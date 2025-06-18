import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Camera, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import Navigation from "@/components/Navigation";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState({
    currency: "USD",
    darkMode: false,
    notifications: true,
    emailUpdates: true,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
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

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id);

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw new Error(`Failed to fetch profile: ${profileError.message}`);
        }

        if (!profileData || profileData.length === 0) {
          // Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || null,
            })
            .select()
            .single();

          if (createError) {
            console.error("Profile creation error:", createError);
            throw new Error(`Failed to create profile: ${createError.message}`);
          }

          setProfile(newProfile);
        } else {
          setProfile(profileData[0]);
        }

        // Fetch user preferences
        const { data: preferencesData, error: preferencesError } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (preferencesError && preferencesError.code !== "PGRST116") { // PGRST116 is "no rows returned"
          console.error("Preferences fetch error:", preferencesError);
          throw new Error(`Failed to fetch preferences: ${preferencesError.message}`);
        }

        if (preferencesData) {
          setPreferences(preferencesData);
        } else {
          // Create default preferences
          const { error: createPrefError } = await supabase
            .from("user_preferences")
            .insert({
              user_id: user.id,
              currency: "USD",
              dark_mode: false,
              notifications: true,
              email_updates: true,
            });

          if (createPrefError) {
            console.error("Preferences creation error:", createPrefError);
            throw new Error(`Failed to create preferences: ${createPrefError.message}`);
          }
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

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

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile?.full_name,
          email: profile?.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }

      // Update preferences
      const { error: preferencesError } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (preferencesError) {
        console.error("Preferences update error:", preferencesError);
        throw new Error(`Failed to update preferences: ${preferencesError.message}`);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw new Error(`Failed to sign out: ${error.message}`);
      }
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center text-paypal-highlight hover:text-paypal-highlight/80">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive/90"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile?.full_name || ""}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Preferences</h3>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select
                      value={preferences.currency}
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <Switch
                      id="darkMode"
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, darkMode: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <Switch
                      id="notifications"
                      checked={preferences.notifications}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailUpdates">Email Updates</Label>
                    <Switch
                      id="emailUpdates"
                      checked={preferences.emailUpdates}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailUpdates: checked }))}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Profile;
