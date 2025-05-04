import { 
  InsertInstagramAccount, 
  InstagramAccount, 
  ScheduledContent, 
  InsertScheduledContent 
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private instagramAccounts: Map<number, InstagramAccount>;
  private scheduledContent: Map<number, ScheduledContent>;
  private accountId: number;
  private contentId: number;

  constructor() {
    this.instagramAccounts = new Map();
    this.scheduledContent = new Map();
    this.accountId = 1;
    this.contentId = 1;
  }

  // Instagram Account Operations
  async createInstagramAccount(account: InsertInstagramAccount): Promise<InstagramAccount> {
    const id = this.accountId++;
    const newAccount: InstagramAccount = { 
      ...account, 
      id, 
      createdAt: new Date(),
      // Ensure null values for optional fields
      isActive: account.isActive === undefined ? true : account.isActive,
      profilePic: account.profilePic || null,
      sessionData: account.sessionData || null
    };
    this.instagramAccounts.set(id, newAccount);
    return newAccount;
  }

  async getInstagramAccount(id: number): Promise<InstagramAccount | undefined> {
    return this.instagramAccounts.get(id);
  }

  async getInstagramAccountByUsername(username: string): Promise<InstagramAccount | undefined> {
    return Array.from(this.instagramAccounts.values()).find(
      (account) => account.username === username
    );
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
    
    // Ensure the content has proper types and null values for optional fields
    const newContent: ScheduledContent = { 
      ...content, 
      id, 
      createdAt: new Date(),
      // Set default status if not provided
      status: content.status || "scheduled",
      // Ensure null values for optional fields
      firstComment: content.firstComment || null,
      location: content.location || null,
      hideLikeCount: content.hideLikeCount === undefined ? false : content.hideLikeCount,
      taggedUsers: Array.isArray(content.taggedUsers) ? content.taggedUsers : null
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
      ...data,
      // Ensure null values for optional fields if they're undefined
      firstComment: data.firstComment !== undefined ? data.firstComment : content.firstComment,
      location: data.location !== undefined ? data.location : content.location,
      hideLikeCount: data.hideLikeCount !== undefined ? data.hideLikeCount : content.hideLikeCount,
      taggedUsers: data.taggedUsers !== undefined ? 
        (Array.isArray(data.taggedUsers) ? data.taggedUsers : null) : 
        content.taggedUsers
    };
    
    this.scheduledContent.set(id, updatedContent);
    return updatedContent;
  }

  async deleteScheduledContent(id: number): Promise<boolean> {
    return this.scheduledContent.delete(id);
  }
}

export const storage = new MemStorage();
