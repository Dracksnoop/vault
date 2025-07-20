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
  userId: integer("user_id").notNull(), // User-specific data
});

export const items = pgTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  categoryId: text("category_id").notNull(),
  quantityInStock: integer("quantity_in_stock").default(0),
  quantityRentedOut: integer("quantity_rented_out").default(0),
  location: text("location"),
  userId: integer("user_id").notNull(), // User-specific data
});

export const units = pgTable("units", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  serialNumber: text("serial_number").notNull(),
  barcode: text("barcode"),
  status: text("status").notNull().default("Available"), // Available, Rented, Maintenance, Retired
  currentCustomerId: integer("current_customer_id"), // Customer ID who currently has this unit
  location: text("location"),
  warrantyExpiry: text("warranty_expiry"),
  notes: text("notes"),
  rentedBy: integer("rented_by"), // Customer ID who has rented this unit (legacy field)
  serviceId: text("service_id"), // Service ID for rental tracking
  userId: integer("user_id").notNull(), // User-specific data
  
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
  
  // Replacement tracking
  isUnderReplacement: boolean("is_under_replacement").default(false),
  replacementRequestId: text("replacement_request_id"),
  replacedDate: text("replaced_date"),
  replacedReason: text("replaced_reason"),
  opticalDrive: text("optical_drive"),
  ports: text("ports"),
  coolingSystem: text("cooling_system"),
  // Monitor specifications
  monitorBrand: text("monitor_brand"),
  monitorModel: text("monitor_model"),
  screenSize: integer("screen_size"),
  resolution: text("resolution"),
  panelType: text("panel_type"),
  refreshRate: integer("refresh_rate"),
  responseTime: integer("response_time"),
  aspectRatio: text("aspect_ratio"),
  brightness: integer("brightness"),
  contrastRatio: text("contrast_ratio"),
  inputPorts: text("input_ports"),
  hasSpeakers: text("has_speakers"),
  adjustableHeight: boolean("adjustable_height"),
  adjustableTilt: boolean("adjustable_tilt"),
  adjustableSwivel: boolean("adjustable_swivel"),
  adjustablePivot: boolean("adjustable_pivot"),
  mountCompatibility: text("mount_compatibility"),
  colorGamut: integer("color_gamut"),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(), // User-specific data
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  company: text("company"),
  // Extended fields for customer management
  customerType: text("customer_type").notNull(), // "one-time" or "rental"
  companyName: text("company_name"),
  userId: integer("user_id").notNull(), // User-specific data
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
  userId: integer("user_id").notNull(), // User-specific data
});

export const serviceItems = pgTable("service_items", {
  id: text("id").primaryKey(),
  serviceId: text("service_id").notNull(),
  itemId: text("item_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  userId: integer("user_id").notNull(), // User-specific data
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
  userId: integer("user_id").notNull(), // User-specific data
});

export const rentalTimeline = pgTable("rental_timeline", {
  id: text("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  serviceId: text("service_id").notNull(),
  changeType: text("change_type").notNull(), // "created", "added", "removed", "modified"
  title: text("title").notNull(),
  description: text("description"),
  itemsSnapshot: text("items_snapshot").notNull(), // JSON string of rented items at this point
  totalValue: decimal("total_value", { precision: 10, scale: 2 }),
  createdAt: text("created_at").default("now()"),
});

export const vendors = pgTable("vendors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organization: text("organization"),
  country: text("country"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  address: text("address"),
  gstTaxId: text("gst_tax_id"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  legalDocuments: text("legal_documents"), // JSON string of uploaded document URLs
  createdAt: text("created_at").default("now()"),
  updatedAt: text("updated_at").default("now()"),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull(),
  orderDate: text("order_date").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "processing", "completed", "cancelled"
  totalItems: integer("total_items").default(0),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: text("created_at").default("now()"),
  updatedAt: text("updated_at").default("now()"),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: text("id").primaryKey(),
  purchaseOrderId: text("purchase_order_id").notNull(),
  itemId: text("item_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  createdAt: text("created_at").default("now()"),
});

export const sellOrders = pgTable("sell_orders", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  customerOrganization: text("customer_organization"),
  customerCountry: text("customer_country"),
  customerCity: text("customer_city"),
  customerState: text("customer_state"),
  customerPincode: text("customer_pincode"),
  customerGstTaxId: text("customer_gst_tax_id"),
  orderDate: text("order_date").notNull(),
  status: text("status").notNull().default("completed"), // "pending", "processing", "completed", "cancelled"
  totalItems: integer("total_items").default(0),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: text("created_at").default("now()"),
  updatedAt: text("updated_at").default("now()"),
});

export const sellOrderItems = pgTable("sell_order_items", {
  id: text("id").primaryKey(),
  sellOrderId: text("sell_order_id").notNull(),
  itemId: text("item_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  serialNumbers: text("serial_numbers"), // JSON array of serial numbers for sold units
  createdAt: text("created_at").default("now()"),
});

// Billing System Schemas
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  rentalId: text("rental_id"), // Optional - for rental-based invoices
  serviceId: text("service_id"), // Optional - for service-based invoices
  invoiceDate: text("invoice_date").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "paid", "overdue", "cancelled"
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  notes: text("notes"),
  paymentTerms: text("payment_terms"),
  isRecurring: boolean("is_recurring").default(false),
  recurringScheduleId: text("recurring_schedule_id"), // Links to recurring schedule
  userId: integer("user_id").notNull(), // User-specific data
  createdAt: text("created_at").default("now()"),
  updatedAt: text("updated_at").default("now()"),
});

export const invoiceItems = pgTable("invoice_items", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull(),
  itemId: text("item_id"), // Optional - for inventory items
  itemName: text("item_name").notNull(),
  itemDescription: text("item_description"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"), // Percentage
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }).default("0"), // Percentage
  serialNumbers: text("serial_numbers"), // JSON array of serial numbers for rented units
  rentalPeriod: text("rental_period"), // "2025-01-01 to 2025-01-31"
  userId: integer("user_id").notNull(), // User-specific data
  createdAt: text("created_at").default("now()"),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  paymentNumber: text("payment_number").notNull().unique(),
  invoiceId: text("invoice_id").notNull(),
  customerId: integer("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  paymentDate: text("payment_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  paymentMethod: text("payment_method").notNull(), // "cash", "card", "bank_transfer", "upi", "cheque"
  paymentStatus: text("payment_status").notNull().default("completed"), // "pending", "completed", "failed", "refunded"
  transactionId: text("transaction_id"), // External payment gateway transaction ID
  referenceNumber: text("reference_number"), // Cheque number, UPI ref, etc.
  notes: text("notes"),
  userId: integer("user_id").notNull(), // User-specific data
  createdAt: text("created_at").default("now()"),
  updatedAt: text("updated_at").default("now()"),
});

export const recurringInvoiceSchedules = pgTable("recurring_invoice_schedules", {
  id: text("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  rentalId: text("rental_id"), // Optional - for rental-based schedules
  serviceId: text("service_id"), // Optional - for service-based schedules
  frequency: text("frequency").notNull(), // "monthly", "quarterly", "yearly"
  interval: integer("interval").notNull().default(1), // Every X months/quarters/years
  startDate: text("start_date").notNull(),
  endDate: text("end_date"), // Optional - for finite schedules
  nextInvoiceDate: text("next_invoice_date").notNull(),
  lastInvoiceDate: text("last_invoice_date"), // Last generated invoice date
  isActive: boolean("is_active").default(true),
  templateData: text("template_data").notNull(), // JSON template for generating invoices
  paymentTerms: text("payment_terms").default("Net 30"),
  autoGenerate: boolean("auto_generate").default(true),
  notificationDays: integer("notification_days").default(3), // Days before due date to send reminders
  userId: integer("user_id").notNull(), // User-specific data
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
  userId: true,
});

export const insertItemSchema = createInsertSchema(items).pick({
  id: true,
  name: true,
  model: true,
  categoryId: true,
  quantityInStock: true,
  quantityRentedOut: true,
  location: true,
  userId: true,
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
  monitorBrand: true,
  monitorModel: true,
  screenSize: true,
  resolution: true,
  panelType: true,
  refreshRate: true,
  responseTime: true,
  aspectRatio: true,
  brightness: true,
  contrastRatio: true,
  inputPorts: true,
  hasSpeakers: true,
  adjustableHeight: true,
  adjustableTilt: true,
  adjustableSwivel: true,
  adjustablePivot: true,
  mountCompatibility: true,
  colorGamut: true,
  rentedBy: true,
  serviceId: true,
  currentCustomerId: true,
  userId: true,
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
  userId: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  id: true,
  customerId: true,
  serviceType: true,
  status: true,
  notes: true,
  userId: true,
});

export const insertServiceItemSchema = createInsertSchema(serviceItems).pick({
  id: true,
  serviceId: true,
  itemId: true,
  quantity: true,
  unitPrice: true,
  totalPrice: true,
  userId: true,
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
  userId: true,
});

export const insertRentalTimelineSchema = createInsertSchema(rentalTimeline).pick({
  id: true,
  customerId: true,
  serviceId: true,
  changeType: true,
  title: true,
  description: true,
  itemsSnapshot: true,
  totalValue: true,
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

export type InsertRentalTimeline = z.infer<typeof insertRentalTimelineSchema>;
export type RentalTimeline = typeof rentalTimeline.$inferSelect;

// Employee Management Schema
export const employees = pgTable("employees", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(), // Company employee ID
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(), // Manager, Developer, Designer, HR, Finance, etc.
  department: text("department").notNull(),
  joiningDate: text("joining_date").notNull(),
  salary: text("salary"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  idProofType: text("id_proof_type").notNull(), // Aadhar, PAN, Passport, Driving License
  idProofNumber: text("id_proof_number").notNull(),
  bankAccountNumber: text("bank_account_number"),
  bankIfscCode: text("bank_ifsc_code"),
  bankName: text("bank_name"),
  status: text("status").notNull().default("active"), // active, inactive, terminated
  notes: text("notes"),
  userId: integer("user_id").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  employeeId: true,
  userId: true,
  createdAt: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSellOrderSchema = createInsertSchema(sellOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSellOrderItemSchema = createInsertSchema(sellOrderItems).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).pick({
  id: true,
  vendorId: true,
  orderDate: true,
  status: true,
  totalItems: true,
  totalValue: true,
  notes: true,
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).pick({
  id: true,
  purchaseOrderId: true,
  itemId: true,
  quantity: true,
  unitPrice: true,
  totalPrice: true,
});

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

// Billing System Insert Schemas
export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecurringInvoiceScheduleSchema = createInsertSchema(recurringInvoiceSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Company Profile Schema
export const companyProfiles = pgTable("company_profiles", {
  id: text("id").primaryKey(),
  companyName: text("company_name").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  stateProvince: text("state_province").notNull(),
  country: text("country").notNull(),
  zipPostalCode: text("zip_postal_code").notNull(),
  phoneNumber: text("phone_number").notNull(),
  emailAddress: text("email_address").notNull(),
  gstNumber: text("gst_number"), // Optional tax ID
  websiteUrl: text("website_url"), // Optional website
  logoUrl: text("logo_url"), // URL or path to uploaded logo
  logoData: text("logo_data"), // Base64 encoded logo data
  isDefault: boolean("is_default").default(false), // Mark as default profile
  userId: integer("user_id").notNull(), // User-specific data
  createdAt: text("created_at").default("now()"),
  updatedAt: text("updated_at").default("now()"),
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Billing System Types
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertRecurringInvoiceSchedule = z.infer<typeof insertRecurringInvoiceScheduleSchema>;
export type RecurringInvoiceSchedule = typeof recurringInvoiceSchedules.$inferSelect;

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;

export type InsertSellOrder = z.infer<typeof insertSellOrderSchema>;
export type SellOrder = typeof sellOrders.$inferSelect;

export type InsertSellOrderItem = z.infer<typeof insertSellOrderItemSchema>;
export type SellOrderItem = typeof sellOrderItems.$inferSelect;

export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type CompanyProfile = typeof companyProfiles.$inferSelect;

// Replacement Request Schema
export const replacementRequests = pgTable("replacement_requests", {
  id: text("id").primaryKey(),
  unitId: text("unit_id").notNull(),
  unitSerialNumber: text("unit_serial_number").notNull(),
  itemId: text("item_id"),
  itemName: text("item_name").notNull(),
  itemModel: text("item_model"),
  reason: text("reason").notNull(), // warranty, damage, expired, defective, other
  status: text("status").notNull().default("pending"), // pending, approved, completed, rejected
  requestDate: text("request_date").notNull(),
  approvalDate: text("approval_date"),
  completionDate: text("completion_date"),
  replacementUnitId: text("replacement_unit_id"),
  replacementSerialNumber: text("replacement_serial_number"),
  notes: text("notes"),
  vendorName: text("vendor_name").notNull(),
  warrantyExpiryDate: text("warranty_expiry_date"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
  customerId: text("customer_id"),
  customerName: text("customer_name"),
  userId: integer("user_id").notNull(), // User-specific data
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertReplacementRequestSchema = createInsertSchema(replacementRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReplacementRequest = z.infer<typeof insertReplacementRequestSchema>;
export type ReplacementRequest = typeof replacementRequests.$inferSelect;
