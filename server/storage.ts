import { 
  users, 
  type User, 
  type InsertUser, 
  type Inventory, 
  type InsertInventory, 
  type Customer, 
  type InsertCustomer,
  type Category,
  type InsertCategory,
  type Item,
  type InsertItem,
  type Unit,
  type InsertUnit,
  type Service,
  type InsertService,
  type ServiceItem,
  type InsertServiceItem,
  type Rental,
  type InsertRental,
  type RentalTimeline,
  type InsertRentalTimeline,
  type Vendor,
  type InsertVendor,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type PurchaseOrderItem,
  type InsertPurchaseOrderItem,
  type SellOrder,
  type InsertSellOrder,
  type SellOrderItem,
  type InsertSellOrderItem,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type Payment,
  type InsertPayment,
  type RecurringInvoiceSchedule,
  type InsertRecurringInvoiceSchedule
} from "@shared/schema";
import { MongoClient, Db, Collection } from 'mongodb';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Item methods
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  getItemsByCategory(categoryId: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;
  
  // Unit methods
  getUnits(): Promise<Unit[]>;
  getUnit(id: string): Promise<Unit | undefined>;
  getUnitsByItem(itemId: string): Promise<Unit[]>;
  getUnitBySerialNumber(serialNumber: string): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit | undefined>;
  deleteUnit(id: string): Promise<boolean>;
  
  // Legacy inventory methods
  getInventory(): Promise<Inventory[]>;
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  
  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  getServicesByCustomer(customerId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;
  
  // Service Item methods
  getServiceItems(): Promise<ServiceItem[]>;
  getServiceItem(id: string): Promise<ServiceItem | undefined>;
  getServiceItemsByService(serviceId: string): Promise<ServiceItem[]>;
  createServiceItem(serviceItem: InsertServiceItem): Promise<ServiceItem>;
  updateServiceItem(id: string, serviceItem: Partial<InsertServiceItem>): Promise<ServiceItem | undefined>;
  deleteServiceItem(id: string): Promise<boolean>;
  
  // Rental methods
  getRentals(): Promise<Rental[]>;
  getRental(id: string): Promise<Rental | undefined>;
  getRentalsByCustomer(customerId: number): Promise<Rental[]>;
  getRentalsByService(serviceId: string): Promise<Rental[]>;
  createRental(rental: InsertRental): Promise<Rental>;
  updateRental(id: string, rental: Partial<InsertRental>): Promise<Rental | undefined>;
  deleteRental(id: string): Promise<boolean>;
  
  // Rental Timeline methods
  getRentalTimeline(customerId: number): Promise<RentalTimeline[]>;
  createRentalTimelineEntry(entry: InsertRentalTimeline): Promise<RentalTimeline>;
  
  // Vendor methods
  getVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<boolean>;
  
  // Purchase Order methods
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: string): Promise<boolean>;
  
  // Purchase Order Item methods
  getPurchaseOrderItems(): Promise<PurchaseOrderItem[]>;
  getPurchaseOrderItem(id: string): Promise<PurchaseOrderItem | undefined>;
  getPurchaseOrderItemsByOrder(orderId: string): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  updatePurchaseOrderItem(id: string, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined>;
  deletePurchaseOrderItem(id: string): Promise<boolean>;
  
  // Sell Order methods
  getSellOrders(): Promise<SellOrder[]>;
  getSellOrder(id: string): Promise<SellOrder | undefined>;
  createSellOrder(order: InsertSellOrder): Promise<SellOrder>;
  updateSellOrder(id: string, order: Partial<InsertSellOrder>): Promise<SellOrder | undefined>;
  deleteSellOrder(id: string): Promise<boolean>;
  
  // Sell Order Item methods
  getSellOrderItems(): Promise<SellOrderItem[]>;
  getSellOrderItem(id: string): Promise<SellOrderItem | undefined>;
  getSellOrderItemsByOrder(orderId: string): Promise<SellOrderItem[]>;
  createSellOrderItem(item: InsertSellOrderItem): Promise<SellOrderItem>;
  updateSellOrderItem(id: string, item: Partial<InsertSellOrderItem>): Promise<SellOrderItem | undefined>;
  deleteSellOrderItem(id: string): Promise<boolean>;
  
  // Billing System methods
  // Invoice methods
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoicesByCustomer(customerId: number): Promise<Invoice[]>;
  getInvoicesByStatus(status: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  
  // Invoice Item methods
  getInvoiceItems(): Promise<InvoiceItem[]>;
  getInvoiceItem(id: string): Promise<InvoiceItem | undefined>;
  getInvoiceItemsByInvoice(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: string, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: string): Promise<boolean>;
  
  // Payment methods
  getPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByCustomer(customerId: number): Promise<Payment[]>;
  getPaymentsByInvoice(invoiceId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<boolean>;
  
  // Recurring Invoice Schedule methods
  getRecurringInvoiceSchedules(): Promise<RecurringInvoiceSchedule[]>;
  getRecurringInvoiceSchedule(id: string): Promise<RecurringInvoiceSchedule | undefined>;
  getRecurringInvoiceSchedulesByCustomer(customerId: number): Promise<RecurringInvoiceSchedule[]>;
  getActiveRecurringInvoiceSchedules(): Promise<RecurringInvoiceSchedule[]>;
  createRecurringInvoiceSchedule(schedule: InsertRecurringInvoiceSchedule): Promise<RecurringInvoiceSchedule>;
  updateRecurringInvoiceSchedule(id: string, schedule: Partial<InsertRecurringInvoiceSchedule>): Promise<RecurringInvoiceSchedule | undefined>;
  deleteRecurringInvoiceSchedule(id: string): Promise<boolean>;
  
  initialize(): Promise<void>;
}

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db;
  private users: Collection<User>;
  private categories: Collection<Category>;
  private items: Collection<Item>;
  private units: Collection<Unit>;
  private inventory: Collection<Inventory>;
  private customers: Collection<Customer>;
  private services: Collection<Service>;
  private serviceItems: Collection<ServiceItem>;
  private rentals: Collection<Rental>;
  private rentalTimeline: Collection<RentalTimeline>;
  private vendors: Collection<Vendor>;
  private purchaseOrders: Collection<PurchaseOrder>;
  private purchaseOrderItems: Collection<PurchaseOrderItem>;
  private sellOrders: Collection<SellOrder>;
  private sellOrderItems: Collection<SellOrderItem>;
  // Billing system collections
  private invoices: Collection<Invoice>;
  private invoiceItems: Collection<InvoiceItem>;
  private payments: Collection<Payment>;
  private recurringInvoiceSchedules: Collection<RecurringInvoiceSchedule>;
  private isInitialized = false;

  constructor() {
    const uri = process.env.MANGODB_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB connection string not found in environment variables');
    }
    this.client = new MongoClient(uri);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.client.connect();
      this.db = this.client.db('raydify_vault');
      this.users = this.db.collection<User>('users');
      this.categories = this.db.collection<Category>('categories');
      this.items = this.db.collection<Item>('items');
      this.units = this.db.collection<Unit>('units');
      this.inventory = this.db.collection<Inventory>('inventory');
      this.customers = this.db.collection<Customer>('customers');
      this.services = this.db.collection<Service>('services');
      this.serviceItems = this.db.collection<ServiceItem>('serviceItems');
      this.rentals = this.db.collection<Rental>('rentals');
      this.rentalTimeline = this.db.collection<RentalTimeline>('rentalTimeline');
      this.vendors = this.db.collection<Vendor>('vendors');
      this.purchaseOrders = this.db.collection<PurchaseOrder>('purchaseOrders');
      this.purchaseOrderItems = this.db.collection<PurchaseOrderItem>('purchaseOrderItems');
      this.sellOrders = this.db.collection<SellOrder>('sellOrders');
      this.sellOrderItems = this.db.collection<SellOrderItem>('sellOrderItems');
      // Billing system collections
      this.invoices = this.db.collection<Invoice>('invoices');
      this.invoiceItems = this.db.collection<InvoiceItem>('invoiceItems');
      this.payments = this.db.collection<Payment>('payments');
      this.recurringInvoiceSchedules = this.db.collection<RecurringInvoiceSchedule>('recurringInvoiceSchedules');
      
      // Initialize default categories if they don't exist
      const categoryCount = await this.categories.countDocuments();
      if (categoryCount === 0) {
        const defaultCategories = [
          { id: "1", name: "CPU", itemCount: 0 },
          { id: "2", name: "Monitor", itemCount: 0 },
          { id: "3", name: "Keyboard", itemCount: 0 },
          { id: "4", name: "Mouse", itemCount: 0 },
          { id: "5", name: "Cables", itemCount: 0 },
          { id: "6", name: "Networking Devices", itemCount: 0 },
          { id: "7", name: "Biometric Devices", itemCount: 0 },
        ];
        await this.categories.insertMany(defaultCategories);
        console.log('Initialized default categories');
      }
      
      this.isInitialized = true;
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    await this.initialize();
    const user = await this.users.findOne({ id });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.initialize();
    const user = await this.users.findOne({ username });
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.initialize();
    
    // Get the next available ID
    const lastUser = await this.users.findOne({}, { sort: { id: -1 } });
    const id = lastUser ? lastUser.id + 1 : 1;
    
    const user: User = { ...insertUser, id };
    await this.users.insertOne(user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    await this.initialize();
    return await this.users.find({}).toArray();
  }

  async deleteUser(id: number): Promise<boolean> {
    await this.initialize();
    const result = await this.users.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    await this.initialize();
    return await this.categories.find({}).toArray();
  }

  async getCategory(id: string): Promise<Category | undefined> {
    await this.initialize();
    const category = await this.categories.findOne({ id });
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    await this.initialize();
    const category: Category = { ...insertCategory };
    await this.categories.insertOne(category);
    return category;
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    await this.initialize();
    const result = await this.categories.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.categories.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Item methods
  async getItems(): Promise<Item[]> {
    await this.initialize();
    return await this.items.find({}).toArray();
  }

  async getItem(id: string): Promise<Item | undefined> {
    await this.initialize();
    const item = await this.items.findOne({ id });
    return item || undefined;
  }

  async getItemsByCategory(categoryId: string): Promise<Item[]> {
    await this.initialize();
    return await this.items.find({ categoryId }).toArray();
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    await this.initialize();
    const item: Item = { ...insertItem };
    await this.items.insertOne(item);
    return item;
  }

  async updateItem(id: string, updateData: Partial<InsertItem>): Promise<Item | undefined> {
    await this.initialize();
    const result = await this.items.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteItem(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.items.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Unit methods
  async getUnits(): Promise<Unit[]> {
    await this.initialize();
    return await this.units.find({}).toArray();
  }

  async getUnit(id: string): Promise<Unit | undefined> {
    await this.initialize();
    const unit = await this.units.findOne({ id });
    return unit || undefined;
  }

  async getUnitsByItem(itemId: string): Promise<Unit[]> {
    await this.initialize();
    return await this.units.find({ itemId }).toArray();
  }

  async getUnitBySerialNumber(serialNumber: string): Promise<Unit | undefined> {
    await this.initialize();
    const unit = await this.units.findOne({ serialNumber });
    return unit || undefined;
  }

  async createUnit(insertUnit: InsertUnit): Promise<Unit> {
    await this.initialize();
    const unit: Unit = { ...insertUnit };
    await this.units.insertOne(unit);
    return unit;
  }

  async updateUnit(id: string, updateData: Partial<InsertUnit>): Promise<Unit | undefined> {
    await this.initialize();
    const result = await this.units.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteUnit(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.units.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Legacy inventory methods
  async getInventory(): Promise<Inventory[]> {
    await this.initialize();
    return await this.inventory.find({}).toArray();
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    await this.initialize();
    const item = await this.inventory.findOne({ id });
    return item || undefined;
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    await this.initialize();
    
    // Get the next available ID
    const lastItem = await this.inventory.findOne({}, { sort: { id: -1 } });
    const id = lastItem ? lastItem.id + 1 : 1;
    
    const item: Inventory = { ...insertItem, id };
    await this.inventory.insertOne(item);
    return item;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    await this.initialize();
    const result = await this.inventory.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    await this.initialize();
    const result = await this.inventory.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    await this.initialize();
    return await this.customers.find({}).toArray();
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    await this.initialize();
    const customer = await this.customers.findOne({ id });
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    await this.initialize();
    
    // Get the next available ID
    const lastCustomer = await this.customers.findOne({}, { sort: { id: -1 } });
    const id = lastCustomer ? lastCustomer.id + 1 : 1;
    
    const now = new Date().toISOString();
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      createdAt: now,
      updatedAt: now
    };
    await this.customers.insertOne(customer);
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    await this.initialize();
    const result = await this.customers.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    await this.initialize();
    
    // Get all services for this customer before deleting them
    const customerServices = await this.services.find({ customerId: id }).toArray();
    
    // Delete all service items for services that belonged to this customer
    for (const service of customerServices) {
      await this.serviceItems.deleteMany({ serviceId: service.id });
    }
    
    // Delete all services for this customer
    await this.services.deleteMany({ customerId: id });
    
    // Delete all rentals for this customer
    await this.rentals.deleteMany({ customerId: id });
    
    // Delete all timeline entries for this customer
    await this.rentalTimeline.deleteMany({ customerId: id });
    
    // Delete customer record
    const customerResult = await this.customers.deleteOne({ id });
    
    console.log(`Deleted customer ${id} and all associated data`);
    return customerResult.deletedCount === 1;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    await this.initialize();
    return await this.services.find().toArray();
  }

  async getService(id: string): Promise<Service | undefined> {
    await this.initialize();
    const service = await this.services.findOne({ id });
    return service || undefined;
  }

  async getServicesByCustomer(customerId: number): Promise<Service[]> {
    await this.initialize();
    return await this.services.find({ customerId }).toArray();
  }

  async createService(insertService: InsertService): Promise<Service> {
    await this.initialize();
    const now = new Date().toISOString();
    const service: Service = { 
      ...insertService,
      createdAt: now,
      updatedAt: now
    };
    await this.services.insertOne(service);
    return service;
  }

  async updateService(id: string, updateData: Partial<InsertService>): Promise<Service | undefined> {
    await this.initialize();
    const result = await this.services.findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteService(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.services.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Service Item methods
  async getServiceItems(): Promise<ServiceItem[]> {
    await this.initialize();
    return await this.serviceItems.find().toArray();
  }

  async getServiceItem(id: string): Promise<ServiceItem | undefined> {
    await this.initialize();
    const serviceItem = await this.serviceItems.findOne({ id });
    return serviceItem || undefined;
  }

  async getServiceItemsByService(serviceId: string): Promise<ServiceItem[]> {
    await this.initialize();
    return await this.serviceItems.find({ serviceId }).toArray();
  }

  async createServiceItem(insertServiceItem: InsertServiceItem): Promise<ServiceItem> {
    await this.initialize();
    const serviceItem: ServiceItem = { ...insertServiceItem };
    await this.serviceItems.insertOne(serviceItem);
    return serviceItem;
  }

  async updateServiceItem(id: string, updateData: Partial<InsertServiceItem>): Promise<ServiceItem | undefined> {
    await this.initialize();
    const result = await this.serviceItems.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteServiceItem(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.serviceItems.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Rental methods
  async getRentals(): Promise<Rental[]> {
    await this.initialize();
    return await this.rentals.find().toArray();
  }

  async getRental(id: string): Promise<Rental | undefined> {
    await this.initialize();
    const rental = await this.rentals.findOne({ id });
    return rental || undefined;
  }

  async getRentalsByCustomer(customerId: number): Promise<Rental[]> {
    await this.initialize();
    return await this.rentals.find({ customerId }).toArray();
  }

  async getRentalsByService(serviceId: string): Promise<Rental[]> {
    await this.initialize();
    return await this.rentals.find({ serviceId }).toArray();
  }

  async createRental(insertRental: InsertRental): Promise<Rental> {
    await this.initialize();
    const now = new Date().toISOString();
    const rental: Rental = { 
      ...insertRental,
      createdAt: now,
      updatedAt: now
    };
    await this.rentals.insertOne(rental);
    return rental;
  }

  async updateRental(id: string, updateData: Partial<InsertRental>): Promise<Rental | undefined> {
    await this.initialize();
    const result = await this.rentals.findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteRental(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.rentals.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Rental Timeline methods
  async getRentalTimeline(customerId: number): Promise<RentalTimeline[]> {
    await this.initialize();
    return await this.rentalTimeline.find({ customerId }).sort({ createdAt: -1 }).toArray();
  }

  async createRentalTimelineEntry(insertEntry: InsertRentalTimeline): Promise<RentalTimeline> {
    await this.initialize();
    const now = new Date().toISOString();
    const entry: RentalTimeline = { 
      ...insertEntry,
      createdAt: now
    };
    await this.rentalTimeline.insertOne(entry);
    return entry;
  }

  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    await this.initialize();
    return await this.vendors.find({}).toArray();
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    await this.initialize();
    console.log("Looking for vendor with id:", id);
    const vendor = await this.vendors.findOne({ id });
    console.log("Found vendor:", vendor);
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    await this.initialize();
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const vendor: Vendor = { 
      ...insertVendor,
      id,
      createdAt: now,
      updatedAt: now
    };
    console.log("Creating vendor with ID:", id);
    await this.vendors.insertOne(vendor);
    return vendor;
  }

  async updateVendor(id: string, updateData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    await this.initialize();
    const result = await this.vendors.findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteVendor(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.vendors.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    await this.initialize();
    return await this.purchaseOrders.find({}).toArray();
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    await this.initialize();
    const order = await this.purchaseOrders.findOne({ id });
    return order || undefined;
  }

  async createPurchaseOrder(insertOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    await this.initialize();
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const order: PurchaseOrder = { 
      ...insertOrder,
      id,
      createdAt: now,
      updatedAt: now
    };
    console.log("Creating purchase order with ID:", id);
    await this.purchaseOrders.insertOne(order);
    return order;
  }

  async updatePurchaseOrder(id: string, updateData: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    await this.initialize();
    const result = await this.purchaseOrders.findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deletePurchaseOrder(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.purchaseOrders.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Purchase Order Item methods
  async getPurchaseOrderItems(): Promise<PurchaseOrderItem[]> {
    await this.initialize();
    return await this.purchaseOrderItems.find({}).toArray();
  }

  async getPurchaseOrderItem(id: string): Promise<PurchaseOrderItem | undefined> {
    await this.initialize();
    const item = await this.purchaseOrderItems.findOne({ id });
    return item || undefined;
  }

  async getPurchaseOrderItemsByOrder(orderId: string): Promise<PurchaseOrderItem[]> {
    await this.initialize();
    console.log("Looking for purchase order items with orderId:", orderId);
    const items = await this.purchaseOrderItems.find({ purchaseOrderId: orderId }).toArray();
    console.log("Found purchase order items:", items);
    return items;
  }

  async createPurchaseOrderItem(insertItem: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    await this.initialize();
    const now = new Date().toISOString();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const item: PurchaseOrderItem = { 
      ...insertItem,
      id,
      createdAt: now
    };
    console.log("Creating purchase order item with ID:", id);
    await this.purchaseOrderItems.insertOne(item);
    return item;
  }

  async updatePurchaseOrderItem(id: string, updateData: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    await this.initialize();
    const result = await this.purchaseOrderItems.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deletePurchaseOrderItem(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.purchaseOrderItems.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Sell Order methods
  async getSellOrders(): Promise<SellOrder[]> {
    await this.initialize();
    return await this.sellOrders.find({}).toArray();
  }

  async getSellOrder(id: string): Promise<SellOrder | undefined> {
    await this.initialize();
    const order = await this.sellOrders.findOne({ id });
    return order || undefined;
  }

  async createSellOrder(insertOrder: InsertSellOrder): Promise<SellOrder> {
    await this.initialize();
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const order: SellOrder = { 
      ...insertOrder,
      id,
      createdAt: now,
      updatedAt: now
    };
    console.log("Creating sell order with ID:", id);
    await this.sellOrders.insertOne(order);
    return order;
  }

  async updateSellOrder(id: string, updateData: Partial<InsertSellOrder>): Promise<SellOrder | undefined> {
    await this.initialize();
    const result = await this.sellOrders.findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteSellOrder(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.sellOrders.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Sell Order Item methods
  async getSellOrderItems(): Promise<SellOrderItem[]> {
    await this.initialize();
    return await this.sellOrderItems.find({}).toArray();
  }

  async getSellOrderItem(id: string): Promise<SellOrderItem | undefined> {
    await this.initialize();
    const item = await this.sellOrderItems.findOne({ id });
    return item || undefined;
  }

  async getSellOrderItemsByOrder(orderId: string): Promise<SellOrderItem[]> {
    await this.initialize();
    console.log("Looking for sell order items with orderId:", orderId);
    const items = await this.sellOrderItems.find({ sellOrderId: orderId }).toArray();
    console.log("Found sell order items:", items);
    return items;
  }

  async createSellOrderItem(insertItem: InsertSellOrderItem): Promise<SellOrderItem> {
    await this.initialize();
    const now = new Date().toISOString();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const item: SellOrderItem = { 
      ...insertItem,
      id,
      createdAt: now
    };
    console.log("Creating sell order item with ID:", id);
    await this.sellOrderItems.insertOne(item);
    return item;
  }

  async updateSellOrderItem(id: string, updateData: Partial<InsertSellOrderItem>): Promise<SellOrderItem | undefined> {
    await this.initialize();
    const result = await this.sellOrderItems.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteSellOrderItem(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.sellOrderItems.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Billing System Implementation
  // Invoice methods
  async getInvoices(): Promise<Invoice[]> {
    await this.initialize();
    return await this.invoices.find({}).toArray();
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    await this.initialize();
    const invoice = await this.invoices.findOne({ id });
    return invoice || undefined;
  }

  async getInvoicesByCustomer(customerId: number): Promise<Invoice[]> {
    await this.initialize();
    return await this.invoices.find({ customerId }).toArray();
  }

  async getInvoicesByStatus(status: string): Promise<Invoice[]> {
    await this.initialize();
    return await this.invoices.find({ status }).toArray();
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    await this.initialize();
    const now = new Date().toISOString();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const invoice: Invoice = { 
      ...insertInvoice,
      id,
      createdAt: now,
      updatedAt: now
    };
    await this.invoices.insertOne(invoice);
    return invoice;
  }

  async updateInvoice(id: string, updateData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    await this.initialize();
    const result = await this.invoices.findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.invoices.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Invoice Item methods
  async getInvoiceItems(): Promise<InvoiceItem[]> {
    await this.initialize();
    return await this.invoiceItems.find({}).toArray();
  }

  async getInvoiceItem(id: string): Promise<InvoiceItem | undefined> {
    await this.initialize();
    const item = await this.invoiceItems.findOne({ id });
    return item || undefined;
  }

  async getInvoiceItemsByInvoice(invoiceId: string): Promise<InvoiceItem[]> {
    await this.initialize();
    return await this.invoiceItems.find({ invoiceId }).toArray();
  }

  async createInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    await this.initialize();
    const now = new Date().toISOString();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const item: InvoiceItem = { 
      ...insertItem,
      id,
      createdAt: now
    };
    await this.invoiceItems.insertOne(item);
    return item;
  }

  async updateInvoiceItem(id: string, updateData: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    await this.initialize();
    const result = await this.invoiceItems.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteInvoiceItem(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.invoiceItems.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Payment methods
  async getPayments(): Promise<Payment[]> {
    await this.initialize();
    return await this.payments.find({}).toArray();
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    await this.initialize();
    const payment = await this.payments.findOne({ id });
    return payment || undefined;
  }

  async getPaymentsByCustomer(customerId: number): Promise<Payment[]> {
    await this.initialize();
    return await this.payments.find({ customerId }).toArray();
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    await this.initialize();
    return await this.payments.find({ invoiceId }).toArray();
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    await this.initialize();
    const now = new Date().toISOString();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const payment: Payment = { 
      ...insertPayment,
      id,
      createdAt: now,
      updatedAt: now
    };
    await this.payments.insertOne(payment);
    return payment;
  }

  async updatePayment(id: string, updateData: Partial<InsertPayment>): Promise<Payment | undefined> {
    await this.initialize();
    const result = await this.payments.findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deletePayment(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.payments.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Recurring Invoice Schedule methods
  async getRecurringInvoiceSchedules(): Promise<RecurringInvoiceSchedule[]> {
    await this.initialize();
    return await this.recurringInvoiceSchedules.find({}).toArray();
  }

  async getRecurringInvoiceSchedule(id: string): Promise<RecurringInvoiceSchedule | undefined> {
    await this.initialize();
    const schedule = await this.recurringInvoiceSchedules.findOne({ id });
    return schedule || undefined;
  }

  async getRecurringInvoiceSchedulesByCustomer(customerId: number): Promise<RecurringInvoiceSchedule[]> {
    await this.initialize();
    return await this.recurringInvoiceSchedules.find({ customerId }).toArray();
  }

  async getActiveRecurringInvoiceSchedules(): Promise<RecurringInvoiceSchedule[]> {
    await this.initialize();
    return await this.recurringInvoiceSchedules.find({ isActive: true }).toArray();
  }

  async createRecurringInvoiceSchedule(insertSchedule: InsertRecurringInvoiceSchedule): Promise<RecurringInvoiceSchedule> {
    await this.initialize();
    const now = new Date().toISOString();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const schedule: RecurringInvoiceSchedule = { 
      ...insertSchedule,
      id,
      createdAt: now,
      updatedAt: now
    };
    await this.recurringInvoiceSchedules.insertOne(schedule);
    return schedule;
  }

  async updateRecurringInvoiceSchedule(id: string, updateData: Partial<InsertRecurringInvoiceSchedule>): Promise<RecurringInvoiceSchedule | undefined> {
    await this.initialize();
    const result = await this.recurringInvoiceSchedules.findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteRecurringInvoiceSchedule(id: string): Promise<boolean> {
    await this.initialize();
    const result = await this.recurringInvoiceSchedules.deleteOne({ id });
    return result.deletedCount === 1;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<string, Category>;
  private items: Map<string, Item>;
  private units: Map<string, Unit>;
  private inventory: Map<number, Inventory>;
  private customers: Map<number, Customer>;
  private services: Map<string, Service>;
  private serviceItems: Map<string, ServiceItem>;
  private rentals: Map<string, Rental>;
  private rentalTimeline: Map<string, RentalTimeline>;
  private vendors: Map<string, Vendor>;
  private purchaseOrders: Map<string, PurchaseOrder>;
  private purchaseOrderItems: Map<string, PurchaseOrderItem>;
  private sellOrders: Map<string, SellOrder>;
  private sellOrderItems: Map<string, SellOrderItem>;
  private currentUserId: number;
  private currentInventoryId: number;
  private currentCustomerId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.items = new Map();
    this.units = new Map();
    this.inventory = new Map();
    this.customers = new Map();
    this.services = new Map();
    this.serviceItems = new Map();
    this.rentals = new Map();
    this.rentalTimeline = new Map();
    this.vendors = new Map();
    this.purchaseOrders = new Map();
    this.purchaseOrderItems = new Map();
    this.sellOrders = new Map();
    this.sellOrderItems = new Map();
    this.currentUserId = 1;
    this.currentInventoryId = 1;
    this.currentCustomerId = 1;
  }

  async initialize(): Promise<void> {
    // No initialization needed for memory storage
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = { ...insertCategory };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    
    const updated: Category = { ...existing, ...updateData };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Item methods
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: string): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async getItemsByCategory(categoryId: string): Promise<Item[]> {
    return Array.from(this.items.values()).filter(item => item.categoryId === categoryId);
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const item: Item = { ...insertItem };
    this.items.set(item.id, item);
    return item;
  }

  async updateItem(id: string, updateData: Partial<InsertItem>): Promise<Item | undefined> {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    
    const updated: Item = { ...existing, ...updateData };
    this.items.set(id, updated);
    return updated;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  // Unit methods
  async getUnits(): Promise<Unit[]> {
    return Array.from(this.units.values());
  }

  async getUnit(id: string): Promise<Unit | undefined> {
    return this.units.get(id);
  }

  async getUnitsByItem(itemId: string): Promise<Unit[]> {
    return Array.from(this.units.values()).filter(unit => unit.itemId === itemId);
  }

  async getUnitBySerialNumber(serialNumber: string): Promise<Unit | undefined> {
    return Array.from(this.units.values()).find(unit => unit.serialNumber === serialNumber);
  }

  async createUnit(insertUnit: InsertUnit): Promise<Unit> {
    const unit: Unit = { ...insertUnit };
    this.units.set(unit.id, unit);
    return unit;
  }

  async updateUnit(id: string, updateData: Partial<InsertUnit>): Promise<Unit | undefined> {
    const existing = this.units.get(id);
    if (!existing) return undefined;
    
    const updated: Unit = { ...existing, ...updateData };
    this.units.set(id, updated);
    return updated;
  }

  async deleteUnit(id: string): Promise<boolean> {
    return this.units.delete(id);
  }

  // Legacy inventory methods
  async getInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const id = this.currentInventoryId++;
    const item: Inventory = { ...insertItem, id };
    this.inventory.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const existing = this.inventory.get(id);
    if (!existing) return undefined;
    
    const updated: Inventory = { ...existing, ...updateData };
    this.inventory.set(id, updated);
    return updated;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventory.delete(id);
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existing = this.customers.get(id);
    if (!existing) return undefined;
    
    const updated: Customer = { ...existing, ...updateData };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    // Delete customer record
    const customerDeleted = this.customers.delete(id);
    
    // Delete all timeline entries for this customer
    const timelineEntries = Array.from(this.rentalTimeline.values()).filter(entry => entry.customerId === id);
    timelineEntries.forEach(entry => this.rentalTimeline.delete(entry.id));
    
    // Delete all services for this customer
    const customerServices = Array.from(this.services.values()).filter(service => service.customerId === id);
    customerServices.forEach(service => this.services.delete(service.id));
    
    // Delete all service items for services that belonged to this customer
    customerServices.forEach(service => {
      const serviceItems = Array.from(this.serviceItems.values()).filter(item => item.serviceId === service.id);
      serviceItems.forEach(item => this.serviceItems.delete(item.id));
    });
    
    // Delete all rentals for this customer
    const customerRentals = Array.from(this.rentals.values()).filter(rental => rental.customerId === id);
    customerRentals.forEach(rental => this.rentals.delete(rental.id));
    
    console.log(`Deleted customer ${id} and all associated data`);
    return customerDeleted;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByCustomer(customerId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.customerId === customerId);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const service: Service = { ...insertService };
    this.services.set(service.id, service);
    return service;
  }

  async updateService(id: string, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const existing = this.services.get(id);
    if (!existing) return undefined;
    
    const updated: Service = { ...existing, ...updateData };
    this.services.set(id, updated);
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    return this.services.delete(id);
  }

  // Service Item methods
  async getServiceItems(): Promise<ServiceItem[]> {
    return Array.from(this.serviceItems.values());
  }

  async getServiceItem(id: string): Promise<ServiceItem | undefined> {
    return this.serviceItems.get(id);
  }

  async getServiceItemsByService(serviceId: string): Promise<ServiceItem[]> {
    return Array.from(this.serviceItems.values()).filter(item => item.serviceId === serviceId);
  }

  async createServiceItem(insertServiceItem: InsertServiceItem): Promise<ServiceItem> {
    const serviceItem: ServiceItem = { ...insertServiceItem };
    this.serviceItems.set(serviceItem.id, serviceItem);
    return serviceItem;
  }

  async updateServiceItem(id: string, updateData: Partial<InsertServiceItem>): Promise<ServiceItem | undefined> {
    const existing = this.serviceItems.get(id);
    if (!existing) return undefined;
    
    const updated: ServiceItem = { ...existing, ...updateData };
    this.serviceItems.set(id, updated);
    return updated;
  }

  async deleteServiceItem(id: string): Promise<boolean> {
    return this.serviceItems.delete(id);
  }

  // Rental methods
  async getRentals(): Promise<Rental[]> {
    return Array.from(this.rentals.values());
  }

  async getRental(id: string): Promise<Rental | undefined> {
    return this.rentals.get(id);
  }

  async getRentalsByCustomer(customerId: number): Promise<Rental[]> {
    return Array.from(this.rentals.values()).filter(rental => rental.customerId === customerId);
  }

  async getRentalsByService(serviceId: string): Promise<Rental[]> {
    return Array.from(this.rentals.values()).filter(rental => rental.serviceId === serviceId);
  }

  async createRental(insertRental: InsertRental): Promise<Rental> {
    const rental: Rental = { ...insertRental };
    this.rentals.set(rental.id, rental);
    return rental;
  }

  async updateRental(id: string, updateData: Partial<InsertRental>): Promise<Rental | undefined> {
    const existing = this.rentals.get(id);
    if (!existing) return undefined;
    
    const updated: Rental = { ...existing, ...updateData };
    this.rentals.set(id, updated);
    return updated;
  }

  async deleteRental(id: string): Promise<boolean> {
    return this.rentals.delete(id);
  }

  // Rental Timeline methods
  async getRentalTimeline(customerId: number): Promise<RentalTimeline[]> {
    return Array.from(this.rentalTimeline.values())
      .filter(entry => entry.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  async createRentalTimelineEntry(insertEntry: InsertRentalTimeline): Promise<RentalTimeline> {
    const entry: RentalTimeline = { 
      ...insertEntry,
      createdAt: new Date().toISOString()
    };
    this.rentalTimeline.set(entry.id, entry);
    return entry;
  }

  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const vendor: Vendor = { 
      ...insertVendor,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.vendors.set(vendor.id, vendor);
    return vendor;
  }

  async updateVendor(id: string, updateData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const existing = this.vendors.get(id);
    if (!existing) return undefined;
    
    const updated: Vendor = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
    this.vendors.set(id, updated);
    return updated;
  }

  async deleteVendor(id: string): Promise<boolean> {
    return this.vendors.delete(id);
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async createPurchaseOrder(insertOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const now = new Date().toISOString();
    const order: PurchaseOrder = { 
      ...insertOrder,
      createdAt: now,
      updatedAt: now
    };
    this.purchaseOrders.set(order.id, order);
    return order;
  }

  async updatePurchaseOrder(id: string, updateData: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const existing = this.purchaseOrders.get(id);
    if (!existing) return undefined;
    
    const updated: PurchaseOrder = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
    this.purchaseOrders.set(id, updated);
    return updated;
  }

  async deletePurchaseOrder(id: string): Promise<boolean> {
    return this.purchaseOrders.delete(id);
  }

  // Purchase Order Item methods
  async getPurchaseOrderItems(): Promise<PurchaseOrderItem[]> {
    return Array.from(this.purchaseOrderItems.values());
  }

  async getPurchaseOrderItem(id: string): Promise<PurchaseOrderItem | undefined> {
    return this.purchaseOrderItems.get(id);
  }

  async getPurchaseOrderItemsByOrder(orderId: string): Promise<PurchaseOrderItem[]> {
    return Array.from(this.purchaseOrderItems.values()).filter(
      item => item.purchaseOrderId === orderId
    );
  }

  async createPurchaseOrderItem(insertItem: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const now = new Date().toISOString();
    const item: PurchaseOrderItem = { 
      ...insertItem,
      createdAt: now
    };
    this.purchaseOrderItems.set(item.id, item);
    return item;
  }

  async updatePurchaseOrderItem(id: string, updateData: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    const existing = this.purchaseOrderItems.get(id);
    if (!existing) return undefined;
    
    const updated: PurchaseOrderItem = { ...existing, ...updateData };
    this.purchaseOrderItems.set(id, updated);
    return updated;
  }

  async deletePurchaseOrderItem(id: string): Promise<boolean> {
    return this.purchaseOrderItems.delete(id);
  }

  // Sell Order methods
  async getSellOrders(): Promise<SellOrder[]> {
    return Array.from(this.sellOrders.values());
  }

  async getSellOrder(id: string): Promise<SellOrder | undefined> {
    return this.sellOrders.get(id);
  }

  async createSellOrder(insertOrder: InsertSellOrder): Promise<SellOrder> {
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const order: SellOrder = { 
      ...insertOrder,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.sellOrders.set(order.id, order);
    return order;
  }

  async updateSellOrder(id: string, updateData: Partial<InsertSellOrder>): Promise<SellOrder | undefined> {
    const existing = this.sellOrders.get(id);
    if (!existing) return undefined;
    
    const updated: SellOrder = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
    this.sellOrders.set(id, updated);
    return updated;
  }

  async deleteSellOrder(id: string): Promise<boolean> {
    return this.sellOrders.delete(id);
  }

  // Sell Order Item methods
  async getSellOrderItems(): Promise<SellOrderItem[]> {
    return Array.from(this.sellOrderItems.values());
  }

  async getSellOrderItem(id: string): Promise<SellOrderItem | undefined> {
    return this.sellOrderItems.get(id);
  }

  async getSellOrderItemsByOrder(orderId: string): Promise<SellOrderItem[]> {
    return Array.from(this.sellOrderItems.values()).filter(
      item => item.sellOrderId === orderId
    );
  }

  async createSellOrderItem(insertItem: InsertSellOrderItem): Promise<SellOrderItem> {
    const now = new Date().toISOString();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const item: SellOrderItem = { 
      ...insertItem,
      id,
      createdAt: now
    };
    this.sellOrderItems.set(item.id, item);
    return item;
  }

  async updateSellOrderItem(id: string, updateData: Partial<InsertSellOrderItem>): Promise<SellOrderItem | undefined> {
    const existing = this.sellOrderItems.get(id);
    if (!existing) return undefined;
    
    const updated: SellOrderItem = { ...existing, ...updateData };
    this.sellOrderItems.set(id, updated);
    return updated;
  }

  async deleteSellOrderItem(id: string): Promise<boolean> {
    return this.sellOrderItems.delete(id);
  }
}

// Use MongoDB storage if connection string is available, otherwise fallback to memory
export const storage = process.env.MANGODB_URI || process.env.MONGODB_URI 
  ? new MongoStorage() 
  : new MemStorage();
