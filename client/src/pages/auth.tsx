import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

interface AuthFormData {
  username: string;
  password: string;
}

export default function Auth() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: AuthFormData) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      
      toast({
        title: "Account connected",
        description: "Your Instagram account has been successfully connected.",
        variant: "default",
      });
      
      navigate("/calendar");
    },
    onError: (error) => {
      toast({
        title: "Authentication failed",
        description: error.message || "Failed to connect your Instagram account. Please verify your credentials.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await loginMutation.mutateAsync({ username, password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="gradient-logo p-3 rounded-lg">
              <svg 
                className="h-8 w-8 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl">Connect Instagram Account</CardTitle>
          <CardDescription>
            Enter your Instagram credentials to connect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your Instagram username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your Instagram password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800 flex items-start">
                <AlertCircle className="text-amber-600 dark:text-amber-500 h-5 w-5 mr-2 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-500">
                  This application uses the unofficial Instagrapi library. 
                  Connecting your account is at your own risk and should only be done for testing purposes.
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect Account"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="link" onClick={() => navigate("/")}>
            Go back to home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
