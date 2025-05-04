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
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = insertInstagramAccountSchema.parse(req.body);
      
      // Create instagrapi client and attempt login
      const client = new InstagrapiClient();
      const result = await client.login(data.username, data.password);
      
      if (!result.success) {
        return res.status(401).json({ message: result.error || "Authentication failed" });
      }
      
      // Store the account in storage
      const account = await storage.createInstagramAccount({
        ...data,
        isActive: true,
        profilePic: result.profilePic,
        sessionData: result.sessionData
      });
      
      res.status(200).json({ success: true, account });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Authentication failed" });
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
