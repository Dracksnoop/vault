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
  type InsertRentalTimeline
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
    const result = await this.customers.deleteOne({ id });
    return result.deletedCount === 1;
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
    return this.customers.delete(id);
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
}

// Use MongoDB storage if connection string is available, otherwise fallback to memory
export const storage = process.env.MANGODB_URI || process.env.MONGODB_URI 
  ? new MongoStorage() 
  : new MemStorage();
