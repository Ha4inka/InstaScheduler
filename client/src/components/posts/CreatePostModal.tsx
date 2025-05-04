import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { InstagramAccount, ContentType, CreatePostFormData } from "@/lib/types";
import { useDropzone } from "react-dropzone";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Image, Play, Upload, Check, X, PlusCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const { toast } = useToast();
  const [contentType, setContentType] = useState<ContentType>("post");
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [caption, setCaption] = useState("");
  const [firstComment, setFirstComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date());
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [hideLikeCount, setHideLikeCount] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: accounts } = useQuery<InstagramAccount[]>({ 
    queryKey: ['/api/accounts']
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'video/mp4': [],
    },
    maxFiles: contentType === "post" ? 10 : 1,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      
      // Generate preview URLs
      const urls = acceptedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/scheduled-content", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-content'] });
      onOpenChange(false);
      resetForm();
      toast({
        title: "Content scheduled successfully",
        description: "Your content has been scheduled for posting.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to schedule content",
        description: error.message || "An error occurred while scheduling your content.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setContentType("post");
    setSelectedAccount(null);
    setCaption("");
    setFirstComment("");
    setFiles([]);
    setPreviewUrls([]);
    setScheduledDate(new Date());
    setScheduledTime("12:00");
    setLocation("");
    setHideLikeCount(false);
    setTaggedUsers([]);
  };

  const handleSubmit = async () => {
    if (!selectedAccount) {
      toast({
        title: "No account selected",
        description: "Please select an Instagram account to post to.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No media selected",
        description: "Please upload at least one media file.",
        variant: "destructive",
      });
      return;
    }

    if (!scheduledDate) {
      toast({
        title: "No date selected",
        description: "Please select a date for scheduling.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`media${index}`, file);
      });

      // Add other form data
      formData.append("accountId", selectedAccount.toString());
      formData.append("type", contentType);
      formData.append("caption", caption);
      
      if (firstComment) {
        formData.append("firstComment", firstComment);
      }
      
      // Combine date and time
      const dateTimeString = `${format(scheduledDate, "yyyy-MM-dd")}T${scheduledTime}:00`;
      formData.append("scheduledDate", dateTimeString);
      
      if (location) {
        formData.append("location", location);
      }
      
      formData.append("hideLikeCount", hideLikeCount.toString());
      
      if (taggedUsers.length > 0) {
        formData.append("taggedUsers", JSON.stringify(taggedUsers));
      }

      await createPostMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Post</h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-1/2 p-4 flex flex-col h-[calc(90vh-150px)] overflow-y-auto">
            <div className="flex space-x-4 mb-4">
              <Button
                className={cn(
                  "flex-1 flex justify-center items-center",
                  contentType === "post" ? "bg-secondary" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}
                onClick={() => setContentType("post")}
              >
                <Image className="h-4 w-4 mr-2" />
                Post
              </Button>
              <Button 
                className={cn(
                  "flex-1 flex justify-center items-center",
                  contentType === "story" ? "bg-accent" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}
                onClick={() => setContentType("story")}
              >
                <Play className="h-4 w-4 mr-2" />
                Story
              </Button>
            </div>
            
            {files.length === 0 ? (
              <div 
                {...getRootProps()} 
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center flex-1 mb-4 cursor-pointer hover:border-primary dark:hover:border-primary"
              >
                <input {...getInputProps()} />
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 mb-3">
                  <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-2">Drag & drop your media files here</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center mb-4">
                  Supports JPG, PNG, MP4 {contentType === "post" ? "(up to 10 files)" : "(1 file)"}
                </p>
                <Button>Browse Files</Button>
              </div>
            ) : (
              <div className="flex-1 mb-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-sm">Selected Media</h3>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setFiles([]);
                    setPreviewUrls([]);
                  }}>
                    Clear All
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Preview ${index}`} 
                        className="w-full h-full object-cover"
                      />
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newFiles = [...files];
                          newFiles.splice(index, 1);
                          setFiles(newFiles);
                          
                          const newUrls = [...previewUrls];
                          URL.revokeObjectURL(newUrls[index]);
                          newUrls.splice(index, 1);
                          setPreviewUrls(newUrls);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {contentType === "post" && files.length < 10 && (
                    <div 
                      {...getRootProps()} 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md aspect-square flex items-center justify-center cursor-pointer hover:border-primary dark:hover:border-primary"
                    >
                      <input {...getInputProps()} />
                      <PlusCircle className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <Label htmlFor="caption" className="mb-1 block">Caption</Label>
              <Textarea 
                id="caption"
                value={caption} 
                onChange={(e) => setCaption(e.target.value)} 
                className="w-full h-32" 
                placeholder="Write your caption here... #hashtags @mentions"
              />
            </div>
            
            <div>
              <Label htmlFor="firstComment" className="mb-1 block">First Comment</Label>
              <Textarea 
                id="firstComment"
                value={firstComment} 
                onChange={(e) => setFirstComment(e.target.value)} 
                className="w-full h-20" 
                placeholder="Add a comment (hashtags, etc.)"
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-900 p-4 h-[calc(90vh-150px)] overflow-y-auto">
            <h3 className="font-medium text-lg mb-4">Post Settings</h3>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <h4 className="font-medium mb-3">Instagram Account</h4>
              <Select 
                value={selectedAccount?.toString() || ""} 
                onValueChange={(value) => setSelectedAccount(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      <div className="flex items-center">
                        {account.profilePic ? (
                          <img 
                            src={account.profilePic}
                            alt={account.username}
                            className="w-6 h-6 rounded-full mr-2 object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center mr-2">
                            <span className="text-xs text-white">
                              {account.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {account.username}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <h4 className="font-medium mb-3">Schedule</h4>
              <div className="mb-3">
                <Label htmlFor="date" className="mb-1 block">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                    >
                      {scheduledDate ? format(scheduledDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="mb-3">
                <Label htmlFor="time" className="mb-1 block">Time</Label>
                <Input 
                  id="time"
                  type="time" 
                  value={scheduledTime} 
                  onChange={(e) => setScheduledTime(e.target.value)} 
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <h4 className="font-medium mb-3">Advanced Options</h4>
              
              <div className="mb-3">
                <Label htmlFor="location" className="mb-1 block">Location</Label>
                <Input 
                  id="location"
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="Add a location" 
                  className="w-full"
                />
              </div>
              
              <div className="mb-3">
                <Label htmlFor="taggedUsers" className="mb-1 block">Tag People</Label>
                <Input 
                  id="taggedUsers"
                  type="text" 
                  placeholder="@username1, @username2..." 
                  className="w-full"
                  value={taggedUsers.join(", ")}
                  onChange={(e) => {
                    const input = e.target.value;
                    const users = input.split(",").map(user => user.trim());
                    setTaggedUsers(users.filter(Boolean));
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Hide Like Count</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hide the number of likes on this post</p>
                </div>
                <Switch 
                  checked={hideLikeCount} 
                  onCheckedChange={setHideLikeCount} 
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Post"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
