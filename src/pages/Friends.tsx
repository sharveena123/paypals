import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, MessageCircle, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url?: string | null;
}

interface FriendCardProps {
  friend: UserProfile;
  balance: number;
  onViewExpenses: () => void;
  onRemove: () => void;
}

const FriendCard = ({ friend, balance, onViewExpenses, onRemove }: FriendCardProps) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center space-x-4">
        {friend.avatar_url ? (
          <img src={friend.avatar_url} alt={friend.full_name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
            {friend.full_name ? friend.full_name[0] : friend.username[0]}
          </div>
        )}
        <div>
          <div className="font-semibold">{friend.full_name}</div>
          <div className="text-gray-500 text-sm">@{friend.username}</div>
          <div className="mt-1 text-xs">
            {balance > 0 && <span className="text-green-600">They owe you ${balance.toFixed(2)}</span>}
            {balance < 0 && <span className="text-red-600">You owe ${Math.abs(balance).toFixed(2)}</span>}
            {balance === 0 && <span className="text-gray-400">Settled</span>}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button size="sm" variant="outline" onClick={onViewExpenses}>
          <Eye className="w-4 h-4 mr-1" /> View Expenses
        </Button>
        {/* <Button size="sm" variant="outline"><MessageCircle className="w-4 h-4 mr-1" /> Message</Button> */}
        <Button size="sm" variant="destructive" onClick={onRemove}>
          <UserMinus className="w-4 h-4 mr-1" /> Remove
        </Button>
      </div>
    </div>
  );
};

const Friends = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [addingFriend, setAddingFriend] = useState<string | null>(null);

  // Check if friends table exists and create it if needed
  const ensureFriendsTable = async () => {
    try {
      // Try to query the friends table to see if it exists
      const { error } = await supabase
        .from("friends")
        .select("id")
        .limit(1);

      if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
        console.log("Friends table doesn't exist, creating it...");
        toast({
          title: "Info",
          description: "Setting up friends functionality...",
        });
        
        // Since we can't create tables from the client, we'll show a helpful message
        toast({
          title: "Setup Required",
          description: "The friends table needs to be created. Please contact the administrator or check the database setup.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking friends table:", error);
      return false;
    }
  };

  // Fetch friends from the database
  const fetchFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if friends table exists
      const tableExists = await ensureFriendsTable();
      if (!tableExists) {
        return;
      }

      // First, get all friendship records where the user is involved
      const { data: friendships, error: friendshipsError } = await supabase
        .from("friends")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (friendshipsError) {
        console.error("Error fetching friendships:", friendshipsError);
        if (friendshipsError.message.includes("relation") && friendshipsError.message.includes("does not exist")) {
          toast({
            title: "Setup Required",
            description: "The friends table needs to be created. Please contact the administrator.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch friends",
            variant: "destructive",
          });
        }
        return;
      }

      if (friendships && friendships.length > 0) {
        // Extract friend IDs (the other user in each friendship)
        const friendIds = friendships.map(friendship => {
          return friendship.user_id === user.id ? friendship.friend_id : friendship.user_id;
        });

        // Fetch the actual friend profiles
        const { data: friendProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, username, email, avatar_url")
          .in("id", friendIds);

        if (profilesError) {
          console.error("Error fetching friend profiles:", profilesError);
          toast({
            title: "Error",
            description: "Failed to fetch friend profiles",
            variant: "destructive",
          });
          return;
        }

        if (friendProfiles) {
          setFriends(friendProfiles);
        }
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error in fetchFriends:", error);
      toast({
        title: "Error",
        description: "Failed to fetch friends",
        variant: "destructive",
      });
    }
  };

  // Live search for users
  useEffect(() => {
    if (!search) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    const fetch = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, username, email, avatar_url")
          .or(
            `full_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`
          )
          .neq("id", user.id) // Don't show current user
          .limit(5);

        if (error) {
          console.error("Error searching users:", error);
          return;
        }

        if (data) {
          // Filter out users who are already friends
          const { data: existingFriends } = await supabase
            .from("friends")
            .select("user_id, friend_id")
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
            .eq("status", "accepted");

          const existingFriendIds = new Set();
          if (existingFriends) {
            existingFriends.forEach(friendship => {
              if (friendship.user_id === user.id) {
                existingFriendIds.add(friendship.friend_id);
              } else {
                existingFriendIds.add(friendship.user_id);
              }
            });
          }

          const filteredResults = data.filter(user => !existingFriendIds.has(user.id));
          setSearchResults(filteredResults);
        }
      } catch (error) {
        console.error("Error in search:", error);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(fetch);
  }, [search]);

  useEffect(() => {
    fetchFriends();
  }, []);

  // Add friend logic
  const handleAddFriend = async (friendId: string) => {
    try {
      setAddingFriend(friendId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if friends table exists
      const tableExists = await ensureFriendsTable();
      if (!tableExists) {
        setAddingFriend(null);
        return;
      }

      const { error } = await supabase
        .from("friends")
        .insert([
          { user_id: user.id, friend_id: friendId, status: "accepted" }
        ]);

      if (error) {
        console.error("Error adding friend:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to add friend",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Friend added successfully!",
        });
        await fetchFriends();
        setSearch(""); // Clear search
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error in handleAddFriend:", error);
      toast({
        title: "Error",
        description: "Failed to add friend",
        variant: "destructive",
      });
    } finally {
      setAddingFriend(null);
    }
  };

  // Remove friend logic
  const handleRemoveFriend = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("friends")
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (error) {
        console.error("Error removing friend:", error);
        toast({
          title: "Error",
          description: "Failed to remove friend",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Friend removed successfully!",
        });
        await fetchFriends();
      }
    } catch (error) {
      console.error("Error in handleRemoveFriend:", error);
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Top: Search Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <Input
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full"
            />
            {search && (
              <div className="mt-2">
                {loading && <div className="text-gray-400 text-sm">Searching...</div>}
                {!loading && searchResults.length === 0 && (
                  <div className="text-gray-400 text-sm">
                    No users found. <br />
                    <span>Add as guest or invite by email:</span>
                    <div className="flex mt-2 space-x-2">
                      <Input
                        placeholder="Email to invite"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" variant="outline" disabled={!inviteEmail}>
                        <UserPlus className="w-4 h-4 mr-1" /> Invite
                      </Button>
                    </div>
                  </div>
                )}
                {!loading && searchResults.length > 0 && (
                  <div className="bg-gray-50 rounded shadow p-2">
                    {searchResults.map(user => (
                      <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex items-center space-x-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                              {user.full_name ? user.full_name[0] : user.username[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleAddFriend(user.id)}
                          disabled={addingFriend === user.id}
                        >
                          <UserPlus className="w-4 h-4 mr-1" /> 
                          {addingFriend === user.id ? "Adding..." : "Add"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Middle: Friends List */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Friends</h2>
            {friends.length === 0 && <div className="text-gray-400">No friends yet.</div>}
            {friends.map(friend => (
              <FriendCard
                key={friend.id}
                friend={friend}
                balance={balances[friend.id] || 0}
                onViewExpenses={() => {}}
                onRemove={() => handleRemoveFriend(friend.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Friends; 