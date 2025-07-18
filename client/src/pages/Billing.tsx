import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Download
} from 'lucide-react';

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

export default function Billing() {
  const [activeTab, setActiveTab] = useState('overview');

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
            <Button className="bg-black text-white hover:bg-gray-800 border-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
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
                              <Button variant="outline" size="sm" className="border-black">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="border-black">
                                <Download className="w-4 h-4" />
                              </Button>
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
            <Button className="bg-black text-white hover:bg-gray-800 border-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </div>

          <Card className="bg-white border-black">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-600">Customer</th>
                      <th className="text-left p-4 font-medium text-gray-600">Frequency</th>
                      <th className="text-left p-4 font-medium text-gray-600">Next Invoice</th>
                      <th className="text-left p-4 font-medium text-gray-600">Last Invoice</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedulesLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">Loading schedules...</td>
                      </tr>
                    ) : (
                      schedules?.map((schedule) => (
                        <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="font-medium">{schedule.customerName}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}
                              {schedule.interval > 1 && ` (Every ${schedule.interval})`}
                            </div>
                          </td>
                          <td className="p-4 text-sm">{formatDate(schedule.nextInvoiceDate)}</td>
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
                              <Button variant="outline" size="sm" className="border-black">
                                <Eye className="w-4 h-4" />
                              </Button>
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
    </div>
  );
}