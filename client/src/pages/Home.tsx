import { Package, Users, Clock, DollarSign, Plus, UserPlus, Truck } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Home</h1>
      <p className="text-gray-600">Welcome to Raydify Vault - Your inventory management solution.</p>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Inventory</p>
              <p className="text-2xl font-bold text-blue-900">1,234</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Customers</p>
              <p className="text-2xl font-bold text-green-900">567</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-900">89</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Monthly Revenue</p>
              <p className="text-2xl font-bold text-purple-900">$12,345</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Plus className="w-4 h-4 text-green-500 mr-3" />
              <span>New inventory item added: Product XYZ</span>
              <span className="ml-auto text-xs text-gray-400">2 hours ago</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <UserPlus className="w-4 h-4 text-blue-500 mr-3" />
              <span>New customer registered: John Doe</span>
              <span className="ml-auto text-xs text-gray-400">4 hours ago</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Truck className="w-4 h-4 text-purple-500 mr-3" />
              <span>Order #1234 shipped successfully</span>
              <span className="ml-auto text-xs text-gray-400">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
