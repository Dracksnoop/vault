import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Search, Edit, Trash2, Building, MapPin, Phone, Mail, CreditCard, Calendar, User, Briefcase } from "lucide-react";
import type { Employee, InsertEmployee } from "@shared/schema";

const roleOptions = [
  "Manager", "Senior Manager", "Team Lead", "Software Engineer", "Senior Software Engineer", 
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer",
  "UI/UX Designer", "Product Manager", "Project Manager", "Business Analyst", 
  "QA Engineer", "Data Analyst", "HR Manager", "Finance Manager", "Sales Executive",
  "Marketing Specialist", "Customer Support", "System Administrator", "Technical Writer"
];

const departmentOptions = [
  "Engineering", "Design", "Product", "Marketing", "Sales", "Human Resources", 
  "Finance", "Operations", "Customer Support", "Quality Assurance", "DevOps", 
  "Business Development", "Legal", "Administration"
];

const idProofOptions = [
  "Aadhar Card", "PAN Card", "Passport", "Driving License", "Voter ID Card"
];

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showEmployeeCards, setShowEmployeeCards] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<InsertEmployee>>({
    status: "active"
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: () => apiRequest("GET", "/api/employees")
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: (employee: Partial<InsertEmployee>) => 
      apiRequest("POST", "/api/employees", employee),
    onSuccess: () => {
      // Force refresh the employees data
      queryClient.removeQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees"] });
      setIsAddEmployeeOpen(false);
      setNewEmployee({ status: "active" });
      toast({
        title: "Employee Added",
        description: "Employee has been successfully added to the system."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive"
      });
    }
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, employee }: { id: string; employee: Partial<InsertEmployee> }) =>
      apiRequest("PUT", `/api/employees/${id}`, employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setEditingEmployee(null);
      setPhotoPreview(null);
      toast({
        title: "Employee Updated",
        description: "Employee information has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive"
      });
    }
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Employee Deleted",
        description: "Employee has been removed from the system."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to delete employee",
        variant: "destructive"
      });
    }
  });

  const filteredEmployees = employees.filter((employee: Employee) =>
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email || !newEmployee.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createEmployeeMutation.mutate(newEmployee);
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 1MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoPreview(result);
      if (editingEmployee) {
        setEditingEmployee({ ...editingEmployee, photo: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateEmployee = () => {
    if (!editingEmployee) return;
    updateEmployeeMutation.mutate({ 
      id: editingEmployee.id, 
      employee: editingEmployee 
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary"; 
      case "terminated": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage company employees, roles, and personal information
          </p>
        </div>
        <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newEmployee.firstName || ""}
                      onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newEmployee.lastName || ""}
                      onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="john.doe@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Job Information */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Job Information
                </h3>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newEmployee.role || ""}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={newEmployee.department || ""}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="joiningDate">Joining Date *</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={newEmployee.joiningDate || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary (Optional)</Label>
                  <Input
                    id="salary"
                    value={newEmployee.salary || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    placeholder="₹50,000"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Address Information
                </h3>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={newEmployee.address || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                    placeholder="123 Main Street, Apartment 4B"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={newEmployee.city || ""}
                      onChange={(e) => setNewEmployee({ ...newEmployee, city: e.target.value })}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={newEmployee.state || ""}
                      onChange={(e) => setNewEmployee({ ...newEmployee, state: e.target.value })}
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={newEmployee.pincode || ""}
                      onChange={(e) => setNewEmployee({ ...newEmployee, pincode: e.target.value })}
                      placeholder="400001"
                    />
                  </div>
                </div>
              </div>

              {/* ID Proof & Banking */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  ID Proof & Banking
                </h3>
                <div>
                  <Label htmlFor="idProofType">ID Proof Type *</Label>
                  <Select
                    value={newEmployee.idProofType || ""}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, idProofType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID proof type" />
                    </SelectTrigger>
                    <SelectContent>
                      {idProofOptions.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idProofNumber">ID Proof Number *</Label>
                  <Input
                    id="idProofNumber"
                    value={newEmployee.idProofNumber || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, idProofNumber: e.target.value })}
                    placeholder="1234-5678-9012"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccountNumber">Bank Account Number (Optional)</Label>
                  <Input
                    id="bankAccountNumber"
                    value={newEmployee.bankAccountNumber || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, bankAccountNumber: e.target.value })}
                    placeholder="1234567890123456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="bankIfscCode">IFSC Code (Optional)</Label>
                    <Input
                      id="bankIfscCode"
                      value={newEmployee.bankIfscCode || ""}
                      onChange={(e) => setNewEmployee({ ...newEmployee, bankIfscCode: e.target.value })}
                      placeholder="SBIN0001234"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name (Optional)</Label>
                    <Input
                      id="bankName"
                      value={newEmployee.bankName || ""}
                      onChange={(e) => setNewEmployee({ ...newEmployee, bankName: e.target.value })}
                      placeholder="State Bank of India"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact & Notes */}
              <div className="col-span-2 space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Emergency Contact & Additional Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={newEmployee.emergencyContactName || ""}
                      onChange={(e) => setNewEmployee({ ...newEmployee, emergencyContactName: e.target.value })}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={newEmployee.emergencyContactPhone || ""}
                      onChange={(e) => setNewEmployee({ ...newEmployee, emergencyContactPhone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newEmployee.notes || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, notes: e.target.value })}
                    placeholder="Additional notes about the employee..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddEmployee}
                disabled={createEmployeeMutation.isPending}
              >
                {createEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowEmployeeCards(!showEmployeeCards)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Click to view all</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((emp: Employee) => emp.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(employees.map((emp: Employee) => emp.department)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(employees.map((emp: Employee) => emp.role)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Cards Dashboard */}
      {showEmployeeCards && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Employee Cards Dashboard</CardTitle>
                <CardDescription>All employees in card format</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowEmployeeCards(false)}
              >
                Back to Directory
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading employees...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No employees found. Add your first employee to get started.
                  </div>
                ) : (
                  employees.map((employee: Employee) => (
                    <Card key={employee.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {employee.firstName} {employee.lastName}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant={getStatusBadgeVariant(employee.status)}>
                              {employee.status}
                            </Badge>
                            <div className="w-24 h-32 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                              {employee.photo ? (
                                <img 
                                  src={employee.photo} 
                                  alt={`${employee.firstName} ${employee.lastName}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-12 w-12 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.role}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.department}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.city}, {employee.state}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Joined: {new Date(employee.joiningDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-end space-x-1 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingEmployee(employee);
                              setPhotoPreview(employee.photo || null);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                            disabled={deleteEmployeeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      {!showEmployeeCards && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              Search and manage all company employees
            </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees by name, ID, email, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading employees...</div>
          ) : (
            <div className="grid gap-4">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No employees found matching your search." : "No employees found. Add your first employee to get started."}
                </div>
              ) : (
                filteredEmployees.map((employee: Employee) => (
                  <Card key={employee.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {employee.firstName} {employee.lastName}
                            </h3>
                            <Badge variant={getStatusBadgeVariant(employee.status)}>
                              {employee.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Employee ID</p>
                              <p className="font-medium">{employee.employeeId}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Role</p>
                              <p className="font-medium">{employee.role}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Department</p>
                              <p className="font-medium">{employee.department}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Joining Date</p>
                              <p className="font-medium">
                                {new Date(employee.joiningDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Email</p>
                              <p className="font-medium">{employee.email}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Phone</p>
                              <p className="font-medium">{employee.phone}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p className="font-medium">{employee.city}, {employee.state}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">ID Proof</p>
                              <p className="font-medium">{employee.idProofType}</p>
                            </div>
                          </div>
                          {employee.notes && (
                            <div className="mt-2">
                              <p className="text-muted-foreground text-sm">Notes</p>
                              <p className="text-sm">{employee.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingEmployee(employee);
                              setPhotoPreview(employee.photo || null);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                            disabled={deleteEmployeeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Edit Employee Dialog */}
      {editingEmployee && (
        <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Employee: {editingEmployee.firstName} {editingEmployee.lastName}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {/* Similar form structure as Add Employee but with existing data */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input
                      id="editFirstName"
                      value={editingEmployee.firstName}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input
                      id="editLastName"
                      value={editingEmployee.lastName}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={editingEmployee.phone}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Job Information
                </h3>
                <div>
                  <Label htmlFor="editRole">Role</Label>
                  <Select
                    value={editingEmployee.role}
                    onValueChange={(value) => setEditingEmployee({ ...editingEmployee, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editDepartment">Department</Label>
                  <Select
                    value={editingEmployee.department}
                    onValueChange={(value) => setEditingEmployee({ ...editingEmployee, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editingEmployee.status}
                    onValueChange={(value) => setEditingEmployee({ ...editingEmployee, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editSalary">Salary</Label>
                  <Input
                    id="editSalary"
                    value={editingEmployee.salary || ""}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: e.target.value })}
                  />
                </div>
                
                {/* Photo Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="editPhoto">Employee Photo</Label>
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-32 h-40 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                      {photoPreview || editingEmployee.photo ? (
                        <img 
                          src={photoPreview || editingEmployee.photo} 
                          alt="Employee Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        id="editPhoto"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('editPhoto')?.click()}
                      >
                        Choose Photo
                      </Button>
                      {(photoPreview || editingEmployee.photo) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPhotoPreview(null);
                            setEditingEmployee({ ...editingEmployee, photo: undefined });
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Upload passport size photo (max 1MB, JPG/PNG)
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <div>
                  <Label htmlFor="editNotes">Notes</Label>
                  <Textarea
                    id="editNotes"
                    value={editingEmployee.notes || ""}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditingEmployee(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateEmployee}
                disabled={updateEmployeeMutation.isPending}
              >
                {updateEmployeeMutation.isPending ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}