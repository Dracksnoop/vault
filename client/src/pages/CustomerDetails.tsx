import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  ArrowLeft,
  FileText,
  Receipt,
  CreditCard,
  Clock,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  Edit,
  Download,
  Plus
} from 'lucide-react';
import { Link } from 'wouter';
import RentalItemsPanel from '@/components/RentalItemsPanel';

export default function CustomerDetails() {
  const [match, params] = useRoute('/customer/:id');
  const customerId = params?.id ? parseInt(params.id) : null;
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showRentalItems, setShowRentalItems] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    customerType: '',
    companyName: '',
    billingAddress: '',
    shippingAddress: '',
    gstVatNumber: '',
    paymentTerms: ''
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['/api/customers', customerId],
    enabled: !!customerId,
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

  const updateCustomerMutation = useMutation({
    mutationFn: (customerData: any) =>
      apiRequest(`/api/customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify(customerData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId] });
      setShowEditCustomer(false);
      toast({
        title: 'Customer Updated',
        description: 'Customer information has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update customer information.',
        variant: 'destructive',
      });
    },
  });

  const handleEditCustomer = () => {
    setEditCustomerData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      customerType: customer.customerType || '',
      companyName: customer.companyName || '',
      billingAddress: customer.billingAddress || '',
      shippingAddress: customer.shippingAddress || '',
      gstVatNumber: customer.gstVatNumber || '',
      paymentTerms: customer.paymentTerms || ''
    });
    setShowEditCustomer(true);
  };

  const handleSaveCustomer = () => {
    updateCustomerMutation.mutate(editCustomerData);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (customerLoading || !customer) {
    return (
      <div className="bg-white rounded-lg border border-black p-6">
        <div className="text-black">Loading customer details...</div>
      </div>
    );
  }

  const customerServices = services.filter((service: any) => service.customerId === customerId);
  const customerRentals = rentals.filter((rental: any) => rental.customerId === customerId);
  
  // Calculate rental metrics
  const activeRentals = customerRentals.filter((rental: any) => rental.isOngoing);
  const completedRentals = customerRentals.filter((rental: any) => !rental.isOngoing);
  
  // Mock calculation for demonstration (in real app, this would come from payment records)
  const totalRentPaid = 15000;
  const totalDue = 5000;
  const nextRentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  // If showing rental items panel, render it instead
  if (showRentalItems) {
    return (
      <RentalItemsPanel
        customerId={customerId}
        customerName={customer.name}
        onBack={() => setShowRentalItems(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/customer">
            <Button variant="outline" size="sm" className="border-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-black">{customer.name}</h1>
            <p className="text-gray-600 mt-1">Customer Details & Management</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 text-white hover:bg-green-700">
                <FileText className="w-4 h-4 mr-2" />
                Create Challan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Challan for {customer.name}</DialogTitle>
              </DialogHeader>
              <div className="p-6">
                <p className="text-gray-600 mb-4">Challan creation form will be implemented here</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Challan Number</label>
                      <input type="text" className="w-full p-2 border border-gray-300 rounded" placeholder="CH-001" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input type="date" className="w-full p-2 border border-gray-300 rounded" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-green-600 text-white hover:bg-green-700">Create Challan</Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Receipt className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Invoice for {customer.name}</DialogTitle>
              </DialogHeader>
              <div className="p-6">
                <p className="text-gray-600 mb-4">Invoice creation form will be implemented here</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                      <input type="text" className="w-full p-2 border border-gray-300 rounded" placeholder="INV-001" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input type="date" className="w-full p-2 border border-gray-300 rounded" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input type="number" className="w-full p-2 border border-gray-300 rounded" placeholder="0.00" />
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">Create Invoice</Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card className="border-black">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-black" />
              </div>
              <div>
                <CardTitle className="text-xl text-black">{customer.name}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {customer.customerType}
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="border-black" onClick={handleEditCustomer}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{customer.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{customer.phone}</span>
            </div>
            {customer.companyName && (
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{customer.companyName}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{customer.billingAddress}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rentals">Rentals</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="border-black cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => setShowRentalItems(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                    <p className="text-2xl font-bold text-black">{activeRentals.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-black">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Rent Paid</p>
                    <p className="text-2xl font-bold text-green-600">₹{totalRentPaid.toLocaleString()}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-black">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount Due</p>
                    <p className="text-2xl font-bold text-red-600">₹{totalDue.toLocaleString()}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-black">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Rent Due</p>
                    <p className="text-sm font-bold text-orange-600">{nextRentDate.toLocaleDateString()}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-black">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Rent payment received for July 2025</span>
                  </div>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Rental service created</span>
                  </div>
                  <span className="text-xs text-gray-500">1 week ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">Customer account created</span>
                  </div>
                  <span className="text-xs text-gray-500">1 week ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rentals" className="space-y-6">
          <Card className="border-black">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rental History</CardTitle>
                <Button className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  New Rental
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customerRentals.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No rentals found for this customer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerRentals.map((rental: any) => (
                    <div key={rental.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Rental #{rental.id}</p>
                          <p className="text-sm text-gray-600">
                            Started: {new Date(rental.startDate).toLocaleDateString()}
                          </p>
                          {rental.endDate && (
                            <p className="text-sm text-gray-600">
                              Ended: {new Date(rental.endDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={rental.isOngoing ? "default" : "secondary"}>
                            {rental.isOngoing ? "Active" : "Completed"}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            Payment: {rental.paymentFrequency}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="border-black">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock payment history */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment #001</p>
                      <p className="text-sm text-gray-600">July 2025 Rent</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">₹5,000</p>
                      <p className="text-sm text-gray-600">Paid on July 5, 2025</p>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment #002</p>
                      <p className="text-sm text-gray-600">June 2025 Rent</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">₹5,000</p>
                      <p className="text-sm text-gray-600">Paid on June 5, 2025</p>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment #003</p>
                      <p className="text-sm text-gray-600">May 2025 Rent</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">₹5,000</p>
                      <p className="text-sm text-gray-600">Paid on May 5, 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="border-black">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Button className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock documents */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Rental Agreement</p>
                        <p className="text-sm text-gray-600">Uploaded on July 10, 2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Receipt className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Invoice #INV-001</p>
                        <p className="text-sm text-gray-600">Generated on July 8, 2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="border-black">
            <CardHeader>
              <CardTitle>Complete History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium">Customer Created</p>
                  <p className="text-sm text-gray-600">July 13, 2025 at 11:30 AM</p>
                  <p className="text-sm text-gray-500">Customer account was created through Customer Management system</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-medium">Rental Service Started</p>
                  <p className="text-sm text-gray-600">July 13, 2025 at 11:30 AM</p>
                  <p className="text-sm text-gray-500">Monthly rental service initiated</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="font-medium">Rental Agreement Signed</p>
                  <p className="text-sm text-gray-600">July 13, 2025 at 11:30 AM</p>
                  <p className="text-sm text-gray-500">Customer signed rental agreement for ongoing service</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditCustomer} onOpenChange={setShowEditCustomer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={editCustomerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border-black"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={editCustomerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-black"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={editCustomerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="border-black"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label>Customer Type *</Label>
                <RadioGroup 
                  value={editCustomerData.customerType} 
                  onValueChange={(value) => handleInputChange('customerType', value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one-time" id="edit-one-time" />
                    <Label htmlFor="edit-one-time">One-Time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rental" id="edit-rental" />
                    <Label htmlFor="edit-rental">Rental</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={editCustomerData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="border-black"
                  placeholder="Enter company name (optional)"
                />
              </div>
              <div>
                <Label htmlFor="gst">GST/VAT Number</Label>
                <Input
                  id="gst"
                  value={editCustomerData.gstVatNumber}
                  onChange={(e) => handleInputChange('gstVatNumber', e.target.value)}
                  className="border-black"
                  placeholder="Enter GST/VAT number (optional)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="billingAddress">Billing Address *</Label>
              <Textarea
                id="billingAddress"
                value={editCustomerData.billingAddress}
                onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                className="border-black"
                placeholder="Enter billing address"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Textarea
                id="shippingAddress"
                value={editCustomerData.shippingAddress}
                onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                className="border-black"
                placeholder="Enter shipping address (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                value={editCustomerData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                className="border-black"
                placeholder="e.g., Net 30 days, Cash on delivery"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditCustomer(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCustomer} 
                disabled={updateCustomerMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {updateCustomerMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}