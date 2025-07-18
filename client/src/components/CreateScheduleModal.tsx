import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Calendar, Clock, User, FileText } from 'lucide-react';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Item {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  unitsInStock: number;
}

interface ScheduleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function CreateScheduleModal({ isOpen, onClose }: CreateScheduleModalProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [frequency, setFrequency] = useState('monthly');
  const [interval, setInterval] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);

  const { toast } = useToast();

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    enabled: isOpen,
  });

  // Fetch items for selection
  const { data: items, isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ['/api/items'],
    enabled: showItemSelector,
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      return await apiRequest('POST', '/api/recurring-schedules', scheduleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/stats'] });
      toast({
        title: "Success",
        description: "Recurring schedule created successfully",
      });
      resetForm();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create recurring schedule",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setSelectedCustomer(null);
    setFrequency('monthly');
    setInterval(1);
    setStartDate('');
    setEndDate('');
    setDescription('');
    setScheduleItems([]);
    setShowItemSelector(false);
    setSelectedItem(null);
    setItemQuantity(1);
  };

  const handleAddItem = () => {
    if (!selectedItem) return;

    const newItem: ScheduleItem = {
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity: itemQuantity,
      unitPrice: selectedItem.unitPrice,
      totalPrice: itemQuantity * selectedItem.unitPrice
    };

    setScheduleItems([...scheduleItems, newItem]);
    setSelectedItem(null);
    setItemQuantity(1);
    setShowItemSelector(false);
  };

  const handleRemoveItem = (index: number) => {
    setScheduleItems(scheduleItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return scheduleItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleSubmit = () => {
    if (!selectedCustomer || !startDate || scheduleItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one item",
        variant: "destructive",
      });
      return;
    }

    const scheduleData = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      frequency,
      interval,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      description,
      items: scheduleItems,
      totalAmount: calculateTotal(),
      isActive: true,
      nextInvoiceDate: new Date(startDate).toISOString(),
    };

    createScheduleMutation.mutate(scheduleData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getNextInvoiceDate = () => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const next = new Date(start);
    
    if (frequency === 'monthly') {
      next.setMonth(next.getMonth() + interval);
    } else if (frequency === 'quarterly') {
      next.setMonth(next.getMonth() + (3 * interval));
    } else if (frequency === 'yearly') {
      next.setFullYear(next.getFullYear() + interval);
    }
    
    return next.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Recurring Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Selection */}
          <Card className="border-black">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Select Customer *</Label>
                <Select onValueChange={(value) => {
                  const customer = customers?.find(c => c.id === value);
                  setSelectedCustomer(customer || null);
                }}>
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersLoading ? (
                      <SelectItem value="loading">Loading customers...</SelectItem>
                    ) : (
                      customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="font-medium">{selectedCustomer.name}</div>
                  <div className="text-sm text-gray-600">{selectedCustomer.email}</div>
                  <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Configuration */}
          <Card className="border-black">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="interval">Interval</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                    className="border-black"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Every {interval} {frequency}
                  </div>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-black"
                  />
                </div>

                {startDate && (
                  <div>
                    <Label>Next Invoice Date</Label>
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      {formatDate(getNextInvoiceDate())}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Schedule description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Selection */}
          <Card className="border-black">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Invoice Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Add items that will be included in each recurring invoice
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowItemSelector(true)}
                  className="border-black"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {scheduleItems.length > 0 ? (
                <div className="space-y-2">
                  {scheduleItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex-1">
                        <div className="font-medium">{item.itemName}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="border-red-500 text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div className="font-medium">Total Amount</div>
                    <div className="font-bold text-lg">{formatCurrency(calculateTotal())}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items added yet. Click "Add Item" to get started.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-black"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createScheduleMutation.isPending || !selectedCustomer || !startDate || scheduleItems.length === 0}
              className="bg-black text-white hover:bg-gray-800"
            >
              {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </div>

        {/* Item Selector Modal */}
        {showItemSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg border border-black max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Select Item</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowItemSelector(false)}
                  className="border-black"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="item">Item</Label>
                  <Select onValueChange={(value) => {
                    const item = items?.find(i => i.id === value);
                    setSelectedItem(item || null);
                  }}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Choose an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemsLoading ? (
                        <SelectItem value="loading">Loading items...</SelectItem>
                      ) : (
                        items?.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - {formatCurrency(item.unitPrice)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedItem && (
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="font-medium">{selectedItem.name}</div>
                    <div className="text-sm text-gray-600">Category: {selectedItem.category}</div>
                    <div className="text-sm text-gray-600">Unit Price: {formatCurrency(selectedItem.unitPrice)}</div>
                    <div className="text-sm text-gray-600">In Stock: {selectedItem.unitsInStock}</div>
                  </div>
                )}

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                    className="border-black"
                  />
                </div>

                {selectedItem && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="font-medium">Total: {formatCurrency(selectedItem.unitPrice * itemQuantity)}</div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowItemSelector(false)}
                    className="border-black"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={!selectedItem}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}