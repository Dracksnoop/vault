import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  RotateCcw, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  FileText, 
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { ReplacementRequestModal } from '@/components/ReplacementRequestModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReplacementRecord {
  id: string;
  unitId: string;
  unitSerialNumber: string;
  itemName: string;
  itemModel: string;
  reason: 'warranty' | 'damage' | 'expired' | 'defective' | 'other';
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requestDate: string;
  completionDate?: string;
  replacementUnitId?: string;
  replacementSerialNumber?: string;
  notes: string;
  vendorName: string;
  warrantyExpiryDate?: string;
  cost: number;
  customerId?: string;
  customerName?: string;
}

export default function Replacements() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [showReplacementModal, setShowReplacementModal] = useState(false);

  // Approve replacement mutation
  const approveReplacementMutation = useMutation({
    mutationFn: async (replacementId: string) => {
      const storedReplacements = localStorage.getItem('replacementRequests');
      if (storedReplacements) {
        const replacements = JSON.parse(storedReplacements);
        const replacementToApprove = replacements.find((r: any) => r.id === replacementId);
        
        if (replacementToApprove) {
          // Mark the unit as under replacement
          await apiRequest(`/api/units/${replacementToApprove.unitId}`, {
            method: 'PUT',
            body: {
              isUnderReplacement: true,
              replacementRequestId: replacementId
            }
          });
        }
        
        const updatedReplacements = replacements.map((replacement: any) => {
          if (replacement.id === replacementId) {
            return {
              ...replacement,
              status: 'approved',
              approvalDate: new Date().toISOString().split('T')[0]
            };
          }
          return replacement;
        });
        localStorage.setItem('replacementRequests', JSON.stringify(updatedReplacements));
        return updatedReplacements;
      }
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/replacements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      toast({
        title: "Success",
        description: "Replacement request approved successfully. Unit is now under replacement.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve replacement request",
        variant: "destructive",
      });
    }
  });

  // Complete replacement mutation
  const completeReplacementMutation = useMutation({
    mutationFn: async (replacementId: string) => {
      const storedReplacements = localStorage.getItem('replacementRequests');
      if (storedReplacements) {
        const replacements = JSON.parse(storedReplacements);
        const replacementToComplete = replacements.find((r: any) => r.id === replacementId);
        
        if (replacementToComplete) {
          // Mark the original unit as replaced and make it available again
          await apiRequest(`/api/units/${replacementToComplete.unitId}`, {
            method: 'PUT',
            body: {
              isUnderReplacement: false,
              replacementRequestId: null,
              replacedDate: new Date().toISOString().split('T')[0],
              replacedReason: replacementToComplete.reason,
              status: 'Available'
            }
          });
          
          // Update the replacement record
          const updatedReplacements = replacements.map((replacement: any) => {
            if (replacement.id === replacementId) {
              return {
                ...replacement,
                status: 'completed',
                completionDate: new Date().toISOString().split('T')[0]
              };
            }
            return replacement;
          });
          
          localStorage.setItem('replacementRequests', JSON.stringify(updatedReplacements));
          return updatedReplacements;
        }
      }
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/replacements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      toast({
        title: "Success",
        description: "Replacement completed successfully. Unit is now available with replacement history.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete replacement request",
        variant: "destructive",
      });
    }
  });

  // Fetch replacement data from localStorage (where replacement requests are stored)
  const { data: replacements = [], isLoading } = useQuery({
    queryKey: ['/api/replacements'],
    queryFn: async () => {
      // Get replacement requests from localStorage
      const storedReplacements = localStorage.getItem('replacementRequests');
      let replacementData: ReplacementRecord[] = [];
      
      if (storedReplacements) {
        try {
          replacementData = JSON.parse(storedReplacements);
        } catch (error) {
          console.error('Error parsing replacement data:', error);
        }
      }
      
      // If no data, show some sample data for demonstration
      if (replacementData.length === 0) {
        replacementData = [
          {
            id: 'sample-1',
            unitId: 'unit-001',
            unitSerialNumber: 'LED-1752400001-1',
            itemName: 'LED Display 55"',
            itemModel: 'Samsung QN55Q70A',
            reason: 'warranty',
            status: 'completed',
            requestDate: '2025-01-15',
            completionDate: '2025-01-20',
            replacementUnitId: 'unit-150',
            replacementSerialNumber: 'LED-1752400150-1',
            notes: 'Screen flickering issue reported by customer',
            vendorName: 'Samsung India',
            warrantyExpiryDate: '2025-12-31',
            cost: 0,
            customerId: '1',
            customerName: 'Krishna Gurjar'
          },
          {
            id: 'test-replacement-' + Date.now(),
            unitId: '1752575932110_unit_2',
            unitSerialNumber: 'I543089001',
            itemId: '1752575932110',
            itemName: 'CPU Intel Core i7',
            itemModel: 'Intel Core i7-12700K',
            reason: 'defective',
            status: 'pending',
            requestDate: new Date().toISOString().split('T')[0],
            notes: 'Unit showing performance issues and overheating - test replacement',
            vendorName: 'Intel Corporation',
            warrantyExpiryDate: '2025-12-31',
            cost: 45000,
            customerId: null,
            customerName: null
          }
        ];
        
        // Store the test replacement data
        localStorage.setItem('replacementRequests', JSON.stringify(replacementData));
      }
      
      return replacementData as ReplacementRecord[];
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Calculate statistics
  const stats = {
    totalReplacements: replacements.length,
    pendingReplacements: replacements.filter(r => r.status === 'pending').length,
    completedReplacements: replacements.filter(r => r.status === 'completed').length,
    warrantyReplacements: replacements.filter(r => r.reason === 'warranty').length,
    totalCost: replacements.reduce((sum, r) => sum + r.cost, 0),
    avgReplacementTime: 5, // Mock average days
  };

  // Filter replacements based on search and filters
  const filteredReplacements = replacements.filter(replacement => {
    const matchesSearch = 
      replacement.unitSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      replacement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      replacement.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      replacement.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || replacement.status === statusFilter;
    const matchesReason = reasonFilter === 'all' || replacement.reason === reasonFilter;
    
    return matchesSearch && matchesStatus && matchesReason;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'warranty': return 'bg-blue-100 text-blue-800';
      case 'damage': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'defective': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Replacements</h1>
              <p className="text-gray-600 mt-2">Manage warranty replacements, damaged items, and defective units</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowReplacementModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Replacement Request
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Replacement Requests</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border border-black">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Replacements</CardTitle>
                    <RotateCcw className="w-4 h-4 text-gray-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">{stats.totalReplacements}</div>
                  <p className="text-sm text-gray-600">All time</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-black">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingReplacements}</div>
                  <p className="text-sm text-gray-600">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-black">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completedReplacements}</div>
                  <p className="text-sm text-gray-600">Successfully replaced</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-black">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Warranty Claims</CardTitle>
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.warrantyReplacements}</div>
                  <p className="text-sm text-gray-600">Under warranty</p>
                </CardContent>
              </Card>
            </div>

            {/* Cost Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border border-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Replacement Cost</span>
                    <span className="text-xl font-bold text-black">₹{stats.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Warranty Covered</span>
                    <span className="text-lg font-semibold text-green-600">₹0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Out of Pocket</span>
                    <span className="text-lg font-semibold text-red-600">₹{stats.totalCost.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Average Processing Time</span>
                    <span className="text-xl font-bold text-black">{stats.avgReplacementTime} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="text-lg font-semibold text-green-600">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="text-lg font-semibold text-blue-600">{stats.pendingReplacements + 2}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white border border-black">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Recent Replacement Activity</CardTitle>
                <CardDescription>Latest replacement requests and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReplacements.slice(0, 5).map((replacement) => (
                    <div key={replacement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(replacement.status)}
                        <div>
                          <p className="font-medium text-black">{replacement.itemName}</p>
                          <p className="text-sm text-gray-600">Serial: {replacement.unitSerialNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getReasonColor(replacement.reason)}>
                          {replacement.reason}
                        </Badge>
                        <Badge className={getStatusColor(replacement.status)}>
                          {replacement.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Replacement Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-white border border-black">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search by serial number, item name, customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={reasonFilter} onValueChange={setReasonFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reasons</SelectItem>
                      <SelectItem value="warranty">Warranty</SelectItem>
                      <SelectItem value="damage">Damage</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="defective">Defective</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Replacement Requests List */}
            <div className="space-y-4">
              {filteredReplacements.map((replacement) => (
                <Card key={replacement.id} className="bg-white border border-black">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-black">{replacement.itemName}</h3>
                            <p className="text-sm text-gray-600">{replacement.itemModel}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getReasonColor(replacement.reason)}>
                              {replacement.reason}
                            </Badge>
                            <Badge className={getStatusColor(replacement.status)}>
                              {replacement.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Serial Number</p>
                            <p className="font-medium text-black">{replacement.unitSerialNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Customer</p>
                            <p className="font-medium text-black">{replacement.customerName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Request Date</p>
                            <p className="font-medium text-black">{new Date(replacement.requestDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Vendor</p>
                            <p className="font-medium text-black">{replacement.vendorName}</p>
                          </div>
                          {replacement.cost > 0 && (
                            <div>
                              <p className="text-gray-600">Cost</p>
                              <p className="font-medium text-red-600">₹{replacement.cost.toLocaleString()}</p>
                            </div>
                          )}
                          {replacement.completionDate && (
                            <div>
                              <p className="text-gray-600">Completion Date</p>
                              <p className="font-medium text-green-600">{new Date(replacement.completionDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        
                        {replacement.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{replacement.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {replacement.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => approveReplacementMutation.mutate(replacement.id)}
                            disabled={approveReplacementMutation.isPending}
                          >
                            {approveReplacementMutation.isPending ? 'Approving...' : 'Approve'}
                          </Button>
                        )}
                        {replacement.status === 'approved' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => completeReplacementMutation.mutate(replacement.id)}
                            disabled={completeReplacementMutation.isPending}
                          >
                            {completeReplacementMutation.isPending ? 'Completing...' : 'Complete'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredReplacements.length === 0 && (
              <Card className="bg-white border border-black">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No replacement requests found matching your criteria.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-white border border-black">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Replacement Reports</CardTitle>
                <CardDescription>Generate detailed reports and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="p-6 h-auto flex-col items-start">
                    <FileText className="w-6 h-6 mb-2" />
                    <div className="text-left">
                      <p className="font-medium">Monthly Replacement Report</p>
                      <p className="text-sm text-gray-600">Detailed breakdown of all replacements</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="p-6 h-auto flex-col items-start">
                    <TrendingUp className="w-6 h-6 mb-2" />
                    <div className="text-left">
                      <p className="font-medium">Cost Analysis Report</p>
                      <p className="text-sm text-gray-600">Financial impact and trends</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="p-6 h-auto flex-col items-start">
                    <Package className="w-6 h-6 mb-2" />
                    <div className="text-left">
                      <p className="font-medium">Warranty Claims Report</p>
                      <p className="text-sm text-gray-600">Warranty-related replacements</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="p-6 h-auto flex-col items-start">
                    <AlertTriangle className="w-6 h-6 mb-2" />
                    <div className="text-left">
                      <p className="font-medium">Failure Analysis Report</p>
                      <p className="text-sm text-gray-600">Common failure patterns</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Replacement Request Modal */}
        <ReplacementRequestModal 
          isOpen={showReplacementModal} 
          onClose={() => setShowReplacementModal(false)} 
        />
      </div>
    </div>
  );
}