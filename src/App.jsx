import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Bell } from 'lucide-react';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import NotificationToast from './components/NotificationToast';
import { supabase } from './lib/supabase';

function App() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Fetch events from Supabase on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('events')
        .select('*');

      if (supabaseError) {
        throw supabaseError;
      }

      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEventClick = (date = new Date()) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (newEvent) => {
    try {
      // Optimistically update UI (optional, but good for UX. We await the actual insert to be safe here though)
      const { data, error: supabaseError } = await supabase
        .from('events')
        .insert([
          {
            title: newEvent.title,
            date: newEvent.date,
            description: newEvent.description,
            color: newEvent.color
          }
        ])
        .select();

      if (supabaseError) {
        throw supabaseError;
      }

      if (data && data.length > 0) {
        setEvents([...events, data[0]]);
        
        // Notify success
        const id = Date.now();
        setNotifications(prev => [...prev, {
          id,
          title: 'Success!',
          message: 'Event saved successfully.'
        }]);
        setTimeout(() => dismissNotification(id), 3000);
      }
    } catch (err) {
      console.error('Error saving event:', err);
      // Notify error
      const id = Date.now();
      setNotifications(prev => [...prev, {
        id,
        title: 'Error',
        message: 'Failed to save event. Please try again.'
      }]);
      setTimeout(() => dismissNotification(id), 5000);
    }
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
            {isLoading ? (
               <p className="subtitle">Loading your events...</p>
            ) : error ? (
               <p className="subtitle" style={{color: 'var(--accent-color)'}}>{error}</p>
            ) : (
              <p className="subtitle">
                You have {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? 's' : ''}.
              </p>
            )}
          </div>
          
          <div className="calendar-section glass-panel" style={{ opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.3s' }}>
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
