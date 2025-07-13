import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Customer from "./pages/Customer";
import Demo from "./pages/Demo";
import CallService from "./pages/CallService";
import Trade from "./pages/Trade";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "@/pages/not-found";

function Router() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem("authToken");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("authToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("authToken");
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/customer" component={Customer} />
        <Route path="/demo" component={Demo} />
        <Route path="/callservice" component={CallService} />
        <Route path="/trade" component={Trade} />
        <Route path="/users" component={Users} />
        <Route path="/profile" component={Profile} />
        <Route path="/support" component={Support} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
