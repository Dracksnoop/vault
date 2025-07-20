import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Cpu, 
  HardDrive, 
  Monitor, 
  Microchip, 
  Zap,
  Settings,
  Save,
  X
} from 'lucide-react';

interface CPUUnit {
  id: string;
  itemId: string;
  serialNumber: string;
  barcode: string;
  status: string;
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
}

interface CPUSpecsEditorProps {
  unit: CPUUnit;
  isOpen: boolean;
  onClose: () => void;
}

export default function CPUSpecsEditor({ unit, isOpen, onClose }: CPUSpecsEditorProps) {
  const [specs, setSpecs] = useState<CPUUnit>({
    ...unit,
    cpuBrand: unit.cpuBrand || '',
    cpuModel: unit.cpuModel || '',
    cpuCores: unit.cpuCores || 0,
    cpuClockSpeed: unit.cpuClockSpeed || '',
    cpuArchitecture: unit.cpuArchitecture || '',
    cpuCacheSize: unit.cpuCacheSize || '',
    ramSize: unit.ramSize || 0,
    ramType: unit.ramType || '',
    ramSpeed: unit.ramSpeed || 0,
    ramSlotsUsed: unit.ramSlotsUsed || 0,
    storageType: unit.storageType || '',
    storageCapacity: unit.storageCapacity || '',
    storageNumDrives: unit.storageNumDrives || 0,
    gpuType: unit.gpuType || '',
    gpuModel: unit.gpuModel || '',
    gpuVram: unit.gpuVram || 0,
    motherboardModel: unit.motherboardModel || '',
    psuWattage: unit.psuWattage || 0,
    psuEfficiency: unit.psuEfficiency || '',
    osName: unit.osName || '',
    networkAdapter: unit.networkAdapter || '',
    opticalDrive: unit.opticalDrive || '',
    ports: unit.ports || '',
    coolingSystem: unit.coolingSystem || '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updatedSpecs: CPUUnit) => {
      return await apiRequest('PUT', `/api/units/${unit.id}`, updatedSpecs);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "CPU specifications updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update CPU specifications",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(specs);
  };

  const handleInputChange = (field: keyof CPUUnit, value: any) => {
    setSpecs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            CPU Specifications - {unit.serialNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Processor Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cpu className="w-4 h-4" />
                Processor Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpuBrand">Brand</Label>
                  <Select value={specs.cpuBrand} onValueChange={(value) => handleInputChange('cpuBrand', value)}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Select CPU brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intel">Intel</SelectItem>
                      <SelectItem value="AMD">AMD</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cpuModel">Model</Label>
                  <Input
                    id="cpuModel"
                    value={specs.cpuModel}
                    onChange={(e) => handleInputChange('cpuModel', e.target.value)}
                    placeholder="e.g., Core i7-12700K"
                    className="border-black"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cpuCores">Number of Cores</Label>
                  <Input
                    id="cpuCores"
                    type="number"
                    value={specs.cpuCores}
                    onChange={(e) => handleInputChange('cpuCores', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 8"
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="cpuClockSpeed">Clock Speed</Label>
                  <Input
                    id="cpuClockSpeed"
                    value={specs.cpuClockSpeed}
                    onChange={(e) => handleInputChange('cpuClockSpeed', e.target.value)}
                    placeholder="e.g., 3.6 GHz"
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="cpuArchitecture">Architecture</Label>
                  <Select value={specs.cpuArchitecture} onValueChange={(value) => handleInputChange('cpuArchitecture', value)}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Select architecture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="32-bit">32-bit</SelectItem>
                      <SelectItem value="64-bit">64-bit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="cpuCacheSize">Cache Size</Label>
                <Input
                  id="cpuCacheSize"
                  value={specs.cpuCacheSize}
                  onChange={(e) => handleInputChange('cpuCacheSize', e.target.value)}
                  placeholder="e.g., 12 MB"
                  className="border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Memory (RAM) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HardDrive className="w-4 h-4" />
                Memory (RAM)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ramSize">Total Size (GB)</Label>
                  <Input
                    id="ramSize"
                    type="number"
                    value={specs.ramSize}
                    onChange={(e) => handleInputChange('ramSize', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 16"
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="ramType">Type</Label>
                  <Select value={specs.ramType} onValueChange={(value) => handleInputChange('ramType', value)}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Select RAM type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DDR3">DDR3</SelectItem>
                      <SelectItem value="DDR4">DDR4</SelectItem>
                      <SelectItem value="DDR5">DDR5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ramSpeed">Speed (MHz)</Label>
                  <Input
                    id="ramSpeed"
                    type="number"
                    value={specs.ramSpeed}
                    onChange={(e) => handleInputChange('ramSpeed', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 3200"
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="ramSlotsUsed">Number of Slots Used</Label>
                  <Input
                    id="ramSlotsUsed"
                    type="number"
                    value={specs.ramSlotsUsed}
                    onChange={(e) => handleInputChange('ramSlotsUsed', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 2"
                    className="border-black"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HardDrive className="w-4 h-4" />
                Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storageType">Type</Label>
                  <Select value={specs.storageType} onValueChange={(value) => handleInputChange('storageType', value)}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Select storage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HDD">HDD</SelectItem>
                      <SelectItem value="SSD">SSD</SelectItem>
                      <SelectItem value="NVMe">NVMe</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="storageCapacity">Capacity</Label>
                  <Input
                    id="storageCapacity"
                    value={specs.storageCapacity}
                    onChange={(e) => handleInputChange('storageCapacity', e.target.value)}
                    placeholder="e.g., 1TB"
                    className="border-black"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="storageNumDrives">Number of Drives</Label>
                <Input
                  id="storageNumDrives"
                  type="number"
                  value={specs.storageNumDrives}
                  onChange={(e) => handleInputChange('storageNumDrives', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 1"
                  className="border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Graphics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="w-4 h-4" />
                Graphics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gpuType">GPU Type</Label>
                  <Select value={specs.gpuType} onValueChange={(value) => handleInputChange('gpuType', value)}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Select GPU type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Integrated">Integrated</SelectItem>
                      <SelectItem value="Dedicated">Dedicated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gpuModel">GPU Model</Label>
                  <Input
                    id="gpuModel"
                    value={specs.gpuModel}
                    onChange={(e) => handleInputChange('gpuModel', e.target.value)}
                    placeholder="e.g., RTX 4060"
                    className="border-black"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="gpuVram">VRAM (GB)</Label>
                <Input
                  id="gpuVram"
                  type="number"
                  value={specs.gpuVram}
                  onChange={(e) => handleInputChange('gpuVram', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 8"
                  className="border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Motherboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Microchip className="w-4 h-4" />
                Motherboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="motherboardModel">Brand and Model</Label>
                <Input
                  id="motherboardModel"
                  value={specs.motherboardModel}
                  onChange={(e) => handleInputChange('motherboardModel', e.target.value)}
                  placeholder="e.g., ASUS ROG Strix B550-F"
                  className="border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Power Supply Unit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-4 h-4" />
                Power Supply Unit (PSU)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="psuWattage">Wattage (W)</Label>
                  <Input
                    id="psuWattage"
                    type="number"
                    value={specs.psuWattage}
                    onChange={(e) => handleInputChange('psuWattage', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 750"
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="psuEfficiency">Efficiency Rating</Label>
                  <Input
                    id="psuEfficiency"
                    value={specs.psuEfficiency}
                    onChange={(e) => handleInputChange('psuEfficiency', e.target.value)}
                    placeholder="e.g., 80+ Gold"
                    className="border-black"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-4 h-4" />
                Operating System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="osName">OS Name and Version</Label>
                <Input
                  id="osName"
                  value={specs.osName}
                  onChange={(e) => handleInputChange('osName', e.target.value)}
                  placeholder="e.g., Windows 11 Pro"
                  className="border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-4 h-4" />
                Additional Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="networkAdapter">Network Adapter</Label>
                  <Input
                    id="networkAdapter"
                    value={specs.networkAdapter}
                    onChange={(e) => handleInputChange('networkAdapter', e.target.value)}
                    placeholder="e.g., Gigabit Ethernet"
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="opticalDrive">Optical Drive</Label>
                  <Input
                    id="opticalDrive"
                    value={specs.opticalDrive}
                    onChange={(e) => handleInputChange('opticalDrive', e.target.value)}
                    placeholder="e.g., DVD-RW"
                    className="border-black"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="ports">Ports</Label>
                <Textarea
                  id="ports"
                  value={specs.ports}
                  onChange={(e) => handleInputChange('ports', e.target.value)}
                  placeholder="e.g., 6x USB 3.0, 2x USB 2.0, HDMI, DisplayPort"
                  className="border-black"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="coolingSystem">Cooling System</Label>
                <Input
                  id="coolingSystem"
                  value={specs.coolingSystem}
                  onChange={(e) => handleInputChange('coolingSystem', e.target.value)}
                  placeholder="e.g., Air Cooler, Liquid Cooling"
                  className="border-black"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-black"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}