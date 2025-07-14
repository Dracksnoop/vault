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
  
  // New states for adding more items
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Items, 2: Configure Units & Pricing
  
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

  const handleAddMoreItems = () => {
    setShowAddItemDialog(true);
    setSelectedItems([]);
    setItemSearchTerm('');
    setCurrentStep(1);
  };

  const handleSelectItem = (item: any) => {
    const availableUnits = getAvailableUnitsForItem(item.id);
    if (availableUnits.length === 0) {
      toast({
        title: "No Units Available",
        description: `${item.name} has no available units for rental`,
        variant: "destructive",
      });
      return;
    }

    const isAlreadySelected = selectedItems.some(selected => selected.id === item.id);
    if (isAlreadySelected) {
      toast({
        title: "Item Already Selected",
        description: `${item.name} is already in your selection`,
        variant: "destructive",
      });
      return;
    }

    const newSelectedItem = {
      id: item.id,
      itemDetails: item,
      availableUnits: availableUnits,
      selectedUnits: [],
      unitPrice: '1000', // Default price
      totalValue: 0
    };

    setSelectedItems([...selectedItems, newSelectedItem]);
    toast({
      title: "Item Added",
      description: `${item.name} added to selection`,
    });
  };

  const handleRemoveSelectedItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleUnitSelection = (itemId: string, unitId: string) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === itemId) {
        const isSelected = item.selectedUnits.includes(unitId);
        const newSelectedUnits = isSelected 
          ? item.selectedUnits.filter((id: string) => id !== unitId)
          : [...item.selectedUnits, unitId];
        
        return {
          ...item,
          selectedUnits: newSelectedUnits,
          totalValue: newSelectedUnits.length * parseFloat(item.unitPrice)
        };
      }
      return item;
    }));
  };

  const handleUnitPriceChange = (itemId: string, newPrice: string) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === itemId) {
        const price = parseFloat(newPrice) || 0;
        return {
          ...item,
          unitPrice: newPrice,
          totalValue: item.selectedUnits.length * price
        };
      }
      return item;
    }));
  };

  const handleNextStep = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to continue",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleAddToPending = () => {
    const validItems = selectedItems.filter(item => item.selectedUnits.length > 0);
    
    if (validItems.length === 0) {
      toast({
        title: "No Units Selected",
        description: "Please select units for at least one item",
        variant: "destructive",
      });
      return;
    }

    const newPendingItems = validItems.map(item => ({
      id: `pending-${Date.now()}-${Math.random()}`,
      itemId: item.id,
      itemDetails: item.itemDetails,
      units: item.selectedUnits,
      unitPrice: item.unitPrice,
      totalValue: item.totalValue
    }));

    setPendingItems([...pendingItems, ...newPendingItems]);
    setSelectedItems([]);
    setCurrentStep(1);
    setShowAddItemDialog(false);
    
    toast({
      title: "Items Added to Pending",
      description: `${validItems.length} item(s) added to pending list`,
    });
  };

  const handlePushToTimeline = async () => {
    if (pendingItems.length === 0) return;
    
    try {
      // Get the service ID for this customer
      const customerService = customerServices.find(service => service.customerId === customerId);
      const serviceId = customerService?.id || serviceItems[0]?.serviceId || 'default-service';
      
      // Add each pending item to the rental
      for (const pendingItem of pendingItems) {
        // Update unit statuses to rented and assign to customer
        await Promise.all(pendingItem.units.map((unitId: string) => 
          apiRequest(`/api/units/${unitId}`, {
            method: 'PUT',
            body: { 
              status: 'Rented',
              currentCustomerId: customerId,
              rentedBy: customerId,
              serviceId: serviceId
            }
          })
        ));
        
        // Check if this item already exists for this customer
        const existingServiceItem = customerServiceItems.find(
          (serviceItem: any) => serviceItem.itemId === pendingItem.itemId
        );
        
        if (existingServiceItem) {
          // Update existing service item - increase quantity and recalculate total
          const newQuantity = existingServiceItem.quantity + pendingItem.units.length;
          const newTotalValue = (parseFloat(pendingItem.unitPrice) * newQuantity).toFixed(2);
          
          await apiRequest(`/api/service-items/${existingServiceItem.id}`, {
            method: 'PUT',
            body: {
              quantity: newQuantity,
              unitPrice: pendingItem.unitPrice,
              totalValue: newTotalValue
            }
          });
        } else {
          // Create new service item record
          await apiRequest('/api/service-items', {
            method: 'POST',
            body: {
              id: `service-item-${Date.now()}-${Math.random()}`,
              serviceId: serviceId,
              itemId: pendingItem.itemId,
              quantity: pendingItem.units.length,
              unitPrice: pendingItem.unitPrice,
              totalValue: pendingItem.totalValue.toString()
            }
          });
        }
      }
      
      // Create timeline entry showing complete rental snapshot (existing + new items)
      try {
        // Create complete snapshot of all items in rental after adding new items
        const completeItemsSnapshot = [];
        
        // Add existing items with their current units
        for (const existingItem of enrichedServiceItems) {
          const existingUnits = getUnitsForItem(existingItem.itemId);
          if (existingUnits.length > 0) {
            completeItemsSnapshot.push({
              itemName: existingItem.itemDetails?.name || 'Unknown Item',
              unitPrice: parseFloat(existingItem.unitPrice || '0'),
              units: existingUnits.map((unit: any) => ({
                unitId: unit.id,
                serialNumber: unit.serialNumber || 'N/A',
                barcode: unit.barcode || 'N/A'
              }))
            });
          }
        }
        
        // Add newly added items
        for (const newItem of pendingItems) {
          // Check if this item already exists in existing items
          const existingItemIndex = completeItemsSnapshot.findIndex(
            item => item.itemName === newItem.itemDetails.name
          );
          
          if (existingItemIndex >= 0) {
            // Add units to existing item
            const newUnits = newItem.units.map((unitId: string) => {
              const unit = units.find((u: any) => u.id === unitId);
              return {
                unitId,
                serialNumber: unit?.serialNumber || 'N/A',
                barcode: unit?.barcode || 'N/A'
              };
            });
            completeItemsSnapshot[existingItemIndex].units.push(...newUnits);
          } else {
            // Add as new item
            completeItemsSnapshot.push({
              itemName: newItem.itemDetails.name,
              unitPrice: parseFloat(newItem.unitPrice || '0'),
              units: newItem.units.map((unitId: string) => {
                const unit = units.find((u: any) => u.id === unitId);
                return {
                  unitId,
                  serialNumber: unit?.serialNumber || 'N/A',
                  barcode: unit?.barcode || 'N/A'
                };
              })
            });
          }
        }
        
        // Calculate total value of entire rental
        const totalRentalValue = completeItemsSnapshot.reduce((sum: number, item: any) => 
          sum + (item.unitPrice * item.units.length), 0);
        
        await apiRequest(`/api/customers/${customerId}/timeline`, {
          method: 'POST',
          body: {
            id: `timeline-${Date.now()}`,
            customerId: parseInt(customerId.toString()),
            serviceId: serviceId,
            changeType: 'added',
            title: 'Items Added to Rental',
            description: `Added ${pendingItems.length} new item type(s) to rental (Total: ${completeItemsSnapshot.length} item types)`,
            itemsSnapshot: JSON.stringify(completeItemsSnapshot),
            totalValue: totalRentalValue.toString()
          }
        });
      } catch (timelineError) {
        console.warn('Failed to create timeline entry:', timelineError);
      }
      
      // Clear pending items and refresh all related data
      setPendingItems([]);
      
      // Invalidate all queries to ensure fresh data across the entire app
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rentals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      // Force refetch service items to update the current view
      await queryClient.refetchQueries({ queryKey: ['/api/service-items'] });
      
      toast({
        title: "Items Pushed to Timeline",
        description: `${pendingItems.length} item(s) added to rental successfully`,
      });
    } catch (error) {
      console.error('Error pushing to timeline:', error);
      toast({
        title: "Error Pushing Items",
        description: "Failed to add items to rental. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePendingItem = (itemId: string) => {
    setPendingItems(pendingItems.filter(item => item.id !== itemId));
    toast({
      title: "Item Removed",
      description: "Item removed from pending list",
    });
  };

  const handleAddUnits = async () => {
    if (selectedUnitsToAdd.length === 0) return;
    
    try {
      // Update unit statuses to rented and assign to customer
      await Promise.all(selectedUnitsToAdd.map(unitId => 
        apiRequest(`/api/units/${unitId}`, {
          method: 'PUT',
          body: { 
            status: 'Rented',
            currentCustomerId: customerId,
            rentedBy: customerId,
            serviceId: selectedItem.serviceId
          }
        })
      ));
      
      // Get unit details for timeline entry
      const addedUnitDetails = selectedUnitsToAdd.map(unitId => {
        const unit = units.find((u: any) => u.id === unitId);
        return {
          unitId: unitId,
          serialNumber: unit?.serialNumber || 'N/A',
          barcode: unit?.barcode || 'N/A'
        };
      });
      
      // Create timeline entry for units added with complete rental state snapshot
      try {
        // Create complete snapshot of all items in rental after adding units
        const completeItemsSnapshot = [];
        
        // Add all current service items with their units
        for (const serviceItem of enrichedServiceItems) {
          const itemUnits = getRentedUnitsForItem(serviceItem.itemId);
          
          // If this is the item we're adding units to, include the new units
          if (serviceItem.itemId === selectedItem.itemId) {
            const newUnits = selectedUnitsToAdd.map(unitId => {
              const unit = units.find((u: any) => u.id === unitId);
              return {
                unitId,
                serialNumber: unit?.serialNumber || 'N/A',
                barcode: unit?.barcode || 'N/A'
              };
            });
            itemUnits.push(...newUnits);
          }
          
          if (itemUnits.length > 0) {
            completeItemsSnapshot.push({
              itemName: serviceItem.itemDetails?.name || 'Unknown Item',
              unitPrice: parseFloat(serviceItem.unitPrice || '0'),
              units: itemUnits.map((unit: any) => ({
                unitId: unit.id,
                serialNumber: unit.serialNumber || 'N/A',
                barcode: unit.barcode || 'N/A'
              }))
            });
          }
        }
        
        // Calculate total value of entire rental
        const totalRentalValue = completeItemsSnapshot.reduce((sum: number, item: any) => 
          sum + (item.unitPrice * item.units.length), 0);
        
        await apiRequest(`/api/customers/${customerId}/timeline`, {
          method: 'POST',
          body: {
            id: `timeline-${Date.now()}`,
            customerId: parseInt(customerId),
            serviceId: selectedItem.serviceId,
            changeType: 'added',
            title: 'Units Added to Rental',
            description: `Added ${selectedUnitsToAdd.length} unit(s) to ${selectedItem.itemDetails?.name || 'rental'}`,
            itemsSnapshot: JSON.stringify(completeItemsSnapshot),
            totalValue: totalRentalValue.toString()
          }
        });
      } catch (timelineError) {
        console.warn('Failed to create timeline entry:', timelineError);
      }
      
      // Invalidate all relevant queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rentals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
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
      // Get unit details for timeline entry before removing
      const removedUnitDetails = selectedUnitsToRemove.map(unitId => {
        const unit = units.find((u: any) => u.id === unitId);
        return {
          unitId: unitId,
          serialNumber: unit?.serialNumber || 'N/A',
          barcode: unit?.barcode || 'N/A'
        };
      });
      
      // Update unit statuses to Available and clear customer assignment
      await Promise.all(selectedUnitsToRemove.map(unitId => 
        apiRequest(`/api/units/${unitId}`, {
          method: 'PUT',
          body: { 
            status: 'Available',
            currentCustomerId: null,
            rentedBy: null,
            serviceId: null
          }
        })
      ));
      
      // Create timeline entry for units removed with complete rental state snapshot
      try {
        // Create complete snapshot of all items in rental after removing units
        const completeItemsSnapshot = [];
        
        // Add all current service items with their units
        for (const serviceItem of enrichedServiceItems) {
          let itemUnits = getRentedUnitsForItem(serviceItem.itemId);
          
          // If this is the item we're removing units from, exclude the removed units
          if (serviceItem.itemId === selectedItem.itemId) {
            itemUnits = itemUnits.filter((unit: any) => !selectedUnitsToRemove.includes(unit.id));
          }
          
          if (itemUnits.length > 0) {
            completeItemsSnapshot.push({
              itemName: serviceItem.itemDetails?.name || 'Unknown Item',
              unitPrice: parseFloat(serviceItem.unitPrice || '0'),
              units: itemUnits.map((unit: any) => ({
                unitId: unit.id,
                serialNumber: unit.serialNumber || 'N/A',
                barcode: unit.barcode || 'N/A'
              }))
            });
          }
        }
        
        // Calculate total value of entire rental
        const totalRentalValue = completeItemsSnapshot.reduce((sum: number, item: any) => 
          sum + (item.unitPrice * item.units.length), 0);
        
        await apiRequest(`/api/customers/${customerId}/timeline`, {
          method: 'POST',
          body: {
            id: `timeline-${Date.now()}`,
            customerId: parseInt(customerId),
            serviceId: selectedItem.serviceId,
            changeType: 'removed',
            title: 'Units Removed from Rental',
            description: `Removed ${selectedUnitsToRemove.length} unit(s) from ${selectedItem.itemDetails?.name || 'rental'}`,
            itemsSnapshot: JSON.stringify(completeItemsSnapshot),
            totalValue: totalRentalValue.toString()
          }
        });
      } catch (timelineError) {
        console.warn('Failed to create timeline entry:', timelineError);
      }
      
      // Invalidate all relevant queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rentals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
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
    return units.filter((unit: any) => 
      unit.itemId === itemId && 
      unit.status === 'Rented' && 
      unit.currentCustomerId === customerId
    );
  };

  const getAvailableUnitsForItem = (itemId: string) => {
    return units.filter((unit: any) => unit.itemId === itemId && unit.status === 'Available' && !unit.currentCustomerId);
  };

  // Get customer services
  const customerServices = services.filter((service: any) => service.customerId === customerId);
  const customerRentals = rentals.filter((rental: any) => rental.customerId === customerId);
  const activeRentals = customerRentals.filter((rental: any) => rental.isOngoing);

  // Get service items for customer services
  const customerServiceItems = serviceItems.filter((serviceItem: any) => 
    customerServices.some((service: any) => service.id === serviceItem.serviceId)
  );

  // Group service items by item ID to avoid duplicates
  const groupedServiceItems = customerServiceItems.reduce((acc: any, serviceItem: any) => {
    if (!acc[serviceItem.itemId]) {
      acc[serviceItem.itemId] = {
        ...serviceItem,
        quantity: 0,
        totalValue: 0
      };
    }
    
    // Sum quantities and recalculate total value based on latest unit price
    acc[serviceItem.itemId].quantity += serviceItem.quantity || 0;
    acc[serviceItem.itemId].unitPrice = serviceItem.unitPrice; // Use latest unit price
    acc[serviceItem.itemId].totalValue = (parseFloat(serviceItem.unitPrice || '0') * acc[serviceItem.itemId].quantity).toFixed(2);
    
    return acc;
  }, {});

  // Enrich grouped service items with actual item details
  const enrichedServiceItems = Object.values(groupedServiceItems).map((serviceItem: any) => {
    const itemDetails = items.find((item: any) => item.id === serviceItem.itemId);
    const itemUnits = units.filter((unit: any) => unit.itemId === serviceItem.itemId);
    
    // Only count units that are rented by THIS specific customer
    const customerRentedUnits = itemUnits.filter((unit: any) => 
      unit.status === 'Rented' && unit.currentCustomerId === customerId
    );
    
    return {
      ...serviceItem,
      itemDetails,
      availableUnits: itemUnits.length,
      rentedUnits: customerRentedUnits.length,
      quantity: customerRentedUnits.length, // Use customer-specific rented units count
      unitPrice: serviceItem.unitPrice || itemDetails?.price || '0',
      totalValue: (parseFloat(serviceItem.unitPrice || itemDetails?.price || '0') * customerRentedUnits.length).toFixed(2)
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
    // Get units for this item that are rented by THIS specific customer
    const allItemUnits = units.filter((unit: any) => unit.itemId === itemId);
    const customerRentedUnits = allItemUnits.filter((unit: any) => 
      unit.status === 'Rented' && unit.currentCustomerId === customerId
    );
    
    return customerRentedUnits;
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Rental Items</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddMoreItems}
              className="border-black hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add More Items
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pending Items Section */}
          {pendingItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">Pending Items</h3>
                <Button 
                  onClick={handlePushToTimeline}
                  className="bg-black text-white hover:bg-gray-800"
                  size="sm"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Push to Timeline
                </Button>
              </div>
              <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                {pendingItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-black">{item.itemDetails.name}</h4>
                        <p className="text-sm text-gray-600">{item.units.length} units • ₹{item.unitPrice} per unit</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="font-semibold text-black">₹{item.totalValue}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemovePendingItem(item.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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

      {/* Enhanced Rental Timeline */}
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Rental Timeline</span>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Complete rental state snapshots showing all items and quantities at each point in time
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {timeline.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No timeline entries yet</p>
                <p className="text-sm text-gray-500 mt-1">Timeline will show rental modifications and changes</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                <div className="space-y-8">
                  {timeline.map((entry: any, index: number) => (
                    <div key={entry.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute left-4 w-4 h-4 bg-white border-2 border-blue-500 rounded-full z-10" />
                      
                      {/* Date and time between boxes */}
                      <div className="ml-12 mb-4">
                        <div className="text-sm font-medium text-gray-700">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      {/* Timeline snapshot box */}
                      <div className="ml-12 bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        {/* Box header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getChangeTypeIcon(entry.changeType)}
                            <h3 className="font-semibold text-black">{entry.title}</h3>
                          </div>
                          <Badge variant={getChangeTypeBadgeVariant(entry.changeType)}>
                            {entry.changeType}
                          </Badge>
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4">{entry.description}</p>
                        
                        {/* Complete rental snapshot */}
                        {entry.itemsSnapshot && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                              <Package className="w-4 h-4 mr-2" />
                              Complete Rental State
                            </h4>
                            <div className="space-y-3">
                              {(() => {
                                try {
                                  const snapshotData = JSON.parse(entry.itemsSnapshot);
                                  
                                  // Handle different snapshot formats
                                  if (Array.isArray(snapshotData)) {
                                    // New format: array of items with their units
                                    if (snapshotData.length > 0 && snapshotData[0].itemName) {
                                      return snapshotData.map((item: any, itemIndex: number) => (
                                        <div key={itemIndex} className="bg-white border border-gray-200 rounded-md p-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                              <Package className="w-4 h-4 text-blue-600" />
                                              <span className="font-medium text-gray-800">{item.itemName}</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                              <span className="text-sm text-gray-600">
                                                Quantity: {item.units?.length || 0}
                                              </span>
                                              <span className="text-sm font-medium text-gray-800">
                                                ₹{(item.unitPrice * (item.units?.length || 0)).toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                          {item.units && item.units.length > 0 && (
                                            <div className="ml-6 space-y-1">
                                              {item.units.map((unit: any, unitIndex: number) => (
                                                <div key={unitIndex} className="flex items-center text-xs text-gray-500">
                                                  <span className="mr-2">#{unit.serialNumber}</span>
                                                  <span>{unit.barcode}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ));
                                    } else {
                                      // Old format: array of units
                                      return (
                                        <div className="bg-white border border-gray-200 rounded-md p-3">
                                          <div className="grid grid-cols-2 gap-2">
                                            {snapshotData.map((unit: any, unitIndex: number) => (
                                              <div key={unitIndex} className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">#{unit.serialNumber}</span>
                                                <span className="text-gray-500">{unit.barcode}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    }
                                  } else {
                                    return <span className="text-sm text-gray-500">Snapshot format not supported</span>;
                                  }
                                } catch (e) {
                                  return <span className="text-sm text-gray-500">Snapshot data unavailable</span>;
                                }
                              })()}
                            </div>
                            
                            {/* Total value */}
                            {entry.totalValue && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-700">Total Rental Value:</span>
                                  <span className="text-lg font-bold text-black">₹{parseFloat(entry.totalValue).toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                    <p className="text-lg font-bold">{getRentedUnitsForItem(selectedItem.itemId).length} units</p>
                  </div>
                  <div>
                    <p className="font-medium">Unit Price:</p>
                    <p className="text-lg font-bold">₹{selectedItem.unitPrice}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Value:</p>
                    <p className="text-lg font-bold">₹{(getRentedUnitsForItem(selectedItem.itemId).length * parseFloat(selectedItem.unitPrice || '0')).toFixed(2)}</p>
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
                          These units will be returned to inventory as "Available"
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

      {/* Add New Item Dialog - Multi-Step Form */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add More Items to Rental</DialogTitle>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className="flex-1 h-0.5 bg-gray-200">
                <div className={`h-full transition-all duration-300 ${
                  currentStep === 2 ? 'w-full bg-blue-600' : 'w-0 bg-gray-200'
                }`}></div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Select Items</span>
              <span>Configure Units & Pricing</span>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Step 1: Item Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-items">Search Items</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search-items"
                      placeholder="Search items by name, model, or category..."
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Items */}
                  <div>
                    <Label>Available Items</Label>
                    <ScrollArea className="h-96 border rounded-lg p-4">
                      <div className="space-y-2">
                        {items?.filter((item: any) => 
                          !selectedItems.some(selected => selected.id === item.id) &&
                          (item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
                           item.model.toLowerCase().includes(itemSearchTerm.toLowerCase()))
                        ).map((item: any) => (
                          <div 
                            key={item.id} 
                            className="p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50"
                            onClick={() => handleSelectItem(item)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-black">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.model}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-black">{getAvailableUnitsForItem(item.id).length} available</p>
                                <p className="text-xs text-gray-500">{getAvailableUnitsForItem(item.id).length + getRentedUnitsForItem(item.id).length} total</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Selected Items */}
                  <div>
                    <Label>Selected Items ({selectedItems.length})</Label>
                    <ScrollArea className="h-96 border rounded-lg p-4">
                      {selectedItems.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No items selected</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedItems.map((item: any) => (
                            <div key={item.id} className="p-3 rounded-lg border bg-blue-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-black">{item.itemDetails.name}</h4>
                                    <p className="text-sm text-gray-600">{item.availableUnits.length} units available</p>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRemoveSelectedItem(item.id)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Configure Units & Pricing */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Configure Units and Pricing</Label>
                  <p className="text-sm text-gray-600">Select units and set prices for each item</p>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {selectedItems.map((item: any) => (
                      <Card key={item.id} className="border-black">
                        <CardHeader>
                          <CardTitle className="text-lg">{item.itemDetails.name}</CardTitle>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`price-${item.id}`}>Unit Price (₹)</Label>
                              <Input
                                id={`price-${item.id}`}
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleUnitPriceChange(item.id, e.target.value)}
                                className="w-32"
                                min="0"
                              />
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Selected: {item.selectedUnits.length} units</p>
                              <p className="text-lg font-bold text-black">₹{item.totalValue.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {item.availableUnits.map((unit: any) => (
                              <div 
                                key={unit.id} 
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                  item.selectedUnits.includes(unit.id)
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => handleUnitSelection(item.id, unit.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                      <Package className="w-3 h-3 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-black text-sm">#{unit.serialNumber}</p>
                                      <p className="text-xs text-gray-600">{unit.barcode}</p>
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">{unit.status}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
                Cancel
              </Button>
              
              <div className="flex space-x-2">
                {currentStep === 2 && (
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Previous
                  </Button>
                )}
                
                {currentStep === 1 && (
                  <Button onClick={handleNextStep} className="bg-blue-600 text-white hover:bg-blue-700">
                    Next: Configure Units
                  </Button>
                )}
                
                {currentStep === 2 && (
                  <Button onClick={handleAddToPending} className="bg-green-600 text-white hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Pending ({selectedItems.reduce((sum, item) => sum + item.selectedUnits.length, 0)} units)
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}