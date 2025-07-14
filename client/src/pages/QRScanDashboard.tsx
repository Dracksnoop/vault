import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  User, 
  Lock, 
  Package, 
  Cpu, 
  HardDrive, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Monitor,
  LogOut,
  QrCode
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Unit, Item } from "@shared/schema";

interface UnitDetails {
  serialNumber: string;
  model: string;
  name: string;
  location: string;
  warranty: string;
  status: "Available" | "Rented" | "Maintenance" | "Retired";
  notes: string;
  barcode: string;
}

interface LoginCredentials {
  userId: string;
  password: string;
}

export default function QRScanDashboard() {
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginCredentials>({ userId: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unitDetails, setUnitDetails] = useState<UnitDetails | null>(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [rentalInfo, setRentalInfo] = useState<any>(null);

  useEffect(() => {
    // Extract serial number from URL path
    const pathParts = location.split('/');
    const unitIndex = pathParts.indexOf('unit');
    if (unitIndex !== -1 && pathParts[unitIndex + 1]) {
      setSerialNumber(pathParts[unitIndex + 1]);
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      // Authenticate user with real API
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.userId,
          password: loginForm.password
        })
      });

      if (response.user) {
        setIsAuthenticated(true);
        setAuthenticatedUser(response.user);
        
        // Fetch unit details after successful login
        await fetchUnitDetails(serialNumber);
      } else {
        setLoginError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError("Invalid credentials. Please try again.");
    }

    setIsLoading(false);
  };

  const fetchUnitDetails = async (serialNum: string) => {
    try {
      // Fetch unit details by serial number using the new API endpoint
      const response = await apiRequest(`/api/units/serial/${serialNum}`);
      
      if (response.unitDetails) {
        setUnitDetails(response.unitDetails);
        setRentalInfo(response.rentalInfo);
      } else {
        setLoginError("Unit details not found");
      }
    } catch (error) {
      console.error('Error fetching unit details:', error);
      setLoginError("Unit not found in system");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUnitDetails(null);
    setLoginForm({ userId: "", password: "" });
    setLoginError("");
    setAuthenticatedUser(null);
    setRentalInfo(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800";
      case "Rented": return "bg-blue-100 text-blue-800";
      case "rented": return "bg-blue-100 text-blue-800";
      case "Maintenance": return "bg-yellow-100 text-yellow-800";
      case "Retired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available": return <CheckCircle className="w-4 h-4" />;
      case "Rented": return <Package className="w-4 h-4" />;
      case "rented": return <Package className="w-4 h-4" />;
      case "Maintenance": return <AlertTriangle className="w-4 h-4" />;
      case "Retired": return <Lock className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-black">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-black">
                Secure Access Required
              </CardTitle>
              <CardDescription className="text-black">
                Please authenticate to view unit details
                {serialNumber && (
                  <div className="mt-2 p-2 bg-gray-100 rounded border">
                    <span className="text-sm font-mono">Unit: {serialNumber}</span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-black font-medium mb-2">Login Options:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• <strong>System Users:</strong> Use your username and password</p>
                    <p>• <strong>Customers:</strong> Use your name or email as username, phone as password</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId" className="text-black">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="userId"
                      type="text"
                      placeholder="Enter your username, name, or email"
                      value={loginForm.userId}
                      onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                      className="pl-10 border-black"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password or phone number"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="pl-10 border-black"
                      required
                    />
                  </div>
                </div>

                {loginError && (
                  <Alert className="border-red-500">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-700">
                      {loginError}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Secure Login
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!unitDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="border-black">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Unit Not Found</h2>
            <p className="text-gray-600 mb-4">
              Serial number "{serialNumber}" was not found in the system.
            </p>
            <Button onClick={handleLogout} variant="outline" className="border-black">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-black">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">QR Scan Dashboard</h1>
                <p className="text-sm text-gray-600">Unit Details & Status</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="border-black">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit Overview */}
          <div className="lg:col-span-2">
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  {unitDetails.name}
                </CardTitle>
                <CardDescription className="text-black">
                  Model: {unitDetails.model}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-black font-medium">Serial Number</Label>
                    <div className="p-2 bg-gray-50 rounded border font-mono text-sm">
                      {unitDetails.serialNumber}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-medium">Status</Label>
                    <Badge className={`${getStatusColor(unitDetails.status)} border inline-flex items-center gap-1`}>
                      {getStatusIcon(unitDetails.status)}
                      {unitDetails.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-black font-medium">Barcode</Label>
                  <div className="p-2 bg-gray-50 rounded border font-mono text-sm">
                    {unitDetails.barcode}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-black font-medium">Location</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-black">{unitDetails.location}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-black font-medium">Warranty</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-black">
                      {unitDetails.warranty !== 'N/A' ? `Valid until ${unitDetails.warranty}` : 'No warranty information'}
                    </span>
                  </div>
                </div>

                {unitDetails.notes && unitDetails.notes !== 'No notes available' && (
                  <div className="space-y-2">
                    <Label className="text-black font-medium">Notes</Label>
                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-black text-sm">{unitDetails.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rental Information - Show only if unit is rented */}
            {rentalInfo && unitDetails.status === 'rented' && (
              <Card className="border-black">
                <CardHeader>
                  <CardTitle className="text-black flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Rental Information
                  </CardTitle>
                  <CardDescription className="text-black">
                    Currently rented to customer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Information */}
                  <div className="space-y-2">
                    <Label className="text-black font-medium">Customer Details</Label>
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-black">Name:</span>
                          <span className="text-sm text-gray-600">{rentalInfo.customer.name}</span>
                        </div>
                        {rentalInfo.customer.company && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-black">Company:</span>
                            <span className="text-sm text-gray-600">{rentalInfo.customer.company}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-black">Phone:</span>
                          <span className="text-sm text-gray-600">{rentalInfo.customer.phone}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-black">Email:</span>
                          <span className="text-sm text-gray-600">{rentalInfo.customer.email}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-black">Address:</span>
                          <span className="text-sm text-gray-600 text-right">{rentalInfo.customer.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rental Terms */}
                  <div className="space-y-2">
                    <Label className="text-black font-medium">Rental Terms</Label>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-black">Start Date:</span>
                          <span className="text-sm text-gray-600">
                            {new Date(rentalInfo.rental.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-black">End Date:</span>
                          <span className="text-sm text-gray-600">
                            {new Date(rentalInfo.rental.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-black">Payment:</span>
                          <span className="text-sm text-gray-600">
                            ${rentalInfo.rental.rate} ({rentalInfo.rental.paymentFrequency})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-black">Total Amount:</span>
                          <span className="text-sm text-gray-600">${rentalInfo.rental.totalAmount}</span>
                        </div>
                        {rentalInfo.rental.securityDeposit && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-black">Security Deposit:</span>
                            <span className="text-sm text-gray-600">${rentalInfo.rental.securityDeposit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Terms */}
                  {rentalInfo.rental.terms && (
                    <div className="space-y-2">
                      <Label className="text-black font-medium">Additional Terms</Label>
                      <div className="p-3 bg-gray-50 rounded border">
                        <p className="text-black text-sm">{rentalInfo.rental.terms}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* User Info & Actions */}
          <div className="space-y-6">
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-black">Logged in as</p>
                      <p className="text-xs text-gray-600">{authenticatedUser?.username}</p>
                      {authenticatedUser?.email && (
                        <p className="text-xs text-gray-500">{authenticatedUser?.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-black">Access Level</p>
                      <p className="text-xs text-gray-600">
                        {authenticatedUser?.type === 'customer' ? 'Customer Access' : 'System User'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Unit Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full border-black" disabled>
                  View Only Mode
                </Button>
                <Button variant="outline" className="w-full border-black" disabled>
                  Contact Admin for Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}