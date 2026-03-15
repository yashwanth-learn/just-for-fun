import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const NotificationToast = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {notifications.map(n => (
        <div key={n.id} style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)',
          animation: 'slideInRight 0.3s ease-out forwards',
          minWidth: '280px'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{n.title}</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {n.message}
            </p>
          </div>
          <button onClick={() => onDismiss(n.id)} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px'
          }}>
            <X size={16} />
          </button>
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default NotificationToast;
