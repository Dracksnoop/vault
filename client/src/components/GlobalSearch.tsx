import { useState, useEffect, useRef } from "react";
import { Search, X, Package, Users, FileText, Wrench, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'item' | 'customer' | 'unit' | 'service' | 'rental';
  icon: React.ReactNode;
  action: () => void;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Fetch all data for search
  const { data: items = [] } = useQuery({ queryKey: ["/api/items"] });
  const { data: customers = [] } = useQuery({ queryKey: ["/api/customers"] });
  const { data: units = [] } = useQuery({ queryKey: ["/api/units"] });
  const { data: services = [] } = useQuery({ queryKey: ["/api/services"] });
  const { data: rentals = [] } = useQuery({ queryKey: ["/api/rentals"] });

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation and shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global shortcut to open search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
        return;
      }

      // Only handle these keys when search is open
      if (isOpen) {
        if (event.key === "Escape") {
          setIsOpen(false);
          setSearchTerm("");
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
            setIsOpen(false);
            setSearchTerm("");
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    // Search items
    items.forEach((item: any) => {
      if (item.name.toLowerCase().includes(term) || 
          item.model.toLowerCase().includes(term) ||
          item.location.toLowerCase().includes(term)) {
        searchResults.push({
          id: `item-${item.id}`,
          title: item.name,
          subtitle: `${item.model} • ${item.quantityInStock} units`,
          type: 'item',
          icon: <Package className="w-4 h-4 text-blue-600" />,
          action: () => navigate("/inventory")
        });
      }
    });

    // Search customers
    customers.forEach((customer: any) => {
      if (customer.name.toLowerCase().includes(term) ||
          customer.email.toLowerCase().includes(term) ||
          customer.phone.toLowerCase().includes(term)) {
        searchResults.push({
          id: `customer-${customer.id}`,
          title: customer.name,
          subtitle: `${customer.email} • ${customer.phone}`,
          type: 'customer',
          icon: <Users className="w-4 h-4 text-green-600" />,
          action: () => navigate(`/customer/${customer.id}`)
        });
      }
    });

    // Search units
    units.forEach((unit: any) => {
      if (unit.serialNumber.toLowerCase().includes(term) ||
          unit.barcode.toLowerCase().includes(term) ||
          unit.location.toLowerCase().includes(term)) {
        const item = items.find((i: any) => i.id === unit.itemId);
        searchResults.push({
          id: `unit-${unit.id}`,
          title: `${item?.name || 'Unknown'} - ${unit.serialNumber}`,
          subtitle: `${unit.status} • ${unit.location}`,
          type: 'unit',
          icon: <Package className="w-4 h-4 text-orange-600" />,
          action: () => navigate("/inventory")
        });
      }
    });

    // Search services
    services.forEach((service: any) => {
      if (service.type.toLowerCase().includes(term) ||
          service.description.toLowerCase().includes(term)) {
        searchResults.push({
          id: `service-${service.id}`,
          title: service.type,
          subtitle: service.description,
          type: 'service',
          icon: <Wrench className="w-4 h-4 text-purple-600" />,
          action: () => navigate("/customer")
        });
      }
    });

    // Search rentals
    rentals.forEach((rental: any) => {
      const customer = customers.find((c: any) => c.id === rental.customerId);
      if (customer?.name.toLowerCase().includes(term) ||
          rental.startDate.toLowerCase().includes(term)) {
        searchResults.push({
          id: `rental-${rental.id}`,
          title: `Rental - ${customer?.name || 'Unknown'}`,
          subtitle: `Start: ${rental.startDate} • ${rental.paymentFrequency}`,
          type: 'rental',
          icon: <FileText className="w-4 h-4 text-red-600" />,
          action: () => navigate(`/customer/${rental.customerId}`)
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setSelectedIndex(0);
  }, [searchTerm, items, customers, units, services, rentals, navigate]);

  const handleSearchClick = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search trigger button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSearchClick}
          className="relative h-9 w-full justify-start border border-black rounded-lg text-black hover:bg-gray-50 focus:ring-2 focus:ring-black/20"
        >
          <Search className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate">Search everything...</span>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden sm:block">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-300 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600">
              ⌘K
            </kbd>
          </div>
        </Button>
      </div>

      {/* Search modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden min-w-80 sm:min-w-96">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items, customers, units, services..."
                className="pl-10 pr-10 border-gray-300 focus:border-black focus:ring-black"
                autoFocus
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Search results */}
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 && searchTerm && (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p>No results found for "{searchTerm}"</p>
              </div>
            )}

            {results.length === 0 && !searchTerm && (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">Start typing to search across all data...</p>
                <div className="mt-2 text-xs text-gray-400">
                  • Items & Products • Customers • Units • Services • Rentals
                </div>
              </div>
            )}

            {results.map((result, index) => (
              <div
                key={result.id}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors",
                  index === selectedIndex ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                )}
                onClick={() => {
                  result.action();
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                <div className="flex-shrink-0">
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-black truncate">
                    {result.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {result.subtitle}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {results.length > 0 && (
            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Use ↑↓ to navigate, Enter to select</span>
                <span>{results.length} results</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}