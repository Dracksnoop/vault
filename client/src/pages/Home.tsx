import { Package, Users, Clock, DollarSign, Plus, UserPlus, Truck, Calendar, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // Fetch real-time data from APIs
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: rentals = [] } = useQuery({
    queryKey: ['/api/rentals'],
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: items = [] } = useQuery({
    queryKey: ['/api/items'],
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: serviceItems = [] } = useQuery({
    queryKey: ['/api/service-items'],
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['/api/services'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Use dashboard stats or calculate fallback values
  const totalUnits = dashboardStats?.totalUnits || 0;
  const rentedUnits = dashboardStats?.rentedUnits || 0;
  const availableUnits = dashboardStats?.inStockUnits || 0;
  const activeCustomers = dashboardStats?.activeCustomers || 0;
  const activeRentals = rentals.filter((rental: any) => rental.isOngoing).length;
  
  // Calculate total rental value from service items
  const totalRentalValue = serviceItems.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.totalValue) || 0);
  }, 0);

  // Generate recent activity based on real data
  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent customers
    const recentCustomers = customers.slice(-3).reverse();
    recentCustomers.forEach((customer: any, index: number) => {
      activities.push({
        icon: UserPlus,
        text: `New customer registered: ${customer.name}`,
        time: `${2 + index * 2} hours ago`
      });
    });
    
    // Add recent rental activities
    const recentRentals = rentals.slice(-2).reverse();
    recentRentals.forEach((rental: any, index: number) => {
      activities.push({
        icon: Calendar,
        text: `New rental started: ${rental.startDate}`,
        time: `${4 + index * 3} hours ago`
      });
    });
    
    // Add recent item additions
    const recentItems = items.slice(-2).reverse();
    recentItems.forEach((item: any, index: number) => {
      activities.push({
        icon: Plus,
        text: `New inventory item added: ${item.name}`,
        time: `${6 + index * 4} hours ago`
      });
    });
    
    // If no real activity, show system status
    if (activities.length === 0) {
      activities.push(
        {
          icon: TrendingUp,
          text: `System online - ${totalUnits} units tracked`,
          time: `Updated now`
        },
        {
          icon: Package,
          text: `Inventory synchronized - ${availableUnits} available`,
          time: `5 minutes ago`
        }
      );
    }
    
    return activities.slice(0, 5); // Show max 5 activities
  };

  const recentActivity = getRecentActivity();
  return (
    <div className="bg-white rounded-lg border border-black p-6">
      <h1 className="text-2xl font-bold text-black mb-4">Home</h1>
      <p className="text-black">Welcome to Raydify Vault - Your inventory management solution.</p>
      
      {/* Low Stock Alert */}
      {dashboardStats?.lowStockItems > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">Low Stock Alert</p>
              <p className="text-sm text-yellow-700">
                {dashboardStats.lowStockItems} item{dashboardStats.lowStockItems > 1 ? 's' : ''} running low on inventory
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium">Total Inventory</p>
              <p className="text-2xl font-bold text-black">{totalUnits}</p>
              <p className="text-xs text-gray-600">{availableUnits} available, {rentedUnits} rented</p>
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
              <p className="text-2xl font-bold text-black">{activeCustomers}</p>
              <p className="text-xs text-gray-600">with ongoing rentals</p>
            </div>
            <div className="w-12 h-12 bg-white border border-black rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium">Active Rentals</p>
              <p className="text-2xl font-bold text-black">{activeRentals}</p>
              <p className="text-xs text-gray-600">ongoing agreements</p>
            </div>
            <div className="w-12 h-12 bg-white border border-black rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-medium">Total Rental Value</p>
              <p className="text-2xl font-bold text-black">₹{totalRentalValue.toLocaleString()}</p>
              <p className="text-xs text-gray-600">{serviceItems.length} service items</p>
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
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center text-sm text-black">
                <activity.icon className="w-4 h-4 text-black mr-3" />
                <span>{activity.text}</span>
                <span className="ml-auto text-xs text-gray-600">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
