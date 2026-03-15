import React from 'react';
import { Calendar, Film } from 'lucide-react';

const Tabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs-nav">
      <button 
        className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
        onClick={() => onTabChange('events')}
      >
        <Calendar size={18} />
        Calendar
      </button>
      <button 
        className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
        onClick={() => onTabChange('movies')}
      >
        <Film size={18} />
        Movies Wishlist
      </button>
    </div>
  );
};

export default Tabs;
