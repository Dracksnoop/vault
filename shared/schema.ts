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
