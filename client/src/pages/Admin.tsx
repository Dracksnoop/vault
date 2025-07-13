import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  password: string;
}

export default function Admin() {
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [showPasswords, setShowPasswords] = useState<{[key: number]: boolean}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setNewUser({ username: "", password: "" });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/users/${userId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const togglePasswordVisibility = (userId: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(prev => ({ ...prev, password }));
  };

  return (
    <div className="bg-white border border-black rounded-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-2">Admin Panel</h1>
        <p className="text-black">Manage user accounts and access credentials</p>
      </div>

      {/* Create User Section */}
      <Card className="mb-6 border-black">
        <CardHeader className="border-b border-black">
          <CardTitle className="text-black">Create New User</CardTitle>
          <CardDescription className="text-black">
            Add a new user account to access the inventory management system
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username" className="text-black">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  className="border-black"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-black">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="border-black"
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-black"
                    onClick={generatePassword}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={createUserMutation.isPending}
              className="bg-black text-white hover:bg-gray-800 border-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-black">
        <CardHeader className="border-b border-black">
          <CardTitle className="text-black">Existing Users</CardTitle>
          <CardDescription className="text-black">
            Manage existing user accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-black">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-black">No users found</div>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user: User) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-black rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-black">Username: {user.username}</div>
                    <div className="text-sm text-black flex items-center gap-2">
                      Password: 
                      <span className="font-mono">
                        {showPasswords[user.id] ? user.password : '••••••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="text-gray-600 hover:text-black"
                      >
                        {showPasswords[user.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteUserMutation.mutate(user.id)}
                    disabled={deleteUserMutation.isPending}
                    className="border-black text-black hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}