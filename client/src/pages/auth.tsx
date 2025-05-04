import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Instagram, LogIn, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthFormData {
  username: string;
  password: string;
}

export default function Auth() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: AuthFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.account.username}!`,
        variant: "default",
      });
      
      navigate("/calendar");
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Failed to connect your Instagram account. Please verify your credentials.",
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: AuthFormData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.account.username}! Your account has been created.`,
        variant: "default",
      });
      
      navigate("/calendar");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register your account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await loginMutation.mutateAsync({ 
        username: loginUsername, 
        password: loginPassword 
      });
    } catch (error) {
      // Error is handled in mutation
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await registerMutation.mutateAsync({ 
        username: registerUsername, 
        password: registerPassword 
      });
    } catch (error) {
      // Error is handled in mutation
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Left column: Forms */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="gradient-logo p-3 rounded-lg">
                <Instagram className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Instagram Scheduler</CardTitle>
            <CardDescription>
              Login or create an account to manage your Instagram content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Your Instagram username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Your Instagram password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        "Logging in..."
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" /> Login
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Choose a password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? (
                        "Creating account..."
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" /> Create Account
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800 flex items-start mt-4">
              <AlertCircle className="text-amber-600 dark:text-amber-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-500">
                This application uses the unofficial Instagrapi library. 
                Connecting your account is at your own risk and should only be done for testing purposes.
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="link" onClick={() => navigate("/")}>
              Go back to home
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right column: Hero section */}
      <div className="hidden md:flex flex-1 bg-blue-600 text-white p-8 items-center justify-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Schedule Instagram Content with Ease</h1>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Plan and schedule Instagram posts and stories</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Connect multiple Instagram accounts</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Calendar view to organize your content strategy</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Publish automatically at optimal times</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
