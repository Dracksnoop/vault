import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 lg:ml-60">
        <Header onMenuClick={() => setSidebarOpen(true)} user={user} onLogout={onLogout} />
        <main className="pt-32 p-2 sm:p-4 lg:p-6 min-h-screen bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
