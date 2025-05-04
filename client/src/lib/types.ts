export interface InstagramAccount {
  id: number;
  username: string;
  isActive: boolean;
  profilePic?: string;
}

export type ContentType = "post" | "story";

export interface ScheduledContent {
  id: number;
  accountId: number;
  type: ContentType;
  caption: string;
  mediaUrl: string;
  scheduledDate: string;
  status: "scheduled" | "published" | "failed";
  firstComment?: string;
  location?: string;
  hideLikeCount?: boolean;
  taggedUsers?: string[];
}

export interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  scheduledContent: ScheduledContent[];
}

export interface Month {
  name: string;
  year: number;
  days: CalendarDay[];
}

export interface CreatePostFormData {
  accountId: number;
  type: ContentType;
  caption: string;
  media: File[];
  scheduledDate: string;
  scheduledTime: string;
  firstComment?: string;
  location?: string;
  hideLikeCount?: boolean;
  taggedUsers?: string[];
}
