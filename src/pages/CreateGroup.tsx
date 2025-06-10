
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Plus, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const addMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember("");
    }
  };

  const removeMember = (memberToRemove: string) => {
    setMembers(members.filter(member => member !== memberToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Creating group:", {
        name: groupName,
        description,
        members: [...members, "You"], // Include current user
      });
      
      toast({
        title: "Group created!",
        description: `${groupName} has been created successfully.`,
      });
      
      // Redirect to groups page
      navigate("/groups");
    } catch (error) {
      toast({
        title: "Failed to create group",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link to="/groups" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Groups
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center">
                <Users className="w-6 h-6 mr-3" />
                Create New Group
              </h1>
              <p className="text-muted-foreground">Set up a new expense group</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Group Details</CardTitle>
              <CardDescription>
                Create a group to start splitting expenses with friends, family, or colleagues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="e.g., Weekend Trip, Roommates, Office Lunch"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the group"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Add Members</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter member name or email"
                      value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                      disabled={isLoading}
                    />
                    <Button 
                      type="button" 
                      onClick={addMember}
                      variant="outline"
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {members.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Members:</Label>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                          <span>You (Group creator)</span>
                        </div>
                        {members.map((member, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm">{member}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMember(member)}
                              disabled={isLoading}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-paypal-primary text-black hover:bg-paypal-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Group"}
                  </Button>
                  <Link to="/groups">
                    <Button variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
