import { users, type User, type InsertUser, type Inventory, type InsertInventory, type Customer, type InsertCustomer } from "@shared/schema";
import { MongoClient, Db, Collection } from 'mongodb';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Inventory methods
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
  
  initialize(): Promise<void>;
}

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db;
  private users: Collection<User>;
  private inventory: Collection<Inventory>;
  private customers: Collection<Customer>;
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
      this.inventory = this.db.collection<Inventory>('inventory');
      this.customers = this.db.collection<Customer>('customers');
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

  // Inventory methods
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
    
    const customer: Customer = { ...insertCustomer, id };
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inventory: Map<number, Inventory>;
  private customers: Map<number, Customer>;
  private currentUserId: number;
  private currentInventoryId: number;
  private currentCustomerId: number;

  constructor() {
    this.users = new Map();
    this.inventory = new Map();
    this.customers = new Map();
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

  // Inventory methods
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
}

// Use MongoDB storage if connection string is available, otherwise fallback to memory
export const storage = process.env.MANGODB_URI || process.env.MONGODB_URI 
  ? new MongoStorage() 
  : new MemStorage();
