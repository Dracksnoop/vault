import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Eye, EyeOff, Users, Database, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/WhatsApp_Image_2025-07-13_at_1.27.05_AM-removebg-preview_1752387426033.png";

interface User {
  id: number;
  username: string;
  password: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  user: any;
}

export default function AdminDashboard({ onLogout, user }: AdminDashboardProps) {
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [showPasswords, setShowPasswords] = useState<{[key: number]: boolean}>({});
  const [activeTab, setActiveTab] = useState("users");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string }) => {
      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(userData),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || responseData.message || `Error: ${response.status}`);
        }

        return responseData;
      } catch (error: any) {
        throw new Error(error.message || "Failed to create user");
      }
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
      console.error("Create user error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || responseData.message || `Error: ${response.status}`);
        }

        return responseData;
      } catch (error: any) {
        throw new Error(error.message || "Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error("Delete user error:", error);
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white border border-black rounded-lg flex items-center justify-center">
                <img src={logoPath} alt="Vault Logo" className="w-5 h-5" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-black">RAYDIFY VAULT - ADMIN</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-black">Welcome, {user?.username}</span>
              <Button
                variant="outline"
                onClick={onLogout}
                className="border-black text-black hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === "overview"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === "users"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === "settings"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-black">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-black">Total Users</CardTitle>
                  <div className="text-2xl font-bold text-black">{users.length}</div>
                </CardHeader>
              </Card>
              <Card className="border-black">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-black">Inventory Items</CardTitle>
                  <div className="text-2xl font-bold text-black">{stats.totalInventory || 0}</div>
                </CardHeader>
              </Card>
              <Card className="border-black">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-black">Active Customers</CardTitle>
                  <div className="text-2xl font-bold text-black">{stats.activeCustomers || 0}</div>
                </CardHeader>
              </Card>
              <Card className="border-black">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-black">Total Value</CardTitle>
                  <div className="text-2xl font-bold text-black">${stats.totalValue?.toFixed(2) || "0.00"}</div>
                </CardHeader>
              </Card>
            </div>

            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-black">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-black">Database Connection</span>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">API Status</span>
                    <span className="text-green-600 font-medium">Operational</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Active Sessions</span>
                    <span className="text-black font-medium">{users.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Create User Section */}
            <Card className="border-black">
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
                {usersLoading ? (
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
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-black">System Settings</CardTitle>
                <CardDescription className="text-black">
                  Configure system-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-black">Database Connection</Label>
                    <p className="text-sm text-black">MongoDB Atlas - Connected</p>
                  </div>
                  <div>
                    <Label className="text-black">Authentication</Label>
                    <p className="text-sm text-black">Token-based authentication enabled</p>
                  </div>
                  <div>
                    <Label className="text-black">Session Management</Label>
                    <p className="text-sm text-black">In-memory session storage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}