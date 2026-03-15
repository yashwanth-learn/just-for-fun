import React, { useState, useEffect } from 'react';
import { PartyPopper as ConfettiIcon, Bell, Trash2, Download } from 'lucide-react';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import NotificationToast from './components/NotificationToast';
import Tabs from './components/Tabs';
import MoviesTab from './components/MoviesTab';
import { supabase } from './lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState('events');

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Listen for the event that allows us to prompt for installation
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

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

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      // Optimistic upate
      setEvents(prev => prev.filter(e => e.id !== id));

      const { error: supabaseError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;

    } catch (err) {
      console.error('Error deleting event:', err);
      alert("Failed to delete event.");
      fetchEvents(); // revert
    }
  };

  const handleSaveEvent = async (newEvent) => {
    try {
      // Optimistically update UI
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

  // Get upcoming events for the dashboard and list
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="app-layout">
      <header className="app-header glass-panel">
        <div className="container header-content">
          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <ConfettiIcon size={24} className="logo-icon" />
            </div>
            <h1 className="logo-text text-gradient">Maa Lokam</h1>
          </div>
          <nav className="header-actions">
            {deferredPrompt && (
              <button
                className="btn-install"
                onClick={handleInstallClick}
                aria-label="Install App"
              >
                <Download size={16} />
                <span className="install-text">App</span>
              </button>
            )}
            <button
              className={`btn-icon ${notificationPermission === 'granted' ? 'active-bell' : ''}`}
              aria-label="Notifications"
              onClick={requestNotificationPermission}
              style={{ color: notificationPermission === 'granted' ? 'var(--accent-color)' : 'var(--text-secondary)' }}
            >
              <Bell size={20} />
            </button>
          </nav>
        </div>
      </header>

      <main className="container main-content">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'events' ? (
          <section className="dashboard-content">
            <div className="welcome-banner glass-panel">
              <h2>Welcome back!</h2>
              {isLoading ? (
                <p className="subtitle">Loading your events...</p>
              ) : error ? (
                <p className="subtitle" style={{ color: 'var(--accent-color)' }}>{error}</p>
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

            {/* Manage Upcoming Events List */}
            {upcomingEvents.length > 0 && (
              <div className="manage-events-section glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Upcoming Events</h3>
                <div className="event-list">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="event-list-item">
                      <div className="event-list-details">
                        <span className="event-list-title" style={{ color: event.color || 'var(--text-primary)' }}>{event.title}</span>
                        <span className="event-list-date">
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteEvent(event.id)}
                        aria-label="Delete Event"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : (
          <MoviesTab />
        )}
      </main>

      {/* Only render modals if we are on the events tab */}
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
