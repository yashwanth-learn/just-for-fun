import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import './Calendar.css';

const Calendar = ({ events, onAddEvent, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const jumpToToday = () => setCurrentDate(new Date());

  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <div className="month-selector">
          <button className="btn-icon" onClick={prevMonth}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="current-month">{format(currentDate, 'MMMM yyyy')}</h2>
          <button className="btn-icon" onClick={nextMonth}>
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="calendar-actions">
          <button className="glass-btn" onClick={jumpToToday}>Today</button>
          <button className="btn-primary" onClick={() => onAddEvent(new Date())}>
            <Plus size={18} /> New Event
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        days.push(
            <div className="day-name" key={`day-${i}`}>
            {format(dayDate, 'EEE')}
            </div>
        );
    }
    return <div className="days-row">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="calendar-grid">
        {daysInterval.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);
          
          // Find events for this day
          const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
          
          return (
            <div 
              className={`cell glass-panel ${!isCurrentMonth ? 'disabled' : ''} ${isCurrentDay ? 'today' : ''}`} 
              key={`cell-${i}`}
              onClick={() => onDateSelect(day)}
            >
              <div className="date-number">{format(day, dateFormat)}</div>
              <div className="event-indicators">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div key={idx} className="event-badge event-dot" style={{ backgroundColor: event.color || 'var(--accent-color)' }}>
                    <span className="event-title-text">{event.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="event-badge-more">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="calendar-container">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;
