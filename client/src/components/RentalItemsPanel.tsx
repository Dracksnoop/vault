import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  X
} from 'lucide-react';

interface RentalItemsPanelProps {
  customerId: number;
  customerName: string;
  onBack: () => void;
}

export default function RentalItemsPanel({ customerId, customerName, onBack }: RentalItemsPanelProps) {
  const [showViewUnitsDialog, setShowViewUnitsDialog] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: services = [] } = useQuery({
    queryKey: ['/api/services'],
  });

  const { data: serviceItems = [] } = useQuery({
    queryKey: ['/api/service-items'],
  });

  const { data: rentals = [] } = useQuery({
    queryKey: ['/api/rentals'],
  });

  const { data: items = [] } = useQuery({
    queryKey: ['/api/items'],
  });

  const { data: units = [] } = useQuery({
    queryKey: ['/api/units'],
  });

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

  // Handle View Units button click
  const handleViewUnits = (serviceItem: any) => {
    setSelectedItem(serviceItem);
    setShowViewUnitsDialog(true);
  };

  // Handle Modify button click
  const handleModify = (serviceItem: any) => {
    setSelectedItem(serviceItem);
    setShowModifyDialog(true);
  };

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
        <div className="flex space-x-2">
          <Button variant="outline" className="border-black">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Reports
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Modify Rental
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-black">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-black">{totalItemsRented}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Item Types</p>
                <p className="text-2xl font-bold text-black">{enrichedServiceItems.length}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">₹{totalRentalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Since</p>
                <p className="text-lg font-bold text-orange-600">
                  {activeRentals.length > 0 ? new Date(activeRentals[0].startDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rental Items List */}
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Rental Items Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrichedServiceItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No rental items found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrichedServiceItems.map((serviceItem: any) => (
                <div key={serviceItem.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-black">
                          {serviceItem.itemDetails?.name || 'Unknown Item'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {serviceItem.itemDetails?.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">
                            SKU: {serviceItem.itemDetails?.sku || 'N/A'}
                          </Badge>
                          <Badge variant="secondary">
                            Category: {serviceItem.itemDetails?.categoryId || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Quantity Rented</p>
                          <p className="font-semibold text-lg">{serviceItem.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Unit Price</p>
                          <p className="font-semibold text-lg">₹{serviceItem.unitPrice}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Value</p>
                          <p className="font-semibold text-lg text-green-600">₹{serviceItem.totalValue}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Rented since: {activeRentals.length > 0 ? new Date(activeRentals[0].startDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-black"
                        onClick={() => handleViewUnits(serviceItem)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Units
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-blue-500 text-blue-500"
                        onClick={() => handleModify(serviceItem)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modify
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rental Timeline */}
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Rental Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeRentals.map((rental: any) => (
              <div key={rental.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rental Started</p>
                    <p className="text-sm text-gray-600">
                      {new Date(rental.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">Active</Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      Payment: {rental.paymentFrequency}
                    </p>
                  </div>
                </div>
                {rental.notes && (
                  <p className="text-sm text-gray-500 mt-2">Notes: {rental.notes}</p>
                )}
              </div>
            ))}
          </div>
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

      {/* Modify Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Modify Rental - {selectedItem?.itemDetails?.name}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    defaultValue={selectedItem.quantity}
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    defaultValue={selectedItem.unitPrice}
                    className="border-black"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={selectedItem.itemDetails?.description || ''}
                  className="border-black"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger className="border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger className="border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  className="border-black"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowModifyDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}