import React from 'react';

const LichRaServer = () => {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '60px 30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <i className="fa-solid fa-calendar-days" style={{ fontSize: '48px', color: '#6366f1', margin: '0 auto 20px', display: 'block' }}></i>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Lịch Ra Server</h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
          Tính năng đang được phát triển.<br />
          Vui lòng quay lại sau!
        </p>
      </div>
    </div>
  );
};

export default LichRaServer;
