import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Shield, Tractor } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Navigate based on user role
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (data?.role === 'admin') {
          navigate('/admin');
        } else if (data?.role === 'farmer') {
          navigate('/farmer');
        }
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat p-4" style={{ backgroundImage: "url('/dbg.jpg')" }}>
      <div className="container mx-auto max-w-4xl flex items-center justify-center min-h-screen">
        <div className="text-center mb-8 bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Sprout className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-2">سمارٹ زراعت مارکیٹ</h1>
          <p className="text-xl text-muted-foreground">شروع کرنے کے لیے سائن ان کریں</p>

          <div className="text-center mt-8">
          <Button onClick={() => navigate('/auth')}>
            سائن ان کریں
          </Button>
        </div>
        </div>

        {/* <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Manage market data, users, and system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">
                Go to Admin Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/farmer')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Tractor className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Farmer Dashboard</CardTitle>
              <CardDescription>
                View market rates, weather updates, and manage your crops
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Go to Farmer Dashboard
              </Button>
            </CardContent>
          </Card>
        </div> */}

        
      </div>
    </div>
  );
};

export default Dashboard;
