import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Search, 
  Package,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ReplacementRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InventoryItem {
  _id: string;
  id: string;
  name: string;
  model: string;
  categoryId: string;
  quantityInStock: number;
  quantityRentedOut: number;
  location: string;
}

interface Unit {
  _id: string;
  id: string;
  itemId: string;
  serialNumber: string;
  barcode: string;
  status: string;
  location: string;
  currentCustomerId?: string;
}

interface Category {
  _id: string;
  id: string;
  name: string;
}

interface Customer {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
}

const replacementSchema = z.object({
  reason: z.enum(['warranty', 'damage', 'expired', 'defective', 'other']),
  notes: z.string().min(1, 'Notes are required'),
  replacementType: z.enum(['same', 'different']),
  newItemName: z.string().optional(),
  newItemModel: z.string().optional(),
  cost: z.number().min(0, 'Cost must be positive').optional(),
  vendorName: z.string().min(1, 'Vendor name is required'),
  warrantyExpiryDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.replacementType === 'different') {
    if (!data.newItemName || data.newItemName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'New item name is required when replacing with different item',
        path: ['newItemName'],
      });
    }
    if (!data.newItemModel || data.newItemModel.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'New item model is required when replacing with different item',
        path: ['newItemModel'],
      });
    }
  }
});

type ReplacementFormData = z.infer<typeof replacementSchema>;

export function ReplacementRequestModal({ isOpen, onClose }: ReplacementRequestModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: items = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/items'],
    enabled: isOpen,
  });

  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ['/api/units'],
    enabled: isOpen,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: isOpen,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    enabled: isOpen,
  });

  const form = useForm<ReplacementFormData>({
    resolver: zodResolver(replacementSchema),
    defaultValues: {
      reason: 'warranty',
      notes: '',
      replacementType: 'same',
      newItemName: '',
      newItemModel: '',
      cost: 0,
      vendorName: 'Default Vendor',
      warrantyExpiryDate: '',
    },
  });

  const watchReplacementType = form.watch('replacementType');

  // Get units for selected item
  const itemUnits = units.filter(unit => unit.itemId === selectedItem?.id);
  const rentedUnits = itemUnits.filter(unit => unit.status === 'Rented');
  const availableUnits = itemUnits.filter(unit => unit.status === 'Available');

  // Filter items for selection
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get available items for replacement (different item scenario)
  const availableReplacementItems = items.filter(item => {
    const itemAvailableUnits = units.filter(unit => unit.itemId === item.id && unit.status === 'Available');
    return itemAvailableUnits.length > 0;
  });

  // Create replacement mutation
  const createReplacementMutation = useMutation({
    mutationFn: async (data: ReplacementFormData & { unitId: string; itemId: string }) => {
      // Create replacement record using API
      const replacementData = {
        unitId: data.unitId,
        unitSerialNumber: selectedUnit?.serialNumber || '',
        itemId: data.itemId || '',
        itemName: selectedItem?.name || '',
        itemModel: selectedItem?.model || '',
        reason: data.reason,
        status: 'pending',
        requestDate: new Date().toISOString().split('T')[0],
        notes: data.notes || '',
        cost: String(data.cost || 0),
        vendorName: data.vendorName,
        warrantyExpiryDate: data.warrantyExpiryDate || '',
        customerId: selectedUnit?.currentCustomerId || '',
        customerName: selectedUnit?.currentCustomerId ? 
          (customers.find(c => c.id === selectedUnit?.currentCustomerId)?.name || '') : '',
      };

      // Create replacement request via API
      return await apiRequest('POST', '/api/replacement-requests', replacementData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Replacement request created successfully",
      });
      
      // Invalidate replacement cache to update dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/replacement-requests'] });
      
      // Reset form and close modal
      form.reset();
      setCurrentStep(1);
      setSelectedUnit(null);
      setSelectedItem(null);
      setSearchTerm('');
      setCategoryFilter('all');
      onClose();
    },
    onError: (error: any) => {
      console.error('Replacement creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create replacement request",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep === 1 && selectedItem && selectedUnit) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (data: ReplacementFormData) => {
    if (selectedUnit && selectedItem) {
      createReplacementMutation.mutate({
        ...data,
        unitId: selectedUnit.id,
        itemId: selectedItem.id,
      });
    }
  };

  const getItemCategory = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const getUnitCustomer = (unit: Unit) => {
    if (unit.currentCustomerId) {
      return customers.find(c => c.id === unit.currentCustomerId)?.name || 'Unknown Customer';
    }
    return 'Available';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Replacement Request</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Select Item & Unit</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Replacement Details</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 3 ? <CheckCircle className="w-4 h-4" /> : '3'}
              </div>
              <span className="text-sm font-medium">Review & Submit</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Item & Unit */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Step 1: Select Item & Unit for Replacement</h3>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search items by name or model..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => {
                  const itemUnitsForItem = units.filter(unit => unit.itemId === item.id);
                  const rentedUnitsForItem = itemUnitsForItem.filter(unit => unit.status === 'Rented');
                  const availableUnitsForItem = itemUnitsForItem.filter(unit => unit.status === 'Available');
                  
                  return (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedItem?.id === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-sm font-medium text-black">{item.name}</CardTitle>
                            <p className="text-xs text-gray-600">{item.model}</p>
                            <p className="text-xs text-gray-500">{getItemCategory(item.categoryId)}</p>
                          </div>
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Available:</span>
                            <span className="font-medium text-green-600">{availableUnitsForItem.length}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Rented:</span>
                            <span className="font-medium text-orange-600">{rentedUnitsForItem.length}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium text-black">{item.location}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Unit Selection */}
              {selectedItem && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-black mb-3">Select Unit for Replacement</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {itemUnits.map((unit) => {
                      const isSelectable = unit.status === 'Available' || unit.status === 'Rented';
                      const isSold = unit.status === 'Sold';
                      
                      return (
                        <Card
                          key={unit.id}
                          className={`transition-colors ${
                            isSold 
                              ? 'border-gray-200 opacity-50 cursor-not-allowed bg-gray-50' 
                              : isSelectable 
                                ? selectedUnit?.id === unit.id 
                                  ? 'border-blue-500 bg-blue-50 cursor-pointer' 
                                  : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                                : 'border-gray-200 opacity-75 cursor-not-allowed'
                          }`}
                          onClick={() => {
                            if (isSelectable) {
                              setSelectedUnit(unit);
                            }
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`text-sm font-medium ${isSold ? 'text-gray-400' : 'text-black'}`}>
                                  {unit.serialNumber}
                                </p>
                                <p className={`text-xs ${isSold ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {unit.barcode}
                                </p>
                                <p className={`text-xs ${isSold ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {getUnitCustomer(unit)}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge 
                                  className={`text-xs ${
                                    unit.status === 'Available' ? 'bg-green-100 text-green-800' : 
                                    unit.status === 'Rented' ? 'bg-orange-100 text-orange-800' : 
                                    unit.status === 'Sold' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {unit.status}
                                </Badge>
                                <p className={`text-xs mt-1 ${isSold ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {unit.location}
                                </p>
                              </div>
                            </div>
                            {isSold && (
                              <div className="mt-2 text-xs text-red-600 font-medium">
                                Cannot be replaced (Already Sold)
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Replacement Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Step 2: Replacement Details</h3>
              
              {/* Selected Item & Unit Summary */}
              <Card className="mb-6 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-black">{selectedItem?.name}</p>
                      <p className="text-sm text-gray-600">{selectedItem?.model}</p>
                      <p className="text-sm text-gray-500">Unit: {selectedUnit?.serialNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Replacement Reason *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="warranty">Warranty</SelectItem>
                              <SelectItem value="damage">Damage</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="defective">Defective</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="replacementType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Replacement Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="same">Same Item</SelectItem>
                              <SelectItem value="different">Different Item</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Different Item Details */}
                  {watchReplacementType === 'different' && (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> When replacing with a different item, the original item will be updated everywhere 
                          while keeping the same serial number. This ensures continuity in your inventory system.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="newItemName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Item Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter new item name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="newItemModel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Item Model *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter new item model" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Replacement Cost (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter cost"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter vendor name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="warrantyExpiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the issue and replacement details..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Step 3: Review & Submit</h3>
              
              <Card className="border border-black">
                <CardHeader>
                  <CardTitle className="text-lg">Replacement Request Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Item</p>
                      <p className="font-medium text-black">{selectedItem?.name}</p>
                      <p className="text-sm text-gray-600">{selectedItem?.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unit</p>
                      <p className="font-medium text-black">{selectedUnit?.serialNumber}</p>
                      <p className="text-sm text-gray-600">{selectedUnit?.barcode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="font-medium text-black">{form.getValues('reason')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Replacement Type</p>
                      <p className="font-medium text-black">{form.getValues('replacementType')}</p>
                    </div>
                    {form.getValues('replacementType') === 'different' && form.getValues('newItemName') && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">New Item Details</p>
                        <p className="font-medium text-black">
                          {form.getValues('newItemName')} - {form.getValues('newItemModel')}
                        </p>
                      </div>
                    )}
                    {form.getValues('cost') > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Cost</p>
                        <p className="font-medium text-black">₹{form.getValues('cost')?.toLocaleString()}</p>
                      </div>
                    )}
                    {form.getValues('vendorName') && (
                      <div>
                        <p className="text-sm text-gray-600">Vendor</p>
                        <p className="font-medium text-black">{form.getValues('vendorName')}</p>
                      </div>
                    )}
                  </div>
                  
                  {form.getValues('notes') && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-medium text-black">{form.getValues('notes')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handleBack}
            disabled={createReplacementMutation.isPending}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!selectedItem || !selectedUnit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              disabled={createReplacementMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createReplacementMutation.isPending ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Submit Request
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}