import nodeSchedule, { Job as ScheduledTask } from "node-schedule";
import { storage } from "./storage.js";
import { ScheduledContent } from "../shared/schema.js";
import { InstagrapiClient } from "./instagrapi.js";
import path from "path";
import fs from "fs";

class ContentScheduler {
  private scheduledTasks: Map<number, ScheduledTask>;
  private instagrapiClient: InstagrapiClient;

  constructor() {
    this.scheduledTasks = new Map();
    this.instagrapiClient = new InstagrapiClient();
    this.init();
  }

  async init() {
    // Load all scheduled content and schedule them
    const content = await storage.getAllScheduledContent();
    content.forEach(item => {
      if (item.status === "scheduled") {
        this.schedulePost(item);
      }
    });
  }

  schedulePost(content: ScheduledContent) {
    // Don't schedule if it's already published or failed
    if (content.status !== "scheduled") {
      return;
    }

    // Skip if scheduled date is in the past
    const now = new Date();
    const scheduledDate = new Date(content.scheduledDate);
    if (scheduledDate < now) {
      console.warn(`Content ${content.id} scheduled date is in the past, marking as failed`);
      storage.updateScheduledContent(content.id, { status: "failed" });
      return;
    }

    // Cancel any existing task for this content
    if (this.scheduledTasks.has(content.id)) {
      this.scheduledTasks.get(content.id)?.cancel();
    }

    // Schedule the task
    const task = nodeSchedule.scheduleJob(scheduledDate, async () => {
      try {
        await this.publishContent(content);
      } catch (error) {
        console.error(`Error publishing content ${content.id}:`, error);
        await storage.updateScheduledContent(content.id, { status: "failed" });
      }
    });

    this.scheduledTasks.set(content.id, task);
    console.log(`Scheduled content ${content.id} for ${scheduledDate.toISOString()}`);
  }

  cancelScheduledPost(contentId: number) {
    if (this.scheduledTasks.has(contentId)) {
      this.scheduledTasks.get(contentId)?.cancel();
      this.scheduledTasks.delete(contentId);
      console.log(`Cancelled scheduled content ${contentId}`);
    }
  }

  async publishContent(content: ScheduledContent) {
    // Get the account
    const account = await storage.getInstagramAccount(content.accountId);
    if (!account) {
      throw new Error(`Account ${content.accountId} not found`);
    }

    // Get the media file path
    const mediaPath = path.join(process.cwd(), content.mediaUrl);
    if (!fs.existsSync(mediaPath)) {
      throw new Error(`Media file ${mediaPath} not found`);
    }

    // Publish based on content type
    let result;
    if (content.type === "post") {
      result = await this.instagrapiClient.createPost(
        account.sessionData || {},
        mediaPath,
        content.caption,
        {
          firstComment: content.firstComment || undefined,
          location: content.location || undefined,
          hideLikeCount: content.hideLikeCount === null ? undefined : content.hideLikeCount,
          taggedUsers: content.taggedUsers || undefined
        }
      );
    } else { // story
      result = await this.instagrapiClient.createStory(
        account.sessionData || {},
        mediaPath,
        content.caption
      );
    }

    if (result.success) {
      await storage.updateScheduledContent(content.id, { status: "published" });
      console.log(`Successfully published content ${content.id}`);
    } else {
      throw new Error(result.error || "Unknown error publishing content");
    }
  }
}

export const scheduler = new ContentScheduler();
