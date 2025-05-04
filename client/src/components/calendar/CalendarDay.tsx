import { cn } from "@/lib/utils";
import { CalendarDay as CalendarDayType } from "@/lib/types";
import PostPreview from "../posts/PostPreview";
import StoryPreview from "../posts/StoryPreview";

interface CalendarDayProps {
  day: CalendarDayType;
}

export default function CalendarDay({ day }: CalendarDayProps) {
  const isOtherMonth = !day.isCurrentMonth;
  
  return (
    <div 
      className={cn(
        "col-span-1 border-t border-gray-200 dark:border-gray-700 p-2 calendar-day",
        day.isToday ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800",
        isOtherMonth ? "opacity-50" : ""
      )}
    >
      <div className="text-right mb-2">
        <span 
          className={cn(
            "text-sm",
            isOtherMonth ? "text-gray-400 dark:text-gray-600" : "",
            day.isToday ? "font-semibold text-primary" : ""
          )}
        >
          {day.date}
        </span>
        
        {day.isToday && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
            Today
          </span>
        )}
      </div>
      
      {/* Scheduled content */}
      <div className="space-y-2">
        {day.scheduledContent.map((content) => (
          content.type === "post" ? (
            <PostPreview key={content.id} post={content} />
          ) : (
            <StoryPreview key={content.id} story={content} />
          )
        ))}
      </div>
    </div>
  );
}
