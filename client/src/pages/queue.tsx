import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScheduledContent } from "@/lib/types";
import MainContent from "@/components/layout/MainContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Image, Play, Search, Edit2, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QueueViewProps {
  showHeading: boolean;
}

// This is the component that will be rendered by the router
export default function Queue() {
  return <QueueView showHeading={true} />;
}

// This is the component that can be reused with or without a heading
export function QueueView({ showHeading = true }: QueueViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: scheduledContent, isLoading } = useQuery<ScheduledContent[]>({
    queryKey: ['/api/scheduled-content']
  });
  
  // Filter scheduled content based on search term
  const filteredContent = scheduledContent?.filter(content => 
    content.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.status.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Sort content by scheduled date (newest first)
  const sortedContent = [...filteredContent].sort((a, b) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
  
  return (
    <>
      {showHeading && (
        <MainContent title="Content Queue">
          <QueueContent 
            isLoading={isLoading} 
            content={sortedContent} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </MainContent>
      )}
      
      {!showHeading && (
        <QueueContent 
          isLoading={isLoading} 
          content={sortedContent} 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}
    </>
  );
}

interface QueueContentProps {
  isLoading: boolean;
  content: ScheduledContent[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

function QueueContent({ isLoading, content, searchTerm, setSearchTerm }: QueueContentProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-medium">Scheduled Content</h3>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search content..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading scheduled content...</p>
        </div>
      ) : content.length === 0 ? (
        <div className="p-8 text-center">
          {searchTerm ? (
            <p className="text-gray-500 dark:text-gray-400">No results found for "{searchTerm}"</p>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No scheduled content yet</p>
              <Button>Create Your First Post</Button>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Media</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                      <img 
                        src={item.mediaUrl} 
                        alt={item.caption} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium truncate max-w-[300px]">{item.caption}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[300px]">
                      Account: {item.accountId}
                    </p>
                  </TableCell>
                  <TableCell>
                    {item.type === "post" ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        Post
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-accent flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Story
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {format(new Date(item.scheduledDate), "MMM d, h:mm a")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      item.status === "published" ? "bg-green-500" :
                      item.status === "failed" ? "bg-red-500" :
                      "bg-blue-500"
                    )}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
