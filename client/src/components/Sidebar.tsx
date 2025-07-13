import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  Home, 
  Package, 
  Users, 
  Play, 
  Phone, 
  RefreshCw, 
  UserCheck, 
  User, 
  LifeBuoy 
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoPath from "@assets/WhatsApp_Image_2025-07-13_at_1.27.05_AM-removebg-preview_1752387426033.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Customer", href: "/customer", icon: Users },
  { name: "Customer Management", href: "/customer-management", icon: UserCheck },
  { name: "Demo", href: "/demo", icon: Play },
  { name: "Call/Service", href: "/callservice", icon: Phone },
  { name: "Trade", href: "/trade", icon: RefreshCw },
  { name: "Users", href: "/users", icon: UserCheck },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Support", href: "/support", icon: LifeBuoy },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-black transform transition-transform duration-200 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-black">
          <div className="w-8 h-8 bg-white border border-black rounded-lg flex items-center justify-center">
            <img src={logoPath} alt="Vault Logo" className="w-5 h-5" />
          </div>
          <span className="ml-3 text-lg font-semibold text-black">VAULT</span>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "nav-item-active"
                    : "text-black hover:bg-gray-50 hover:text-black"
                )}
                onClick={onClose}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
