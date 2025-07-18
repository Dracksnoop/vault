import { useState } from 'react';
import { ShoppingCart, DollarSign, Package, Plus, Users, FileText } from 'lucide-react';
import { PurchaseDashboard } from '@/components/PurchaseDashboard';
import { SellDashboard } from '@/components/SellDashboard';

export default function Trade() {
  const [selectedView, setSelectedView] = useState<'overview' | 'purchase' | 'sell'>('overview');

  if (selectedView === 'purchase') {
    return <PurchaseDashboard onBack={() => setSelectedView('overview')} />;
  }

  if (selectedView === 'sell') {
    return <SellDashboard onBack={() => setSelectedView('overview')} />;
  }

  return (
    <div className="bg-white rounded-lg border border-black p-6">
      <h1 className="text-2xl font-bold text-black mb-4">Trade</h1>
      <p className="text-black mb-8">Handle trading operations and exchanges.</p>
      
      {/* Trade Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          className="bg-white border border-black rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setSelectedView('purchase')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-black">Purchase</p>
              <p className="text-sm text-gray-600">Buy inventory</p>
            </div>
          </div>
          <p className="text-black text-sm">
            Create purchase orders, manage vendors, and add new inventory items to your stock.
          </p>
        </div>
        
        <div 
          className="bg-white border border-black rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setSelectedView('sell')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-black">Sell</p>
              <p className="text-sm text-gray-600">Sell inventory</p>
            </div>
          </div>
          <p className="text-black text-sm">
            Sell inventory items, manage sales transactions, and track revenue.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Purchases</p>
              <p className="text-xl font-bold text-black">₹0</p>
            </div>
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white border border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Vendors</p>
              <p className="text-xl font-bold text-black">0</p>
            </div>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white border border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-xl font-bold text-black">0</p>
            </div>
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">Recent Trading Activity</h2>
        <div className="bg-white border border-black rounded-lg p-4">
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No trading activity yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Start by creating a purchase order or selling inventory items
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
