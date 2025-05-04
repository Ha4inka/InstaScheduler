import {
  InstagramAccount,
  InsertInstagramAccount,
  ScheduledContent,
  InsertScheduledContent,
  instagramAccounts,
  scheduledContent
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from "pg";
const { Pool } = pg;

export interface IStorage {
  // Instagram Account Operations
  createInstagramAccount(account: InsertInstagramAccount): Promise<InstagramAccount>;
  getInstagramAccount(id: number): Promise<InstagramAccount | undefined>;
  getInstagramAccountByUsername(username: string): Promise<InstagramAccount | undefined>;
  getAllInstagramAccounts(): Promise<InstagramAccount[]>;
  updateInstagramAccount(id: number, data: Partial<InsertInstagramAccount>): Promise<InstagramAccount | undefined>;
  deleteInstagramAccount(id: number): Promise<boolean>;
  
  // Scheduled Content Operations
  createScheduledContent(content: InsertScheduledContent): Promise<ScheduledContent>;
  getScheduledContent(id: number): Promise<ScheduledContent | undefined>;
  getAllScheduledContent(): Promise<ScheduledContent[]>;
  updateScheduledContent(id: number, data: Partial<InsertScheduledContent>): Promise<ScheduledContent | undefined>;
  deleteScheduledContent(id: number): Promise<boolean>;
  
  // Session support
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresStore = connectPg(session);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }
  
  // Instagram Account Operations
  async createInstagramAccount(account: InsertInstagramAccount): Promise<InstagramAccount> {
    const [newAccount] = await db
      .insert(instagramAccounts)
      .values(account)
      .returning();
    
    return newAccount;
  }
  
  async getInstagramAccount(id: number): Promise<InstagramAccount | undefined> {
    const [account] = await db
      .select()
      .from(instagramAccounts)
      .where(eq(instagramAccounts.id, id));
    
    return account;
  }
  
  async getInstagramAccountByUsername(username: string): Promise<InstagramAccount | undefined> {
    const [account] = await db
      .select()
      .from(instagramAccounts)
      .where(eq(instagramAccounts.username, username));
    
    return account;
  }
  
  async getAllInstagramAccounts(): Promise<InstagramAccount[]> {
    return await db
      .select()
      .from(instagramAccounts);
  }
  
  async updateInstagramAccount(id: number, data: Partial<InsertInstagramAccount>): Promise<InstagramAccount | undefined> {
    const [updatedAccount] = await db
      .update(instagramAccounts)
      .set(data)
      .where(eq(instagramAccounts.id, id))
      .returning();
    
    return updatedAccount;
  }
  
  async deleteInstagramAccount(id: number): Promise<boolean> {
    const result = await db
      .delete(instagramAccounts)
      .where(eq(instagramAccounts.id, id));
    
    return true; // PostgreSQL doesn't return boolean for delete operations
  }
  
  // Scheduled Content Operations
  async createScheduledContent(content: InsertScheduledContent): Promise<ScheduledContent> {
    // Insert with null handling built into Drizzle
    const [newContent] = await db
      .insert(scheduledContent)
      .values(content)
      .returning();
    
    return newContent;
  }
  
  async getScheduledContent(id: number): Promise<ScheduledContent | undefined> {
    const [content] = await db
      .select()
      .from(scheduledContent)
      .where(eq(scheduledContent.id, id));
    
    return content;
  }
  
  async getAllScheduledContent(): Promise<ScheduledContent[]> {
    return await db
      .select()
      .from(scheduledContent);
  }
  
  async updateScheduledContent(id: number, data: Partial<InsertScheduledContent>): Promise<ScheduledContent | undefined> {
    // Update directly without additional processing
    // Drizzle ORM handles the null values correctly
    const [updatedContent] = await db
      .update(scheduledContent)
      .set(data)
      .where(eq(scheduledContent.id, id))
      .returning();
    
    return updatedContent;
  }
  
  async deleteScheduledContent(id: number): Promise<boolean> {
    await db
      .delete(scheduledContent)
      .where(eq(scheduledContent.id, id));
    
    return true;
  }
}

// Memory storage implementation for fallback
export class MemStorage implements IStorage {
  private instagramAccounts: Map<number, InstagramAccount>;
  private scheduledContent: Map<number, ScheduledContent>;
  private accountId: number;
  private contentId: number;
  sessionStore: session.Store;
  
  constructor() {
    this.instagramAccounts = new Map();
    this.scheduledContent = new Map();
    this.accountId = 1;
    this.contentId = 1;
    
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  // Instagram Account Operations
  async createInstagramAccount(account: InsertInstagramAccount): Promise<InstagramAccount> {
    const id = this.accountId++;
    
    // Create a proper InstagramAccount object with all required fields
    const newAccount: InstagramAccount = { 
      ...account, 
      id, 
      createdAt: new Date(),
      isActive: account.isActive ?? true,
      profilePic: account.profilePic ?? null,
      sessionData: account.sessionData ?? null
    };
    
    this.instagramAccounts.set(id, newAccount);
    return newAccount;
  }
  
  async getInstagramAccount(id: number): Promise<InstagramAccount | undefined> {
    return this.instagramAccounts.get(id);
  }
  
  async getInstagramAccountByUsername(username: string): Promise<InstagramAccount | undefined> {
    // Use Array.from to avoid downlevelIteration errors
    const accounts = Array.from(this.instagramAccounts.values());
    return accounts.find(account => account.username === username);
  }
  
  async getAllInstagramAccounts(): Promise<InstagramAccount[]> {
    return Array.from(this.instagramAccounts.values());
  }
  
  async updateInstagramAccount(id: number, data: Partial<InsertInstagramAccount>): Promise<InstagramAccount | undefined> {
    const account = this.instagramAccounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...data };
    this.instagramAccounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteInstagramAccount(id: number): Promise<boolean> {
    return this.instagramAccounts.delete(id);
  }
  
  // Scheduled Content Operations
  async createScheduledContent(content: InsertScheduledContent): Promise<ScheduledContent> {
    const id = this.contentId++;
    
    // Create a proper ScheduledContent object with all required fields
    const newContent: ScheduledContent = { 
      // Required fields
      id, 
      createdAt: new Date(),
      accountId: content.accountId,
      type: content.type,
      caption: content.caption,
      mediaUrl: content.mediaUrl,
      scheduledDate: content.scheduledDate,
      status: content.status || "scheduled",
      
      // Optional fields with proper null handling
      firstComment: content.firstComment ?? null,
      location: content.location ?? null,
      hideLikeCount: content.hideLikeCount ?? false,
      taggedUsers: content.taggedUsers ?? null
    };
    
    this.scheduledContent.set(id, newContent);
    return newContent;
  }
  
  async getScheduledContent(id: number): Promise<ScheduledContent | undefined> {
    return this.scheduledContent.get(id);
  }
  
  async getAllScheduledContent(): Promise<ScheduledContent[]> {
    return Array.from(this.scheduledContent.values());
  }
  
  async updateScheduledContent(id: number, data: Partial<InsertScheduledContent>): Promise<ScheduledContent | undefined> {
    const content = this.scheduledContent.get(id);
    if (!content) return undefined;
    
    // Create the updated content with proper null handling
    const updatedContent: ScheduledContent = { 
      ...content,
      // Update specific fields with proper type handling
      ...(data.accountId !== undefined && { accountId: data.accountId }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.caption !== undefined && { caption: data.caption }),
      ...(data.mediaUrl !== undefined && { mediaUrl: data.mediaUrl }),
      ...(data.scheduledDate !== undefined && { scheduledDate: data.scheduledDate }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.firstComment !== undefined && { firstComment: data.firstComment }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.hideLikeCount !== undefined && { hideLikeCount: data.hideLikeCount }),
      ...(data.taggedUsers !== undefined && { taggedUsers: data.taggedUsers })
    };
    
    this.scheduledContent.set(id, updatedContent);
    return updatedContent;
  }
  
  async deleteScheduledContent(id: number): Promise<boolean> {
    return this.scheduledContent.delete(id);
  }
}

// Export the appropriate storage implementation
export const storage = new DatabaseStorage();