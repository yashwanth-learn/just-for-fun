import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Bell } from 'lucide-react';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import NotificationToast from './components/NotificationToast';

function App() {
  // Initialize events from local storage, or default to an empty array
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('pwa_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Sync events to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('pwa_events', JSON.stringify(events));
  }, [events]);

  const handleAddEventClick = (date = new Date()) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  const handleDateSelect = (date) => {
    handleAddEventClick(date);
  };

  const requestNotificationPermission = () => {
    if (notificationPermission === 'granted') {
      // Simulate pushing a random notification
      const id = Date.now();
      setNotifications(prev => [...prev, {
        id,
        title: 'Upcoming Event!',
        message: 'Don\'t forget about the Gathering this weekend.'
      }]);
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        dismissNotification(id);
      }, 5000);
    } else {
      // Simulate permission request
      if (window.confirm("Gatherings would like to send you notifications for upcoming events. Allow?")) {
        setNotificationPermission('granted');
        alert("Notifications enabled! Click the Bell icon again to test.");
      } else {
        setNotificationPermission('denied');
      }
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Get upcoming events for the dashboard
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="app-layout">
      <header className="app-header glass-panel">
        <div className="container header-content">
          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <CalendarIcon size={24} className="logo-icon" />
            </div>
            <h1 className="logo-text text-gradient">Gatherings</h1>
          </div>
          <nav className="header-actions">
            <button 
              className={`btn-icon ${notificationPermission === 'granted' ? 'active-bell' : ''}`} 
              aria-label="Notifications"
              onClick={requestNotificationPermission}
              style={{ color: notificationPermission === 'granted' ? 'var(--accent-color)' : 'var(--text-secondary)' }}
            >
              <Bell size={20} />
            </button>
            <button className="glass-btn" onClick={() => handleAddEventClick()}>
              New Event
            </button>
          </nav>
        </div>
      </header>
      
      <main className="container main-content">
        <section className="dashboard-content">
          <div className="welcome-banner glass-panel">
            <h2>Welcome back!</h2>
            <p className="subtitle">
              You have {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? 's' : ''}.
            </p>
          </div>
          
          <div className="calendar-section glass-panel">
            <Calendar 
              events={events} 
              onAddEvent={handleAddEventClick}
              onDateSelect={handleDateSelect}
            />
          </div>
        </section>
      </main>

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialDate={selectedDate}
      />
      
      <NotificationToast 
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}

export default App;
