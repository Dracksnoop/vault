import { User, Menu } from "lucide-react";
import logoPath from "@assets/WhatsApp_Image_2025-07-13_at_1.27.05_AM-removebg-preview_1752387426033.png";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-[var(--navy)] shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-60 z-40 h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Logo for mobile */}
        <div className="flex items-center lg:hidden">
          <div className="w-8 h-8 bg-[var(--magenta)] rounded-lg flex items-center justify-center">
            <img src={logoPath} alt="Vault Logo" className="w-5 h-5" />
          </div>
          <span className="ml-3 text-lg font-semibold text-white">VAULT</span>
        </div>
        
        {/* Spacer for desktop */}
        <div className="hidden lg:block"></div>
        
        {/* User avatar */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
}
