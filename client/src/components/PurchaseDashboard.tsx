import { useState } from 'react';
import { ChevronLeft, ChevronRight, Package, Plus, Building, ShoppingCart, CheckCircle, Upload, X, Edit2, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PurchaseDashboardProps {
  onBack: () => void;
}

interface PurchaseItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  model: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  location: string;
  specifications: any;
}

interface VendorFormData {
  name: string;
  organization: string;
  country: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  gstTaxId: string;
  contactPerson: string;
  phone: string;
  email: string;
  legalDocuments: string;
}

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  organization: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  address: z.string().min(1, 'Address is required'),
  gstTaxId: z.string().optional(),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  legalDocuments: z.string().optional(),
});

const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  model: z.string().min(1, 'Model is required'),
  categoryId: z.string().min(1, 'Category is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.string().min(1, 'Unit price is required'),
  location: z.string().min(1, 'Location is required'),
});

export function PurchaseDashboard({ onBack }: PurchaseDashboardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorData, setVendorData] = useState<VendorFormData | null>(null);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vendors
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Fetch purchase history
  const { data: purchaseHistory = [] } = useQuery({
    queryKey: ['/api/purchase-orders'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Vendor form
  const vendorForm = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      organization: '',
      country: '',
      city: '',
      state: '',
      pincode: '',
      address: '',
      gstTaxId: '',
      contactPerson: '',
      phone: '',
      email: '',
      legalDocuments: '',
    },
  });

  // Item form
  const itemForm = useForm<{
    name: string;
    model: string;
    categoryId: string;
    quantity: number;
    unitPrice: string;
    location: string;
  }>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      model: '',
      categoryId: '',
      quantity: 1,
      unitPrice: '',
      location: '',
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const categoryId = Date.now().toString();
      return apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          id: categoryId,
          name: data.name,
          itemCount: 0,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setNewCategoryName('');
      setIsAddingCategory(false);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    },
  });

  // Create vendor mutation
  const createVendorMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      return apiRequest('/api/vendors', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      vendorForm.reset();
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create vendor",
        variant: "destructive",
      });
    },
  });

  // Create purchase order mutation
  const createPurchaseOrderMutation = useMutation({
    mutationFn: async (data: {
      vendorData: VendorFormData;
      items: PurchaseItem[];
    }) => {
      // First create vendor
      const vendorId = Date.now().toString();
      await apiRequest('/api/vendors', {
        method: 'POST',
        body: JSON.stringify({
          id: vendorId,
          ...data.vendorData,
        }),
      });

      // Create items and units
      for (const item of data.items) {
        const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        // Create item
        await apiRequest('/api/items', {
          method: 'POST',
          body: JSON.stringify({
            id: itemId,
            name: item.name,
            model: item.model,
            categoryId: item.categoryId,
            quantityInStock: item.quantity,
            quantityRentedOut: 0,
            location: item.location,
          }),
        });

        // Create units for this item
        for (let i = 0; i < item.quantity; i++) {
          const unitId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          const serialNumber = `${item.name.substring(0, 3).toUpperCase()}-${Date.now()}-${i + 1}`;
          
          await apiRequest('/api/units', {
            method: 'POST',
            body: JSON.stringify({
              id: unitId,
              itemId: itemId,
              serialNumber: serialNumber,
              barcode: `BC${serialNumber}`,
              status: 'Available',
              location: item.location,
              ...item.specifications,
            }),
          });
        }
      }

      // Create purchase order
      const purchaseOrderId = Date.now().toString();
      const totalValue = data.items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
      
      return apiRequest('/api/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({
          id: purchaseOrderId,
          vendorId: vendorId,
          orderDate: new Date().toISOString().split('T')[0],
          status: 'completed',
          totalItems: data.items.reduce((sum, item) => sum + item.quantity, 0),
          totalValue: totalValue.toString(),
          notes: 'Purchase order created via dashboard',
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      
      toast({
        title: "Success",
        description: "Purchase order created and items added to inventory",
      });
      
      // Reset form
      setCurrentStep(1);
      setVendorData(null);
      setPurchaseItems([]);
      vendorForm.reset();
      itemForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
    },
  });

  const handleVendorSubmit = async (data: VendorFormData) => {
    try {
      await createVendorMutation.mutateAsync(data);
      setVendorData(data);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error creating vendor:', error);
    }
  };

  const handleAddItem = (data: {
    name: string;
    model: string;
    categoryId: string;
    quantity: number;
    unitPrice: string;
    location: string;
  }) => {
    const category = categories.find((cat: any) => cat.id === data.categoryId);
    const totalPrice = (parseFloat(data.unitPrice) * data.quantity).toString();
    
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      ...data,
      categoryName: category?.name || 'Unknown',
      totalPrice,
      specifications: {}, // Add specifications as needed
    };

    setPurchaseItems([...purchaseItems, newItem]);
    setIsAddingItem(false);
    itemForm.reset();
  };

  const handleRemoveItem = (itemId: string) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== itemId));
  };

  const handleCreatePurchaseOrder = () => {
    if (!vendorData || purchaseItems.length === 0) {
      toast({
        title: "Error",
        description: "Please complete vendor information and add items",
        variant: "destructive",
      });
      return;
    }

    createPurchaseOrderMutation.mutate({
      vendorData,
      items: purchaseItems,
    });
  };

  const totalOrderValue = purchaseItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);

  return (
    <div className="bg-white rounded-lg border border-black p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-black hover:text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Trade
          </button>
          <h1 className="text-2xl font-bold text-black">Purchase Dashboard</h1>
        </div>
      </div>

      {/* New Purchase Creation Wizard */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-black mb-4">Create New Purchase Order</h2>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Vendor Info</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Items</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 3 ? <CheckCircle className="w-4 h-4" /> : '3'}
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white border border-black rounded-lg p-6">
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Step 1: Vendor Information</h3>
              
              {/* Vendor Selection */}
              {vendors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-black mb-3">Select Existing Vendor or Create New</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {vendors.map((vendor: any) => (
                      <button
                        key={vendor.id}
                        type="button"
                        onClick={() => {
                          vendorForm.reset({
                            name: vendor.name,
                            organization: vendor.organization || '',
                            country: vendor.country || '',
                            city: vendor.city || '',
                            state: vendor.state || '',
                            pincode: vendor.pincode || '',
                            address: vendor.address || '',
                            gstTaxId: vendor.gstTaxId || '',
                            contactPerson: vendor.contactPerson || '',
                            phone: vendor.phone || '',
                            email: vendor.email || '',
                            legalDocuments: vendor.legalDocuments || '',
                          });
                        }}
                        className="p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                      >
                        <div className="font-medium text-black">{vendor.name}</div>
                        <div className="text-sm text-gray-600">{vendor.organization || 'No organization'}</div>
                        <div className="text-sm text-gray-500">{vendor.email}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Or create a new vendor below:
                  </div>
                </div>
              )}

              <Form {...vendorForm}>
                <form onSubmit={vendorForm.handleSubmit(handleVendorSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={vendorForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter vendor name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter organization name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={vendorForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={vendorForm.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter pincode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="gstTaxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST/Tax ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter GST/Tax ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={vendorForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={vendorForm.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact person" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={vendorForm.control}
                    name="legalDocuments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Documents</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input placeholder="Upload legal documents" {...field} />
                            <Button type="button" variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                      Next: Add Items
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Step 2: Inventory Items</h3>
              
              {/* Categories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-black">Select Category</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category: any) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedCategoryId === category.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.itemCount || 0} items</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Item Form */}
              {selectedCategoryId && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-black">Add Item to Category</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingItem(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              )}

              {/* Purchase Items List */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-4">Purchase Items ({purchaseItems.length})</h4>
                {purchaseItems.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No items added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchaseItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-black">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.model} • {item.categoryName}</p>
                          <p className="text-sm text-gray-600">{item.location}</p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="font-medium text-black">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-600">₹{parseFloat(item.unitPrice).toLocaleString()} each</p>
                          <p className="text-sm font-medium text-black">₹{parseFloat(item.totalPrice).toLocaleString()}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  disabled={purchaseItems.length === 0}
                  onClick={() => setCurrentStep(3)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Next: Review
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Step 3: Review & Create Purchase Order</h3>
              
              {/* Vendor Summary */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-2">Vendor Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Vendor Name</p>
                      <p className="font-medium text-black">{vendorData?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Person</p>
                      <p className="font-medium text-black">{vendorData?.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-black">{vendorData?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-black">{vendorData?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-2">Purchase Items</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {purchaseItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium text-black">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.model} • {item.categoryName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-black">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-600">₹{parseFloat(item.totalPrice).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-2">Order Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium text-black">{purchaseItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-bold text-black text-lg">₹{totalOrderValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleCreatePurchaseOrder}
                  disabled={createPurchaseOrderMutation.isPending}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  {createPurchaseOrderMutation.isPending ? 'Creating...' : 'Create Purchase Order'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createCategoryMutation.mutate({ name: newCategoryName })}
                disabled={!newCategoryName || createCategoryMutation.isPending}
                className="bg-black text-white hover:bg-gray-800"
              >
                {createCategoryMutation.isPending ? 'Adding...' : 'Add Category'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(handleAddItem)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter item name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter model" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={itemForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        value={selectedCategoryId}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setSelectedCategoryId(e.target.value);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={itemForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter quantity"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price (₹) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter unit price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingItem(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Add Item
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Purchase History Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-black mb-4">Purchase History</h2>
        <div className="bg-white border border-black rounded-lg p-4">
          {purchaseHistory.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No purchase orders yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first purchase order above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchaseHistory.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-black">{order.vendorName}</p>
                    <p className="text-sm text-gray-600">{order.orderDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-black">{order.totalItems} items</p>
                    <p className="text-sm text-gray-600">₹{parseFloat(order.totalValue).toLocaleString()}</p>
                  </div>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}