import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationProvider } from "./contexts/NavigationContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Customer from "./pages/Customer";
import CustomerDetails from "./pages/CustomerDetails";
import CustomerManagement from "./pages/CustomerManagement";
import Demo from "./pages/Demo";
import CallService from "./pages/CallService";
import Trade from "./pages/Trade";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import QRScanDashboard from "./pages/QRScanDashboard";
import NotFound from "@/pages/not-found";
import VaultLoader from "./components/VaultLoader";

function Router() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreloading, setIsPreloading] = useState(false);

  const preloadAllData = async () => {
    try {
      // Preload all critical data that will be needed across the app
      await Promise.all([
        queryClient.prefetchQuery({ queryKey: ["/api/dashboard/stats"] }),
        queryClient.prefetchQuery({ queryKey: ["/api/categories"] }),
        queryClient.prefetchQuery({ queryKey: ["/api/items"] }),
        queryClient.prefetchQuery({ queryKey: ["/api/units"] }),
        queryClient.prefetchQuery({ queryKey: ["/api/customers"] }),
        queryClient.prefetchQuery({ queryKey: ["/api/services"] }),
        queryClient.prefetchQuery({ queryKey: ["/api/service-items"] }),
        queryClient.prefetchQuery({ queryKey: ["/api/rentals"] }),
      ]);
    } catch (error) {
      console.error("Error preloading data:", error);
    }
  };

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
            
            // If user is authenticated, preload all data before showing the app
            setIsPreloading(true);
            await preloadAllData();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Ensure data is ready
            setIsPreloading(false);
            
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

  return (
    <Switch>
      {/* Public QR Scan Dashboard - accessible without main app authentication */}
      <Route path="/unit/:serialNumber" component={QRScanDashboard} />
      
      {/* All other routes require authentication */}
      <Route>
        {isLoading ? (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-black">Loading...</div>
          </div>
        ) : isPreloading ? (
          <VaultLoader 
            isVisible={true}
            message="Preparing your workspace..."
            description="Loading all system data for optimal performance"
          />
        ) : !user ? (
          <Login onLogin={handleLogin} />
        ) : user.username === 'admin' ? (
          <AdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <Layout user={user} onLogout={handleLogout}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/customer" component={Customer} />
              <Route path="/customer/:id" component={CustomerDetails} />
              <Route path="/customer-management" component={CustomerManagement} />
              <Route path="/demo" component={Demo} />
              <Route path="/callservice" component={CallService} />
              <Route path="/trade" component={Trade} />
              <Route path="/users" component={Users} />
              <Route path="/profile" component={Profile} />
              <Route path="/support" component={Support} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </NavigationProvider>
    </QueryClientProvider>
  );
}

export default App;
