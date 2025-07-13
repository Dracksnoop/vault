import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QRCodeSVG } from "qrcode.react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Barcode, 
  MapPin, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  QrCode,
  Download,
  X
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  itemCount: number;
}

interface Item {
  id: string;
  name: string;
  model: string;
  categoryId: string;
  quantityInStock: number;
  quantityRentedOut: number;
  location: string;
  units: Unit[];
}

interface Unit {
  id: string;
  serialNumber: string;
  barcode: string;
  status: "In Stock" | "Rented" | "Maintenance" | "Retired";
  location: string;
  warrantyExpiry: string;
  notes: string;
}

const initialCategories: Category[] = [
  { id: "1", name: "CPU", itemCount: 12 },
  { id: "2", name: "Monitor", itemCount: 8 },
  { id: "3", name: "Keyboard", itemCount: 15 },
  { id: "4", name: "Mouse", itemCount: 20 },
  { id: "5", name: "Cables", itemCount: 45 },
  { id: "6", name: "Networking Devices", itemCount: 6 },
  { id: "7", name: "Biometric Devices", itemCount: 3 },
];

const initialItems: Item[] = [
  {
    id: "1",
    name: "Intel Core i7-12700K",
    model: "BX8071512700K",
    categoryId: "1",
    quantityInStock: 8,
    quantityRentedOut: 4,
    location: "Warehouse A-1",
    units: [
      {
        id: "1",
        serialNumber: "CPU001",
        barcode: "123456789012",
        status: "In Stock",
        location: "Warehouse A-1",
        warrantyExpiry: "2025-12-31",
        notes: "New condition"
      },
      {
        id: "2",
        serialNumber: "CPU002",
        barcode: "123456789013",
        status: "Rented",
        location: "Client Site B",
        warrantyExpiry: "2025-12-31",
        notes: "Rented to TechCorp"
      }
    ]
  },
  {
    id: "2",
    name: "Dell UltraSharp 27\"",
    model: "U2723QE",
    categoryId: "2",
    quantityInStock: 5,
    quantityRentedOut: 3,
    location: "Warehouse B-2",
    units: []
  },
  {
    id: "3",
    name: "Logitech MX Keys",
    model: "920-009294",
    categoryId: "3",
    quantityInStock: 12,
    quantityRentedOut: 3,
    location: "Warehouse C-1",
    units: []
  }
];

export default function Inventory() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("1");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [unitSearchTerm, setUnitSearchTerm] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedUnitForQR, setSelectedUnitForQR] = useState<Unit | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState({
    name: "",
    model: "",
    location: "",
    quantityInStock: 0
  });
  const [editUnitData, setEditUnitData] = useState({
    serialNumber: "",
    barcode: "",
    status: "In Stock" as const,
    location: "",
    warrantyExpiry: "",
    notes: ""
  });
  const [newItem, setNewItem] = useState({
    name: "",
    model: "",
    location: "",
    quantityInStock: 0
  });
  const [newUnit, setNewUnit] = useState({
    serialNumber: "",
    barcode: "",
    status: "In Stock" as const,
    location: "",
    warrantyExpiry: "",
    notes: ""
  });

  // API queries
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => apiRequest("/api/categories"),
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/items"],
    queryFn: () => apiRequest("/api/items"),
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ["/api/units"],
    queryFn: () => apiRequest("/api/units"),
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
  });

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (category: { id: string; name: string; itemCount: number }) =>
      apiRequest("/api/categories", {
        method: "POST",
        body: JSON.stringify(category),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowAddCategory(false);
      setNewCategory("");
    },
  });

  const createItemMutation = useMutation({
    mutationFn: (item: any) =>
      apiRequest("/api/items", {
        method: "POST",
        body: JSON.stringify(item),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowAddItem(false);
      setNewItem({
        name: "",
        model: "",
        location: "",
        quantityInStock: 0
      });
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: (unit: any) =>
      apiRequest("/api/units", {
        method: "POST",
        body: JSON.stringify(unit),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowAddUnit(false);
      setNewUnit({
        serialNumber: "",
        barcode: "",
        status: "In Stock" as const,
        location: "",
        warrantyExpiry: "",
        notes: ""
      });
    },
  });

  // Delete mutations
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest(`/api/items/${itemId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      setSelectedItem(null);
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (unitId: string) =>
      apiRequest(`/api/units/${unitId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) =>
      apiRequest(`/api/categories/${categoryId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      setSelectedCategory("1"); // Reset to first category
    },
  });

  // Edit mutations
  const editItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setEditingItem(null);
    },
  });

  const editUnitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/units/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setEditingUnit(null);
    },
  });

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const categoryItems = items.filter(item => item.categoryId === selectedCategory);
  const filteredItems = categoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItemData = items.find(item => item.id === selectedItem);
  const itemUnits = units.filter(unit => unit.itemId === selectedItem);
  const filteredUnits = itemUnits.filter(unit =>
    unit.serialNumber.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
    unit.barcode.toLowerCase().includes(unitSearchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-800 border-green-300";
      case "Rented": return "bg-blue-100 text-blue-800 border-blue-300";
      case "Maintenance": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Retired": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Stock": return <CheckCircle className="w-4 h-4" />;
      case "Rented": return <Package className="w-4 h-4" />;
      case "Maintenance": return <Clock className="w-4 h-4" />;
      case "Retired": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const newCat: Category = {
        id: Date.now().toString(),
        name: newCategory.trim(),
        itemCount: 0
      };
      createCategoryMutation.mutate(newCat);
    }
  };

  const generateSerialNumber = (itemName: string, index: number) => {
    // Generate a unique serial number based on item name and index
    const prefix = itemName.toUpperCase().replace(/\s+/g, '').substring(0, 3);
    const timestamp = Date.now().toString().slice(-4);
    const paddedIndex = (index + 1).toString().padStart(3, '0');
    return `${prefix}${timestamp}${paddedIndex}`;
  };

  const generateBarcode = () => {
    // Generate a 12-digit barcode
    return Math.floor(Math.random() * 900000000000) + 100000000000;
  };

  const handleAddItem = async () => {
    if (newItem.name.trim() && newItem.model.trim() && newItem.quantityInStock > 0) {
      const itemId = Date.now().toString();
      
      const item = {
        id: itemId,
        name: newItem.name.trim(),
        model: newItem.model.trim(),
        categoryId: selectedCategory,
        quantityInStock: newItem.quantityInStock,
        quantityRentedOut: 0,
        location: newItem.location.trim(),
      };
      
      try {
        // First create the item
        await createItemMutation.mutateAsync(item);
        
        // Then create all units
        const unitPromises = [];
        for (let i = 0; i < newItem.quantityInStock; i++) {
          const unit = {
            id: `${itemId}_unit_${i}`,
            itemId: itemId,
            serialNumber: generateSerialNumber(newItem.name, i),
            barcode: generateBarcode().toString(),
            status: "In Stock",
            location: newItem.location.trim() || "Warehouse",
            warrantyExpiry: "",
            notes: "Auto-generated unit"
          };
          unitPromises.push(createUnitMutation.mutateAsync(unit));
        }
        
        await Promise.all(unitPromises);
        
        // Invalidate all queries to ensure UI updates
        queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
        queryClient.invalidateQueries({ queryKey: ["/api/items"] });
        queryClient.invalidateQueries({ queryKey: ["/api/units"] });
        
      } catch (error) {
        console.error("Error creating item and units:", error);
      }
    }
  };

  const handleAddUnit = () => {
    if (selectedItem && newUnit.serialNumber.trim()) {
      const unit = {
        id: Date.now().toString(),
        itemId: selectedItem,
        serialNumber: newUnit.serialNumber.trim(),
        barcode: newUnit.barcode.trim() || generateBarcode().toString(),
        status: newUnit.status,
        location: newUnit.location.trim() || selectedItemData?.location || "Warehouse",
        warrantyExpiry: newUnit.warrantyExpiry,
        notes: newUnit.notes.trim()
      };
      
      createUnitMutation.mutate(unit);
      
      setNewUnit({
        serialNumber: "",
        barcode: "",
        status: "In Stock",
        location: "",
        warrantyExpiry: "",
        notes: ""
      });
      setShowAddUnit(false);
    }
  };

  const generateQRUrl = (serialNumber: string) => {
    return `https://raydifyvault.com/unit/${serialNumber}`;
  };

  const handleGenerateQR = (unit: Unit) => {
    setSelectedUnitForQR(unit);
    setShowQRCode(true);
  };

  const downloadQRCode = () => {
    if (!selectedUnitForQR) return;
    
    const svg = document.querySelector('#qr-code-svg') as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 200;
      canvas.height = 200;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `QR_${selectedUnitForQR.serialNumber}.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  // Edit handlers
  const handleEditItem = (item: Item) => {
    setEditingItem(item.id);
    setEditItemData({
      name: item.name,
      model: item.model,
      location: item.location,
      quantityInStock: item.quantityInStock
    });
  };

  const handleSaveItem = async () => {
    if (editingItem) {
      const originalItem = items.find(item => item.id === editingItem);
      const originalQuantity = originalItem?.quantityInStock || 0;
      const newQuantity = editItemData.quantityInStock;
      
      try {
        // First update the item
        await editItemMutation.mutateAsync({
          id: editingItem,
          data: editItemData
        });
        
        // Handle quantity changes
        const existingUnits = units.filter(unit => unit.itemId === editingItem);
        
        if (newQuantity > originalQuantity) {
          // Quantity increased - generate additional units
          const unitsToCreate = newQuantity - originalQuantity;
          
          const unitPromises = [];
          for (let i = 0; i < unitsToCreate; i++) {
            const unit = {
              id: `${editingItem}_unit_${Date.now()}_${i}`,
              itemId: editingItem,
              serialNumber: generateSerialNumber(editItemData.name, existingUnits.length + i),
              barcode: generateBarcode().toString(),
              status: "In Stock",
              location: editItemData.location || "Warehouse",
              warrantyExpiry: "",
              notes: "Auto-generated unit from quantity update"
            };
            unitPromises.push(createUnitMutation.mutateAsync(unit));
          }
          
          await Promise.all(unitPromises);
        } else if (newQuantity < originalQuantity) {
          // Quantity decreased - remove excess units (prioritize "In Stock" units)
          const unitsToRemove = originalQuantity - newQuantity;
          const sortedUnits = [...existingUnits].sort((a, b) => {
            // Prioritize removing "In Stock" units first
            if (a.status === "In Stock" && b.status !== "In Stock") return -1;
            if (a.status !== "In Stock" && b.status === "In Stock") return 1;
            return 0;
          });
          
          const deletePromises = [];
          for (let i = 0; i < unitsToRemove && i < sortedUnits.length; i++) {
            deletePromises.push(deleteUnitMutation.mutateAsync(sortedUnits[i].id));
          }
          
          await Promise.all(deletePromises);
        }
        
        // Invalidate all queries to ensure UI updates
        queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
        queryClient.invalidateQueries({ queryKey: ["/api/items"] });
        queryClient.invalidateQueries({ queryKey: ["/api/units"] });
        
      } catch (error) {
        console.error("Error updating item and generating units:", error);
      }
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit.id);
    setEditUnitData({
      serialNumber: unit.serialNumber,
      barcode: unit.barcode,
      status: unit.status,
      location: unit.location,
      warrantyExpiry: unit.warrantyExpiry,
      notes: unit.notes
    });
  };

  const handleSaveUnit = () => {
    if (editingUnit) {
      editUnitMutation.mutate({
        id: editingUnit,
        data: editUnitData
      });
    }
  };

  // Delete handlers
  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this item and all its units?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleDeleteUnit = (unitId: string) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      deleteUnitMutation.mutate(unitId);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category and all its items?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem-1.5rem)] bg-white overflow-hidden border-t border-black">
      <div className="flex h-full">
        {/* Left Panel - Categories */}
        <div className="w-80 border-r border-black bg-white flex flex-col h-full">
          <div className="p-4 border-b border-black flex-shrink-0">
            <h2 className="text-lg font-semibold text-black">Categories</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedItem(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                    selectedCategory === category.id
                      ? "bg-gray-100 border-l-4 border-black"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-black">{category.name}</div>
                  <div className="text-sm text-gray-600">{category.itemCount} items</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-black flex-shrink-0 bg-white">
            <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
              <DialogTrigger asChild>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Category
                </Button>
              </DialogTrigger>
              <DialogContent className="border-black">
                <DialogHeader>
                  <DialogTitle className="text-black">Add New Category</DialogTitle>
                  <DialogDescription className="text-black">
                    Create a new inventory category
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName" className="text-black">Category Name</Label>
                    <Input
                      id="categoryName"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter category name"
                      className="border-black"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddCategory}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      Add Category
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddCategory(false)}
                      className="border-black"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Right Panel - Items or Unit Details */}
        <div className="flex-1 bg-white flex flex-col max-h-full">
          {!selectedItem ? (
            // Items View
            <div className="h-full flex flex-col max-h-full">
              <div className="p-4 border-b border-black flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-black">
                    {selectedCategoryData?.name}
                  </h2>
                  <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                    <DialogTrigger asChild>
                      <Button className="bg-black text-white hover:bg-gray-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-black max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-black">Add New Item</DialogTitle>
                        <DialogDescription className="text-black">
                          Add a new item to {selectedCategoryData?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-black">Product Name</Label>
                          <Input
                            value={newItem.name}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                            placeholder="Enter product name"
                            className="border-black"
                          />
                        </div>
                        <div>
                          <Label className="text-black">Model/Specification</Label>
                          <Input
                            value={newItem.model}
                            onChange={(e) => setNewItem({...newItem, model: e.target.value})}
                            placeholder="Enter model number"
                            className="border-black"
                          />
                        </div>
                        <div>
                          <Label className="text-black">Location</Label>
                          <Input
                            value={newItem.location}
                            onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                            placeholder="Enter storage location"
                            className="border-black"
                          />
                        </div>
                        <div>
                          <Label className="text-black">Quantity in Stock</Label>
                          <Input
                            type="number"
                            min="1"
                            value={newItem.quantityInStock}
                            onChange={(e) => setNewItem({...newItem, quantityInStock: parseInt(e.target.value) || 0})}
                            placeholder="Enter quantity (will generate unique serial numbers)"
                            className="border-black"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Each unit will automatically get a unique serial number
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleAddItem}
                            className="bg-black text-white hover:bg-gray-800"
                          >
                            Add Item
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddItem(false)}
                            className="border-black"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-black"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="border-black hover:bg-gray-50 cursor-pointer transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1" onClick={() => setSelectedItem(item.id)}>
                            <div className="font-medium text-black">{item.name}</div>
                            <div className="text-sm text-gray-600 mb-2">{item.model}</div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4 text-gray-500" />
                                <span className="text-black">Stock: {item.quantityInStock}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-black">Rented: {item.quantityRentedOut}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-gray-500" />
                                <span className="text-black">Available: {item.quantityInStock - item.quantityRentedOut}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-black">{item.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-black"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditItem(item);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-black text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Unit Details View
            <div className="h-full flex flex-col max-h-full">
              <div className="p-4 border-b border-black flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedItem(null)}
                      className="border-black"
                    >
                      ← Back
                    </Button>
                    <div>
                      <h2 className="text-xl font-semibold text-black">
                        {selectedItemData?.name}
                      </h2>
                      <p className="text-sm text-gray-600">{selectedItemData?.model}</p>
                    </div>
                  </div>
                  <Dialog open={showAddUnit} onOpenChange={setShowAddUnit}>
                    <DialogTrigger asChild>
                      <Button className="bg-black text-white hover:bg-gray-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Unit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-black max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-black">Add New Unit</DialogTitle>
                        <DialogDescription className="text-black">
                          Add a new unit for {selectedItemData?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-black">Serial Number</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newUnit.serialNumber}
                              onChange={(e) => setNewUnit({...newUnit, serialNumber: e.target.value})}
                              placeholder="Enter serial number"
                              className="border-black"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="border-black"
                              onClick={() => {
                                const autoSerial = generateSerialNumber(selectedItemData?.name || "ITEM", selectedItemData?.units.length || 0);
                                setNewUnit({...newUnit, serialNumber: autoSerial});
                              }}
                            >
                              Auto
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-black">Barcode</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newUnit.barcode}
                              onChange={(e) => setNewUnit({...newUnit, barcode: e.target.value})}
                              placeholder="Enter barcode"
                              className="border-black"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="border-black"
                              onClick={() => {
                                const autoBarcode = generateBarcode().toString();
                                setNewUnit({...newUnit, barcode: autoBarcode});
                              }}
                            >
                              Generate
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-black">Status</Label>
                          <Select value={newUnit.status} onValueChange={(value: any) => setNewUnit({...newUnit, status: value})}>
                            <SelectTrigger className="border-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-black">
                              <SelectItem value="In Stock">In Stock</SelectItem>
                              <SelectItem value="Rented">Rented</SelectItem>
                              <SelectItem value="Maintenance">Maintenance</SelectItem>
                              <SelectItem value="Retired">Retired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-black">Location</Label>
                          <Input
                            value={newUnit.location}
                            onChange={(e) => setNewUnit({...newUnit, location: e.target.value})}
                            placeholder="Enter location"
                            className="border-black"
                          />
                        </div>
                        <div>
                          <Label className="text-black">Warranty Expiry</Label>
                          <Input
                            type="date"
                            value={newUnit.warrantyExpiry}
                            onChange={(e) => setNewUnit({...newUnit, warrantyExpiry: e.target.value})}
                            className="border-black"
                          />
                        </div>
                        <div>
                          <Label className="text-black">Notes</Label>
                          <Textarea
                            value={newUnit.notes}
                            onChange={(e) => setNewUnit({...newUnit, notes: e.target.value})}
                            placeholder="Enter notes"
                            className="border-black"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleAddUnit}
                            className="bg-black text-white hover:bg-gray-800"
                          >
                            Add Unit
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddUnit(false)}
                            className="border-black"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by serial number or barcode..."
                    value={unitSearchTerm}
                    onChange={(e) => setUnitSearchTerm(e.target.value)}
                    className="pl-10 border-black"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="space-y-4">
                  {filteredUnits.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No units found for this item</p>
                      <p className="text-sm text-gray-400">Add new units to track individual serial numbers</p>
                    </div>
                  ) : (
                    filteredUnits.map((unit) => (
                      <Card key={unit.id} className="border-black">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div className="font-medium text-black">{unit.serialNumber}</div>
                                <Badge className={`${getStatusColor(unit.status)} border`}>
                                  {getStatusIcon(unit.status)}
                                  <span className="ml-1">{unit.status}</span>
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Barcode className="w-4 h-4 text-gray-500" />
                                  <span className="text-black">{unit.barcode}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="text-black">{unit.location}</span>
                                </div>
                                {unit.warrantyExpiry && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-black">Warranty: {unit.warrantyExpiry}</span>
                                  </div>
                                )}
                              </div>
                              {unit.notes && (
                                <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                                  <p className="text-sm text-black">{unit.notes}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-black"
                                onClick={() => handleGenerateQR(unit)}
                                title="Generate QR Code"
                              >
                                <QrCode className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-black"
                                onClick={() => window.open(`/unit/${unit.serialNumber}`, '_blank')}
                                title="Test QR Dashboard"
                              >
                                <Search className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-black"
                                onClick={() => handleEditUnit(unit)}
                                title="Edit Unit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-black text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteUnit(unit.id)}
                                title="Delete Unit"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="border-black max-w-md">
          <DialogHeader>
            <DialogTitle className="text-black flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code for Unit {selectedUnitForQR?.serialNumber}
            </DialogTitle>
            <DialogDescription className="text-black">
              Scan this QR code to view live unit details
            </DialogDescription>
          </DialogHeader>
          
          {selectedUnitForQR && (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg border border-black">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={generateQRUrl(selectedUnitForQR.serialNumber)}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-black font-medium mb-2">Encoded URL:</p>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <code className="text-xs text-black break-all">
                      {generateQRUrl(selectedUnitForQR.serialNumber)}
                    </code>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  <p><strong>Item:</strong> {selectedItemData?.name}</p>
                  <p><strong>Model:</strong> {selectedItemData?.model}</p>
                  <p><strong>Status:</strong> {selectedUnitForQR.status}</p>
                  <p><strong>Location:</strong> {selectedUnitForQR.location}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={downloadQRCode}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowQRCode(false)}
                  className="border-black"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={editingItem !== null} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="border-black max-w-md">
          <DialogHeader>
            <DialogTitle className="text-black">Edit Item</DialogTitle>
            <DialogDescription className="text-black">
              Update item information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Product Name</Label>
              <Input
                value={editItemData.name}
                onChange={(e) => setEditItemData({...editItemData, name: e.target.value})}
                placeholder="Enter product name"
                className="border-black"
              />
            </div>
            <div>
              <Label className="text-black">Model/Specification</Label>
              <Input
                value={editItemData.model}
                onChange={(e) => setEditItemData({...editItemData, model: e.target.value})}
                placeholder="Enter model number"
                className="border-black"
              />
            </div>
            <div>
              <Label className="text-black">Location</Label>
              <Input
                value={editItemData.location}
                onChange={(e) => setEditItemData({...editItemData, location: e.target.value})}
                placeholder="Enter storage location"
                className="border-black"
              />
            </div>
            <div>
              <Label className="text-black">Quantity in Stock</Label>
              <Input
                type="number"
                min="0"
                value={editItemData.quantityInStock}
                onChange={(e) => setEditItemData({...editItemData, quantityInStock: parseInt(e.target.value) || 0})}
                className="border-black"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveItem}
                className="bg-black text-white hover:bg-gray-800"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingItem(null)}
                className="border-black"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Unit Modal */}
      <Dialog open={editingUnit !== null} onOpenChange={() => setEditingUnit(null)}>
        <DialogContent className="border-black max-w-md">
          <DialogHeader>
            <DialogTitle className="text-black">Edit Unit</DialogTitle>
            <DialogDescription className="text-black">
              Update unit information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Serial Number</Label>
              <Input
                value={editUnitData.serialNumber}
                onChange={(e) => setEditUnitData({...editUnitData, serialNumber: e.target.value})}
                placeholder="Enter serial number"
                className="border-black"
              />
            </div>
            <div>
              <Label className="text-black">Barcode</Label>
              <Input
                value={editUnitData.barcode}
                onChange={(e) => setEditUnitData({...editUnitData, barcode: e.target.value})}
                placeholder="Enter barcode"
                className="border-black"
              />
            </div>
            <div>
              <Label className="text-black">Status</Label>
              <Select value={editUnitData.status} onValueChange={(value: any) => setEditUnitData({...editUnitData, status: value})}>
                <SelectTrigger className="border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-black">
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Rented">Rented</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-black">Location</Label>
              <Input
                value={editUnitData.location}
                onChange={(e) => setEditUnitData({...editUnitData, location: e.target.value})}
                placeholder="Enter location"
                className="border-black"
              />
            </div>
            <div>
              <Label className="text-black">Warranty Expiry</Label>
              <Input
                type="date"
                value={editUnitData.warrantyExpiry}
                onChange={(e) => setEditUnitData({...editUnitData, warrantyExpiry: e.target.value})}
                className="border-black"
              />
            </div>
            <div>
              <Label className="text-black">Notes</Label>
              <Textarea
                value={editUnitData.notes}
                onChange={(e) => setEditUnitData({...editUnitData, notes: e.target.value})}
                placeholder="Enter notes"
                className="border-black"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveUnit}
                className="bg-black text-white hover:bg-gray-800"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingUnit(null)}
                className="border-black"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
