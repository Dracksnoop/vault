import { Package, Users, Clock, DollarSign, Plus, UserPlus, Truck } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white rounded-lg border border-black p-6">
      <h1 className="text-2xl font-bold text-black mb-4">Home</h1>
      <p className="text-black">Welcome to Raydify Vault - Your inventory management solution.</p>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium">Total Inventory</p>
              <p className="text-2xl font-bold text-black">1,234</p>
            </div>
            <div className="w-12 h-12 bg-white border border-black rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium">Active Customers</p>
              <p className="text-2xl font-bold text-black">567</p>
            </div>
            <div className="w-12 h-12 bg-white border border-black rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium">Pending Orders</p>
              <p className="text-2xl font-bold text-black">89</p>
            </div>
            <div className="w-12 h-12 bg-white border border-black rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium">Monthly Revenue</p>
              <p className="text-2xl font-bold text-black">$12,345</p>
            </div>
            <div className="w-12 h-12 bg-white border border-black rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-black mb-4">Recent Activity</h2>
        <div className="bg-white border border-black rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-black">
              <Plus className="w-4 h-4 text-black mr-3" />
              <span>New inventory item added: Product XYZ</span>
              <span className="ml-auto text-xs text-gray-600">2 hours ago</span>
            </div>
            <div className="flex items-center text-sm text-black">
              <UserPlus className="w-4 h-4 text-black mr-3" />
              <span>New customer registered: John Doe</span>
              <span className="ml-auto text-xs text-gray-600">4 hours ago</span>
            </div>
            <div className="flex items-center text-sm text-black">
              <Truck className="w-4 h-4 text-black mr-3" />
              <span>Order #1234 shipped successfully</span>
              <span className="ml-auto text-xs text-gray-600">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
