import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Edit,
  Eye,
  BarChart3,
  QrCode,
  Barcode,
  User,
  Phone,
  Mail,
  Building,
  X,
  Plus,
  Minus,
  Settings,
  CheckCircle,
  AlertCircle,
  Trash2,
  Search
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface RentalItemsPanelProps {
  customerId: number;
  customerName: string;
  onBack: () => void;
}

export default function RentalItemsPanel({ customerId, customerName, onBack }: RentalItemsPanelProps) {
  const [showViewUnitsDialog, setShowViewUnitsDialog] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnitsToRemove, setSelectedUnitsToRemove] = useState<string[]>([]);
  const [selectedUnitsToAdd, setSelectedUnitsToAdd] = useState<string[]>([]);
  const [modifyActiveTab, setModifyActiveTab] = useState('remove');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4 text-green-600" /></div>;
      case 'added':
        return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><Plus className="w-4 h-4 text-blue-600" /></div>;
      case 'removed':
        return <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"><Minus className="w-4 h-4 text-red-600" /></div>;
      case 'modified':
        return <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><Settings className="w-4 h-4 text-yellow-600" /></div>;
      default:
        return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><AlertCircle className="w-4 h-4 text-gray-600" /></div>;
    }
  };

  const getChangeTypeBadgeVariant = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'default';
      case 'added':
        return 'default';
      case 'removed':
        return 'destructive';
      case 'modified':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getItemName = (itemId: string) => {
    const item = items.find((item: any) => item.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  // Data queries
  const { data: services = [] } = useQuery({
    queryKey: ['/api/services'],
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: serviceItems = [] } = useQuery({
    queryKey: ['/api/service-items'],
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

  const { data: units = [] } = useQuery({
    queryKey: ['/api/units'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Timeline data for the customer
  const { data: timeline = [] } = useQuery({
    queryKey: ['/api/customers', customerId, 'timeline'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Handler functions
  const handleViewUnits = (serviceItem: any) => {
    setSelectedItem(serviceItem);
    setShowViewUnitsDialog(true);
  };

  const handleModify = (serviceItem: any) => {
    setSelectedItem(serviceItem);
    setSelectedUnitsToRemove([]);
    setSelectedUnitsToAdd([]);
    setSearchTerm('');
    setModifyActiveTab('remove');
    setShowModifyDialog(true);
  };

  const handleAddUnits = async () => {
    if (selectedUnitsToAdd.length === 0) return;
    
    try {
      // Simple implementation for now
      await Promise.all(selectedUnitsToAdd.map(unitId => 
        apiRequest(`/api/units/${unitId}`, {
          method: 'PUT',
          body: { status: 'rented' }
        })
      ));
      
      // Invalidate all relevant queries to force refetch
      await queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/service-items'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/rentals'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId, 'timeline'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
      // Force refetch of all queries
      await queryClient.refetchQueries({ queryKey: ['/api/units'] });
      await queryClient.refetchQueries({ queryKey: ['/api/service-items'] });
      await queryClient.refetchQueries({ queryKey: ['/api/items'] });
      
      setSelectedUnitsToAdd([]);
      setShowModifyDialog(false);
      toast({
        title: "Units Added Successfully",
        description: `Added ${selectedUnitsToAdd.length} units to rental`,
      });
    } catch (error) {
      console.error('Error adding units:', error);
      toast({
        title: "Error Adding Units",
        description: "Failed to add units to rental. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveUnits = async () => {
    if (selectedUnitsToRemove.length === 0) return;
    
    try {
      await Promise.all(selectedUnitsToRemove.map(unitId => 
        apiRequest(`/api/units/${unitId}`, {
          method: 'PUT',
          body: { status: 'In Stock' }
        })
      ));
      
      // Invalidate all relevant queries to force refetch
      await queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/service-items'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/rentals'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId, 'timeline'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
      // Force refetch of all queries
      await queryClient.refetchQueries({ queryKey: ['/api/units'] });
      await queryClient.refetchQueries({ queryKey: ['/api/service-items'] });
      await queryClient.refetchQueries({ queryKey: ['/api/items'] });
      
      setSelectedUnitsToRemove([]);
      setShowModifyDialog(false);
      toast({
        title: "Units Removed Successfully",
        description: `Removed ${selectedUnitsToRemove.length} units from rental`,
      });
    } catch (error) {
      console.error('Error removing units:', error);
      toast({
        title: "Error Removing Units",
        description: "Failed to remove units from rental. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleUnitSelection = (unitId: string, isRemoving: boolean) => {
    if (isRemoving) {
      setSelectedUnitsToRemove(prev => 
        prev.includes(unitId) 
          ? prev.filter(id => id !== unitId)
          : [...prev, unitId]
      );
    } else {
      setSelectedUnitsToAdd(prev => 
        prev.includes(unitId) 
          ? prev.filter(id => id !== unitId)
          : [...prev, unitId]
      );
    }
  };

  const getRentedUnitsForItem = (itemId: string) => {
    return units.filter((unit: any) => unit.itemId === itemId && unit.status === 'rented');
  };

  const getAvailableUnitsForItem = (itemId: string) => {
    return units.filter((unit: any) => unit.itemId === itemId && unit.status === 'In Stock');
  };

  // Get customer services
  const customerServices = services.filter((service: any) => service.customerId === customerId);
  const customerRentals = rentals.filter((rental: any) => rental.customerId === customerId);
  const activeRentals = customerRentals.filter((rental: any) => rental.isOngoing);

  // Get service items for customer services
  const customerServiceItems = serviceItems.filter((serviceItem: any) => 
    customerServices.some((service: any) => service.id === serviceItem.serviceId)
  );

  // Enrich service items with actual item details
  const enrichedServiceItems = customerServiceItems.map((serviceItem: any) => {
    const itemDetails = items.find((item: any) => item.id === serviceItem.itemId);
    const itemUnits = units.filter((unit: any) => unit.itemId === serviceItem.itemId);
    const rentedUnits = itemUnits.filter((unit: any) => unit.status === 'rented');
    
    return {
      ...serviceItem,
      itemDetails,
      availableUnits: itemUnits.length,
      rentedUnits: rentedUnits.length,
      unitPrice: serviceItem.unitPrice || itemDetails?.price || '0',
      totalValue: (parseFloat(serviceItem.unitPrice || itemDetails?.price || '0') * serviceItem.quantity).toFixed(2)
    };
  });

  const totalRentalValue = enrichedServiceItems.reduce((sum, item) => 
    sum + parseFloat(item.totalValue), 0
  );

  const totalItemsRented = enrichedServiceItems.reduce((sum, item) => 
    sum + item.quantity, 0
  );

  // Get units for the selected item that are actually rented by this customer
  const getItemUnits = (itemId: string, serviceItem: any) => {
    // Get units for this item that are currently rented
    const allItemUnits = units.filter((unit: any) => unit.itemId === itemId);
    const rentedUnits = allItemUnits.filter((unit: any) => unit.status === 'rented');
    
    // If we have the exact quantity rented, show only that many units
    // This assumes the first N rented units are the ones for this customer
    const quantityRented = serviceItem.quantity || 0;
    
    // Sort by creation date and take the first N units that are rented
    const sortedRentedUnits = rentedUnits.sort((a, b) => 
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
    
    return sortedRentedUnits.slice(0, quantityRented);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="border-black" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customer
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black">Active Rental Items</h1>
            <p className="text-gray-600">{customerName} - Rental Details</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-black">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Total Items Rented
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{totalItemsRented}</div>
            <p className="text-sm text-gray-600">items across all rentals</p>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Rental Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">₹{totalRentalValue.toFixed(2)}</div>
            <p className="text-sm text-gray-600">current rental value</p>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Active Rentals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{activeRentals.length}</div>
            <p className="text-sm text-gray-600">ongoing rental agreements</p>
          </CardContent>
        </Card>
      </div>

      {/* Rental Items */}
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Rental Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrichedServiceItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Rentals</h3>
              <p className="text-gray-600">This customer doesn't have any active rental items.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrichedServiceItems.map((serviceItem: any) => (
                <div key={serviceItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-black">{serviceItem.itemDetails?.name || 'Unknown Item'}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              SKU: {serviceItem.itemDetails?.sku || 'N/A'}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Quantity: {serviceItem.quantity}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              ₹{serviceItem.unitPrice} per unit
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-black">₹{serviceItem.totalValue}</div>
                        <div className="text-sm text-gray-600">Total Value</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewUnits(serviceItem)}
                          className="border-black hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Units
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleModify(serviceItem)}
                          className="border-black hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modify
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Rental Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {timeline.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No timeline entries yet</p>
                <p className="text-sm text-gray-500 mt-1">Timeline will show rental modifications and changes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((entry: any, index: number) => (
                  <div key={entry.id} className="relative">
                    <div className="flex items-start space-x-4">
                      {getChangeTypeIcon(entry.changeType)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-black">{entry.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getChangeTypeBadgeVariant(entry.changeType)}>
                              {entry.changeType}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-1">{entry.description}</p>
                        {entry.totalValue && (
                          <p className="text-sm text-gray-500 mt-1">
                            Total Value: ₹{entry.totalValue}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Timeline Line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200" style={{ marginLeft: '10px' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* View Units Dialog */}
      <Dialog open={showViewUnitsDialog} onOpenChange={setShowViewUnitsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>View Units - {selectedItem?.itemDetails?.name}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-black mb-2">Item Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>SKU:</strong> {selectedItem.itemDetails?.sku || 'N/A'}</p>
                    <p><strong>Category:</strong> {selectedItem.itemDetails?.categoryId || 'N/A'}</p>
                    <p><strong>Description:</strong> {selectedItem.itemDetails?.description || 'No description'}</p>
                    <p><strong>Quantity Rented:</strong> {selectedItem.quantity}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-2">Rental Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Unit Price:</strong> ₹{selectedItem.unitPrice}</p>
                    <p><strong>Total Value:</strong> ₹{selectedItem.totalValue}</p>
                    <p><strong>Rented Units:</strong> {selectedItem.rentedUnits}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold text-black mb-4">Individual Units (Rented by this Customer)</h3>
                {getItemUnits(selectedItem.itemId, selectedItem).length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No units currently rented by this customer</p>
                    <p className="text-sm text-gray-500 mt-1">Units will appear here when rented</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getItemUnits(selectedItem.itemId, selectedItem).map((unit: any) => (
                      <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-600" />
                            <span className="font-medium">Unit #{unit.serialNumber}</span>
                          </div>
                          <Badge variant={unit.status === 'rented' ? 'default' : 'secondary'}>
                            {unit.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <QrCode className="w-4 h-4 text-gray-500" />
                            <span>Serial: {unit.serialNumber}</span>
                          </div>
                          {unit.barcode && (
                            <div className="flex items-center space-x-2">
                              <Barcode className="w-4 h-4 text-gray-500" />
                              <span>Barcode: {unit.barcode}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Added: {new Date(unit.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Modify Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Modify Rental - {selectedItem?.itemDetails?.name}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Current Rental Status */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Current Quantity:</p>
                    <p className="text-lg font-bold">{selectedItem.quantity} units</p>
                  </div>
                  <div>
                    <p className="font-medium">Unit Price:</p>
                    <p className="text-lg font-bold">₹{selectedItem.unitPrice}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Value:</p>
                    <p className="text-lg font-bold">₹{selectedItem.totalValue}</p>
                  </div>
                </div>
              </div>

              {/* Tabbed Interface */}
              <Tabs value={modifyActiveTab} onValueChange={setModifyActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="remove" className="flex items-center space-x-2">
                    <Minus className="w-4 h-4" />
                    <span>Remove Units</span>
                  </TabsTrigger>
                  <TabsTrigger value="add" className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Units</span>
                  </TabsTrigger>
                </TabsList>

                {/* Remove Units Tab */}
                <TabsContent value="remove" className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Currently Rented Units</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getRentedUnitsForItem(selectedItem.itemId).map((unit: any) => (
                        <div
                          key={unit.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedUnitsToRemove.includes(unit.id)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleUnitSelection(unit.id, true)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-gray-600" />
                              <span className="font-medium">#{unit.serialNumber}</span>
                            </div>
                            <Badge variant="destructive">Rented</Badge>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Status: {unit.status}</p>
                            {unit.barcode && <p>Barcode: {unit.barcode}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedUnitsToRemove.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="font-medium text-red-800">
                          Selected {selectedUnitsToRemove.length} units for removal
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          These units will be returned to inventory as "In Stock"
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Add Units Tab */}
                <TabsContent value="add" className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Available Units to Add</h3>
                    
                    {/* Search Input */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by serial number or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-black"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getAvailableUnitsForItem(selectedItem.itemId)
                        .filter((unit: any) => 
                          unit.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (unit.barcode && unit.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((unit: any) => (
                          <div
                            key={unit.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              selectedUnitsToAdd.includes(unit.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleUnitSelection(unit.id, false)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Package className="w-4 h-4 text-gray-600" />
                                <span className="font-medium">#{unit.serialNumber}</span>
                              </div>
                              <Badge variant="secondary">Available</Badge>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>Status: {unit.status}</p>
                              {unit.barcode && <p>Barcode: {unit.barcode}</p>}
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    {selectedUnitsToAdd.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-800">
                          Selected {selectedUnitsToAdd.length} units to add
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          These units will be marked as "rented" and added to this rental
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowModifyDialog(false)}>
                  Cancel
                </Button>
                {modifyActiveTab === 'remove' && (
                  <Button 
                    variant="destructive" 
                    onClick={handleRemoveUnits}
                    disabled={selectedUnitsToRemove.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove {selectedUnitsToRemove.length} Units
                  </Button>
                )}
                {modifyActiveTab === 'add' && (
                  <Button 
                    onClick={handleAddUnits}
                    disabled={selectedUnitsToAdd.length === 0}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {selectedUnitsToAdd.length} Units
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}