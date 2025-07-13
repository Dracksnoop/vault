import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  XCircle
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
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategories[0].id);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [unitSearchTerm, setUnitSearchTerm] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newCategory, setNewCategory] = useState("");
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

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const categoryItems = items.filter(item => item.categoryId === selectedCategory);
  const filteredItems = categoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItemData = items.find(item => item.id === selectedItem);
  const filteredUnits = selectedItemData?.units.filter(unit =>
    unit.serialNumber.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
    unit.barcode.toLowerCase().includes(unitSearchTerm.toLowerCase())
  ) || [];

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
      setCategories([...categories, newCat]);
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.model.trim()) {
      const item: Item = {
        id: Date.now().toString(),
        name: newItem.name.trim(),
        model: newItem.model.trim(),
        categoryId: selectedCategory,
        quantityInStock: newItem.quantityInStock,
        quantityRentedOut: 0,
        location: newItem.location.trim(),
        units: []
      };
      setItems([...items, item]);
      setNewItem({ name: "", model: "", location: "", quantityInStock: 0 });
      setShowAddItem(false);
    }
  };

  const handleAddUnit = () => {
    if (selectedItem && newUnit.serialNumber.trim()) {
      const unit: Unit = {
        id: Date.now().toString(),
        serialNumber: newUnit.serialNumber.trim(),
        barcode: newUnit.barcode.trim(),
        status: newUnit.status,
        location: newUnit.location.trim(),
        warrantyExpiry: newUnit.warrantyExpiry,
        notes: newUnit.notes.trim()
      };
      
      setItems(items.map(item => 
        item.id === selectedItem 
          ? { ...item, units: [...item.units, unit] }
          : item
      ));
      
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

  return (
    <div className="h-full bg-white">
      <div className="flex h-full">
        {/* Left Panel - Categories */}
        <div className="w-80 border-r border-black bg-white">
          <div className="p-4 border-b border-black">
            <h2 className="text-lg font-semibold text-black">Categories</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
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
          
          <div className="p-4 border-t border-black">
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
        <div className="flex-1 bg-white">
          {!selectedItem ? (
            // Items View
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-black">
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
                            value={newItem.quantityInStock}
                            onChange={(e) => setNewItem({...newItem, quantityInStock: parseInt(e.target.value) || 0})}
                            placeholder="0"
                            className="border-black"
                          />
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

              <div className="flex-1 overflow-y-auto p-4">
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
                            <Button variant="outline" size="sm" className="border-black">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-black">
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
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-black">
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
                          <Input
                            value={newUnit.serialNumber}
                            onChange={(e) => setNewUnit({...newUnit, serialNumber: e.target.value})}
                            placeholder="Enter serial number"
                            className="border-black"
                          />
                        </div>
                        <div>
                          <Label className="text-black">Barcode</Label>
                          <Input
                            value={newUnit.barcode}
                            onChange={(e) => setNewUnit({...newUnit, barcode: e.target.value})}
                            placeholder="Enter barcode"
                            className="border-black"
                          />
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

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {filteredUnits.map((unit) => (
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
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-black">Warranty: {unit.warrantyExpiry}</span>
                              </div>
                            </div>
                            {unit.notes && (
                              <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                                <p className="text-sm text-black">{unit.notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-black">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-black">
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
          )}
        </div>
      </div>
    </div>
  );
}
