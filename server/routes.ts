import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertInventorySchema, 
  insertCustomerSchema, 
  insertUserSchema, 
  insertCategorySchema, 
  insertItemSchema, 
  insertUnitSchema,
  insertServiceSchema,
  insertServiceItemSchema,
  insertRentalSchema,
  insertRentalTimelineSchema,
  insertVendorSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema,
  insertSellOrderSchema,
  insertSellOrderItemSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertPaymentSchema,
  insertRecurringInvoiceScheduleSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple session management
  const sessions = new Map<string, any>();
  
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    req.user = sessions.get(sessionId);
    next();
  };

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // First check system users
      const user = await storage.getUserByUsername(username);
      if (user && user.password === password) {
        const sessionId = Math.random().toString(36).substring(2, 15);
        sessions.set(sessionId, { 
          id: user.id, 
          username: user.username, 
          type: 'user',
          role: user.role 
        });
        
        return res.json({ 
          user: { id: user.id, username: user.username, type: 'user', role: user.role }, 
          token: sessionId 
        });
      }

      // If not found in users, check customers
      const customers = await storage.getCustomers();
      const customer = customers.find(c => c.name === username || c.email === username);
      
      if (customer && customer.phone === password) {
        const sessionId = Math.random().toString(36).substring(2, 15);
        sessions.set(sessionId, { 
          id: customer.id, 
          username: customer.name, 
          type: 'customer',
          email: customer.email,
          phone: customer.phone
        });
        
        return res.json({ 
          user: { 
            id: customer.id, 
            username: customer.name, 
            type: 'customer',
            email: customer.email 
          }, 
          token: sessionId 
        });
      }

      return res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(sessions.get(sessionId));
  });

  // Get all customers for authentication (shows available login options)
  app.get("/api/auth/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      // Return only basic info needed for login
      const loginInfo = customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        loginHint: `Use name/email as username and phone as password`
      }));
      res.json(loginInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory data" });
    }
  });

  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getInventoryItem(id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory data" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInventoryItem(id);
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      // Calculate actual item counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const items = await storage.getItemsByCategory(category.id);
          return {
            ...category,
            itemCount: items.length
          };
        })
      );
      res.json(categoriesWithCounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Item routes
  app.get("/api/items", async (req, res) => {
    try {
      const { categoryId } = req.query;
      const items = categoryId 
        ? await storage.getItemsByCategory(categoryId as string)
        : await storage.getItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const validatedData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(validatedData);
      
      // Update category item count
      const categoryItems = await storage.getItemsByCategory(item.categoryId);
      await storage.updateCategory(item.categoryId, { itemCount: categoryItems.length });
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  app.put("/api/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getItem(id);
      
      // Delete all units associated with this item first
      const units = await storage.getUnitsByItem(id);
      for (const unit of units) {
        await storage.deleteUnit(unit.id);
      }
      
      const success = await storage.deleteItem(id);
      if (!success) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      // Update category item count if item was found
      if (item) {
        const categoryItems = await storage.getItemsByCategory(item.categoryId);
        await storage.updateCategory(item.categoryId, { itemCount: categoryItems.length });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Unit routes
  app.get("/api/units", async (req, res) => {
    try {
      const { itemId, serialNumber } = req.query;
      let units;
      
      if (serialNumber) {
        const unit = await storage.getUnitBySerialNumber(serialNumber as string);
        units = unit ? [unit] : [];
      } else if (itemId) {
        units = await storage.getUnitsByItem(itemId as string);
      } else {
        units = await storage.getUnits();
      }
      
      res.json(units);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch units" });
    }
  });

  app.post("/api/units", async (req, res) => {
    try {
      const validatedData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(validatedData);
      res.json(unit);
    } catch (error) {
      res.status(500).json({ error: "Failed to create unit" });
    }
  });

  app.put("/api/units/:id", async (req, res) => {
    try {
      console.log("PUT /api/units/:id request received:", { id: req.params.id, body: req.body });
      const { id } = req.params;
      const validatedData = insertUnitSchema.partial().parse(req.body);
      console.log("Validated data:", validatedData);
      const unit = await storage.updateUnit(id, validatedData);
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }
      res.json(unit);
    } catch (error) {
      console.error("Error updating unit:", error);
      res.status(500).json({ error: "Failed to update unit" });
    }
  });

  app.delete("/api/units/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteUnit(id);
      if (!success) {
        return res.status(404).json({ error: "Unit not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete unit" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if customer exists
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      // Get all services for this customer
      const services = await storage.getServicesByCustomer(id);
      
      // For each service, restore rented items to inventory
      for (const service of services) {
        if (service.serviceType === 'rent') {
          // Get all units currently rented by this customer
          const allUnits = await storage.getUnits();
          const customerUnits = allUnits.filter(unit => 
            unit.currentCustomerId === id || 
            unit.rentedBy === id ||
            unit.serviceId === service.id
          );
          
          // Return all customer units to Available status
          for (const unit of customerUnits) {
            await storage.updateUnit(unit.id, { 
              status: 'Available',
              currentCustomerId: null,
              rentedBy: null,
              serviceId: null
            });
          }
          
          // Get service items for this rental service
          const serviceItems = await storage.getServiceItemsByService(service.id);
          
          // Delete service items
          for (const serviceItem of serviceItems) {
            await storage.deleteServiceItem(serviceItem.id);
          }
        }
        
        // Delete rentals for this service
        const rentals = await storage.getRentalsByService(service.id);
        for (const rental of rentals) {
          await storage.deleteRental(rental.id);
        }
        
        // Delete the service
        await storage.deleteService(service.id);
      }
      
      // Finally, delete the customer
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      res.json({ success: true, message: "Customer and all related data deleted successfully" });
    } catch (error) {
      console.error("Delete customer error:", error);
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const items = await storage.getItems();
      const units = await storage.getUnits();
      const customers = await storage.getCustomers();
      const categories = await storage.getCategories();
      
      // Calculate stats based on units
      const totalUnits = units.length;
      const inStockUnits = units.filter(unit => unit.status === "Available").length;
      const rentedUnits = units.filter(unit => unit.status === "Rented").length;
      const maintenanceUnits = units.filter(unit => unit.status === "Maintenance").length;
      const activeCustomers = customers.length;
      
      // Calculate low stock items (items with < 2 available units)
      const lowStockItems = items.filter(item => {
        const itemUnits = units.filter(unit => unit.itemId === item.id);
        const availableUnits = itemUnits.filter(unit => unit.status === "Available").length;
        return availableUnits < 2;
      }).length;
      
      res.json({
        totalInventory: items.length,
        totalUnits,
        inStockUnits,
        rentedUnits,
        maintenanceUnits,
        activeCustomers,
        lowStockItems,
        categories: categories.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Service management routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Invalid service data" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, validatedData);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Invalid service data" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  app.get("/api/customers/:customerId/services", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const services = await storage.getServicesByCustomer(customerId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer services" });
    }
  });

  // Service Items management routes
  app.get("/api/service-items", async (req, res) => {
    try {
      const serviceItems = await storage.getServiceItems();
      res.json(serviceItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service items" });
    }
  });

  app.post("/api/service-items", async (req, res) => {
    try {
      const validatedData = insertServiceItemSchema.parse(req.body);
      const serviceItem = await storage.createServiceItem(validatedData);
      res.json(serviceItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid service item data" });
    }
  });

  app.get("/api/services/:serviceId/items", async (req, res) => {
    try {
      const serviceItems = await storage.getServiceItemsByService(req.params.serviceId);
      res.json(serviceItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service items" });
    }
  });

  app.put("/api/service-items/:id", async (req, res) => {
    try {
      const validatedData = insertServiceItemSchema.partial().parse(req.body);
      const serviceItem = await storage.updateServiceItem(req.params.id, validatedData);
      if (!serviceItem) {
        return res.status(404).json({ error: "Service item not found" });
      }
      res.json(serviceItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid service item data" });
    }
  });

  app.delete("/api/service-items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteServiceItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Service item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service item" });
    }
  });

  // Rental management routes
  app.get("/api/rentals", async (req, res) => {
    try {
      const rentals = await storage.getRentals();
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rentals" });
    }
  });

  app.post("/api/rentals", async (req, res) => {
    try {
      const validatedData = insertRentalSchema.parse(req.body);
      const rental = await storage.createRental(validatedData);
      res.json(rental);
    } catch (error) {
      res.status(400).json({ error: "Invalid rental data" });
    }
  });

  app.get("/api/rentals/:id", async (req, res) => {
    try {
      const rental = await storage.getRental(req.params.id);
      if (!rental) {
        return res.status(404).json({ error: "Rental not found" });
      }
      res.json(rental);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rental" });
    }
  });

  app.put("/api/rentals/:id", async (req, res) => {
    try {
      const validatedData = insertRentalSchema.partial().parse(req.body);
      const rental = await storage.updateRental(req.params.id, validatedData);
      if (!rental) {
        return res.status(404).json({ error: "Rental not found" });
      }
      res.json(rental);
    } catch (error) {
      res.status(400).json({ error: "Invalid rental data" });
    }
  });

  app.delete("/api/rentals/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRental(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Rental not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rental" });
    }
  });

  app.get("/api/customers/:customerId/rentals", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const rentals = await storage.getRentalsByCustomer(customerId);
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer rentals" });
    }
  });

  app.get("/api/services/:serviceId/rentals", async (req, res) => {
    try {
      const rentals = await storage.getRentalsByService(req.params.serviceId);
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service rentals" });
    }
  });

  // Complete customer management endpoint (multi-step submission)
  app.post("/api/customers/complete", async (req, res) => {
    try {
      const { 
        customerData, 
        serviceData, 
        selectedItems, 
        rentalData 
      } = req.body;

      // Validate and create customer
      const validatedCustomer = insertCustomerSchema.parse(customerData);
      const customer = await storage.createCustomer(validatedCustomer);

      // Create service
      const serviceId = Date.now().toString();
      const validatedService = insertServiceSchema.parse({
        ...serviceData,
        id: serviceId,
        customerId: customer.id
      });
      const service = await storage.createService(validatedService);

      // Validate stock availability before creating service items
      for (const item of selectedItems) {
        const currentItem = await storage.getItem(item.itemId);
        if (!currentItem) {
          return res.status(400).json({ error: `Item ${item.itemId} not found` });
        }
        
        // Check actual available units (units with status 'Available')
        const availableUnits = await storage.getUnitsByItem(item.itemId);
        const availableUnitsFiltered = availableUnits.filter(unit => unit.status === 'Available' && !unit.currentCustomerId);
        
        // Check if requested quantity exceeds available units
        if (item.quantity > availableUnitsFiltered.length) {
          return res.status(400).json({ 
            error: `Insufficient stock for item "${currentItem.name}". Requested: ${item.quantity}, Available: ${availableUnitsFiltered.length}` 
          });
        }
      }

      // Create service items and update unit statuses
      const serviceItems = [];
      for (const item of selectedItems) {
        const serviceItemId = `${serviceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const serviceItem = await storage.createServiceItem({
          id: serviceItemId,
          serviceId: service.id,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice || "0",
          totalPrice: item.totalPrice || "0"
        });
        serviceItems.push(serviceItem);

        // If service type is rental, mark units as rented
        if (serviceData.serviceType === 'rent') {
          // Get available units for this item
          const availableUnits = await storage.getUnitsByItem(item.itemId);
          const availableUnitsFiltered = availableUnits.filter(unit => unit.status === 'Available' && !unit.currentCustomerId);
          
          // Mark the required quantity of units as rented and assign to customer
          const unitsToRent = availableUnitsFiltered.slice(0, item.quantity);
          for (const unit of unitsToRent) {
            await storage.updateUnit(unit.id, { 
              status: 'Rented',
              currentCustomerId: customer.id,
              rentedBy: customer.id,
              serviceId: service.id
            });
          }

          // Update item's quantityRentedOut
          const currentItem = await storage.getItem(item.itemId);
          if (currentItem) {
            const newQuantityRentedOut = (currentItem.quantityRentedOut || 0) + item.quantity;
            const newQuantityInStock = (currentItem.quantityInStock || 0) - item.quantity;
            await storage.updateItem(item.itemId, {
              quantityRentedOut: newQuantityRentedOut,
              quantityInStock: Math.max(0, newQuantityInStock)
            });
          }
        }
      }

      // Create rental if service type is rental
      let rental = null;
      if (serviceData.serviceType === 'rent' && rentalData) {
        const rentalId = `rental-${Date.now()}`;
        rental = await storage.createRental({
          ...rentalData,
          id: rentalId,
          serviceId: service.id,
          customerId: customer.id
        });

        // Create timeline entry for rental creation
        const timelineId = `timeline-${Date.now()}`;
        await storage.createRentalTimelineEntry({
          id: timelineId,
          customerId: customer.id,
          serviceId: service.id,
          changeType: 'created',
          title: 'Customer Rental Created',
          description: `New rental started for ${customer.name}`,
          itemsSnapshot: JSON.stringify(serviceItems),
          totalValue: rentalData.totalValue || "0"
        });
      }

      res.json({
        customer,
        service,
        serviceItems,
        rental,
        success: true
      });
    } catch (error) {
      console.error("Complete customer creation error:", error);
      res.status(400).json({ error: "Failed to create complete customer record" });
    }
  });

  // Fix existing rental statuses (utility endpoint)
  app.post("/api/rentals/fix-statuses", async (req, res) => {
    try {
      const services = await storage.getServices();
      const serviceItems = await storage.getServiceItems();
      
      for (const service of services) {
        if (service.serviceType === 'rent') {
          const items = serviceItems.filter(item => item.serviceId === service.id);
          
          for (const serviceItem of items) {
            // Get available units for this item
            const availableUnits = await storage.getUnitsByItem(serviceItem.itemId);
            const inStockUnits = availableUnits.filter(unit => unit.status === 'Available');
            
            // Mark the required quantity of units as rented
            const unitsToRent = inStockUnits.slice(0, serviceItem.quantity);
            for (const unit of unitsToRent) {
              await storage.updateUnit(unit.id, { status: 'rented' });
            }

            // Update item's quantityRentedOut
            const currentItem = await storage.getItem(serviceItem.itemId);
            if (currentItem) {
              const newQuantityRentedOut = (currentItem.quantityRentedOut || 0) + serviceItem.quantity;
              const newQuantityInStock = (currentItem.quantityInStock || 0) - serviceItem.quantity;
              await storage.updateItem(serviceItem.itemId, {
                quantityRentedOut: newQuantityRentedOut,
                quantityInStock: Math.max(0, newQuantityInStock)
              });
            }
          }
        }
      }
      
      res.json({ success: true, message: "Rental statuses fixed successfully" });
    } catch (error) {
      console.error("Error fixing rental statuses:", error);
      res.status(500).json({ error: "Failed to fix rental statuses" });
    }
  });

  // Fix unit statuses from "In Stock" to "Available"
  app.post("/api/units/fix-statuses", async (req, res) => {
    try {
      const units = await storage.getUnits();
      let updatedCount = 0;
      
      for (const unit of units) {
        if (unit.status === "In Stock") {
          await storage.updateUnit(unit.id, { status: "Available" });
          updatedCount++;
        }
      }
      
      res.json({ 
        success: true, 
        message: `Updated ${updatedCount} units from "In Stock" to "Available"`,
        updatedCount 
      });
    } catch (error) {
      console.error("Error fixing unit statuses:", error);
      res.status(500).json({ error: "Failed to fix unit statuses" });
    }
  });

  // Fix data inconsistencies - clear rental fields for Available units
  app.post("/api/units/fix-data-consistency", async (req, res) => {
    try {
      const units = await storage.getUnits();
      let fixedCount = 0;
      
      for (const unit of units) {
        if (unit.status === "Available" && (unit.rentedBy || unit.serviceId || unit.currentCustomerId)) {
          await storage.updateUnit(unit.id, { 
            rentedBy: null,
            serviceId: null,
            currentCustomerId: null
          });
          fixedCount++;
        }
      }
      
      res.json({ 
        success: true, 
        message: `Fixed ${fixedCount} units with inconsistent data`,
        fixedCount 
      });
    } catch (error) {
      console.error("Error fixing data consistency:", error);
      res.status(500).json({ error: "Failed to fix data consistency" });
    }
  });

  // Fix orphaned rented units (units with Rented status but no associated customer)
  app.post("/api/units/fix-orphaned-rentals", async (req, res) => {
    try {
      const units = await storage.getUnits();
      const customers = await storage.getCustomers();
      let fixedCount = 0;
      
      // Get all valid customer IDs
      const validCustomerIds = customers.map(c => c.id);
      
      for (const unit of units) {
        if (unit.status === "Rented" && (!unit.currentCustomerId || !validCustomerIds.includes(unit.currentCustomerId))) {
          await storage.updateUnit(unit.id, { 
            status: "Available",
            rentedBy: null,
            serviceId: null,
            currentCustomerId: null
          });
          fixedCount++;
        }
      }
      
      res.json({ 
        success: true, 
        message: `Fixed ${fixedCount} orphaned rented units`,
        fixedCount 
      });
    } catch (error) {
      console.error("Error fixing orphaned rentals:", error);
      res.status(500).json({ error: "Failed to fix orphaned rentals" });
    }
  });

  // Clean up duplicate rentals and assign units properly to customers
  app.post("/api/rentals/cleanup-duplicates", async (req, res) => {
    try {
      console.log("Starting rental cleanup...");
      
      // First, reset all rented units to Available and clear rental assignments
      const allUnits = await storage.getUnits();
      const rentedUnits = allUnits.filter(unit => unit.status === 'Rented' || unit.status === 'rented');
      
      console.log(`Found ${rentedUnits.length} rented units to reset`);
      
      for (const unit of rentedUnits) {
        await storage.updateUnit(unit.id, { 
          status: 'Available', 
          currentCustomerId: null,
          rentedBy: null, 
          serviceId: null 
        });
      }
      
      // Get all services and service items
      const services = await storage.getServices();
      const serviceItems = await storage.getServiceItems();
      
      // Group service items by customer to avoid conflicts
      const servicesByCustomer = services.reduce((acc, service) => {
        if (!acc[service.customerId]) {
          acc[service.customerId] = [];
        }
        acc[service.customerId].push(service);
        return acc;
      }, {} as Record<number, any[]>);
      
      let totalAssignments = 0;
      
      // Process each customer's rentals
      for (const [customerId, customerServices] of Object.entries(servicesByCustomer)) {
        console.log(`Processing customer ${customerId}...`);
        
        for (const service of customerServices) {
          if (service.serviceType === 'rent') {
            const items = serviceItems.filter(item => item.serviceId === service.id);
            
            for (const serviceItem of items) {
              // Get available units for this item (not rented by anyone)
              const availableUnits = await storage.getUnitsByItem(serviceItem.itemId);
              const availableUnitsFiltered = availableUnits.filter(unit => 
                unit.status === 'Available' && !unit.currentCustomerId
              );
              
              // Assign the required quantity to this customer
              const unitsToAssign = availableUnitsFiltered.slice(0, serviceItem.quantity);
              console.log(`Assigning ${unitsToAssign.length} units of ${serviceItem.itemId} to customer ${customerId}`);
              
              for (const unit of unitsToAssign) {
                await storage.updateUnit(unit.id, { 
                  status: 'Rented',
                  currentCustomerId: parseInt(customerId),
                  rentedBy: parseInt(customerId),
                  serviceId: service.id
                });
                totalAssignments++;
              }
            }
          }
        }
      }
      
      console.log(`Cleanup completed. Total units assigned: ${totalAssignments}`);
      
      res.json({ 
        success: true, 
        message: `Cleanup completed successfully. ${totalAssignments} units properly assigned to customers.`,
        totalAssignments 
      });
    } catch (error) {
      console.error("Error cleaning up rental duplicates:", error);
      res.status(500).json({ error: "Failed to clean up rental duplicates" });
    }
  });

  // Return units API - mark units as available and clear customer assignment
  app.post("/api/units/return", async (req, res) => {
    try {
      const { unitIds } = req.body;
      
      if (!Array.isArray(unitIds) || unitIds.length === 0) {
        return res.status(400).json({ error: "Unit IDs array is required" });
      }
      
      // Update each unit to available status
      const updatedUnits = [];
      for (const unitId of unitIds) {
        const updatedUnit = await storage.updateUnit(unitId, {
          status: 'Available',
          currentCustomerId: null,
          rentedBy: null,
          serviceId: null
        });
        updatedUnits.push(updatedUnit);
      }
      
      res.json({ 
        success: true, 
        message: `${unitIds.length} units returned successfully`,
        updatedUnits 
      });
    } catch (error) {
      console.error("Error returning units:", error);
      res.status(500).json({ error: "Failed to return units" });
    }
  });

  // Get available units for item selection
  app.get("/api/items/:itemId/available-units", async (req, res) => {
    try {
      const { itemId } = req.params;
      const units = await storage.getUnitsByItem(itemId);
      const availableUnits = units.filter(unit => 
        unit.status === 'Available' && !unit.currentCustomerId
      );
      res.json(availableUnits);
    } catch (error) {
      console.error("Error fetching available units:", error);
      res.status(500).json({ error: "Failed to fetch available units" });
    }
  });

  // Get unit details by serial number (for QR scanning)
  app.get("/api/units/serial/:serialNumber", async (req, res) => {
    try {
      const { serialNumber } = req.params;
      
      // Find unit by serial number
      const unit = await storage.getUnitBySerialNumber(serialNumber);
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }
      
      // Get associated item details
      const item = await storage.getItem(unit.itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found for this unit" });
      }
      
      let rentalInfo = null;
      
      // If unit is rented, get rental and customer information
      if (unit.status === 'rented') {
        try {
          // Find the service item that includes this unit
          const serviceItems = await storage.getServiceItems();
          const serviceItem = serviceItems.find(si => si.itemId === unit.itemId);
          
          if (serviceItem) {
            // Get the service details
            const service = await storage.getService(serviceItem.serviceId);
            
            if (service && service.serviceType === 'rent') {
              // Get the customer details
              const customer = await storage.getCustomer(service.customerId);
              
              // Get rental details - rentals are linked to services, not individual items
              const rentals = await storage.getRentalsByService(service.id);
              const rental = rentals.length > 0 ? rentals[0] : null;
              
              if (customer && rental) {
                rentalInfo = {
                  customer: {
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    company: customer.company,
                    type: customer.type
                  },
                  rental: {
                    startDate: rental.startDate,
                    endDate: rental.endDate || 'Ongoing',
                    paymentFrequency: rental.paymentFrequency,
                    rate: rental.monthlyRate || 'N/A',
                    totalAmount: rental.totalValue || 'N/A',
                    securityDeposit: rental.securityDeposit || 'N/A',
                    terms: rental.notes || 'No additional terms',
                    isOngoing: rental.isOngoing
                  },
                  service: {
                    serviceType: service.serviceType,
                    priority: service.priority,
                    description: service.description,
                    createdAt: service.createdAt
                  }
                };
              }
            }
          }
        } catch (rentalError) {
          console.error("Error fetching rental information:", rentalError);
          // Continue without rental info rather than failing completely
        }
      }
      
      // Return combined unit, item, and rental details
      res.json({
        unit,
        item,
        rentalInfo,
        unitDetails: {
          serialNumber: unit.serialNumber,
          model: item.model || 'N/A',
          name: item.name,
          location: unit.location || 'N/A',
          warranty: unit.warrantyExpiry || 'N/A',
          status: unit.status,
          notes: unit.notes || 'No notes available',
          barcode: unit.barcode
        }
      });
    } catch (error) {
      console.error("Error fetching unit by serial number:", error);
      res.status(500).json({ error: "Failed to fetch unit details" });
    }
  });

  // Rental Timeline routes
  app.get("/api/customers/:customerId/timeline", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const timeline = await storage.getRentalTimeline(customerId);
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching rental timeline:", error);
      res.status(500).json({ error: "Failed to fetch rental timeline" });
    }
  });

  app.post("/api/customers/:customerId/timeline", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const timelineData = insertRentalTimelineSchema.parse({
        ...req.body,
        customerId
      });
      
      const timelineEntry = await storage.createRentalTimelineEntry(timelineData);
      res.json(timelineEntry);
    } catch (error) {
      console.error("Error creating timeline entry:", error);
      res.status(400).json({ error: "Failed to create timeline entry" });
    }
  });

  // Cleanup orphaned timeline entries
  app.post("/api/timeline/cleanup", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      const validCustomerIds = customers.map(c => c.id);
      
      let deletedCount = 0;
      
      // For MongoDB storage, we need to handle this differently
      if (storage.constructor.name === 'MongoStorage') {
        // Delete timeline entries for customers that no longer exist
        const mongoStorage = storage as any;
        await mongoStorage.initialize();
        
        const result = await mongoStorage.rentalTimeline.deleteMany({
          customerId: { $nin: validCustomerIds }
        });
        deletedCount = result.deletedCount;
      } else {
        // For memory storage
        const memStorage = storage as any;
        const timelineEntries = Array.from(memStorage.rentalTimeline.values());
        
        timelineEntries.forEach(entry => {
          if (!validCustomerIds.includes(entry.customerId)) {
            memStorage.rentalTimeline.delete(entry.id);
            deletedCount++;
          }
        });
      }
      
      console.log(`Cleaned up ${deletedCount} orphaned timeline entries`);
      res.json({ 
        success: true, 
        deletedCount,
        message: `Cleaned up ${deletedCount} orphaned timeline entries`
      });
    } catch (error) {
      console.error("Timeline cleanup error:", error);
      res.status(500).json({ error: "Failed to cleanup timeline entries" });
    }
  });

  // Deep cleanup timeline entries that don't match current customer names
  app.post("/api/timeline/deep-cleanup", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      let deletedCount = 0;
      
      // For MongoDB storage
      if (storage.constructor.name === 'MongoStorage') {
        const mongoStorage = storage as any;
        await mongoStorage.initialize();
        
        // For each customer, check if their timeline entries match their current name
        for (const customer of customers) {
          const timelineEntries = await mongoStorage.rentalTimeline.find({ customerId: customer.id }).toArray();
          
          for (const entry of timelineEntries) {
            // Check if the description contains a different customer name
            if (entry.description && entry.description.includes('New rental started for ')) {
              const nameInDescription = entry.description.replace('New rental started for ', '');
              if (nameInDescription !== customer.name) {
                console.log(`Removing timeline entry for customer ${customer.id} (${customer.name}) that references ${nameInDescription}`);
                await mongoStorage.rentalTimeline.deleteOne({ id: entry.id });
                deletedCount++;
              }
            }
          }
        }
      } else {
        // For memory storage
        const memStorage = storage as any;
        
        for (const customer of customers) {
          const timelineEntries = Array.from(memStorage.rentalTimeline.values()).filter(entry => entry.customerId === customer.id);
          
          for (const entry of timelineEntries) {
            if (entry.description && entry.description.includes('New rental started for ')) {
              const nameInDescription = entry.description.replace('New rental started for ', '');
              if (nameInDescription !== customer.name) {
                console.log(`Removing timeline entry for customer ${customer.id} (${customer.name}) that references ${nameInDescription}`);
                memStorage.rentalTimeline.delete(entry.id);
                deletedCount++;
              }
            }
          }
        }
      }
      
      console.log(`Deep cleaned ${deletedCount} mismatched timeline entries`);
      res.json({ 
        success: true, 
        deletedCount,
        message: `Deep cleaned ${deletedCount} mismatched timeline entries`
      });
    } catch (error) {
      console.error("Deep cleanup error:", error);
      res.status(500).json({ error: "Failed to deep cleanup timeline entries" });
    }
  });

  // Vendor routes
  app.get("/api/vendors", requireAuth, async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/:id", requireAuth, async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendor" });
    }
  });

  app.post("/api/vendors", requireAuth, async (req, res) => {
    try {
      console.log("Creating vendor with data:", req.body);
      const validatedData = insertVendorSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const vendor = await storage.createVendor(validatedData);
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Vendor creation error:", error);
      res.status(400).json({ error: "Invalid vendor data", details: error.message });
    }
  });

  app.put("/api/vendors/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertVendorSchema.parse(req.body);
      const vendor = await storage.updateVendor(req.params.id, validatedData);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ error: "Invalid vendor data" });
    }
  });

  app.delete("/api/vendors/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteVendor(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vendor" });
    }
  });

  // Purchase Order routes
  app.get("/api/purchase-orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });

  app.get("/api/purchase-orders/:id", requireAuth, async (req, res) => {
    try {
      console.log("Fetching purchase order details for ID:", req.params.id);
      const order = await storage.getPurchaseOrder(req.params.id);
      if (!order) {
        console.log("Purchase order not found");
        return res.status(404).json({ error: "Purchase order not found" });
      }

      console.log("Purchase order found:", order);
      console.log("Vendor ID:", order.vendorId);

      // Fetch vendor data
      const vendor = await storage.getVendor(order.vendorId);
      console.log("Vendor data:", vendor);
      
      // Fetch purchase order items
      const orderItems = await storage.getPurchaseOrderItemsByOrder(req.params.id);
      console.log("Order items:", orderItems);
      
      // Fetch item details for each purchase order item
      const itemsWithDetails = await Promise.all(
        orderItems.map(async (orderItem) => {
          const item = await storage.getItem(orderItem.itemId);
          const category = item ? await storage.getCategory(item.categoryId) : null;
          
          console.log("Item details:", { item, category });
          
          return {
            ...orderItem,
            name: item?.name || 'Unknown Item',
            model: item?.model || 'N/A',
            categoryName: category?.name || 'Unknown Category',
            location: item?.location || 'N/A'
          };
        })
      );

      console.log("Items with details:", itemsWithDetails);

      // Return enhanced order data
      const response = {
        ...order,
        vendorData: vendor ? {
          name: vendor.name,
          organization: vendor.organization,
          contactPerson: vendor.contactPerson,
          phone: vendor.phone,
          email: vendor.email,
          address: vendor.address,
          country: vendor.country,
          state: vendor.state,
          city: vendor.city,
          pincode: vendor.pincode,
          gstTaxId: vendor.gstTaxId,
          legalDocuments: vendor.legalDocuments
        } : null,
        items: itemsWithDetails
      };
      
      console.log("Final response:", JSON.stringify(response, null, 2));
      res.json(response);
    } catch (error) {
      console.error("Error fetching purchase order details:", error);
      res.status(500).json({ error: "Failed to fetch purchase order" });
    }
  });

  app.post("/api/purchase-orders", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPurchaseOrderSchema.parse(req.body);
      const order = await storage.createPurchaseOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid purchase order data" });
    }
  });

  app.put("/api/purchase-orders/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPurchaseOrderSchema.parse(req.body);
      const order = await storage.updatePurchaseOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid purchase order data" });
    }
  });

  app.delete("/api/purchase-orders/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deletePurchaseOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete purchase order" });
    }
  });

  // Purchase Order Items routes
  app.get("/api/purchase-order-items", requireAuth, async (req, res) => {
    try {
      const items = await storage.getPurchaseOrderItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase order items" });
    }
  });

  app.get("/api/purchase-order-items/order/:orderId", requireAuth, async (req, res) => {
    try {
      const items = await storage.getPurchaseOrderItemsByOrder(req.params.orderId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase order items" });
    }
  });

  app.post("/api/purchase-order-items", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPurchaseOrderItemSchema.parse(req.body);
      const item = await storage.createPurchaseOrderItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid purchase order item data" });
    }
  });

  app.put("/api/purchase-order-items/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPurchaseOrderItemSchema.parse(req.body);
      const item = await storage.updatePurchaseOrderItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid purchase order item data" });
    }
  });

  app.delete("/api/purchase-order-items/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deletePurchaseOrderItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete purchase order item" });
    }
  });

  // Sell Order routes
  app.get("/api/sell-orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getSellOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sell orders" });
    }
  });

  app.get("/api/sell-orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getSellOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Sell order not found" });
      }
      
      // Also fetch the order items
      const orderItems = await storage.getSellOrderItemsByOrder(req.params.id);
      res.json({ order, items: orderItems });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sell order" });
    }
  });

  app.post("/api/sell-orders", requireAuth, async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      
      // Validate main order data
      const validatedOrderData = insertSellOrderSchema.parse(orderData);
      
      // Create the sell order
      const sellOrder = await storage.createSellOrder(validatedOrderData);
      
      // Create sell order items
      const sellOrderItems = [];
      for (const item of items) {
        const sellOrderItem = await storage.createSellOrderItem({
          sellOrderId: sellOrder.id,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          serialNumbers: item.serialNumbers || null
        });
        sellOrderItems.push(sellOrderItem);
        
        // Update inventory by removing sold units
        const serialNumbers = item.serialNumbers ? JSON.parse(item.serialNumbers) : [];
        
        // Get available units for this item
        const availableUnits = await storage.getUnitsByItem(item.itemId);
        const unitsToSell = availableUnits.filter(unit => 
          unit.status === 'Available'
        ).slice(0, item.quantity);
        
        // Update unit statuses to "Sold"
        for (const unit of unitsToSell) {
          await storage.updateUnit(unit.id, { status: 'Sold' });
        }
        
        // Update item quantities
        const currentItem = await storage.getItem(item.itemId);
        if (currentItem) {
          const newQuantityInStock = Math.max(0, (currentItem.quantityInStock || 0) - item.quantity);
          await storage.updateItem(item.itemId, {
            quantityInStock: newQuantityInStock
          });
        }
      }
      
      res.status(201).json({ 
        order: sellOrder,
        items: sellOrderItems,
        success: true
      });
    } catch (error) {
      console.error("Error creating sell order:", error);
      res.status(400).json({ error: "Invalid sell order data" });
    }
  });

  app.put("/api/sell-orders/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSellOrderSchema.parse(req.body);
      const order = await storage.updateSellOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ error: "Sell order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid sell order data" });
    }
  });

  app.delete("/api/sell-orders/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteSellOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Sell order not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sell order" });
    }
  });

  // Sell Order Items routes
  app.get("/api/sell-order-items", requireAuth, async (req, res) => {
    try {
      const items = await storage.getSellOrderItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sell order items" });
    }
  });

  app.get("/api/sell-order-items/order/:orderId", requireAuth, async (req, res) => {
    try {
      const items = await storage.getSellOrderItemsByOrder(req.params.orderId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sell order items" });
    }
  });

  app.post("/api/sell-order-items", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSellOrderItemSchema.parse(req.body);
      const item = await storage.createSellOrderItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid sell order item data" });
    }
  });

  app.put("/api/sell-order-items/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSellOrderItemSchema.parse(req.body);
      const item = await storage.updateSellOrderItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ error: "Sell order item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid sell order item data" });
    }
  });

  app.delete("/api/sell-order-items/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteSellOrderItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Sell order item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sell order item" });
    }
  });

  // Test endpoint to verify MongoDB connection
  // Billing System Routes
  
  // Invoice routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices/customer/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const invoices = await storage.getInvoicesByCustomer(customerId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validated = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validated);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const validated = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(req.params.id, validated);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const success = await storage.deleteInvoice(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  // Invoice Items routes
  app.get("/api/invoice-items", async (req, res) => {
    try {
      const items = await storage.getInvoiceItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice items" });
    }
  });

  app.get("/api/invoice-items/invoice/:invoiceId", async (req, res) => {
    try {
      const items = await storage.getInvoiceItemsByInvoice(req.params.invoiceId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice items" });
    }
  });

  app.post("/api/invoice-items", async (req, res) => {
    try {
      const validated = insertInvoiceItemSchema.parse(req.body);
      const item = await storage.createInvoiceItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid invoice item data" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/customer/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const payments = await storage.getPaymentsByCustomer(customerId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer payments" });
    }
  });

  app.get("/api/payments/invoice/:invoiceId", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByInvoice(req.params.invoiceId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validated = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validated);
      
      // Update invoice status to paid if fully paid
      if (payment.invoiceId) {
        const invoice = await storage.getInvoice(payment.invoiceId);
        if (invoice) {
          const totalPayments = await storage.getPaymentsByInvoice(payment.invoiceId);
          const totalPaid = totalPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
          
          if (totalPaid >= parseFloat(invoice.totalAmount)) {
            await storage.updateInvoice(payment.invoiceId, { status: 'paid' });
          }
        }
      }
      
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid payment data" });
    }
  });

  // Recurring Invoice Schedule routes
  app.get("/api/recurring-schedules", async (req, res) => {
    try {
      const schedules = await storage.getRecurringInvoiceSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recurring schedules" });
    }
  });

  app.get("/api/recurring-schedules/customer/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const schedules = await storage.getRecurringInvoiceSchedulesByCustomer(customerId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer recurring schedules" });
    }
  });

  app.post("/api/recurring-schedules", async (req, res) => {
    try {
      const validated = insertRecurringInvoiceScheduleSchema.parse(req.body);
      const schedule = await storage.createRecurringInvoiceSchedule(validated);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ error: "Invalid recurring schedule data" });
    }
  });

  app.put("/api/recurring-schedules/:id", async (req, res) => {
    try {
      const validated = insertRecurringInvoiceScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateRecurringInvoiceSchedule(req.params.id, validated);
      if (!schedule) {
        return res.status(404).json({ error: "Recurring schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: "Invalid recurring schedule data" });
    }
  });

  app.delete("/api/recurring-schedules/:id", async (req, res) => {
    try {
      const success = await storage.deleteRecurringInvoiceSchedule(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Recurring schedule not found" });
      }
      res.json({ message: "Recurring schedule deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recurring schedule" });
    }
  });

  // Billing dashboard stats
  app.get("/api/billing/stats", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      const payments = await storage.getPayments();
      const recurringSchedules = await storage.getRecurringInvoiceSchedules();
      
      const totalInvoices = invoices.length;
      const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
      const paidInvoices = invoices.filter(i => i.status === 'paid').length;
      const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
      
      const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const outstandingAmount = invoices
        .filter(i => i.status === 'pending')
        .reduce((sum, i) => sum + parseFloat(i.totalAmount), 0);
      
      const activeSchedules = recurringSchedules.filter(s => s.isActive).length;
      
      res.json({
        totalInvoices,
        pendingInvoices,
        paidInvoices,
        overdueInvoices,
        totalRevenue,
        outstandingAmount,
        activeSchedules,
        totalPayments: payments.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch billing stats" });
    }
  });

  app.get("/api/test/db", async (req, res) => {
    try {
      await storage.initialize();
      res.json({ 
        status: "Connected to MongoDB", 
        database: "raydify_vault",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to connect to MongoDB", 
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
