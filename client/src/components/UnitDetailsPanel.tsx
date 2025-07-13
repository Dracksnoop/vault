import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from "qrcode.react";
import { 
  Package, 
  Barcode, 
  MapPin, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  QrCode,
  Download,
  X,
  Save,
  Info,
  Cpu,
  Monitor,
  Keyboard,
  Mouse,
  Cable,
  HardDrive,
  Microchip,
  Settings
} from 'lucide-react';

interface Unit {
  id: string;
  itemId: string;
  serialNumber: string;
  barcode: string;
  status: "In Stock" | "Rented" | "Maintenance" | "Retired";
  location: string;
  warrantyExpiry: string;
  notes: string;
  // CPU Specifications
  cpuBrand?: string;
  cpuModel?: string;
  cpuCores?: number;
  cpuClockSpeed?: string;
  cpuArchitecture?: string;
  cpuCacheSize?: string;
  // Memory specifications
  ramSize?: number;
  ramType?: string;
  ramSpeed?: number;
  ramSlotsUsed?: number;
  // Storage specifications
  storageType?: string;
  storageCapacity?: string;
  storageNumDrives?: number;
  // Graphics specifications
  gpuType?: string;
  gpuModel?: string;
  gpuVram?: number;
  // Motherboard specifications
  motherboardModel?: string;
  // Power Supply specifications
  psuWattage?: number;
  psuEfficiency?: string;
  // Operating System
  osName?: string;
  // Additional specifications
  networkAdapter?: string;
  opticalDrive?: string;
  ports?: string;
  coolingSystem?: string;
  // Monitor specifications
  monitorBrand?: string;
  monitorModel?: string;
  screenSize?: number;
  resolution?: string;
  panelType?: string;
  refreshRate?: number;
  responseTime?: number;
  aspectRatio?: string;
  brightness?: number;
  contrastRatio?: string;
  inputPorts?: string;
  hasSpeakers?: string;
  adjustableHeight?: boolean;
  adjustableTilt?: boolean;
  adjustableSwivel?: boolean;
  adjustablePivot?: boolean;
  mountCompatibility?: string;
  colorGamut?: number;
}

interface Item {
  id: string;
  name: string;
  model: string;
  categoryId: string;
  quantityInStock: number;
  quantityRentedOut: number;
  location: string;
}

interface Category {
  id: string;
  name: string;
  itemCount: number;
}

interface UnitDetailsPanelProps {
  unit: Unit;
  item: Item;
  category: Category;
  isOpen: boolean;
  onClose: () => void;
}

export default function UnitDetailsPanel({ unit, item, category, isOpen, onClose }: UnitDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [editData, setEditData] = useState(unit);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateUnitMutation = useMutation({
    mutationFn: async (updatedUnit: Unit) => {
      const response = await apiRequest(`/api/units/${unit.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedUnit)
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      setIsEditing(false);
      toast({
        title: "Unit Updated",
        description: "Unit specifications have been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update unit specifications.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateUnitMutation.mutate(editData);
  };

  const handleCancel = () => {
    setEditData(unit);
    setIsEditing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Stock":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Rented":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "Maintenance":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "Retired":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 border-green-300";
      case "Rented":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Maintenance":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Retired":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('cpu')) return <Cpu className="w-5 h-5" />;
    if (name.includes('monitor')) return <Monitor className="w-5 h-5" />;
    if (name.includes('keyboard')) return <Keyboard className="w-5 h-5" />;
    if (name.includes('mouse')) return <Mouse className="w-5 h-5" />;
    if (name.includes('cable')) return <Cable className="w-5 h-5" />;
    if (name.includes('drive') || name.includes('storage')) return <HardDrive className="w-5 h-5" />;
    return <Package className="w-5 h-5" />;
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `${unit.serialNumber}_qr_code.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const renderBasicSpecs = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Serial Number</Label>
          <div className="flex items-center gap-2 mt-1">
            <Barcode className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{unit.serialNumber}</span>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Barcode</Label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">{unit.barcode}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Location</Label>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{unit.location}</span>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Warranty Expiry</Label>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{unit.warrantyExpiry}</span>
          </div>
        </div>
      </div>
      
      {unit.notes && (
        <div>
          <Label className="text-sm font-medium text-gray-700">Notes</Label>
          <p className="text-sm mt-1 p-3 bg-gray-50 border border-gray-200 rounded">{unit.notes}</p>
        </div>
      )}
    </div>
  );

  const renderCPUSpecs = () => (
    <div className="space-y-4">
      {/* Processor Information */}
      {(unit.cpuBrand || unit.cpuModel || unit.cpuCores || unit.cpuClockSpeed) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cpu className="w-4 h-4" />
              Processor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {unit.cpuBrand && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Brand</Label>
                  <p className="text-sm">{unit.cpuBrand}</p>
                </div>
              )}
              {unit.cpuModel && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Model</Label>
                  <p className="text-sm">{unit.cpuModel}</p>
                </div>
              )}
              {unit.cpuCores && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Cores</Label>
                  <p className="text-sm">{unit.cpuCores}</p>
                </div>
              )}
              {unit.cpuClockSpeed && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Clock Speed</Label>
                  <p className="text-sm">{unit.cpuClockSpeed}</p>
                </div>
              )}
              {unit.cpuArchitecture && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Architecture</Label>
                  <p className="text-sm">{unit.cpuArchitecture}</p>
                </div>
              )}
              {unit.cpuCacheSize && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Cache Size</Label>
                  <p className="text-sm">{unit.cpuCacheSize}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Information */}
      {(unit.ramSize || unit.ramType || unit.ramSpeed) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Microchip className="w-4 h-4" />
              Memory (RAM)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {unit.ramSize && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Size</Label>
                  <p className="text-sm">{unit.ramSize} GB</p>
                </div>
              )}
              {unit.ramType && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type</Label>
                  <p className="text-sm">{unit.ramType}</p>
                </div>
              )}
              {unit.ramSpeed && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Speed</Label>
                  <p className="text-sm">{unit.ramSpeed} MHz</p>
                </div>
              )}
              {unit.ramSlotsUsed && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Slots Used</Label>
                  <p className="text-sm">{unit.ramSlotsUsed}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Information */}
      {(unit.storageType || unit.storageCapacity) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HardDrive className="w-4 h-4" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {unit.storageType && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type</Label>
                  <p className="text-sm">{unit.storageType}</p>
                </div>
              )}
              {unit.storageCapacity && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Capacity</Label>
                  <p className="text-sm">{unit.storageCapacity}</p>
                </div>
              )}
              {unit.storageNumDrives && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Number of Drives</Label>
                  <p className="text-sm">{unit.storageNumDrives}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphics Information */}
      {(unit.gpuType || unit.gpuModel) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="w-4 h-4" />
              Graphics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {unit.gpuType && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type</Label>
                  <p className="text-sm">{unit.gpuType}</p>
                </div>
              )}
              {unit.gpuModel && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Model</Label>
                  <p className="text-sm">{unit.gpuModel}</p>
                </div>
              )}
              {unit.gpuVram && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">VRAM</Label>
                  <p className="text-sm">{unit.gpuVram} GB</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Specs */}
      {(unit.motherboardModel || unit.psuWattage || unit.osName) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-4 h-4" />
              Additional Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {unit.motherboardModel && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Motherboard</Label>
                  <p className="text-sm">{unit.motherboardModel}</p>
                </div>
              )}
              {unit.psuWattage && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Power Supply</Label>
                  <p className="text-sm">{unit.psuWattage}W {unit.psuEfficiency && `(${unit.psuEfficiency})`}</p>
                </div>
              )}
              {unit.osName && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Operating System</Label>
                  <p className="text-sm">{unit.osName}</p>
                </div>
              )}
              {unit.networkAdapter && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Network Adapter</Label>
                  <p className="text-sm">{unit.networkAdapter}</p>
                </div>
              )}
              {unit.opticalDrive && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Optical Drive</Label>
                  <p className="text-sm">{unit.opticalDrive}</p>
                </div>
              )}
              {unit.ports && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Ports</Label>
                  <p className="text-sm">{unit.ports}</p>
                </div>
              )}
              {unit.coolingSystem && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Cooling System</Label>
                  <p className="text-sm">{unit.coolingSystem}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderMonitorSpecs = () => (
    <div className="space-y-4">
      {/* Basic Monitor Information */}
      {(unit.monitorBrand || unit.monitorModel || unit.screenSize || unit.resolution) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="w-4 h-4" />
              Display Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {unit.monitorBrand && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Brand</Label>
                  <p className="text-sm">{unit.monitorBrand}</p>
                </div>
              )}
              {unit.monitorModel && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Model</Label>
                  <p className="text-sm">{unit.monitorModel}</p>
                </div>
              )}
              {unit.screenSize && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Screen Size</Label>
                  <p className="text-sm">{unit.screenSize}" inches</p>
                </div>
              )}
              {unit.resolution && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Resolution</Label>
                  <p className="text-sm">{unit.resolution}</p>
                </div>
              )}
              {unit.panelType && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Panel Type</Label>
                  <p className="text-sm">{unit.panelType}</p>
                </div>
              )}
              {unit.aspectRatio && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Aspect Ratio</Label>
                  <p className="text-sm">{unit.aspectRatio}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Specifications */}
      {(unit.refreshRate || unit.responseTime || unit.brightness || unit.contrastRatio || unit.colorGamut) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-4 h-4" />
              Performance Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {unit.refreshRate && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Refresh Rate</Label>
                  <p className="text-sm">{unit.refreshRate} Hz</p>
                </div>
              )}
              {unit.responseTime && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Response Time</Label>
                  <p className="text-sm">{unit.responseTime} ms</p>
                </div>
              )}
              {unit.brightness && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Brightness</Label>
                  <p className="text-sm">{unit.brightness} nits</p>
                </div>
              )}
              {unit.contrastRatio && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contrast Ratio</Label>
                  <p className="text-sm">{unit.contrastRatio}</p>
                </div>
              )}
              {unit.colorGamut && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Color Gamut</Label>
                  <p className="text-sm">{unit.colorGamut}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connectivity & Features */}
      {(unit.inputPorts || unit.hasSpeakers || unit.mountCompatibility) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cable className="w-4 h-4" />
              Connectivity & Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {unit.inputPorts && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Input Ports</Label>
                  <p className="text-sm">{unit.inputPorts}</p>
                </div>
              )}
              {unit.hasSpeakers && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Built-in Speakers</Label>
                  <p className="text-sm">{unit.hasSpeakers}</p>
                </div>
              )}
              {unit.mountCompatibility && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Mount Compatibility</Label>
                  <p className="text-sm">{unit.mountCompatibility}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ergonomics */}
      {(unit.adjustableHeight || unit.adjustableTilt || unit.adjustableSwivel || unit.adjustablePivot) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-4 h-4" />
              Ergonomics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {unit.adjustableHeight && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Adjustable Height</span>
                </div>
              )}
              {unit.adjustableTilt && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Adjustable Tilt</span>
                </div>
              )}
              {unit.adjustableSwivel && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Adjustable Swivel</span>
                </div>
              )}
              {unit.adjustablePivot && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Adjustable Pivot</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-black">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getCategoryIcon(category.name)}
            <div>
              <h2 className="text-xl font-semibold">{item.name} - {item.model}</h2>
              <p className="text-sm text-gray-600">{category.name} • Serial: {unit.serialNumber}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <Badge className={`${getStatusColor(unit.status)} border flex items-center gap-2`}>
              {getStatusIcon(unit.status)}
              {unit.status}
            </Badge>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQRCode(true)}
                className="border-black"
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-black"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Basic Information
            </h3>
            {renderBasicSpecs()}
          </div>

          {/* Technical Specifications */}
          {category.name.toLowerCase() === 'cpu' && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Technical Specifications
              </h3>
              {renderCPUSpecs()}
            </div>
          )}

          {/* Monitor Specifications */}
          {category.name.toLowerCase() === 'monitor' && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Technical Specifications
              </h3>
              {renderMonitorSpecs()}
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={updateUnitMutation.isPending}
                className="bg-black text-white hover:bg-gray-800"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-black"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* QR Code Dialog */}
        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent className="max-w-md border-black">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code for {unit.serialNumber}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={`https://raydifyvault.com/unit/${unit.serialNumber}`}
                  size={200}
                  level="M"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Scan this QR code to view unit details
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={downloadQRCode}
                  variant="outline"
                  className="border-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => setShowQRCode(false)}
                  variant="outline"
                  className="border-black"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}