import React, { useState } from 'react';
import { X } from 'lucide-react';
import './EventModal.css';

const EventModal = ({ isOpen, onClose, onSave, initialDate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate ? initialDate.toISOString().substring(0, 10) : '');
  const [time, setTime] = useState('12:00');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8b5cf6');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date) return;
    
    // Combine date and time
    const eventDateTime = new Date(`${date}T${time}`);
    onSave({
      id: Date.now().toString(),
      title,
      date: eventDateTime.toISOString(),
      description,
      color,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    onClose();
  };

  const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h3>Add New Event</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input 
              type="text" 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Sarah's Birthday Party"
              required 
              className="glass-input"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input 
                type="date" 
                id="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
                className="glass-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input 
                type="time" 
                id="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                required 
                className="glass-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Details about the gathering..."
              className="glass-input"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Color Tag</label>
            <div className="color-picker">
              {colors.map(c => (
                <button
                  type="button"
                  key={c}
                  className={`color-btn ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="glass-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
