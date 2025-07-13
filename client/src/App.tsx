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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
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
