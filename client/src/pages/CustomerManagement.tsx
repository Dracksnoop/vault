import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Package,
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types for the multi-step form
interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  customerType: 'one-time' | 'rental';
  companyName: string;
  billingAddress: string;
  shippingAddress: string;
  gstVatNumber: string;
  paymentTerms: string;
}

interface ServiceFormData {
  serviceType: 'rent' | 'sell' | 'maintenance' | 'others';
  notes: string;
}

interface SelectedItem {
  itemId: string;
  name: string;
  model: string;
  categoryName: string;
  quantity: number;
  availableQuantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface RentalFormData {
  startDate: string;
  endDate: string;
  isOngoing: boolean;
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
  monthlyRate: string;
  totalValue: string;
  notes: string;
}

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isValid: boolean;
}

// Step 1: Customer Details
const CustomerDetailsStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, isValid }) => {
  const handleInputChange = (field: string, value: string) => {
    updateFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Customer Details</h2>
        <p className="text-gray-600">Enter customer information and contact details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-black mb-2 block">Customer Type *</Label>
          <RadioGroup 
            value={formData.customerType} 
            onValueChange={(value) => handleInputChange('customerType', value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="one-time" id="one-time" />
              <Label htmlFor="one-time">One-Time</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rental" id="rental" />
              <Label htmlFor="rental">Rental</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-black">Full Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter customer name"
            className="border-black mt-1"
          />
        </div>

        <div>
          <Label className="text-black">Company Name</Label>
          <Input
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="Enter company name (optional)"
            className="border-black mt-1"
          />
        </div>

        <div>
          <Label className="text-black">Phone Number *</Label>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
            className="border-black mt-1"
          />
        </div>

        <div>
          <Label className="text-black">Email Address *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
            className="border-black mt-1"
          />
        </div>

        <div>
          <Label className="text-black">GST/VAT Number</Label>
          <Input
            value={formData.gstVatNumber}
            onChange={(e) => handleInputChange('gstVatNumber', e.target.value)}
            placeholder="Enter GST/VAT number (optional)"
            className="border-black mt-1"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-black">Billing Address *</Label>
          <Textarea
            value={formData.billingAddress}
            onChange={(e) => handleInputChange('billingAddress', e.target.value)}
            placeholder="Enter billing address"
            className="border-black mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label className="text-black">Shipping Address</Label>
          <Textarea
            value={formData.shippingAddress}
            onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
            placeholder="Enter shipping address (leave blank if same as billing)"
            className="border-black mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label className="text-black">Payment Terms</Label>
          <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
            <SelectTrigger className="border-black">
              <SelectValue placeholder="Select payment terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="net-30">Net 30</SelectItem>
              <SelectItem value="net-15">Net 15</SelectItem>
              <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
              <SelectItem value="cash-on-delivery">Cash on Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!isValid}
          className="bg-black text-white hover:bg-gray-800"
        >
          Next Step <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Step 2: Service Selection
const ServiceSelectionStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, onPrevious, isValid }) => {
  const serviceOptions = [
    { value: 'rent', label: 'Rent', icon: Calendar, description: 'Equipment rental services' },
    { value: 'sell', label: 'Sell', icon: Package, description: 'Purchase equipment' },
    { value: 'maintenance', label: 'Maintenance/Support', icon: Clock, description: 'Repair and maintenance' },
    { value: 'others', label: 'Others', icon: CheckCircle, description: 'Other services' }
  ];

  const handleServiceChange = (serviceType: string) => {
    updateFormData({ ...formData, serviceType });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Service Selection</h2>
        <p className="text-gray-600">Choose the type of service you need</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {serviceOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card 
              key={option.value}
              className={`cursor-pointer transition-all border-2 hover:shadow-lg ${
                formData.serviceType === option.value 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleServiceChange(option.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6 text-black" />
                  <div>
                    <h3 className="font-semibold text-black">{option.label}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <Label className="text-black">Service Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => updateFormData({ ...formData, notes: e.target.value })}
          placeholder="Enter any specific notes or requirements"
          className="border-black mt-1"
          rows={4}
        />
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={onPrevious}
          variant="outline"
          className="border-black"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isValid}
          className="bg-black text-white hover:bg-gray-800"
        >
          Next Step <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Step 3: Item Selection
const ItemSelectionStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, onPrevious, isValid }) => {
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: items = [] } = useQuery({
    queryKey: ['/api/items'],
  });

  const { data: units = [] } = useQuery({
    queryKey: ['/api/units'],
  });

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(formData.selectedItems || []);

  const groupedItems = items.reduce((acc: any, item: any) => {
    const category = categories.find((cat: any) => cat.id === item.categoryId);
    const categoryName = category?.name || 'Uncategorized';
    
    // Calculate real-time available quantity based on units
    const itemUnits = units.filter((unit: any) => unit.itemId === item.id);
    const availableQuantity = itemUnits.filter((unit: any) => unit.status === "In Stock").length;
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push({
      ...item,
      realTimeAvailableQuantity: availableQuantity
    });
    return acc;
  }, {});

  // Sort items within each category by available quantity (highest first)
  Object.keys(groupedItems).forEach(categoryName => {
    groupedItems[categoryName].sort((a: any, b: any) => b.realTimeAvailableQuantity - a.realTimeAvailableQuantity);
  });

  const handleItemSelect = (item: any, isSelected: boolean) => {
    if (isSelected) {
      const newItem: SelectedItem = {
        itemId: item.id,
        name: item.name,
        model: item.model,
        categoryName: categories.find((cat: any) => cat.id === item.categoryId)?.name || 'Uncategorized',
        quantity: 1,
        availableQuantity: item.realTimeAvailableQuantity,
        unitPrice: '0',
        totalPrice: '0'
      };
      setSelectedItems([...selectedItems, newItem]);
    } else {
      setSelectedItems(selectedItems.filter(selected => selected.itemId !== item.id));
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.itemId === itemId) {
        // Enforce stock limit - never allow more than available quantity
        const validQuantity = Math.min(Math.max(1, quantity), item.availableQuantity);
        return { 
          ...item, 
          quantity: validQuantity, 
          totalPrice: (parseFloat(item.unitPrice) * validQuantity).toString() 
        };
      }
      return item;
    }));
  };

  const handlePriceChange = (itemId: string, unitPrice: string) => {
    setSelectedItems(selectedItems.map(item => 
      item.itemId === itemId 
        ? { ...item, unitPrice, totalPrice: (parseFloat(unitPrice) * item.quantity).toString() }
        : item
    ));
  };

  // Update selected items when units change to reflect real-time availability
  useEffect(() => {
    const updatedSelectedItems = selectedItems.map(selectedItem => {
      const currentItem = items.find(item => item.id === selectedItem.itemId);
      if (currentItem) {
        const itemUnits = units.filter((unit: any) => unit.itemId === currentItem.id);
        const realTimeAvailable = itemUnits.filter((unit: any) => unit.status === "In Stock").length;
        return {
          ...selectedItem,
          availableQuantity: realTimeAvailable,
          quantity: Math.min(selectedItem.quantity, realTimeAvailable) // Adjust quantity if it exceeds available
        };
      }
      return selectedItem;
    });
    
    if (JSON.stringify(updatedSelectedItems) !== JSON.stringify(selectedItems)) {
      setSelectedItems(updatedSelectedItems);
    }
  }, [units, items]);

  useEffect(() => {
    updateFormData({ ...formData, selectedItems });
  }, [selectedItems]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Item Selection</h2>
        <p className="text-gray-600">Select items and specify quantities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Items */}
        <div>
          <h3 className="font-semibold text-black mb-4">Available Items</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedItems).map(([categoryName, categoryItems]: [string, any]) => (
              <div key={categoryName}>
                <h4 className="font-medium text-black mb-2">{categoryName}</h4>
                <div className="space-y-2">
                  {categoryItems.map((item: any) => (
                    <Card key={item.id} className={`border-gray-200 ${item.realTimeAvailableQuantity === 0 ? 'opacity-50' : ''}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedItems.some(selected => selected.itemId === item.id)}
                              onCheckedChange={(checked) => handleItemSelect(item, checked as boolean)}
                              disabled={item.realTimeAvailableQuantity === 0}
                            />
                            <div>
                              <p className="font-medium text-black">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.model}</p>
                              <div className="flex items-center space-x-2">
                                <p className={`text-sm ${
                                  item.realTimeAvailableQuantity === 0 ? 'text-red-500' : 
                                  item.realTimeAvailableQuantity <= 5 ? 'text-orange-500' : 
                                  'text-gray-500'
                                }`}>
                                  Available: {item.realTimeAvailableQuantity}
                                </p>
                                {item.realTimeAvailableQuantity === 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    Out of Stock
                                  </Badge>
                                )}
                                {item.realTimeAvailableQuantity > 0 && item.realTimeAvailableQuantity <= 5 && (
                                  <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
                                    Low Stock
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Items */}
        <div>
          <h3 className="font-semibold text-black mb-4">Selected Items ({selectedItems.length})</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items selected</p>
            ) : (
              selectedItems.map((item) => (
                <Card key={item.itemId} className="border-black">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.model}</p>
                          <Badge variant="outline" className="text-xs">
                            {item.categoryName}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemSelect({ id: item.itemId }, false)}
                          className="border-red-500 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs text-gray-600">
                            Quantity (Max: {item.availableQuantity})
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max={item.availableQuantity}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.itemId, parseInt(e.target.value) || 1)}
                            className={`text-sm ${
                              item.quantity === item.availableQuantity 
                                ? 'border-orange-500 bg-orange-50' 
                                : 'border-gray-300'
                            }`}
                          />
                          {item.quantity === item.availableQuantity && (
                            <p className="text-xs text-orange-600 mt-1">
                              Maximum stock reached
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Unit Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handlePriceChange(item.itemId, e.target.value)}
                            className="border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Total</Label>
                          <Input
                            value={item.totalPrice}
                            readOnly
                            className="border-gray-300 text-sm bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={onPrevious}
          variant="outline"
          className="border-black"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isValid}
          className="bg-black text-white hover:bg-gray-800"
        >
          Next Step <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Step 4: Rental Terms (only shown if service type is 'rent')
const RentalTermsStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, onPrevious, isValid }) => {
  const handleInputChange = (field: string, value: string | boolean) => {
    updateFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Rental Terms</h2>
        <p className="text-gray-600">Define rental period and payment terms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-black">Rental Start Date *</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="border-black mt-1"
          />
        </div>

        <div>
          <Label className="text-black">Rental End Date</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            disabled={formData.isOngoing}
            className="border-black mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ongoing"
              checked={formData.isOngoing}
              onCheckedChange={(checked) => handleInputChange('isOngoing', checked as boolean)}
            />
            <Label htmlFor="ongoing" className="text-black">
              This is an ongoing rental (no end date)
            </Label>
          </div>
        </div>

        <div>
          <Label className="text-black">Payment Frequency *</Label>
          <Select 
            value={formData.paymentFrequency} 
            onValueChange={(value) => handleInputChange('paymentFrequency', value)}
          >
            <SelectTrigger className="border-black">
              <SelectValue placeholder="Select payment frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-black">Monthly Rate</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.monthlyRate}
            onChange={(e) => handleInputChange('monthlyRate', e.target.value)}
            placeholder="Enter monthly rate"
            className="border-black mt-1"
          />
        </div>

        <div>
          <Label className="text-black">Total Value</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.totalValue}
            onChange={(e) => handleInputChange('totalValue', e.target.value)}
            placeholder="Enter total rental value"
            className="border-black mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-black">Rental Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Enter any specific rental terms or conditions"
          className="border-black mt-1"
          rows={4}
        />
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={onPrevious}
          variant="outline"
          className="border-black"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isValid}
          className="bg-black text-white hover:bg-gray-800"
        >
          Review & Confirm <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Step 5: Review & Confirm
const ReviewStep: React.FC<StepProps & { onSubmit: () => void; isSubmitting: boolean }> = ({ 
  formData, 
  onPrevious, 
  onSubmit, 
  isSubmitting 
}) => {
  const { customerData, serviceData, selectedItems, rentalData } = formData;

  const totalValue = selectedItems?.reduce((sum: number, item: SelectedItem) => 
    sum + parseFloat(item.totalPrice || '0'), 0
  ) || 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Review & Confirm</h2>
        <p className="text-gray-600">Review all information before submitting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card className="border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Name:</strong> {customerData.name}</div>
            <div><strong>Type:</strong> {customerData.customerType}</div>
            <div><strong>Email:</strong> {customerData.email}</div>
            <div><strong>Phone:</strong> {customerData.phone}</div>
            {customerData.companyName && <div><strong>Company:</strong> {customerData.companyName}</div>}
            {customerData.gstVatNumber && <div><strong>GST/VAT:</strong> {customerData.gstVatNumber}</div>}
            <div><strong>Billing Address:</strong> {customerData.billingAddress}</div>
          </CardContent>
        </Card>

        {/* Service Information */}
        <Card className="border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Service Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Service Type:</strong> {serviceData.serviceType}</div>
            {serviceData.notes && <div><strong>Notes:</strong> {serviceData.notes}</div>}
          </CardContent>
        </Card>

        {/* Selected Items */}
        <Card className="border-black lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Selected Items ({selectedItems?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedItems?.map((item: SelectedItem) => (
                <div key={item.itemId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.model} - {item.categoryName}</p>
                  </div>
                  <div className="text-right">
                    <p>Qty: {item.quantity}</p>
                    <p>Total: ${item.totalPrice}</p>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>Total Value:</span>
                <span>${totalValue.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Terms (if applicable) */}
        {serviceData.serviceType === 'rent' && rentalData && (
          <Card className="border-black lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rental Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Start Date:</strong> {rentalData.startDate}</div>
              {rentalData.endDate && <div><strong>End Date:</strong> {rentalData.endDate}</div>}
              {rentalData.isOngoing && <div><strong>Duration:</strong> Ongoing</div>}
              <div><strong>Payment Frequency:</strong> {rentalData.paymentFrequency}</div>
              {rentalData.monthlyRate && <div><strong>Monthly Rate:</strong> ${rentalData.monthlyRate}</div>}
              {rentalData.totalValue && <div><strong>Total Value:</strong> ${rentalData.totalValue}</div>}
              {rentalData.notes && <div><strong>Notes:</strong> {rentalData.notes}</div>}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={onPrevious}
          variant="outline"
          className="border-black"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Previous
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="bg-black text-white hover:bg-gray-800"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Customer'}
        </Button>
      </div>
    </div>
  );
};

// Main Component
export default function CustomerManagement() {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    customerType: 'one-time',
    companyName: '',
    billingAddress: '',
    shippingAddress: '',
    gstVatNumber: '',
    paymentTerms: '',
  });
  const [serviceData, setServiceData] = useState<ServiceFormData>({
    serviceType: 'rent',
    notes: '',
  });
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [rentalData, setRentalData] = useState<RentalFormData>({
    startDate: '',
    endDate: '',
    isOngoing: false,
    paymentFrequency: 'monthly',
    monthlyRate: '',
    totalValue: '',
    notes: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const steps = [
    { title: 'Customer Details', description: 'Basic information' },
    { title: 'Service Selection', description: 'Choose service type' },
    { title: 'Item Selection', description: 'Select items' },
    ...(serviceData.serviceType === 'rent' ? [{ title: 'Rental Terms', description: 'Define rental period' }] : []),
    { title: 'Review & Confirm', description: 'Final review' },
  ];

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/customers/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Customer created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      // Reset form
      setCurrentStep(1);
      setCustomerData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        customerType: 'one-time',
        companyName: '',
        billingAddress: '',
        shippingAddress: '',
        gstVatNumber: '',
        paymentTerms: '',
      });
      setServiceData({ serviceType: 'rent', notes: '' });
      setSelectedItems([]);
      setRentalData({
        startDate: '',
        endDate: '',
        isOngoing: false,
        paymentFrequency: 'monthly',
        monthlyRate: '',
        totalValue: '',
        notes: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const submissionData = {
      customerData,
      serviceData,
      selectedItems,
      rentalData: serviceData.serviceType === 'rent' ? rentalData : null,
    };

    submitMutation.mutate(submissionData);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return customerData.name && customerData.email && customerData.phone && customerData.billingAddress;
      case 2:
        return serviceData.serviceType;
      case 3:
        return selectedItems.length > 0;
      case 4:
        return serviceData.serviceType !== 'rent' || (rentalData.startDate && rentalData.paymentFrequency);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    const commonProps = {
      onNext: () => setCurrentStep(currentStep + 1),
      onPrevious: () => setCurrentStep(currentStep - 1),
      isValid: validateStep(currentStep),
    };

    switch (currentStep) {
      case 1:
        return (
          <CustomerDetailsStep
            formData={customerData}
            updateFormData={setCustomerData}
            {...commonProps}
          />
        );
      case 2:
        return (
          <ServiceSelectionStep
            formData={serviceData}
            updateFormData={setServiceData}
            {...commonProps}
          />
        );
      case 3:
        return (
          <ItemSelectionStep
            formData={{ selectedItems }}
            updateFormData={(data) => setSelectedItems(data.selectedItems)}
            {...commonProps}
          />
        );
      case 4:
        if (serviceData.serviceType === 'rent') {
          return (
            <RentalTermsStep
              formData={rentalData}
              updateFormData={setRentalData}
              {...commonProps}
            />
          );
        } else {
          return (
            <ReviewStep
              formData={{ customerData, serviceData, selectedItems, rentalData }}
              updateFormData={() => {}}
              onPrevious={() => setCurrentStep(currentStep - 1)}
              onSubmit={handleSubmit}
              isSubmitting={submitMutation.isPending}
              isValid={true}
            />
          );
        }
      case 5:
        return (
          <ReviewStep
            formData={{ customerData, serviceData, selectedItems, rentalData }}
            updateFormData={() => {}}
            onPrevious={() => setCurrentStep(currentStep - 1)}
            onSubmit={handleSubmit}
            isSubmitting={submitMutation.isPending}
            isValid={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-2 sm:p-4 lg:p-6">
        {/* Progress Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">Customer Management</h1>
            <div className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </div>
          </div>
          
          <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
          
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`
                  w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                  ${index + 1 <= currentStep ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {index + 1}
                </div>
                <div className="text-center mt-2 max-w-20 sm:max-w-none">
                  <p className="text-xs sm:text-sm font-medium text-black">{step.title}</p>
                  <p className="text-xs text-gray-600 hidden sm:block">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-black">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}