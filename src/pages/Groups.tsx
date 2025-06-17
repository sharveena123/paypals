
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Users, ArrowLeft, Receipt, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useGroups } from "@/hooks/useGroups";

const Groups = () => {
  const { toast } = useToast();
  const { groups, loading, deleteGroup } = useGroups();

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    const result = await deleteGroup(groupId);
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Group deleted",
        description: `${groupName} has been deleted successfully.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-paypal-primary mx-auto mb-2"></div>
          <p>Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  Groups
                </h1>
                <p className="text-muted-foreground">Manage your expense groups</p>
              </div>
            </div>
            <Link to="/groups/create">
              <Button className="bg-paypal-primary text-black hover:bg-paypal-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {groups.length > 0 ? (
            groups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{group.name}</CardTitle>
                      <CardDescription>
                        {group.member_count} members • Created {new Date(group.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          (group.user_balance || 0) >= 0 ? 'text-paypal-primary' : 'text-paypal-secondary'
                        }`}>
                          {(group.user_balance || 0) >= 0 ? '+' : ''}${Math.abs(group.user_balance || 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(group.user_balance || 0) >= 0 ? 'You are owed' : 'You owe'}
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Group</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{group.name}"? This action cannot be undone and will remove all expenses and data associated with this group.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteGroup(group.id, group.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Group
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center">
                        <Receipt className="w-4 h-4 mr-2" />
                        Group Actions
                      </h4>
                      <div className="flex gap-2">
                        <Link to="/add-expense">
                          <Button size="sm" variant="outline">
                            <Plus className="w-3 h-3 mr-1" />
                            Add Expense
                          </Button>
                        </Link>
                        <Link to="/settle-up">
                          <Button size="sm" className="bg-paypal-highlight text-white hover:bg-paypal-highlight/90">
                            Settle Up
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Groups Yet</h2>
              <p className="text-muted-foreground mb-6">Create your first group to start splitting expenses with friends!</p>
              <Link to="/groups/create">
                <Button className="bg-paypal-primary text-black hover:bg-paypal-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
