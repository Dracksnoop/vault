import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInventorySchema, insertCustomerSchema, insertUserSchema } from "@shared/schema";

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

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const sessionId = Math.random().toString(36).substring(2, 15);
      sessions.set(sessionId, { id: user.id, username: user.username });
      
      res.json({ 
        user: { id: user.id, username: user.username }, 
        token: sessionId 
      });
    } catch (error) {
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
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      const customers = await storage.getCustomers();
      
      const totalInventory = inventory.length;
      const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = inventory.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      const activeCustomers = customers.length;
      
      res.json({
        totalInventory,
        totalQuantity,
        totalValue,
        activeCustomers,
        lowStockItems: inventory.filter(item => item.quantity < 10).length,
        categories: [...new Set(inventory.map(item => item.category))].length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Test endpoint to verify MongoDB connection
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
