import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  CreditCard
} from 'lucide-react';
import { Link } from 'wouter';

export default function Customer() {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['/api/customers'],
  });

  const { data: services = [] } = useQuery({
    queryKey: ['/api/services'],
  });

  const { data: rentals = [] } = useQuery({
    queryKey: ['/api/rentals'],
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Customers</h1>
          <p className="text-gray-600 mt-1">View and manage customer information</p>
        </div>
        <Link href="/customer-management">
          <Button className="bg-black text-white hover:bg-gray-800">
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
              <Card key={customer.id} className="border-black hover:shadow-lg transition-shadow">
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
                    <Button variant="outline" size="sm" className="flex-1 border-black">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="border-red-500 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
