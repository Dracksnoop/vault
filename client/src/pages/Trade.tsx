import { useState } from 'react';
import { ShoppingCart, DollarSign, Package, Plus, Users, FileText, Calendar, IndianRupee } from 'lucide-react';
import { PurchaseDashboard } from '@/components/PurchaseDashboard';
import { SellDashboard } from '@/components/SellDashboard';
import { useQuery } from '@tanstack/react-query';

export default function Trade() {
  const [selectedView, setSelectedView] = useState<'overview' | 'purchase' | 'sell'>('overview');
  const [activeTab, setActiveTab] = useState<'purchase' | 'sell'>('purchase');

  // Fetch sell orders for history
  const { data: sellOrders } = useQuery({
    queryKey: ['/api/sell-orders'],
    enabled: true
  });

  // Fetch purchase orders for history
  const { data: purchaseOrders } = useQuery({
    queryKey: ['/api/purchase-orders'],
    enabled: true
  });

  // Calculate totals with better error handling
  const totalPurchases = purchaseOrders?.reduce((sum: number, order: any) => {
    // Try different possible field names and formats
    const amount = parseFloat(order.totalValue) || 
                  parseFloat(order.totalAmount) || 
                  parseFloat(order.total_value) || 
                  parseFloat(order.total_amount) || 0;
    return sum + amount;
  }, 0) || 0;

  const totalSales = sellOrders?.reduce((sum: number, order: any) => {
    // Try different possible field names and formats
    const amount = parseFloat(order.totalValue) || 
                  parseFloat(order.totalAmount) || 
                  parseFloat(order.total_value) || 
                  parseFloat(order.total_amount) || 0;
    return sum + amount;
  }, 0) || 0;

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
              <p className="text-xl font-bold text-black">
                ₹{totalPurchases.toLocaleString()}
              </p>
            </div>
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white border border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-bold text-black">
                ₹{totalSales.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white border border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold text-black">
                {((purchaseOrders?.length || 0) + (sellOrders?.length || 0))}
              </p>
            </div>
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Trading History */}
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">Trading History</h2>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('purchase')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'purchase'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Purchase History
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'sell'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sell History
          </button>
        </div>

        {/* Purchase History Tab */}
        {activeTab === 'purchase' && (
          <div className="bg-white border border-black rounded-lg p-4">
            {purchaseOrders && purchaseOrders.length > 0 ? (
              <div className="space-y-4">
                {purchaseOrders.map((order: any) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-black">Purchase Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">Vendor: {order.vendorName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-black">
                          ₹{(order.totalValue || order.totalAmount || order.total_value || order.total_amount || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Package className="w-4 h-4 mr-1" />
                        Purchase
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No purchase orders yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start by creating a purchase order
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sell History Tab */}
        {activeTab === 'sell' && (
          <div className="bg-white border border-black rounded-lg p-4">
            {sellOrders && sellOrders.length > 0 ? (
              <div className="space-y-4">
                {sellOrders.map((order: any) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-black">Sale Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                        {order.customerEmail && (
                          <p className="text-sm text-gray-500">{order.customerEmail}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-black">
                          ₹{(order.totalValue || order.totalAmount || order.total_value || order.total_amount || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Sale
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No sales yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start by selling inventory items
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
