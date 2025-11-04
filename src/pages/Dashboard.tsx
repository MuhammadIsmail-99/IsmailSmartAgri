import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/AuthGuard";
import { User } from "@supabase/supabase-js";
import { Sprout, LogOut } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      setUserRole(data?.role ?? null);
    };

    fetchUserRole();
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate('/auth');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <header className="border-b bg-card">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Sprout className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Agriculture Market Tracker</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Welcome, {user?.email}</h2>
            <p className="text-muted-foreground">
              {userRole ? `Role: ${userRole}` : "Loading role..."}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {userRole === 'admin' && (
              <Button
                onClick={() => navigate('/admin')}
                className="h-32 text-lg"
                size="lg"
              >
                Admin Dashboard
              </Button>
            )}
            <Button
              onClick={() => navigate('/farmer')}
              className="h-32 text-lg"
              size="lg"
              variant={userRole === 'admin' ? 'secondary' : 'default'}
            >
              Farmer Dashboard
            </Button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
