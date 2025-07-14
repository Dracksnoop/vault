import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Package,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import VaultLoader from '@/components/VaultLoader';

export default function Customer() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [preloadingCustomer, setPreloadingCustomer] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { navigateWithLoader } = useNavigation();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['/api/customers'],
  });

  const { data: services = [] } = useQuery({
    queryKey: ['/api/services'],
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

  const { data: serviceItems = [] } = useQuery({
    queryKey: ['/api/service-items'],
  });

  // Comprehensive customer data preloading function
  const preloadCustomerData = async (customerId: number) => {
    setPreloadingCustomer(customerId);
    
    try {
      // Preload all customer-related data
      const preloadPromises = [
        // Core customer data
        queryClient.prefetchQuery({
          queryKey: ['/api/customers', customerId],
          queryFn: () => apiRequest(`/api/customers/${customerId}`)
        }),
        
        // Customer timeline
        queryClient.prefetchQuery({
          queryKey: ['/api/customers', customerId, 'timeline'],
          queryFn: () => apiRequest(`/api/customers/${customerId}/timeline`)
        }),
        
        // Ensure all related data is cached
        queryClient.prefetchQuery({
          queryKey: ['/api/services'],
          queryFn: () => apiRequest('/api/services')
        }),
        
        queryClient.prefetchQuery({
          queryKey: ['/api/rentals'],
          queryFn: () => apiRequest('/api/rentals')
        }),
        
        queryClient.prefetchQuery({
          queryKey: ['/api/service-items'],
          queryFn: () => apiRequest('/api/service-items')
        }),
        
        queryClient.prefetchQuery({
          queryKey: ['/api/items'],
          queryFn: () => apiRequest('/api/items')
        }),
        
        queryClient.prefetchQuery({
          queryKey: ['/api/units'],
          queryFn: () => apiRequest('/api/units')
        })
      ];
      
      // Wait for all data to be preloaded
      await Promise.all(preloadPromises);
      
      // Add a small delay to ensure smooth loading experience
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Navigate to customer details
      navigate(`/customer/${customerId}`);
      
    } catch (error) {
      console.error('Error preloading customer data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load customer data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPreloadingCustomer(null);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const response = await apiRequest(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rentals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      toast({
        title: "Success",
        description: "Customer deleted successfully. All rented items have been returned to inventory.",
      });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      setConfirmationText('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (customer: any) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (confirmationText === 'delete' && customerToDelete) {
      deleteMutation.mutate(customerToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-black p-6">
        <div className="text-black">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Customers</h1>
          <p className="text-gray-600 mt-1">View and manage customer information</p>
        </div>
        <Link href="/customer-management">
          <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add New Customer
          </Button>
        </Link>
      </div>

      {/* Customer List */}
      {customers.length === 0 ? (
        <Card className="border-black">
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">No Customers Yet</h3>
            <p className="text-gray-600 mb-4">
              Start by creating your first customer through the Customer Management system.
            </p>
            <Link href="/customer-management">
              <Button className="bg-black text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Create First Customer
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer: any) => {
            const customerServices = services.filter((service: any) => service.customerId === customer.id);
            const customerRentals = rentals.filter((rental: any) => rental.customerId === customer.id);

            return (
              <div key={customer.id} className="relative">
                <Card 
                  className="border-black hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => preloadCustomerData(customer.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-black">{customer.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {customer.customerType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                  
                  {customer.companyName && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{customer.companyName}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{customer.billingAddress}</span>
                  </div>

                  {customer.gstVatNumber && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span>GST/VAT: {customer.gstVatNumber}</span>
                    </div>
                  )}

                  {customer.paymentTerms && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{customer.paymentTerms}</span>
                    </div>
                  )}

                  {/* Services & Rentals Summary */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Services: {customerServices.length}</span>
                      </div>
                      {customer.customerType === 'rental' && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Rentals: {customerRentals.length}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality can be added here
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(customer);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
                </Card>
                
                {/* Loading overlay */}
                {preloadingCustomer === customer.id && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                    <VaultLoader />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Customer
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Warning: This action cannot be undone!</h4>
              <p className="text-sm text-red-700">
                Deleting this customer will:
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• Remove all customer information permanently</li>
                <li>• Delete all associated services and rentals</li>
                <li>• Return all rented items back to inventory</li>
                <li>• Clear all rental history for this customer</li>
              </ul>
            </div>

            {customerToDelete && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Customer to be deleted:</h4>
                <p className="text-sm text-gray-700">
                  <strong>{customerToDelete.name}</strong> ({customerToDelete.email})
                </p>
                {customerToDelete.companyName && (
                  <p className="text-sm text-gray-700">
                    Company: {customerToDelete.companyName}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmationText" className="text-sm font-medium text-gray-700">
                Type <span className="font-bold text-red-600">delete</span> to confirm:
              </Label>
              <Input
                id="confirmationText"
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type 'delete' to confirm"
                className="border-black focus:border-red-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setCustomerToDelete(null);
                setConfirmationText('');
              }}
              className="border-black"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={confirmationText !== 'delete' || deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
