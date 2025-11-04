import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sprout, ArrowLeft } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

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
        // If no role or unknown role, stay on auth page
      }
    };

    checkSession();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = authSchema.parse({ email, password });

      if (!role) {
        toast.error("Please select a role");
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
      } else if (data.user) {
        // Insert user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: role as 'admin' | 'farmer'
          });

        if (roleError) {
          console.error('Error inserting role:', roleError);
          toast.error("Account created but role assignment failed. Please contact support.");
        } else {
          toast.success("Account created! You can now sign in.");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = authSchema.parse({ email, password });

      const { error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        // Navigate based on user role
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (data?.role === 'admin') {
            toast.success("Welcome back, Admin!");
            navigate('/admin');
          } else if (data?.role === 'farmer') {
            toast.success("Welcome back, Farmer!");
            navigate('/farmer');
          } else {
            toast.error("Role not found. Please contact support.");
          }
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4" style={{ backgroundImage: "url('/authbg.jpg')" }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            واپس
          </Button>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Sprout className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">سمارٹ زراعت مارکیٹ</CardTitle>
          <CardDescription>ریئل ٹائم مارکیٹ ریٹس اور موسم کی اپ ڈیٹس تک رسائی حاصل کریں</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">سائن ان</TabsTrigger>
              <TabsTrigger value="signup">سائن اپ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">ای میل</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">پاس ورڈ</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "سائن ان ہو رہا ہے..." : "سائن ان"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">ای میل</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">پاس ورڈ</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-role">کردار</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="اپنا کردار منتخب کریں" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">ایڈمن</SelectItem>
                      <SelectItem value="farmer">کسان</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "اکاؤنٹ بنایا جا رہا ہے..." : "سائن اپ"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
