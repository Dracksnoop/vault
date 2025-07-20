import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Eye,
  Download,
  X
} from 'lucide-react';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BillingStats {
  totalInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  outstandingAmount: number;
  activeSchedules: number;
  totalPayments: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  invoiceDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  totalAmount: string;
  currency: string;
  isRecurring: boolean;
  notes?: string;
  paymentTerms: string;
  createdAt: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  customerId: number;
  customerName: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  notes?: string;
  createdAt: string;
}

interface RecurringSchedule {
  id: string;
  customerId: number;
  customerName: string;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  nextInvoiceDate: string;
  lastInvoiceDate?: string;
  isActive: boolean;
  templateData: string;
  paymentTerms: string;
  createdAt: string;
}

// Recurring Invoice Preview Component
function RecurringInvoicePreview({ schedule, companyProfile, onClose }: { 
  schedule: RecurringSchedule; 
  companyProfile: any; 
  onClose: () => void; 
}) {
  // Parse template data
  const templateData = schedule.templateData ? JSON.parse(schedule.templateData) : {};
  
  // Calculate due date based on payment terms
  const calculateDueDate = (invoiceDate: string, paymentTerms: string) => {
    const date = new Date(invoiceDate);
    const days = parseInt(paymentTerms.match(/\d+/)?.[0] || '30');
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const nextInvoiceDate = new Date(schedule.nextInvoiceDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const dueDate = calculateDueDate(schedule.nextInvoiceDate, schedule.paymentTerms);
  const invoiceNumber = `INV-${new Date(schedule.nextInvoiceDate).toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <div className="text-center border-b border-black pb-4">
        <h1 className="text-2xl font-bold">INVOICE</h1>
      </div>

      {/* Company and Invoice Info */}
      <div className="grid grid-cols-2 gap-8">
        {/* Company Logo and Info */}
        <div className="flex gap-4">
          <div className="w-32 h-32 border border-black flex items-center justify-center bg-gray-50">
            {companyProfile?.logoUrl ? (
              <img src={companyProfile.logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="text-gray-400 text-center">
                <div className="text-sm">Company</div>
                <div className="text-sm">Logo</div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{companyProfile?.companyName || 'Gac infotech'}</h2>
            <div className="text-sm space-y-1 mt-2">
              <div>{companyProfile?.addressLine1 || 'office 103 vidyaik apartment telephone nagar square near nakoda sweets bangali square'}</div>
              <div>{companyProfile?.addressLine2 || 'Indore, madhya pradesh'}</div>
              <div>Country</div>
              <div>{companyProfile?.phoneNumber || '9300004646'}</div>
              <div>{companyProfile?.emailAddress || 'pradeepraurjan2019@gmail.com'}</div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="border border-black p-4">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 font-medium">#</td>
                <td className="py-1">: {invoiceNumber}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Invoice Date</td>
                <td className="py-1">: {nextInvoiceDate}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Terms</td>
                <td className="py-1">: Due on Receipt</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Due Date</td>
                <td className="py-1">: {dueDate}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Info */}
      <div>
        <h3 className="text-lg font-bold">{schedule.customerName}</h3>
      </div>

      {/* Invoice Items Table */}
      <div className="border border-black">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black bg-gray-50">
              <th className="text-left p-3 border-r border-black">#</th>
              <th className="text-left p-3 border-r border-black">Description</th>
              <th className="text-left p-3 border-r border-black">Qty</th>
              <th className="text-left p-3 border-r border-black">Rate</th>
              <th className="text-left p-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black">
              <td className="p-3 border-r border-black">1</td>
              <td className="p-3 border-r border-black">Recurring Service ({schedule.frequency} billing)</td>
              <td className="p-3 border-r border-black text-center">1.00 pcs</td>
              <td className="p-3 border-r border-black text-right">₹{parseFloat(templateData.baseAmount || '0').toFixed(2)}</td>
              <td className="p-3 text-right">₹{parseFloat(templateData.baseAmount || '0').toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="p-3 font-medium">Total in Words</td>
              <td className="p-3 text-right font-medium">Sub Total</td>
              <td className="p-3 text-right">₹{parseFloat(templateData.baseAmount || '0').toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="p-3">Indian Rupees {templateData.baseAmount ? `${templateData.baseAmount} Only` : 'Zero Only'}</td>
              <td className="p-3 text-right font-bold">Total</td>
              <td className="p-3 text-right font-bold">Rs. {parseFloat(templateData.baseAmount || '0').toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="space-y-4 text-sm">
        <div>Thanks for your business.</div>
        
        <div className="space-y-1">
          <div>Name - {companyProfile?.companyName || 'Gac infotech'}</div>
          <div>Account - {companyProfile?.accountNumber || '50200042158014'}</div>
          <div>ifsc code - {companyProfile?.ifscCode || 'HDFC0000192'}</div>
          <div>Address - {companyProfile?.addressLine1 || 'Indore, madhya pradesh'}</div>
        </div>

        <div className="space-y-1 text-xs">
          <div>• This is recurring invoice for {schedule.frequency} billing cycle.</div>
          <div>• Next invoice will be generated on: {new Date(new Date(schedule.nextInvoiceDate).setMonth(new Date(schedule.nextInvoiceDate).getMonth() + (schedule.frequency === 'monthly' ? 1 : schedule.frequency === 'quarterly' ? 3 : 12))).toLocaleDateString('en-IN')}</div>
          <div>• Disputes regarding invoices must be raised within 2 days of receipt.</div>
          <div>• The customer is liable for any damage or loss to rented equipment during the rental period.</div>
          <div>• Charges for repair or replacement will be billed separately.</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-black"
        >
          Close
        </Button>
        <Button
          className="bg-black text-white hover:bg-gray-800"
          onClick={() => {
            window.print();
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
      </div>
    </div>
  );
}

export default function Billing() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreateRecurringModal, setShowCreateRecurringModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCustomerForRecurring, setSelectedCustomerForRecurring] = useState<Invoice | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [selectedScheduleForPreview, setSelectedScheduleForPreview] = useState<any>(null);
  const [showRecurringInvoicePreview, setShowRecurringInvoicePreview] = useState(false);
  const [recurringFormData, setRecurringFormData] = useState({
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    paymentTerms: 'Net 30',
    notes: ''
  });
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<BillingStats>({
    queryKey: ['/api/billing/stats'],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
  });

  const { data: schedules, isLoading: schedulesLoading } = useQuery<RecurringSchedule[]>({
    queryKey: ['/api/recurring-schedules'],
  });

  const { data: companyProfile } = useQuery({
    queryKey: ['/api/company-profiles/default'],
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      return await apiRequest('PUT', `/api/invoices/${invoiceId}`, {
        status: 'paid'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/stats'] });
      toast({
        title: "Success",
        description: "Invoice marked as paid successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid",
        variant: "destructive",
      });
    }
  });

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoicePreview(true);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      console.log('Downloading invoice:', invoice.id);
      
      // Use fetch for PDF download since apiRequest doesn't handle blob responses
      const response = await fetch('/api/invoices/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          companyProfile: companyProfile
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download error:', errorText);
        throw new Error(`Failed to download invoice: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      
      if (blob.size === 0) {
        throw new Error('Empty PDF file received');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">
          Cancelled
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Create recurring schedule mutation
  const createRecurringScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      return await apiRequest('POST', '/api/recurring-schedules', scheduleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/stats'] });
      toast({
        title: "Recurring Schedule Created",
        description: `Automated billing set up successfully`,
      });
      setSelectedCustomerForRecurring(null);
      setRecurringFormData({
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        paymentTerms: 'Net 30',
        notes: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create recurring schedule",
        variant: "destructive",
      });
    },
  });

  // Download recurring invoice function
  const downloadRecurringInvoice = async (schedule: RecurringSchedule) => {
    try {
      const templateData = schedule.templateData ? JSON.parse(schedule.templateData) : {};
      
      // Calculate due date based on payment terms
      const calculateDueDate = (invoiceDate: string, paymentTerms: string) => {
        const date = new Date(invoiceDate);
        const days = parseInt(paymentTerms.match(/\d+/)?.[0] || '30');
        date.setDate(date.getDate() + days);
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        });
      };

      const nextInvoiceDate = new Date(schedule.nextInvoiceDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const dueDate = calculateDueDate(schedule.nextInvoiceDate, schedule.paymentTerms);
      const invoiceNumber = `INV-${new Date(schedule.nextInvoiceDate).toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      // Create invoice data for PDF generation
      const invoiceData = {
        invoiceNumber,
        customerName: schedule.customerName,
        invoiceDate: nextInvoiceDate,
        dueDate: dueDate,
        items: [
          {
            description: `Recurring Service (${schedule.frequency} billing)`,
            quantity: 1,
            unitPrice: parseFloat(templateData.baseAmount || '0'),
            totalPrice: parseFloat(templateData.baseAmount || '0')
          }
        ],
        totalAmount: parseFloat(templateData.baseAmount || '0'),
        currency: 'INR',
        paymentTerms: schedule.paymentTerms,
        notes: `This is recurring invoice for ${schedule.frequency} billing cycle. Next invoice will be generated on: ${new Date(new Date(schedule.nextInvoiceDate).setMonth(new Date(schedule.nextInvoiceDate).getMonth() + (schedule.frequency === 'monthly' ? 1 : schedule.frequency === 'quarterly' ? 3 : 12))).toLocaleDateString('en-IN')}`
      };

      // Generate and download PDF using fetch for blob response
      const response = await fetch('/api/invoices/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download Complete",
          description: `Invoice ${invoiceNumber} downloaded successfully`,
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download invoice PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing & Invoicing</h1>
        <p className="text-gray-600">Manage invoices, payments, and recurring billing schedules</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white border border-black">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100">
            <DollarSign className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-gray-100">
            <FileText className="w-4 h-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-gray-100">
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="recurring" className="data-[state=active]:bg-gray-100">
            <Calendar className="w-4 h-4 mr-2" />
            Recurring
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gray-100">
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-black">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">From {stats?.totalPayments || 0} payments</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-black">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Outstanding Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {statsLoading ? '...' : formatCurrency(stats?.outstandingAmount || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">From {stats?.pendingInvoices || 0} pending invoices</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-black">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {statsLoading ? '...' : stats?.totalInvoices || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.paidInvoices || 0} paid, {stats?.overdueInvoices || 0} overdue
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-black">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Active Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {statsLoading ? '...' : stats?.activeSchedules || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Recurring billing schedules</p>
              </CardContent>
            </Card>
          </div>

          {/* Automatic Invoice Generation Monitoring */}
          <Card className="bg-white border-black">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Automatic Invoice Generation Status
                  </CardTitle>
                  <CardDescription>Monitor when the system will generate invoices automatically (6 days in advance)</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-black"
                  onClick={async () => {
                    try {
                      const response = await apiRequest('POST', '/api/test-recurring-invoices', {});
                      toast({
                        title: "Success",
                        description: "Recurring invoice processing completed. Check your Invoices tab for new invoices.",
                      });
                      // Refresh data
                      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/billing/stats'] });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to process recurring invoices",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Test Now
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedulesLoading ? (
                  <div className="text-center py-4">Loading schedules...</div>
                ) : schedules && schedules.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{schedules?.filter(s => s.isActive).length || 0}</div>
                        <div className="text-sm text-blue-700">Active Schedules</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {schedules?.filter(s => {
                            const nextDate = new Date(s.nextInvoiceDate);
                            const sixDaysFromNow = new Date();
                            sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6);
                            return s.isActive && nextDate <= sixDaysFromNow;
                          }).length || 0}
                        </div>
                        <div className="text-sm text-green-700">Ready to Generate</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {invoices?.filter(inv => inv.recurringScheduleId).length || 0}
                        </div>
                        <div className="text-sm text-yellow-700">Auto-Generated</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Upcoming Automatic Invoices (Next 30 days)</h4>
                      {schedules
                        .filter(s => {
                          const nextDate = new Date(s.nextInvoiceDate);
                          const thirtyDaysFromNow = new Date();
                          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                          return s.isActive && nextDate <= thirtyDaysFromNow;
                        })
                        .sort((a, b) => new Date(a.nextInvoiceDate).getTime() - new Date(b.nextInvoiceDate).getTime())
                        .slice(0, 5)
                        .map((schedule) => {
                          const nextDate = new Date(schedule.nextInvoiceDate);
                          const sixDaysFromNow = new Date();
                          sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6);
                          const willGenerateSoon = nextDate <= sixDaysFromNow;
                          const generateDate = new Date(nextDate);
                          generateDate.setDate(generateDate.getDate() - 6);
                          
                          return (
                            <div key={schedule.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{schedule.customerName}</span>
                                  <Badge className={`${willGenerateSoon ? 'bg-green-100 text-green-800 border-green-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                                    {schedule.frequency}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Invoice Date: {formatDate(schedule.nextInvoiceDate)} • 
                                  Will Generate: {willGenerateSoon ? 'Now (6 days early)' : formatDate(generateDate.toISOString())}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {schedule.templateData && formatCurrency(JSON.parse(schedule.templateData).baseAmount || 0)}
                                </div>
                                {willGenerateSoon && (
                                  <div className="text-xs text-green-600 font-medium">Ready to Generate</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      
                      {schedules.filter(s => {
                        const nextDate = new Date(s.nextInvoiceDate);
                        const thirtyDaysFromNow = new Date();
                        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                        return s.isActive && nextDate <= thirtyDaysFromNow;
                      }).length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          No invoices scheduled for the next 30 days
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Recurring Schedules</h3>
                    <p className="text-gray-600 mb-4">
                      Set up recurring billing schedules to automate invoice generation
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-black">
              <CardHeader>
                <CardTitle className="text-lg">Recent Invoices</CardTitle>
                <CardDescription>Latest invoices generated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoicesLoading ? (
                    <div className="text-center py-4">Loading invoices...</div>
                  ) : (
                    invoices?.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{invoice.invoiceNumber}</span>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {invoice.customerName} • {formatDate(invoice.invoiceDate)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                          <div className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-black">
              <CardHeader>
                <CardTitle className="text-lg">Recent Payments</CardTitle>
                <CardDescription>Latest payments received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentsLoading ? (
                    <div className="text-center py-4">Loading payments...</div>
                  ) : (
                    payments?.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{payment.customerName}</div>
                          <div className="text-sm text-gray-600">
                            {payment.paymentMethod} • {formatDate(payment.paymentDate)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">{formatCurrency(payment.amount)}</div>
                          <div className="text-sm text-gray-500">
                            {payment.status === 'completed' ? 'Completed' : payment.status}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Invoices</h2>
            <div className="flex gap-2">
              <Button 
                className="bg-black text-white hover:bg-gray-800 border-black"
                onClick={() => setShowCreateInvoiceModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
              <Button 
                variant="outline"
                className="border-black text-black hover:bg-gray-100"
                onClick={() => setShowCreateRecurringModal(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Create Recurring Invoice
              </Button>
            </div>
          </div>

          <Card className="bg-white border-black">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-600">Invoice</th>
                      <th className="text-left p-4 font-medium text-gray-600">Customer</th>
                      <th className="text-left p-4 font-medium text-gray-600">Date</th>
                      <th className="text-left p-4 font-medium text-gray-600">Due Date</th>
                      <th className="text-left p-4 font-medium text-gray-600">Amount</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8">Loading invoices...</td>
                      </tr>
                    ) : (
                      invoices?.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="font-medium">{invoice.invoiceNumber}</div>
                            {invoice.isRecurring && (
                              <div className="text-xs text-blue-600">Recurring</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{invoice.customerName}</div>
                            <div className="text-sm text-gray-600">{invoice.customerEmail}</div>
                          </td>
                          <td className="p-4 text-sm">{formatDate(invoice.invoiceDate)}</td>
                          <td className="p-4 text-sm">{formatDate(invoice.dueDate)}</td>
                          <td className="p-4 font-medium">{formatCurrency(invoice.totalAmount)}</td>
                          <td className="p-4">{getStatusBadge(invoice.status)}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-black"
                                onClick={() => handleViewInvoice(invoice)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-black"
                                onClick={() => handleDownloadInvoice(invoice)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-purple-600 text-purple-600 hover:bg-purple-50"
                                onClick={() => {
                                  setSelectedCustomerForRecurring(invoice);
                                  setActiveTab('recurring');
                                  toast({
                                    title: "Schedule Recurring Invoice",
                                    description: `Setting up recurring billing for ${invoice.customerName}`,
                                  });
                                }}
                              >
                                <Calendar className="w-4 h-4" />
                              </Button>
                              {invoice.status === 'pending' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-green-600 text-green-600 hover:bg-green-50"
                                  onClick={() => markAsPaidMutation.mutate(invoice.id)}
                                  disabled={markAsPaidMutation.isPending}
                                >
                                  {markAsPaidMutation.isPending ? '...' : 'Paid'}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payments</h2>
            <Button className="bg-black text-white hover:bg-gray-800 border-black">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>

          <Card className="bg-white border-black">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-600">Customer</th>
                      <th className="text-left p-4 font-medium text-gray-600">Amount</th>
                      <th className="text-left p-4 font-medium text-gray-600">Method</th>
                      <th className="text-left p-4 font-medium text-gray-600">Date</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">Loading payments...</td>
                      </tr>
                    ) : (
                      payments?.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="font-medium">{payment.customerName}</div>
                          </td>
                          <td className="p-4 font-medium text-green-600">{formatCurrency(payment.amount)}</td>
                          <td className="p-4 text-sm">{payment.paymentMethod}</td>
                          <td className="p-4 text-sm">{formatDate(payment.paymentDate)}</td>
                          <td className="p-4">{getStatusBadge(payment.status)}</td>
                          <td className="p-4 text-sm text-gray-600">{payment.reference || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recurring Billing</h2>
            <Button 
              className="bg-black text-white hover:bg-gray-800 border-black"
              onClick={() => setShowCreateRecurringModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </div>

          {/* Show create form if customer is selected for recurring billing */}
          {selectedCustomerForRecurring && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">
                  Create Recurring Schedule for {selectedCustomerForRecurring.customerName}
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Set up automated recurring invoices for this customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                    <div className="p-3 bg-white border border-gray-300 rounded-lg">
                      <div className="font-medium">{selectedCustomerForRecurring.customerName}</div>
                      <div className="text-sm text-gray-600">{selectedCustomerForRecurring.customerEmail}</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Amount</label>
                    <div className="p-3 bg-white border border-gray-300 rounded-lg">
                      <div className="font-medium">{formatCurrency(selectedCustomerForRecurring.totalAmount)}</div>
                      <div className="text-sm text-gray-600">From invoice {selectedCustomerForRecurring.invoiceNumber}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={recurringFormData.frequency}
                      onChange={(e) => setRecurringFormData({...recurringFormData, frequency: e.target.value})}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input 
                      type="date" 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={recurringFormData.startDate}
                      onChange={(e) => setRecurringFormData({...recurringFormData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={recurringFormData.paymentTerms}
                      onChange={(e) => setRecurringFormData({...recurringFormData, paymentTerms: e.target.value})}
                    >
                      <option value="Net 15">Net 15 Days</option>
                      <option value="Net 30">Net 30 Days</option>
                      <option value="Net 45">Net 45 Days</option>
                      <option value="Net 60">Net 60 Days</option>
                    </select>
                  </div>
                </div>

                {/* Next Invoice Date Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Next Invoice Date:</span>
                    <span className="text-sm text-blue-700">
                      {(() => {
                        const start = new Date(recurringFormData.startDate);
                        const next = new Date(start);
                        
                        switch (recurringFormData.frequency) {
                          case 'monthly':
                            next.setMonth(next.getMonth() + 1);
                            break;
                          case 'quarterly':
                            next.setMonth(next.getMonth() + 3);
                            break;
                          case 'yearly':
                            next.setFullYear(next.getFullYear() + 1);
                            break;
                          default:
                            next.setMonth(next.getMonth() + 1);
                        }
                        
                        return next.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });
                      })()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg" 
                    rows={3}
                    placeholder="Add any notes about this recurring schedule..."
                    value={recurringFormData.notes}
                    onChange={(e) => setRecurringFormData({...recurringFormData, notes: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCustomerForRecurring(null)}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    disabled={createRecurringScheduleMutation.isPending}
                    onClick={() => {
                      if (!selectedCustomerForRecurring) return;
                      
                      // Calculate next invoice date based on frequency
                      const calculateNextInvoiceDate = (startDate: string, frequency: string) => {
                        const start = new Date(startDate);
                        const next = new Date(start);
                        
                        switch (frequency) {
                          case 'monthly':
                            next.setMonth(next.getMonth() + 1);
                            break;
                          case 'quarterly':
                            next.setMonth(next.getMonth() + 3);
                            break;
                          case 'yearly':
                            next.setFullYear(next.getFullYear() + 1);
                            break;
                          default:
                            next.setMonth(next.getMonth() + 1);
                        }
                        
                        return next.toISOString().split('T')[0];
                      };

                      const scheduleData = {
                        customerId: parseInt(selectedCustomerForRecurring.customerId),
                        customerName: selectedCustomerForRecurring.customerName,
                        frequency: recurringFormData.frequency,
                        interval: 1,
                        startDate: recurringFormData.startDate,
                        nextInvoiceDate: calculateNextInvoiceDate(recurringFormData.startDate, recurringFormData.frequency),
                        isActive: true,
                        templateData: JSON.stringify({
                          baseAmount: selectedCustomerForRecurring.totalAmount,
                          invoiceNumber: selectedCustomerForRecurring.invoiceNumber,
                          customerEmail: selectedCustomerForRecurring.customerEmail,
                          items: [] // Base template for recurring invoices
                        }),
                        paymentTerms: recurringFormData.paymentTerms,
                        notes: recurringFormData.notes || '',
                        lastInvoiceDate: null
                      };
                      
                      createRecurringScheduleMutation.mutate(scheduleData);
                    }}
                  >
                    {createRecurringScheduleMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Schedule
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white border-black">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-600">Customer</th>
                      <th className="text-left p-4 font-medium text-gray-600">Frequency</th>
                      <th className="text-left p-4 font-medium text-gray-600">Amount</th>
                      <th className="text-left p-4 font-medium text-gray-600">Next Invoice</th>
                      <th className="text-left p-4 font-medium text-gray-600">Last Invoice</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedulesLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8">Loading schedules...</td>
                      </tr>
                    ) : schedules && schedules.length > 0 ? (
                      schedules
                        .sort((a, b) => new Date(a.nextInvoiceDate).getTime() - new Date(b.nextInvoiceDate).getTime())
                        .map((schedule, index) => {
                          const isUpcoming = index < 3; // Highlight first 3 upcoming invoices
                          const nextDate = new Date(schedule.nextInvoiceDate);
                          const today = new Date();
                          const daysDiff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          const isDueSoon = daysDiff <= 7;
                          
                          // Extract amount from templateData
                          const getScheduleAmount = (schedule: any) => {
                            try {
                              if (schedule.templateData) {
                                const templateData = JSON.parse(schedule.templateData);
                                return parseFloat(templateData.baseAmount || '0');
                              }
                              return 0;
                            } catch {
                              return 0;
                            }
                          };
                          
                          const scheduleAmount = getScheduleAmount(schedule);
                          
                          return (
                            <tr key={schedule.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isUpcoming ? 'bg-blue-50' : ''}`}>
                              <td className="p-4">
                                <div className="font-medium">{schedule.customerName}</div>
                                {isUpcoming && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    {index === 0 ? 'Next Up' : `#${index + 1} Upcoming`}
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="text-sm">
                                  {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}
                                  {schedule.interval > 1 && ` (Every ${schedule.interval})`}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-medium text-green-600">{formatCurrency(scheduleAmount)}</div>
                                <div className="text-xs text-gray-500">Per {schedule.frequency}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm">{formatDate(schedule.nextInvoiceDate)}</div>
                                {isDueSoon && (
                                  <div className="text-xs text-orange-600 font-medium">
                                    {daysDiff === 0 ? 'Due Today' : `Due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`}
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-sm">
                                {schedule.lastInvoiceDate ? formatDate(schedule.lastInvoiceDate) : '—'}
                              </td>
                              <td className="p-4">
                                <Badge className={schedule.isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'}>
                                  {schedule.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-black"
                                    onClick={() => {
                                      setSelectedScheduleForPreview(schedule);
                                      setShowRecurringInvoicePreview(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-black"
                                    onClick={() => downloadRecurringInvoice(schedule)}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-green-600 text-green-600 hover:bg-green-50"
                                    onClick={async () => {
                                      try {
                                        // Find the most recent invoice for this recurring schedule
                                        const recentInvoice = invoices?.find(inv => 
                                          inv.recurringScheduleId === schedule.id && 
                                          inv.status === 'pending'
                                        );
                                        
                                        if (!recentInvoice) {
                                          toast({
                                            title: "No Invoice Found",
                                            description: "No pending invoice found for this recurring schedule",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        
                                        // Mark the invoice as paid
                                        await markAsPaidMutation.mutateAsync(recentInvoice.id);
                                        
                                        toast({
                                          title: "Invoice Marked as Paid",
                                          description: `Invoice ${recentInvoice.invoiceNumber} marked as paid successfully`,
                                        });
                                      } catch (error) {
                                        toast({
                                          title: "Error",
                                          description: "Failed to mark invoice as paid",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          No recurring schedules found. Click "Create Schedule" or use the Schedule button on any invoice to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Reports & Analytics</h2>
            <Button className="bg-black text-white hover:bg-gray-800 border-black">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          <Card className="bg-white border-black">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and payment trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Revenue charts and analytics will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal 
        isOpen={showCreateInvoiceModal} 
        onClose={() => setShowCreateInvoiceModal(false)} 
      />

      {/* Recurring Invoice Preview Modal */}
      <Dialog open={showRecurringInvoicePreview} onOpenChange={setShowRecurringInvoicePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Recurring Invoice Preview</DialogTitle>
          </DialogHeader>
          {selectedScheduleForPreview && (
            <RecurringInvoicePreview 
              schedule={selectedScheduleForPreview} 
              companyProfile={companyProfile}
              onClose={() => setShowRecurringInvoicePreview(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Recurring Invoice Modal */}
      <Dialog open={showCreateRecurringModal} onOpenChange={setShowCreateRecurringModal}>
        <DialogContent className="max-w-2xl bg-white border-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create Recurring Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Recurring Invoice Setup</h3>
              <p className="text-gray-600 mb-6">
                This feature will allow you to create automated recurring invoices for your customers.
              </p>
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Set up monthly, quarterly, or yearly billing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Automatic invoice generation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Customer notification system</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Payment tracking and reminders</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowCreateRecurringModal(false)}
                className="border-black"
              >
                Cancel
              </Button>
              <Button
                className="bg-black text-white hover:bg-gray-800"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Recurring invoice feature will be available in the next update",
                  });
                  setShowCreateRecurringModal(false);
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Set Up Recurring
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice Preview - {selectedInvoice?.invoiceNumber}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedInvoice && handleDownloadInvoice(selectedInvoice)}
                className="border-black"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="bg-white p-8 border border-gray-200 rounded-lg">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  {companyProfile?.logoData && (
                    <img 
                      src={companyProfile.logoData} 
                      alt="Company Logo" 
                      className="w-16 h-16 object-cover rounded border border-gray-300"
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {companyProfile?.companyName || 'Raydify Vault'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {companyProfile?.addressLine1 && `${companyProfile.addressLine1}, `}
                      {companyProfile?.city && `${companyProfile.city}, `}
                      {companyProfile?.stateProvince && `${companyProfile.stateProvince} `}
                      {companyProfile?.zipPostalCode}
                    </p>
                    {companyProfile?.phoneNumber && (
                      <p className="text-gray-600">Phone: {companyProfile.phoneNumber}</p>
                    )}
                    {companyProfile?.emailAddress && (
                      <p className="text-gray-600">Email: {companyProfile.emailAddress}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h2>
                  <p className="text-gray-600">#{selectedInvoice.invoiceNumber}</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
                  <p className="font-medium">{selectedInvoice.customerName}</p>
                  <p className="text-gray-600">{selectedInvoice.customerEmail}</p>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <span className="text-gray-600">Invoice Date: </span>
                    <span className="font-medium">{formatDate(selectedInvoice.invoiceDate)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-600">Due Date: </span>
                    <span className="font-medium">{formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-600">Status: </span>
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left font-medium">Description</th>
                      <th className="border border-gray-300 p-3 text-right font-medium">Quantity</th>
                      <th className="border border-gray-300 p-3 text-right font-medium">Rate</th>
                      <th className="border border-gray-300 p-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3">Professional Services</td>
                      <td className="border border-gray-300 p-3 text-right">1</td>
                      <td className="border border-gray-300 p-3 text-right">{formatCurrency(selectedInvoice.totalAmount)}</td>
                      <td className="border border-gray-300 p-3 text-right font-medium">{formatCurrency(selectedInvoice.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invoice Total */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between items-center py-2 border-t border-gray-300">
                    <span className="font-medium">Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-lg font-bold border-t border-gray-300">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="text-sm text-gray-600">
                <p><strong>Payment Terms:</strong> {selectedInvoice.paymentTerms}</p>
                {selectedInvoice.notes && (
                  <p className="mt-2"><strong>Notes:</strong> {selectedInvoice.notes}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}