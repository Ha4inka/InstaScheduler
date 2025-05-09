import React, { useState } from "react";
import MainContent from "@/components/layout/MainContent";
import CalendarView from "@/components/calendar/CalendarView";
import { QueueView } from "@/pages/queue";

// Add this inside the file where QueueView is defined:
// export interface QueueViewProps {
//   showHeading: boolean;
// }

// Then ensure QueueView is typed correctly with:
// const QueueView: React.FC<QueueViewProps> = ({ showHeading }) => { ... }

export default function Calendar() {
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const handleViewChange = (view: 'calendar' | 'list') => {
    setCurrentView(view);
  };
  
  return (
    <MainContent 
      title="Content Calendar" 
      showCalendarToggle={true}
      onViewChange={handleViewChange}
      currentView={currentView}
    >
      {currentView === 'calendar' ? (
        <CalendarView month={currentMonth} />
      ) : (
        <QueueView showHeading={false} />
      )}
    </MainContent>
  );
}
