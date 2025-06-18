import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";

type Group = Database["public"]["Tables"]["groups"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
  group_members: (Database["public"]["Tables"]["group_members"]["Row"] & {
    profiles: Database["public"]["Tables"]["profiles"]["Row"];
  })[];
};

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface MemberInput {
  id: string;
  name: string;
}

const Groups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState<string | null>(null);
  const [availableMembers, setAvailableMembers] = useState<Profile[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberName: "",
    members: [] as MemberInput[],
  });
  const [addMembersFormData, setAddMembersFormData] = useState({
    memberSearch: "",
    selectedMembers: new Set<string>(),
  });

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select(`
          *,
          profiles:created_by(full_name),
          group_members(
            *,
            profiles:user_id(full_name)
          )
        `)
        .order("created_at", { ascending: false });

      if (groupsError) throw groupsError;

      // Fetch available members (all profiles except current user)
      const { data: membersData, error: membersError } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id);

      if (membersError) throw membersError;

      setGroups(groupsData || []);
      setAvailableMembers(membersData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load groups. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddMember = () => {
    if (!formData.memberName.trim()) return;

    const newMember: MemberInput = {
      id: crypto.randomUUID(),
      name: formData.memberName.trim(),
    };

    setFormData({
      ...formData,
      members: [...formData.members, newMember],
      memberName: "",
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setFormData({
      ...formData,
      members: formData.members.filter(m => m.id !== memberId),
    });
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error:", userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Create the group first
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: formData.name,
          description: formData.description,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) {
        console.error("Group creation error:", groupError);
        throw new Error(`Failed to create group: ${groupError.message}`);
      }

      if (!group) {
        throw new Error("No group data returned after creation");
      }

      // Add the creator as an admin member
      const { error: creatorMemberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: "admin",
          member_name: user.user_metadata?.full_name || user.email || 'Group Admin'
        });

      if (creatorMemberError) {
        console.error("Creator member addition error:", creatorMemberError);
        throw new Error(`Failed to add creator as member: ${creatorMemberError.message}`);
      }

      // Add other members
      if (formData.members.length > 0) {
        const memberPromises = formData.members.map((member) =>
          supabase.from("group_members").insert({
            group_id: group.id,
            member_name: member.name,
            role: "member",
            user_id: null // Explicitly set user_id to null for non-registered members
          })
        );

        const memberResults = await Promise.all(memberPromises);
        const memberErrors = memberResults.filter(result => result.error);
        
        if (memberErrors.length > 0) {
          console.error("Member addition errors:", memberErrors);
          throw new Error(`Failed to add some members: ${memberErrors.map(e => e.error?.message).join(", ")}`);
        }
      }

      toast({
        title: "Success",
        description: "Group created successfully",
      });

      setShowCreateForm(false);
      setFormData({
        name: "",
        description: "",
        memberName: "",
        members: [],
      });
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      setIsDeleting(groupId);
      
      // First delete all group members
      const { error: membersError } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId);

      if (membersError) throw membersError;

      // Then delete the group
      const { error: groupError } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (groupError) throw groupError;

      toast({
        title: "Success",
        description: "Group deleted successfully",
      });

      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddMembers = async (groupId: string) => {
    setIsAddingMembers(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        navigate("/login");
        return;
      }

      // Get current group members to exclude them from available members
      const { data: currentMembers, error: membersError } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId);

      if (membersError) throw membersError;

      const currentMemberIds = new Set(currentMembers?.map(m => m.user_id) || []);
      
      // Add new members
      if (addMembersFormData.selectedMembers.size > 0) {
        const memberPromises = Array.from(addMembersFormData.selectedMembers)
          .filter(memberId => !currentMemberIds.has(memberId))
          .map((memberId) =>
            supabase.from("group_members").insert({
              group_id: groupId,
              user_id: memberId,
              role: "member",
            })
          );

        const memberResults = await Promise.all(memberPromises);
        const memberErrors = memberResults.filter(result => result.error);
        
        if (memberErrors.length > 0) {
          throw new Error(`Failed to add some members: ${memberErrors.map(e => e.error?.message).join(", ")}`);
        }
      }

      toast({
        title: "Success",
        description: "Members added successfully",
      });

      setShowAddMembersModal(null);
      setAddMembersFormData({
        memberSearch: "",
        selectedMembers: new Set<string>(),
      });
      fetchGroups();
    } catch (error) {
      console.error("Error adding members:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add members",
        variant: "destructive",
      });
    } finally {
      setIsAddingMembers(false);
    }
  };

  const getAvailableMembersForGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];
    
    const currentMemberIds = new Set(group.group_members.map(m => m.user_id));
    return availableMembers.filter(member => !currentMemberIds.has(member.id));
  };

  const getFilteredAvailableMembers = (groupId: string) => {
    return getAvailableMembersForGroup(groupId).filter(member => 
      (member.full_name?.toLowerCase().includes(addMembersFormData.memberSearch.toLowerCase()) ||
      member.email?.toLowerCase().includes(addMembersFormData.memberSearch.toLowerCase())) &&
      !addMembersFormData.selectedMembers.has(member.id)
    );
  };

  const toggleAddMember = (memberId: string) => {
    const newSelectedMembers = new Set(addMembersFormData.selectedMembers);
    if (newSelectedMembers.has(memberId)) {
      newSelectedMembers.delete(memberId);
    } else {
      newSelectedMembers.add(memberId);
    }
    setAddMembersFormData({ ...addMembersFormData, selectedMembers: newSelectedMembers });
  };

  const renderAddMembersModal = () => {
    if (!showAddMembersModal) return null;
    const group = groups.find(g => g.id === showAddMembersModal);
    if (!group) return null;

    return (
      <Dialog open={!!showAddMembersModal} onOpenChange={() => setShowAddMembersModal(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Members to {group.name}</DialogTitle>
            <DialogDescription>
              Search and select members to add to this group
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search members by name or email..."
                value={addMembersFormData.memberSearch}
                onChange={(e) => setAddMembersFormData({ ...addMembersFormData, memberSearch: e.target.value })}
                className="pr-8"
              />
              <Users className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Search Results */}
            {addMembersFormData.memberSearch && (
              <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {getFilteredAvailableMembers(showAddMembersModal).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No members found
                  </p>
                ) : (
                  getFilteredAvailableMembers(showAddMembersModal).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-paypal-primary/10 flex items-center justify-center text-paypal-primary font-medium">
                          {getInitials(member.full_name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {member.full_name || "Unnamed User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAddMember(member.id)}
                        className="flex-shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Selected Members */}
            {addMembersFormData.selectedMembers.size > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Selected Members</Label>
                <div className="border rounded-md p-4 space-y-2">
                  {Array.from(addMembersFormData.selectedMembers).map((memberId) => {
                    const member = availableMembers.find(m => m.id === memberId);
                    if (!member) return null;
                    return (
                      <div
                        key={memberId}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-paypal-primary/10 flex items-center justify-center text-paypal-primary font-medium">
                            {getInitials(member.full_name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {member.full_name || "Unnamed User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAddMember(memberId)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddMembersModal(null)}
                disabled={isAddingMembers}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAddMembers(showAddMembersModal)}
                disabled={isAddingMembers || addMembersFormData.selectedMembers.size === 0}
                className="bg-paypal-primary text-black hover:bg-paypal-primary/90"
              >
                {isAddingMembers ? "Adding..." : "Add Members"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center text-paypal-highlight hover:text-paypal-highlight/80">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-paypal-primary text-black hover:bg-paypal-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showCreateForm ? "Cancel" : "Create Group"}
            </Button>
          </div>

          {showCreateForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Group</CardTitle>
                <CardDescription>Create a new group and add members</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter group name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Enter group description"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Add Members</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Member name"
                            value={formData.memberName}
                            onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddMember}
                          className="self-end"
                          disabled={!formData.memberName.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {formData.members.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Selected Members</Label>
                        <div className="border rounded-md p-4 space-y-2">
                          {formData.members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-paypal-primary/10 flex items-center justify-center text-paypal-primary font-medium">
                                  {getInitials(member.name)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {member.name}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-destructive hover:text-destructive/90"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-paypal-primary text-black hover:bg-paypal-primary/90"
                      disabled={isCreating}
                    >
                      {isCreating ? "Creating..." : "Create Group"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{group.name}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddMembersModal(group.id)}
                          className="text-paypal-primary hover:text-paypal-primary/90"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Add Members
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                          disabled={isDeleting === group.id}
                        >
                          {isDeleting === group.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Members</h4>
                        <div className="flex flex-wrap gap-2">
                          {group.group_members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center space-x-2 bg-muted px-2 py-1 rounded-full text-sm"
                            >
                              <div className="w-6 h-6 rounded-full bg-paypal-primary/10 flex items-center justify-center text-paypal-primary text-xs font-medium">
                                {getInitials(member.member_name || member.profiles?.full_name || '')}
                              </div>
                              <span>{member.member_name || member.profiles?.full_name || member.profiles?.email}</span>
                              {member.role === "admin" && (
                                <span className="text-xs text-muted-foreground">(Admin)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!showCreateForm && groups.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No groups found</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-paypal-primary text-black hover:bg-paypal-primary/90"
              >
                Create Your First Group
              </Button>
            </div>
          )}

          {renderAddMembersModal()}
        </div>
      </div>
    </>
  );
};

export default Groups;
