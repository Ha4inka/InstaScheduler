import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePostModal from "../posts/CreatePostModal";

interface HeaderProps {
  title: string;
  showCalendarToggle?: boolean;
  onViewChange?: (view: 'calendar' | 'list') => void;
  currentView?: 'calendar' | 'list';
}

export default function Header({ 
  title, 
  showCalendarToggle = false,
  onViewChange,
  currentView = 'calendar'
}: HeaderProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const prevMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(date);
  };

  const nextMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(date);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          {/* Mobile title (sidebar toggle is in MainContent) */}
          <h1 className="ml-2 text-lg font-semibold">{title}</h1>
        </div>
        
        <div className="hidden md:flex md:items-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          
          {showCalendarToggle && onViewChange && (
            <Tabs value={currentView} className="ml-8" onValueChange={(v) => onViewChange(v as 'calendar' | 'list')}>
              <TabsList>
                <TabsTrigger value="calendar">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Month
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        
        <div className="flex items-center">
          <Button variant="primary" onClick={handleCreatePost}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Create Post</span>
          </Button>
        </div>
      </div>

      {(showCalendarToggle && currentView === 'calendar') && (
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex space-x-2 items-center">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">{formatMonth(currentMonth)}</h2>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>
      )}

      <CreatePostModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </header>
  );
}
