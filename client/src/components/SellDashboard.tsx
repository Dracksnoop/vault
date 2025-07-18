import { useState } from 'react';
import { ChevronLeft, ChevronRight, Package, Plus, Building, ShoppingCart, CheckCircle, X, Edit2, Trash2, Eye, Search, User, MapPin, Phone, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SellDashboardProps {
  onBack: () => void;
}

interface SellItem {
  id: string;
  itemId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  model: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  location: string;
  availableUnits: number;
  selectedUnits: string[]; // Array of unit IDs to sell
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  organization: string;
  country: string;
  city: string;
  state: string;
  pincode: string;
  gstTaxId: string;
}

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  organization: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  gstTaxId: z.string().optional(),
});

export function SellDashboard({ onBack }: SellDashboardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
  const [sellItems, setSellItems] = useState<SellItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isViewingOrder, setIsViewingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch items with available units
  const { data: items = [] } = useQuery({
    queryKey: ['/api/items'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch units
  const { data: units = [] } = useQuery({
    queryKey: ['/api/units'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch sell history
  const { data: sellHistory = [] } = useQuery({
    queryKey: ['/api/sell-orders'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch specific sell order details
  const { data: orderDetails } = useQuery({
    queryKey: ['/api/sell-orders', selectedOrderId],
    enabled: !!selectedOrderId,
    staleTime: 0,
    cacheTime: 0,
  });

  // Customer form
  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      organization: '',
      country: '',
      city: '',
      state: '',
      pincode: '',
      gstTaxId: '',
    },
  });

  // Create sell order mutation
  const createSellOrderMutation = useMutation({
    mutationFn: async (sellData: any) => {
      return apiRequest('/api/sell-orders', {
        method: 'POST',
        body: JSON.stringify(sellData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sell order created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sell-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setCurrentStep(3); // Go to success step
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create sell order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get available units for an item
  const getAvailableUnits = (itemId: string) => {
    return units.filter(unit => unit.itemId === itemId && unit.status === 'Available');
  };

  // Add item to sell list
  const addItemToSell = (item: any) => {
    const availableUnits = getAvailableUnits(item.id);
    const category = categories.find(c => c.id === item.categoryId);
    
    if (availableUnits.length === 0) {
      toast({
        title: "No units available",
        description: "This item has no available units to sell.",
        variant: "destructive",
      });
      return;
    }

    const sellItem: SellItem = {
      id: Date.now().toString(),
      itemId: item.id,
      categoryId: item.categoryId,
      categoryName: category?.name || 'Unknown',
      name: item.name,
      model: item.model,
      quantity: 1,
      unitPrice: '0',
      totalPrice: '0',
      location: item.location || 'N/A',
      availableUnits: availableUnits.length,
      selectedUnits: []
    };

    setSellItems([...sellItems, sellItem]);
  };

  // Update sell item
  const updateSellItem = (id: string, updates: Partial<SellItem>) => {
    setSellItems(sellItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        // Recalculate total price
        const quantity = updated.quantity || 0;
        const unitPrice = parseFloat(updated.unitPrice || '0');
        updated.totalPrice = (quantity * unitPrice).toString();
        return updated;
      }
      return item;
    }));
  };

  // Remove sell item
  const removeSellItem = (id: string) => {
    setSellItems(sellItems.filter(item => item.id !== id));
  };

  // Submit customer form
  const onCustomerSubmit = (data: CustomerFormData) => {
    setCustomerData(data);
    setCurrentStep(3); // Go to review step
  };

  // Submit sell order
  const onSellSubmit = async () => {
    if (!customerData || sellItems.length === 0) return;

    const totalItems = sellItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = sellItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);

    const sellOrderData = {
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      customerAddress: customerData.address,
      customerOrganization: customerData.organization,
      customerCountry: customerData.country,
      customerCity: customerData.city,
      customerState: customerData.state,
      customerPincode: customerData.pincode,
      customerGstTaxId: customerData.gstTaxId,
      orderDate: new Date().toISOString().split('T')[0],
      totalItems,
      totalValue: totalValue.toString(),
      notes: 'Sell order created via dashboard',
      items: sellItems.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        serialNumbers: JSON.stringify(item.selectedUnits)
      }))
    };

    createSellOrderMutation.mutate(sellOrderData);
  };

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total values
  const totalItems = sellItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = sellItems.reduce((sum, item) => sum + parseFloat(item.totalPrice || '0'), 0);

  return (
    <div className="bg-white rounded-lg border border-black p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-black text-black hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-black">Sell Dashboard</h1>
        </div>
        
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? 'bg-black text-white'
                  : 'border border-gray-300 text-gray-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Items */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Select Items to Sell</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-black"
                />
              </div>
            </div>
          </div>

          {/* Available Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const availableUnits = getAvailableUnits(item.id);
              const category = categories.find(c => c.id === item.categoryId);
              
              return (
                <div key={item.id} className="bg-white border border-black rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-black">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.model}</p>
                      <p className="text-sm text-gray-600">Category: {category?.name}</p>
                      <p className="text-sm text-gray-600">Location: {item.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-black">Available: {availableUnits.length}</p>
                      <Badge variant={availableUnits.length > 0 ? "default" : "secondary"}>
                        {availableUnits.length > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItemToSell(item)}
                      disabled={availableUnits.length === 0}
                      className="border-black text-black hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Items */}
          {sellItems.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-black mb-4">Selected Items ({sellItems.length})</h3>
              <div className="space-y-3">
                {sellItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-3 border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-black">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.model}</p>
                        <p className="text-sm text-gray-600">Available: {item.availableUnits}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-2">
                          <Input
                            type="number"
                            min="1"
                            max={item.availableUnits}
                            value={item.quantity}
                            onChange={(e) => updateSellItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                            className="w-20 border-black"
                            placeholder="Qty"
                          />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateSellItem(item.id, { unitPrice: e.target.value })}
                            className="w-24 border-black"
                            placeholder="Price"
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-black">₹{parseFloat(item.totalPrice || '0').toLocaleString()}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSellItem(item.id)}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Items: {totalItems}</p>
                    <p className="text-lg font-bold text-black">Total Value: ₹{totalValue.toLocaleString()}</p>
                  </div>
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={sellItems.length === 0}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Next: Customer Details
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Customer Details */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Customer Details</h2>
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="border-black text-black hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={customerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="gstTaxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST/Tax ID</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={customerForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="border-black" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Next: Review & Confirm
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Review & Confirm</h2>
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="border-black text-black hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-black mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-black">{customerData?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-black">{customerData?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-black">{customerData?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Organization</p>
                <p className="font-medium text-black">{customerData?.organization || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium text-black">
                  {customerData?.city}, {customerData?.state}, {customerData?.country}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-black">{customerData?.address}</p>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-black mb-3">Items to Sell</h3>
            <div className="space-y-3">
              {sellItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-3 border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-black">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.model}</p>
                      <p className="text-sm text-gray-600">Category: {item.categoryName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-black">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-600">₹{parseFloat(item.unitPrice).toLocaleString()} each</p>
                      <p className="text-sm font-medium text-black">₹{parseFloat(item.totalPrice).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-black text-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">Total Items: {totalItems}</p>
                <p className="text-xl font-bold">Total Value: ₹{totalValue.toLocaleString()}</p>
              </div>
              <Button
                onClick={onSellSubmit}
                disabled={createSellOrderMutation.isPending}
                className="bg-white text-black hover:bg-gray-200"
              >
                {createSellOrderMutation.isPending ? 'Processing...' : 'Complete Sale'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {createSellOrderMutation.isSuccess && (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">Sale Completed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your sell order has been processed and inventory has been updated.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => {
                setCurrentStep(1);
                setSellItems([]);
                setCustomerData(null);
                customerForm.reset();
              }}
              className="bg-black text-white hover:bg-gray-800"
            >
              Create Another Sale
            </Button>
            <Button
              variant="outline"
              onClick={onBack}
              className="border-black text-black hover:bg-gray-100"
            >
              Back to Trade
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}