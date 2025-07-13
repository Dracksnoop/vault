import { User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoPath from "@assets/WhatsApp_Image_2025-07-13_at_1.27.05_AM-removebg-preview_1752387426033.png";

interface HeaderProps {
  onMenuClick: () => void;
  user: any;
  onLogout: () => void;
}

export default function Header({ onMenuClick, user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white fixed top-0 right-0 left-0 lg:left-60 z-40 h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Logo for mobile */}
        <div className="flex items-center lg:hidden">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <img src={logoPath} alt="Vault Logo" className="w-5 h-5" />
          </div>
          <span className="ml-3 text-lg font-semibold text-black">VAULT</span>
        </div>
        
        {/* Spacer for desktop */}
        <div className="hidden lg:block"></div>
        
        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-black">
              <User className="w-4 h-4 text-black" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-black" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-black">
                  {user?.username || "User"}
                </p>
                <p className="text-xs leading-none text-black">
                  Logged in
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-black" />
            <DropdownMenuItem onClick={onLogout} className="text-black hover:bg-gray-100">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
