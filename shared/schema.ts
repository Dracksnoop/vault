import { pgTable, text, serial, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  itemCount: integer("item_count").default(0),
});

export const items = pgTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  categoryId: text("category_id").notNull(),
  quantityInStock: integer("quantity_in_stock").default(0),
  quantityRentedOut: integer("quantity_rented_out").default(0),
  location: text("location"),
});

export const units = pgTable("units", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  serialNumber: text("serial_number").notNull().unique(),
  barcode: text("barcode"),
  status: text("status").notNull(),
  location: text("location"),
  warrantyExpiry: text("warranty_expiry"),
  notes: text("notes"),
  
  // CPU Specifications
  cpuBrand: text("cpu_brand"),
  cpuModel: text("cpu_model"),
  cpuCores: integer("cpu_cores"),
  cpuClockSpeed: text("cpu_clock_speed"),
  cpuArchitecture: text("cpu_architecture"),
  cpuCacheSize: text("cpu_cache_size"),
  
  // Memory specifications
  ramSize: integer("ram_size"),
  ramType: text("ram_type"),
  ramSpeed: integer("ram_speed"),
  ramSlotsUsed: integer("ram_slots_used"),
  
  // Storage specifications  
  storageType: text("storage_type"),
  storageCapacity: text("storage_capacity"),
  storageNumDrives: integer("storage_num_drives"),
  
  // Graphics specifications
  gpuType: text("gpu_type"),
  gpuModel: text("gpu_model"),
  gpuVram: integer("gpu_vram"),
  
  // Motherboard specifications
  motherboardModel: text("motherboard_model"),
  
  // Power Supply specifications
  psuWattage: integer("psu_wattage"),
  psuEfficiency: text("psu_efficiency"),
  
  // Operating System
  osName: text("os_name"),
  
  // Additional specifications
  networkAdapter: text("network_adapter"),
  opticalDrive: text("optical_drive"),
  ports: text("ports"),
  coolingSystem: text("cooling_system"),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  company: text("company"),
  // Extended fields for customer management
  customerType: text("customer_type").notNull(), // "one-time" or "rental"
  companyName: text("company_name"),
  billingAddress: text("billing_address"),
  shippingAddress: text("shipping_address"),
  gstVatNumber: text("gst_vat_number"),
  paymentTerms: text("payment_terms"),
  createdAt: text("created_at").default("now()"),
  updatedAt: text("updated_at").default("now()"),
});

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  serviceType: text("service_type").notNull(), // "rent", "sell", "maintenance", "others"
  status: text("status").notNull().default("active"), // "active", "completed", "cancelled"
  notes: text("notes"),
  createdAt: text("created_at").default("now()"),
  updatedAt: text("updated_at").default("now()"),
});

export const serviceItems = pgTable("service_items", {
  id: text("id").primaryKey(),
  serviceId: text("service_id").notNull(),
  itemId: text("item_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
});

export const rentals = pgTable("rentals", {
  id: text("id").primaryKey(),
  serviceId: text("service_id").notNull(),
  customerId: integer("customer_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isOngoing: boolean("is_ongoing").default(false),
  paymentFrequency: text("payment_frequency").notNull(), // "monthly", "quarterly", "yearly"
  monthlyRate: decimal("monthly_rate", { precision: 10, scale: 2 }),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("active"), // "active", "completed", "overdue"
  notes: text("notes"),
  createdAt: text("created_at").default("now()"),
  updatedAt: text("updated_at").default("now()"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  id: true,
  name: true,
  itemCount: true,
});

export const insertItemSchema = createInsertSchema(items).pick({
  id: true,
  name: true,
  model: true,
  categoryId: true,
  quantityInStock: true,
  quantityRentedOut: true,
  location: true,
});

export const insertUnitSchema = createInsertSchema(units).pick({
  id: true,
  itemId: true,
  serialNumber: true,
  barcode: true,
  status: true,
  location: true,
  warrantyExpiry: true,
  notes: true,
  cpuBrand: true,
  cpuModel: true,
  cpuCores: true,
  cpuClockSpeed: true,
  cpuArchitecture: true,
  cpuCacheSize: true,
  ramSize: true,
  ramType: true,
  ramSpeed: true,
  ramSlotsUsed: true,
  storageType: true,
  storageCapacity: true,
  storageNumDrives: true,
  gpuType: true,
  gpuModel: true,
  gpuVram: true,
  motherboardModel: true,
  psuWattage: true,
  psuEfficiency: true,
  osName: true,
  networkAdapter: true,
  opticalDrive: true,
  ports: true,
  coolingSystem: true,
});

export const insertInventorySchema = createInsertSchema(inventory).pick({
  name: true,
  sku: true,
  quantity: true,
  price: true,
  category: true,
  description: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  company: true,
  customerType: true,
  companyName: true,
  billingAddress: true,
  shippingAddress: true,
  gstVatNumber: true,
  paymentTerms: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  id: true,
  customerId: true,
  serviceType: true,
  status: true,
  notes: true,
});

export const insertServiceItemSchema = createInsertSchema(serviceItems).pick({
  id: true,
  serviceId: true,
  itemId: true,
  quantity: true,
  unitPrice: true,
  totalPrice: true,
});

export const insertRentalSchema = createInsertSchema(rentals).pick({
  id: true,
  serviceId: true,
  customerId: true,
  startDate: true,
  endDate: true,
  isOngoing: true,
  paymentFrequency: true,
  monthlyRate: true,
  totalValue: true,
  status: true,
  notes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;

export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Unit = typeof units.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertServiceItem = z.infer<typeof insertServiceItemSchema>;
export type ServiceItem = typeof serviceItems.$inferSelect;

export type InsertRental = z.infer<typeof insertRentalSchema>;
export type Rental = typeof rentals.$inferSelect;
