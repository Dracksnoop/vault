import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Phone, User, CheckCircle, Clock, AlertCircle, Search, Plus, Eye, Package, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from 'jspdf';
import type { Customer, Employee, Rental, CallService, CallServiceItem } from "@shared/schema";

interface CallServiceFormData {
  customerId: number;
  customerName: string;
  assignedEmployeeId: string;
  employeeName: string;
  issueDescription: string;
  priority: "low" | "medium" | "high" | "urgent";
  issueResolutionDate: string;
  selectedRentals: string[];
  rentalDetails: { rentalId: string; itemName: string; serialNumbers: string; issueDetails: string }[];
}

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

const Stepper = ({ currentStep, totalSteps }: StepperProps) => {
  const steps = [
    "Start Call",
    "Select Customer", 
    "Select Items",
    "Set Date",
    "Assign Employee",
    "Review & Create"
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between w-full overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-shrink-0">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
                  ${index + 1 < currentStep
                    ? "bg-green-500 text-white"
                    : index + 1 === currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                {index + 1 < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              <div className="ml-3 flex-shrink-0">
                <div className={`text-sm font-medium ${index + 1 === currentStep ? "text-blue-600" : "text-gray-600"}`}>
                  Step {index + 1}
                </div>
                <div className={`text-xs ${index + 1 === currentStep ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                  {step}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-6 flex-shrink-0 ${index + 1 < currentStep ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CallServices() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedCallService, setSelectedCallService] = useState<CallService | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedItemForUnits, setSelectedItemForUnits] = useState<string | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [formData, setFormData] = useState<CallServiceFormData>({
    customerId: 0,
    customerName: "",
    assignedEmployeeId: "",
    employeeName: "",
    issueDescription: "",
    priority: "medium",
    issueResolutionDate: "",
    selectedRentals: [],
    rentalDetails: []
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mark resolved mutation
  const markResolvedMutation = useMutation({
    mutationFn: async (callServiceId: string) => {
      return await apiRequest("PATCH", `/api/call-services/${callServiceId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/call-services"] });
      toast({
        title: "Success",
        description: "Call service marked as resolved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark call service as resolved",
        variant: "destructive",
      });
    },
  });

  // Fetch existing call services
  const { data: callServices = [], isLoading } = useQuery({
    queryKey: ["/api/call-services"],
  });

  // Fetch customers for step 2
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch employees for step 5
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Fetch rentals for selected customer
  const { data: rentals = [] } = useQuery<Rental[]>({
    queryKey: ["/api/rentals"],
    enabled: formData.customerId > 0,
  });

  // Fetch service items to get detailed item information
  const { data: serviceItems = [] } = useQuery({
    queryKey: ["/api/service-items"],
    enabled: formData.customerId > 0,
  });

  // Fetch items to get item details
  const { data: items = [] } = useQuery({
    queryKey: ["/api/items"],
    enabled: formData.customerId > 0,
  });

  // Fetch units to get unit details for selection
  const { data: units = [] } = useQuery({
    queryKey: ["/api/units"],
    enabled: formData.customerId > 0,
  });

  // Create call service mutation
  const createCallServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const callServiceResponse = await apiRequest("POST", "/api/call-services", data);
      
      // Create call service items
      for (const rental of formData.rentalDetails) {
        await apiRequest("POST", "/api/call-service-items", {
          callServiceId: callServiceResponse.id,
          rentalId: rental.rentalId,
          itemName: rental.itemName,
          serialNumbers: rental.serialNumbers,
          issueDetails: rental.issueDetails
        });
      }
      
      return callServiceResponse;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Call service created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/call-services"] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create call service",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      customerId: 0,
      customerName: "",
      assignedEmployeeId: "",
      employeeName: "",
      issueDescription: "",
      priority: "medium",
      issueResolutionDate: "",
      selectedRentals: [],
      rentalDetails: []
    });
    setSelectedDate(undefined);
    setSelectedItemForUnits(null);
    setSelectedUnits([]);
  };

  const handleNext = () => {
    // Update rental details with selected units when moving from step 3
    if (currentStep === 3 && selectedUnits.length > 0) {
      const updatedDetails = formData.rentalDetails.map(detail => ({
        ...detail,
        serialNumbers: selectedUnits.join(', ')
      }));
      setFormData({
        ...formData,
        rentalDetails: updatedDetails
      });
    }
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData({
      ...formData,
      customerId: customer.id,
      customerName: customer.name
    });
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setFormData({
      ...formData,
      assignedEmployeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`
    });
  };

  const handleRentalToggle = (rental: Rental) => {
    const isSelected = formData.selectedRentals.includes(rental.id);
    let updatedRentals;
    let updatedDetails = [...formData.rentalDetails];

    if (isSelected) {
      updatedRentals = formData.selectedRentals.filter(id => id !== rental.id);
      updatedDetails = updatedDetails.filter(detail => detail.rentalId !== rental.id);
      // Clear selected units when deselecting rental
      setSelectedUnits([]);
    } else {
      updatedRentals = [...formData.selectedRentals, rental.id];
      
      // Get service items for this rental to create a proper item name
      const rentalServiceItems = serviceItems.filter((serviceItem: any) => serviceItem.serviceId === rental.serviceId);
      const itemNames = rentalServiceItems.map((serviceItem: any) => {
        const itemDetails = items.find((item: any) => item.id === serviceItem.itemId);
        return itemDetails?.name || 'Unknown Item';
      }).join(', ');
      
      updatedDetails.push({
        rentalId: rental.id,
        itemName: itemNames || `Rental ${rental.id}`,
        serialNumbers: selectedUnits.join(', '),
        issueDetails: ""
      });
    }

    setFormData({
      ...formData,
      selectedRentals: updatedRentals,
      rentalDetails: updatedDetails
    });
  };

  const handleCreateCall = () => {
    if (!formData.customerId || !formData.assignedEmployeeId || !formData.issueDescription || !selectedDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCallServiceMutation.mutate({
      customerId: formData.customerId,
      customerName: formData.customerName,
      assignedEmployeeId: formData.assignedEmployeeId,
      employeeName: formData.employeeName,
      issueDescription: formData.issueDescription,
      priority: formData.priority,
      issueResolutionDate: selectedDate.toISOString(),
    });
  };

  const handleMarkResolved = (callServiceId: string) => {
    markResolvedMutation.mutate(callServiceId);
  };

  const handleViewCallService = (callService: CallService) => {
    setSelectedCallService(callService);
    setShowViewDialog(true);
  };

  const generateCallServicePDF = async (callService: CallService) => {
    try {
      // Get company profile for header
      const companyProfile = await apiRequest("GET", "/api/company-profiles/default");
      
      // Get call service items
      const callServiceItems = await apiRequest("GET", `/api/call-service-items/call/${callService.id}`);
      
      // Get customer details
      const customer = customers.find((c: Customer) => c.id === callService.customerId);
      
      const doc = new jsPDF();
      
      // Header - Company Info
      doc.setFontSize(20);
      doc.text(companyProfile.companyName || "Raydify Vault", 20, 20);
      doc.setFontSize(10);
      doc.text(companyProfile.address || "", 20, 30);
      doc.text(`${companyProfile.city || ""}, ${companyProfile.state || ""} ${companyProfile.zipCode || ""}`, 20, 35);
      doc.text(`Phone: ${companyProfile.phone || ""} | Email: ${companyProfile.email || ""}`, 20, 40);
      
      // Title
      doc.setFontSize(16);
      doc.text("CALL SERVICE REPORT", 20, 55);
      
      // Call Service Details
      doc.setFontSize(12);
      doc.text(`Call Number: ${callService.callNumber}`, 20, 70);
      doc.text(`Status: ${callService.status.toUpperCase()}`, 120, 70);
      doc.text(`Priority: ${callService.priority.toUpperCase()}`, 20, 80);
      doc.text(`Created: ${new Date(callService.createdAt).toLocaleDateString()}`, 120, 80);
      doc.text(`Resolution Due: ${new Date(callService.issueResolutionDate).toLocaleDateString()}`, 20, 90);
      
      if (callService.resolvedAt) {
        doc.text(`Resolved: ${new Date(callService.resolvedAt).toLocaleDateString()}`, 120, 90);
        doc.text(`Resolution Status: ${callService.resolvedOnTime ? "ON TIME" : "LATE"}`, 20, 100);
      }
      
      // Customer Information
      doc.setFontSize(14);
      doc.text("CUSTOMER INFORMATION", 20, 115);
      doc.setFontSize(10);
      if (customer) {
        doc.text(`Name: ${customer.name}`, 20, 125);
        doc.text(`Email: ${customer.email || "N/A"}`, 20, 130);
        doc.text(`Phone: ${customer.phone || "N/A"}`, 20, 135);
        doc.text(`Address: ${customer.address || "N/A"}`, 20, 140);
        doc.text(`City: ${customer.city || "N/A"}, State: ${customer.state || "N/A"}`, 20, 145);
      }
      
      // Employee Assignment
      doc.setFontSize(14);
      doc.text("ASSIGNED EMPLOYEE", 20, 160);
      doc.setFontSize(10);
      doc.text(`Employee: ${callService.employeeName}`, 20, 170);
      
      // Issue Description
      doc.setFontSize(14);
      doc.text("ISSUE DESCRIPTION", 20, 185);
      doc.setFontSize(10);
      const splitDescription = doc.splitTextToSize(callService.issueDescription, 170);
      doc.text(splitDescription, 20, 195);
      
      // Affected Items/Units
      if (callServiceItems && callServiceItems.length > 0) {
        let yPos = 215 + (splitDescription.length * 5);
        doc.setFontSize(14);
        doc.text("AFFECTED ITEMS/UNITS", 20, yPos);
        doc.setFontSize(10);
        
        callServiceItems.forEach((item: any, index: number) => {
          yPos += 10;
          doc.text(`${index + 1}. Item: ${item.itemName}`, 25, yPos);
          if (item.serialNumbers) {
            yPos += 5;
            doc.text(`   Serial Numbers: ${item.serialNumbers}`, 25, yPos);
          }
          if (item.issueDetails) {
            yPos += 5;
            const splitIssue = doc.splitTextToSize(`   Issue Details: ${item.issueDetails}`, 150);
            doc.text(splitIssue, 25, yPos);
            yPos += (splitIssue.length - 1) * 5;
          }
        });
      }
      
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, pageHeight - 20);
      doc.text(`Call Service ID: ${callService.id}`, 20, pageHeight - 15);
      
      // Download the PDF
      doc.save(`CallService_${callService.callNumber}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
      
      toast({
        title: "Success",
        description: "Call service report downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const filteredCallServices = callServices.filter((call: CallService) =>
    call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.callNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 bg-white">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center py-12">
            <Phone className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-2xl font-bold mb-4">Create New Call Service</h3>
            <p className="text-gray-600 mb-8">
              Start the process to create a new call service record for customer support.
            </p>
            <Button onClick={handleNext} size="lg">
              Start Call Creation
            </Button>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Select Customer</h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {customers
                  .filter((customer: Customer) =>
                    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((customer: Customer) => (
                    <Card
                      key={customer.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        formData.customerId === customer.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                      }`}
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{customer.name}</h4>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                          </div>
                          {formData.customerId === customer.id && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        );

      case 3:
        const customerRentals = rentals.filter((rental: Rental) => rental.customerId === formData.customerId);
        
        // Get service items for each rental to show detailed item information
        const getServiceItemsForRental = (rentalId: string) => {
          return serviceItems.filter((serviceItem: any) => serviceItem.serviceId === rentalId);
        };

        const getItemDetails = (itemId: string) => {
          return items.find((item: any) => item.id === itemId);
        };

        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Select Rental Items</h3>
            <p className="text-gray-600 mb-4">
              Select the rental items that are experiencing issues for {formData.customerName}
            </p>
            {customerRentals.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No active rentals found for this customer.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customerRentals.map((rental: Rental) => {
                  const rentalServiceItems = getServiceItemsForRental(rental.serviceId);
                  return (
                    <Card
                      key={rental.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        formData.selectedRentals.includes(rental.id) ? "ring-2 ring-blue-500 bg-blue-50" : ""
                      }`}
                      onClick={() => handleRentalToggle(rental)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-lg">Rental #{rental.id}</h4>
                              {formData.selectedRentals.includes(rental.id) && (
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">Start Date: </span>
                                <span className="font-medium">{new Date(rental.startDate).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Status: </span>
                                <span className="font-medium capitalize">{rental.status}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Monthly Rate: </span>
                                <span className="font-medium">₹{rental.monthlyRate}</span>
                              </div>
                            </div>

                            {/* Show rental items */}
                            {rentalServiceItems.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm text-gray-700 mb-2">Rental Items:</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {rentalServiceItems.map((serviceItem: any) => {
                                    const itemDetails = getItemDetails(serviceItem.itemId);
                                    const itemUnits = units.filter((unit: any) => 
                                      unit.itemId === serviceItem.itemId && 
                                      unit.currentCustomerId === formData.customerId &&
                                      unit.status === 'Rented'
                                    );
                                    const isExpanded = selectedItemForUnits === serviceItem.id;
                                    
                                    return (
                                      <div key={serviceItem.id}>
                                        <div 
                                          className="flex items-center space-x-3 p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition-colors"
                                          onClick={() => setSelectedItemForUnits(isExpanded ? null : serviceItem.id)}
                                        >
                                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Package className="w-4 h-4 text-blue-600" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{itemDetails?.name || 'Unknown Item'}</div>
                                            <div className="text-xs text-gray-600">
                                              Model: {itemDetails?.model || 'N/A'} • Qty: {serviceItem.quantity} • ₹{serviceItem.unitPrice}/unit
                                            </div>
                                            <div className="text-xs text-blue-600 mt-1">
                                              Click to select specific units ({itemUnits.length} units available)
                                            </div>
                                          </div>
                                          <div className="text-gray-400">
                                            {isExpanded ? '−' : '+'}
                                          </div>
                                        </div>
                                        
                                        {/* Unit Selection */}
                                        {isExpanded && (
                                          <div className="mt-2 ml-4 space-y-2 border-l-2 border-blue-200 pl-4">
                                            <div className="text-sm font-medium text-gray-700 mb-2">
                                              Select Units with Issues:
                                            </div>
                                            {itemUnits.map((unit: any) => (
                                              <div 
                                                key={unit.id}
                                                className={`flex items-center space-x-3 p-2 rounded border cursor-pointer transition-colors ${
                                                  selectedUnits.includes(unit.id) 
                                                    ? 'bg-blue-50 border-blue-300' 
                                                    : 'bg-white hover:bg-gray-50'
                                                }`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const isSelected = selectedUnits.includes(unit.id);
                                                  if (isSelected) {
                                                    setSelectedUnits(selectedUnits.filter(id => id !== unit.id));
                                                  } else {
                                                    setSelectedUnits([...selectedUnits, unit.id]);
                                                  }
                                                }}
                                              >
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                  selectedUnits.includes(unit.id) 
                                                    ? 'bg-blue-500 border-blue-500' 
                                                    : 'border-gray-300'
                                                }`}>
                                                  {selectedUnits.includes(unit.id) && (
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                  )}
                                                </div>
                                                <div className="flex-1">
                                                  <div className="font-medium text-sm">Serial: {unit.serialNumber}</div>
                                                  <div className="text-xs text-gray-600">
                                                    Barcode: {unit.barcode || 'N/A'} • Status: {unit.status}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                            {itemUnits.length === 0 && (
                                              <div className="text-sm text-gray-500 italic">
                                                No units found for this item
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Set Issue Resolution Date</h3>
            <div className="space-y-4">
              <Label>Expected Resolution Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !selectedDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <div className="space-y-4">
                <div>
                  <Label>Issue Description</Label>
                  <Textarea
                    value={formData.issueDescription}
                    onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label>Priority Level</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Assign Employee</h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {employees
                  .filter((employee: Employee) =>
                    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    employee.role.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((employee: Employee) => (
                    <Card
                      key={employee.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        formData.assignedEmployeeId === employee.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                      }`}
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            {employee.photo ? (
                              <img
                                src={employee.photo}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium">{employee.firstName} {employee.lastName}</h4>
                              <p className="text-sm text-gray-600">{employee.role}</p>
                              <p className="text-sm text-gray-600">{employee.department}</p>
                            </div>
                          </div>
                          {formData.assignedEmployeeId === employee.id && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Review & Create Call Service</h3>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Call Service Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Customer</Label>
                      <p className="font-medium">{formData.customerName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Assigned Employee</Label>
                      <p className="font-medium">{formData.employeeName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Priority</Label>
                      <div className="mt-1">{getPriorityBadge(formData.priority)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Expected Resolution</Label>
                      <p className="font-medium">
                        {selectedDate ? format(selectedDate, "PPP") : "Not set"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Issue Description</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded border">{formData.issueDescription}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Selected Rental Items</Label>
                    <div className="mt-2 space-y-2">
                      {formData.rentalDetails.length === 0 ? (
                        <p className="text-sm text-gray-600">No rental items selected</p>
                      ) : (
                        formData.rentalDetails.map((detail, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded border">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{detail.itemName}</span>
                              <span className="text-xs text-gray-600">Rental #{detail.rentalId}</span>
                            </div>
                            {selectedUnits.length > 0 && (
                              <div className="mt-1">
                                <span className="text-xs text-gray-600">Selected Units: </span>
                                <span className="text-xs text-blue-600">{selectedUnits.length} unit(s) selected</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call Services</h1>
          <p className="text-gray-600">Manage customer service calls and issue tracking</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Call
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search call services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>
      </div>

      {/* Call Services List */}
      <div className="space-y-4">
        {filteredCallServices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Call Services Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? "No call services match your search." : "Start by creating your first call service."}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Call Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredCallServices.map((call: CallService) => (
            <Card key={call.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium">{call.callNumber}</h3>
                      {getStatusBadge(call.status)}
                      {getPriorityBadge(call.priority)}
                      {call.status === 'resolved' && (
                        <Badge 
                          variant={call.resolvedOnTime ? "outline" : "destructive"}
                          className={
                            call.resolvedOnTime 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {call.resolvedOnTime ? "✓ On Time" : "⚠ Late"}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Customer: </span>
                        <span className="font-medium">{call.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Assigned to: </span>
                        <span className="font-medium">{call.employeeName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Created: </span>
                        <span>{new Date(call.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Resolution Date: </span>
                        <span>
                          {call.issueResolutionDate 
                            ? new Date(call.issueResolutionDate).toLocaleDateString()
                            : "Not set"
                          }
                        </span>
                      </div>
                      {call.resolvedAt && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Resolved On: </span>
                          <span className="font-medium">
                            {new Date(call.resolvedAt).toLocaleDateString()} at {new Date(call.resolvedAt).toLocaleTimeString()}
                          </span>
                          {!call.resolvedOnTime && (
                            <span className="text-red-600 ml-2 text-xs">
                              ({Math.ceil((new Date(call.resolvedAt).getTime() - new Date(call.issueResolutionDate).getTime()) / (1000 * 60 * 60 * 24))} days late)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 line-clamp-2">{call.issueDescription}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {call.status !== 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkResolved(call.id)}
                        disabled={markResolvedMutation.isPending}
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {markResolvedMutation.isPending ? "Resolving..." : "Mark Resolved"}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewCallService(call)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Call Service Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Call Service</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Stepper currentStep={currentStep} totalSteps={6} />
            
            <div className="min-h-[500px] px-2">
              {renderStepContent()}
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t mt-6 px-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                size="lg"
              >
                Previous
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                  size="lg"
                >
                  Cancel
                </Button>
                {currentStep < 6 ? (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (currentStep === 2 && !formData.customerId) ||
                      (currentStep === 5 && !formData.assignedEmployeeId)
                    }
                    size="lg"
                    className="min-w-[100px]"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateCall}
                    disabled={createCallServiceMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 min-w-[160px]"
                    size="lg"
                  >
                    {createCallServiceMutation.isPending ? "Creating..." : "Create Call Service"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Call Service Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Call Service Details - {selectedCallService?.callNumber}</span>
              <Button
                onClick={() => selectedCallService && generateCallServicePDF(selectedCallService)}
                className="ml-4"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedCallService && (
            <div className="space-y-6">
              {/* Call Service Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>Call Service Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Call Number</Label>
                      <p className="text-sm font-medium">{selectedCallService.callNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(selectedCallService.status)}
                        {selectedCallService.status === 'resolved' && (
                          <Badge 
                            variant={selectedCallService.resolvedOnTime ? "outline" : "destructive"}
                            className={
                              selectedCallService.resolvedOnTime 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {selectedCallService.resolvedOnTime ? "✓ On Time" : "⚠ Late"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Priority</Label>
                      <div>{getPriorityBadge(selectedCallService.priority)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                      <p className="text-sm">{new Date(selectedCallService.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Resolution Due</Label>
                      <p className="text-sm">{new Date(selectedCallService.issueResolutionDate).toLocaleDateString()}</p>
                    </div>
                    {selectedCallService.resolvedAt && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Resolved Date</Label>
                        <p className="text-sm">
                          {new Date(selectedCallService.resolvedAt).toLocaleDateString()} at{' '}
                          {new Date(selectedCallService.resolvedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Customer Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const customer = customers.find((c: Customer) => c.id === selectedCallService.customerId);
                    return customer ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                          <p className="text-sm font-medium">{customer.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Email</Label>
                          <p className="text-sm">{customer.email || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Phone</Label>
                          <p className="text-sm">{customer.phone || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Company</Label>
                          <p className="text-sm">{customer.company || "N/A"}</p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-sm font-medium text-gray-600">Address</Label>
                          <p className="text-sm">
                            {customer.address && customer.city && customer.state
                              ? `${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode || ""}`
                              : "N/A"
                            }
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Customer information not available</p>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Employee Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Assigned Employee</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Employee Name</Label>
                    <p className="text-sm font-medium">{selectedCallService.employeeName}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Issue Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Issue Description</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{selectedCallService.issueDescription}</p>
                </CardContent>
              </Card>

              {/* Affected Items/Units */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Affected Items/Units</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const { data: callServiceItems = [] } = useQuery({
                      queryKey: [`/api/call-service-items/call/${selectedCallService.id}`],
                    });
                    
                    return callServiceItems.length > 0 ? (
                      <div className="space-y-4">
                        {callServiceItems.map((item: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Item Name</Label>
                                <p className="text-sm font-medium">{item.itemName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Serial Numbers</Label>
                                <p className="text-sm">{item.serialNumbers || "N/A"}</p>
                              </div>
                              {item.issueDetails && (
                                <div className="col-span-2">
                                  <Label className="text-sm font-medium text-gray-600">Issue Details</Label>
                                  <p className="text-sm">{item.issueDetails}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No specific items/units associated with this call service</p>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}