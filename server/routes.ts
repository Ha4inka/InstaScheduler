import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertInstagramAccountSchema, insertScheduledContentSchema } from "@shared/schema";
import { InstagrapiClient } from "./instagrapi";
import multer from "multer";
import fs from "fs";
import path from "path";
import { scheduler } from "./scheduler";

// Configure multer for media uploads
const upload = multer({ 
  dest: path.join(process.cwd(), "uploads"),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if account already exists
      const existingAccount = await storage.getInstagramAccountByUsername(username);
      
      if (existingAccount) {
        // For demo purposes, we're doing a simple password check
        // In a real app, you would compare hashed passwords
        if (existingAccount.password !== password) {
          return res.status(401).json({ message: "Invalid password" });
        }
        
        // Return the existing account
        res.status(200).json({ 
          success: true, 
          account: {
            id: existingAccount.id,
            username: existingAccount.username,
            isActive: existingAccount.isActive,
            profilePic: existingAccount.profilePic
          }
        });
        return;
      }
      
      // Account doesn't exist, use InstagrapiClient to login
      const client = new InstagrapiClient();
      const result = await client.login(username, password);
      
      if (!result.success) {
        return res.status(401).json({ message: result.error || "Authentication failed" });
      }
      
      // Store the new account in storage
      const account = await storage.createInstagramAccount({
        username,
        password,
        isActive: true,
        profilePic: result.profilePic,
        sessionData: result.sessionData
      });
      
      res.status(200).json({ 
        success: true, 
        account: {
          id: account.id,
          username: account.username,
          isActive: account.isActive,
          profilePic: account.profilePic
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  
  // Register route 
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if username already exists
      const existingAccount = await storage.getInstagramAccountByUsername(username);
      if (existingAccount) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Use InstagrapiClient to register and validate the account
      const client = new InstagrapiClient();
      const result = await client.login(username, password);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Registration failed" });
      }
      
      // Store the account in storage
      const account = await storage.createInstagramAccount({
        username,
        password,
        isActive: true,
        profilePic: result.profilePic,
        sessionData: result.sessionData
      });
      
      res.status(201).json({ 
        success: true, 
        account: {
          id: account.id,
          username: account.username,
          isActive: account.isActive,
          profilePic: account.profilePic
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Instagram accounts routes
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAllInstagramAccounts();
      res.json(accounts.map(account => ({
        id: account.id,
        username: account.username,
        isActive: account.isActive,
        profilePic: account.profilePic
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve accounts" });
    }
  });
  
  // Scheduled content routes
  app.get("/api/scheduled-content", async (req, res) => {
    try {
      const content = await storage.getAllScheduledContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve scheduled content" });
    }
  });
  
  // Create scheduled content
  app.post("/api/scheduled-content", upload.array("media", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      console.log("Uploaded files:", files);
      console.log("Request body:", req.body);
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No media files uploaded" });
      }
      
      // Parse form data
      const accountId = parseInt(req.body.accountId);
      const type = req.body.type;
      const caption = req.body.caption;
      const scheduledDate = new Date(req.body.scheduledDate);
      const firstComment = req.body.firstComment || undefined;
      const location = req.body.location || undefined;
      const hideLikeCount = req.body.hideLikeCount === "true";
      const taggedUsers = req.body.taggedUsers ? JSON.parse(req.body.taggedUsers) : undefined;
      
      // Validate account exists
      const account = await storage.getInstagramAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Instagram account not found" });
      }
      
      // Process media files (in a real app, you would upload these to a storage service)
      // For this example, we'll just use the first file path
      const mediaUrl = `/uploads/${files[0].filename}`;
      
      // Create scheduled content
      const content = await storage.createScheduledContent({
        accountId,
        type,
        caption,
        mediaUrl,
        scheduledDate,
        status: "scheduled",
        firstComment,
        location,
        hideLikeCount,
        taggedUsers
      });
      
      // Schedule the post
      scheduler.schedulePost(content);
      
      res.status(201).json(content);
    } catch (error) {
      console.error("Error creating scheduled content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create scheduled content" });
    }
  });
  
  // Serve uploaded media
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  
  const httpServer = createServer(app);
  return httpServer;
}
