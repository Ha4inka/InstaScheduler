import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import CalendarDay from "./CalendarDay";
import { ScheduledContent, Month } from "@/lib/types";

interface CalendarViewProps {
  month: Date;
}

export default function CalendarView({ month }: CalendarViewProps) {
  const { data: scheduledContent, isLoading } = useQuery<ScheduledContent[]>({
    queryKey: ['/api/scheduled-content']
  });

  const calendarMonth = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const today = new Date();
    
    // Get the first day of the month
    const firstDay = new Date(year, monthIndex, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    // Get the number of days in the previous month
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();
    
    // Calculate the previous month
    const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevMonthYear = monthIndex === 0 ? year - 1 : year;
    
    // Calculate the next month
    const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextMonthYear = monthIndex === 11 ? year + 1 : year;
    
    const days = [];
    
    // Add days from the previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = daysInPrevMonth - firstDayOfWeek + i + 1;
      days.push({
        date,
        month: prevMonthIndex,
        year: prevMonthYear,
        isCurrentMonth: false,
        isToday: false,
        scheduledContent: []
      });
    }
    
    // Add days from the current month
    for (let date = 1; date <= daysInMonth; date++) {
      const isToday = date === today.getDate() && 
        monthIndex === today.getMonth() && 
        year === today.getFullYear();
        
      // Filter scheduled content for this day
      const dayContent = scheduledContent?.filter(content => {
        const contentDate = new Date(content.scheduledDate);
        return contentDate.getDate() === date && 
          contentDate.getMonth() === monthIndex && 
          contentDate.getFullYear() === year;
      }) || [];
      
      days.push({
        date,
        month: monthIndex,
        year,
        isCurrentMonth: true,
        isToday,
        scheduledContent: dayContent
      });
    }
    
    // Add days from the next month to complete the grid (to have a total of 42 days - 6 weeks)
    const remainingDays = 42 - days.length;
    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        month: nextMonthIndex,
        year: nextMonthYear,
        isCurrentMonth: false,
        isToday: false,
        scheduledContent: []
      });
    }
    
    return {
      name: month.toLocaleDateString('en-US', { month: 'long' }),
      year,
      days
    };
  }, [month, scheduledContent]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
        {/* Calendar header */}
        <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Sun</div>
        <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Mon</div>
        <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Tue</div>
        <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Wed</div>
        <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Thu</div>
        <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Fri</div>
        <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Sat</div>
        
        {/* Skeleton loading cells */}
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="col-span-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 calendar-day h-32">
            <div className="text-right mb-2">
              <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full inline-block animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Calendar header */}
      <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Sun</div>
      <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Mon</div>
      <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Tue</div>
      <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Wed</div>
      <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Thu</div>
      <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Fri</div>
      <div className="col-span-1 bg-white dark:bg-gray-800 p-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Sat</div>
      
      {/* Calendar days */}
      {calendarMonth.days.map((day, index) => (
        <CalendarDay key={index} day={day} />
      ))}
    </div>
  );
}
