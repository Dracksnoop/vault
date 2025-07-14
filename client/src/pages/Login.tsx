import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/WhatsApp_Image_2025-07-13_at_1.27.05_AM-removebg-preview_1752387426033.png";

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (creds: { username: string; password: string }) => {
      return await apiRequest("/api/auth/login", {
        method: "POST",
        body: creds,
      });
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      localStorage.setItem("authToken", data.token);
      onLogin(data.user);
      toast({
        title: "Success",
        description: "Welcome to Raydify Vault",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-black">
        <CardHeader className="text-center border-b border-black">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-white border border-black rounded-lg flex items-center justify-center">
              <img src={logoPath} alt="Vault Logo" className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl text-black">RAYDIFY VAULT</CardTitle>
          <CardDescription className="text-black">
            Enter your credentials to access the inventory management system
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-black">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="border-black"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-black">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="border-black"
                placeholder="Enter your password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 border-black"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}