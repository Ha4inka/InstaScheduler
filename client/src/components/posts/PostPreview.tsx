import { useState } from "react";
import { ScheduledContent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Image, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface PostPreviewProps {
  post: ScheduledContent;
}

export default function PostPreview({ post }: PostPreviewProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Extract the time from the scheduledDate
  const formattedTime = format(new Date(post.scheduledDate), "h:mm a");
  
  return (
    <>
      <div 
        className={cn(
          "post-preview bg-white dark:bg-gray-800 rounded shadow-sm border cursor-pointer",
          post.status === "published" 
            ? "border-green-300 dark:border-green-800" 
            : post.status === "failed" 
              ? "border-red-300 dark:border-red-800"
              : "border-gray-200 dark:border-gray-700"
        )}
        onClick={() => setShowDetails(true)}
      >
        <div className="relative pb-[100%] bg-gray-100 dark:bg-gray-700 rounded-t overflow-hidden">
          <img 
            src={post.mediaUrl} 
            alt={post.caption} 
            className="absolute object-cover w-full h-full"
          />
          <div className="absolute top-2 right-2 bg-secondary text-white text-xs px-1.5 py-0.5 rounded">
            <Image className="w-3 h-3 inline mr-1" />
            Post
          </div>
        </div>
        <div className="p-2">
          <p className="text-xs font-medium truncate">{post.caption}</p>
          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3 mr-1" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
      
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scheduled Post</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="relative aspect-square overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
              <img 
                src={post.mediaUrl} 
                alt={post.caption} 
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="grid gap-2">
              <h3 className="font-medium text-sm">Caption</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{post.caption}</p>
            </div>
            
            {post.firstComment && (
              <div className="grid gap-2">
                <h3 className="font-medium text-sm">First Comment</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{post.firstComment}</p>
              </div>
            )}
            
            <div className="grid gap-2">
              <h3 className="font-medium text-sm">Scheduled for</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {format(new Date(post.scheduledDate), "PPP 'at' p")}
              </p>
            </div>
            
            <div className="grid gap-2">
              <h3 className="font-medium text-sm">Status</h3>
              <p className={cn(
                "text-sm",
                post.status === "published" ? "text-green-600 dark:text-green-400" :
                post.status === "failed" ? "text-red-600 dark:text-red-400" :
                "text-blue-600 dark:text-blue-400"
              )}>
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="destructive" size="sm">
              Delete
            </Button>
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="default" size="sm">
                Post Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
