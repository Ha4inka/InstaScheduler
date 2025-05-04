import fs from "fs";
import path from "path";
import crypto from "crypto";

interface LoginResult {
  success: boolean;
  error?: string;
  profilePic?: string;
  sessionData?: Record<string, any>;
}

interface PostResult {
  success: boolean;
  mediaId?: string;
  error?: string;
}

// Demo account info - in a real application, this would be connected to an actual Instagram API
const DEMO_ACCOUNTS = new Map<string, { 
  password: string,
  profilePic: string,
  userId: string 
}>();

export class InstagrapiClient {
  constructor() {
    // Create the uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Set up demo accounts for testing
    // In a real app, you would authenticate against Instagram
    DEMO_ACCOUNTS.set("demo", {
      password: "password123",
      profilePic: "https://via.placeholder.com/150",
      userId: "12345678"
    });
  }

  async login(username: string, password: string): Promise<LoginResult> {
    try {
      // For demo purposes, we're simulating authentication
      // In a real application, you would call the Instagram API
      console.log(`Attempting login for user: ${username}`);
      
      // Check demo accounts
      const account = DEMO_ACCOUNTS.get(username);
      
      if (account && account.password === password) {
        const sessionId = crypto.randomBytes(16).toString("hex");
        
        // Simulate successful login
        return {
          success: true,
          profilePic: account.profilePic,
          sessionData: {
            sessionId,
            userId: account.userId,
            username: username
          }
        };
      }
      
      // For demo purposes, let's also accept any credentials with basic validation
      if (username.length > 2 && password.length > 2) {
        const sessionId = crypto.randomBytes(16).toString("hex");
        
        // Add this user to our demo accounts
        const newProfilePic = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
        const newUserId = crypto.randomBytes(8).toString("hex");
        
        DEMO_ACCOUNTS.set(username, {
          password,
          profilePic: newProfilePic,
          userId: newUserId
        });
        
        return {
          success: true,
          profilePic: newProfilePic,
          sessionData: {
            sessionId,
            userId: newUserId,
            username: username
          }
        };
      }
      
      return {
        success: false,
        error: "Invalid credentials - username and password must be at least 3 characters"
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during login"
      };
    }
  }

  async createPost(
    sessionData: Record<string, any>,
    mediaPath: string, 
    caption: string, 
    options: {
      firstComment?: string;
      location?: string;
      hideLikeCount?: boolean;
      taggedUsers?: string[];
    } = {}
  ): Promise<PostResult> {
    try {
      console.log(`Creating post for user: ${sessionData.username || 'unknown'}`);
      console.log(`Media path: ${mediaPath}`);
      
      // Check if the media file exists
      if (!fs.existsSync(mediaPath)) {
        return {
          success: false,
          error: `Media file not found at ${mediaPath}`
        };
      }
      
      // In a real app, this would upload to Instagram
      // For demo purposes, we'll simulate a successful post
      const mediaId = crypto.randomBytes(12).toString("hex");
      
      return {
        success: true,
        mediaId
      };
    } catch (error) {
      console.error("Post creation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during post creation"
      };
    }
  }

  async createStory(
    sessionData: Record<string, any>,
    mediaPath: string, 
    caption?: string
  ): Promise<PostResult> {
    try {
      console.log(`Creating story for user: ${sessionData.username || 'unknown'}`);
      console.log(`Media path: ${mediaPath}`);
      
      // Check if the media file exists
      if (!fs.existsSync(mediaPath)) {
        return {
          success: false,
          error: `Media file not found at ${mediaPath}`
        };
      }
      
      // In a real app, this would upload to Instagram
      // For demo purposes, we'll simulate a successful story
      const mediaId = crypto.randomBytes(12).toString("hex");
      
      return {
        success: true,
        mediaId
      };
    } catch (error) {
      console.error("Story creation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during story creation"
      };
    }
  }
}
