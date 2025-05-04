import { ReactNode, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MainContentProps {
  children: ReactNode;
  title: string;
  showCalendarToggle?: boolean;
  onViewChange?: (view: 'calendar' | 'list') => void;
  currentView?: 'calendar' | 'list';
}

export default function MainContent({ 
  children, 
  title, 
  showCalendarToggle = false,
  onViewChange,
  currentView = 'calendar'
}: MainContentProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden ml-2">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={title} 
          showCalendarToggle={showCalendarToggle}
          onViewChange={onViewChange} 
          currentView={currentView}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
