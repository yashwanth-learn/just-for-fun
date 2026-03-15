import React from 'react';
import { Calendar, Film, Wine } from 'lucide-react';

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
        Movies
      </button>
      <button 
        className={`tab-btn ${activeTab === 'cocktails' ? 'active' : ''}`}
        onClick={() => onTabChange('cocktails')}
      >
        <Wine size={18} />
        Cocktails
      </button>
    </div>
  );
};

export default Tabs;
