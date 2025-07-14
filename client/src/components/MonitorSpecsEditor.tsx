import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Monitor, 
  Palette, 
  Settings,
  Save,
  X,
  Info,
  Zap,
  Maximize
} from 'lucide-react';

interface MonitorUnit {
  id: string;
  itemId: string;
  serialNumber: string;
  barcode: string;
  status: string;
  location: string;
  warrantyExpiry: string;
  notes: string;
  // Monitor Specifications
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

interface MonitorSpecsEditorProps {
  unit: MonitorUnit;
  isOpen: boolean;
  onClose: () => void;
}

export default function MonitorSpecsEditor({ unit, isOpen, onClose }: MonitorSpecsEditorProps) {
  const [specs, setSpecs] = useState<MonitorUnit>({
    ...unit,
    // Ensure all monitor fields have defaults
    monitorBrand: unit.monitorBrand || '',
    monitorModel: unit.monitorModel || '',
    screenSize: unit.screenSize || 0,
    resolution: unit.resolution || '',
    panelType: unit.panelType || '',
    refreshRate: unit.refreshRate || 0,
    responseTime: unit.responseTime || 0,
    aspectRatio: unit.aspectRatio || '',
    brightness: unit.brightness || 0,
    contrastRatio: unit.contrastRatio || '',
    inputPorts: unit.inputPorts || '',
    hasSpeakers: unit.hasSpeakers || '',
    adjustableHeight: unit.adjustableHeight || false,
    adjustableTilt: unit.adjustableTilt || false,
    adjustableSwivel: unit.adjustableSwivel || false,
    adjustablePivot: unit.adjustablePivot || false,
    mountCompatibility: unit.mountCompatibility || '',
    colorGamut: unit.colorGamut || 0,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateUnitMutation = useMutation({
    mutationFn: async (updatedSpecs: MonitorUnit) => {
      const response = await apiRequest(`/api/units/${unit.id}`, {
        method: 'PUT',
        body: updatedSpecs
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      onClose();
      toast({
        title: "Monitor Specifications Updated",
        description: "Monitor specifications have been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update monitor specifications.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateUnitMutation.mutate(specs);
  };

  const handleCancel = () => {
    setSpecs({
      ...unit,
      monitorBrand: unit.monitorBrand || '',
      monitorModel: unit.monitorModel || '',
      screenSize: unit.screenSize || 0,
      resolution: unit.resolution || '',
      panelType: unit.panelType || '',
      refreshRate: unit.refreshRate || 0,
      responseTime: unit.responseTime || 0,
      aspectRatio: unit.aspectRatio || '',
      brightness: unit.brightness || 0,
      contrastRatio: unit.contrastRatio || '',
      inputPorts: unit.inputPorts || '',
      hasSpeakers: unit.hasSpeakers || '',
      adjustableHeight: unit.adjustableHeight || false,
      adjustableTilt: unit.adjustableTilt || false,
      adjustableSwivel: unit.adjustableSwivel || false,
      adjustablePivot: unit.adjustablePivot || false,
      mountCompatibility: unit.mountCompatibility || '',
      colorGamut: unit.colorGamut || 0,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-black">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Monitor className="w-6 h-6" />
            Monitor Specifications - {unit.serialNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monitorBrand" className="text-sm font-medium">Brand</Label>
                  <Input
                    id="monitorBrand"
                    value={specs.monitorBrand}
                    onChange={(e) => setSpecs({...specs, monitorBrand: e.target.value})}
                    placeholder="e.g., Dell, Samsung, LG"
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="monitorModel" className="text-sm font-medium">Model</Label>
                  <Input
                    id="monitorModel"
                    value={specs.monitorModel}
                    onChange={(e) => setSpecs({...specs, monitorModel: e.target.value})}
                    placeholder="e.g., U2720Q, S27CG552"
                    className="border-black"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Maximize className="w-4 h-4" />
                Display Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="screenSize" className="text-sm font-medium">Screen Size (inches)</Label>
                  <Input
                    id="screenSize"
                    type="number"
                    value={specs.screenSize || ''}
                    onChange={(e) => setSpecs({...specs, screenSize: Number(e.target.value)})}
                    placeholder="e.g., 27"
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="resolution" className="text-sm font-medium">Resolution</Label>
                  <Input
                    id="resolution"
                    value={specs.resolution}
                    onChange={(e) => setSpecs({...specs, resolution: e.target.value})}
                    placeholder="e.g., 2560 x 1440"
                    className="border-black"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="panelType" className="text-sm font-medium">Panel Type</Label>
                  <Select value={specs.panelType} onValueChange={(value) => setSpecs({...specs, panelType: value})}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Select panel type" />
                    </SelectTrigger>
                    <SelectContent className="border-black">
                      <SelectItem value="IPS">IPS</SelectItem>
                      <SelectItem value="TN">TN</SelectItem>
                      <SelectItem value="VA">VA</SelectItem>
                      <SelectItem value="OLED">OLED</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="aspectRatio" className="text-sm font-medium">Aspect Ratio</Label>
                  <Input
                    id="aspectRatio"
                    value={specs.aspectRatio}
                    onChange={(e) => setSpecs({...specs, aspectRatio: e.target.value})}
                    placeholder="e.g., 16:9"
                    className="border-black"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-4 h-4" />
                Performance Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="refreshRate" className="text-sm font-medium">Refresh Rate (Hz)</Label>
                  <Input
                    id="refreshRate"
                    type="number"
                    value={specs.refreshRate || ''}
                    onChange={(e) => setSpecs({...specs, refreshRate: Number(e.target.value)})}
                    placeholder="e.g., 60"
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="responseTime" className="text-sm font-medium">Response Time (ms)</Label>
                  <Input
                    id="responseTime"
                    type="number"
                    value={specs.responseTime || ''}
                    onChange={(e) => setSpecs({...specs, responseTime: Number(e.target.value)})}
                    placeholder="e.g., 5"
                    className="border-black"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brightness" className="text-sm font-medium">Brightness (nits)</Label>
                  <Input
                    id="brightness"
                    type="number"
                    value={specs.brightness || ''}
                    onChange={(e) => setSpecs({...specs, brightness: Number(e.target.value)})}
                    placeholder="e.g., 350"
                    className="border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="contrastRatio" className="text-sm font-medium">Contrast Ratio</Label>
                  <Input
                    id="contrastRatio"
                    value={specs.contrastRatio}
                    onChange={(e) => setSpecs({...specs, contrastRatio: e.target.value})}
                    placeholder="e.g., 1000:1"
                    className="border-black"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="colorGamut" className="text-sm font-medium">Color Gamut (%)</Label>
                <Input
                  id="colorGamut"
                  type="number"
                  value={specs.colorGamut || ''}
                  onChange={(e) => setSpecs({...specs, colorGamut: Number(e.target.value)})}
                  placeholder="e.g., 99"
                  className="border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Connectivity & Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-4 h-4" />
                Connectivity & Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="inputPorts" className="text-sm font-medium">Input Ports</Label>
                <Input
                  id="inputPorts"
                  value={specs.inputPorts}
                  onChange={(e) => setSpecs({...specs, inputPorts: e.target.value})}
                  placeholder="e.g., HDMI x2, DisplayPort, USB-C"
                  className="border-black"
                />
              </div>
              
              <div>
                <Label htmlFor="hasSpeakers" className="text-sm font-medium">Built-in Speakers</Label>
                <Select value={specs.hasSpeakers} onValueChange={(value) => setSpecs({...specs, hasSpeakers: value})}>
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select speaker option" />
                  </SelectTrigger>
                  <SelectContent className="border-black">
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="mountCompatibility" className="text-sm font-medium">Mount Compatibility</Label>
                <Input
                  id="mountCompatibility"
                  value={specs.mountCompatibility}
                  onChange={(e) => setSpecs({...specs, mountCompatibility: e.target.value})}
                  placeholder="e.g., VESA 100x100 mm"
                  className="border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ergonomics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-4 h-4" />
                Ergonomics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjustableHeight"
                    checked={specs.adjustableHeight}
                    onCheckedChange={(checked) => setSpecs({...specs, adjustableHeight: checked as boolean})}
                  />
                  <Label htmlFor="adjustableHeight" className="text-sm">Adjustable Height</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjustableTilt"
                    checked={specs.adjustableTilt}
                    onCheckedChange={(checked) => setSpecs({...specs, adjustableTilt: checked as boolean})}
                  />
                  <Label htmlFor="adjustableTilt" className="text-sm">Adjustable Tilt</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjustableSwivel"
                    checked={specs.adjustableSwivel}
                    onCheckedChange={(checked) => setSpecs({...specs, adjustableSwivel: checked as boolean})}
                  />
                  <Label htmlFor="adjustableSwivel" className="text-sm">Adjustable Swivel</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjustablePivot"
                    checked={specs.adjustablePivot}
                    onCheckedChange={(checked) => setSpecs({...specs, adjustablePivot: checked as boolean})}
                  />
                  <Label htmlFor="adjustablePivot" className="text-sm">Adjustable Pivot</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-black"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateUnitMutation.isPending}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateUnitMutation.isPending ? 'Saving...' : 'Save Specifications'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}