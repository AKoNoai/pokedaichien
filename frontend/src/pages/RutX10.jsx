import React from 'react';

const RutX10 = () => {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '60px 30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <i className="fa-solid fa-dice" style={{ fontSize: '48px', color: '#f59e0b', margin: '0 auto 20px', display: 'block' }}></i>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Rút x10</h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
          Tính năng đang được phát triển.<br />
          Vui lòng quay lại sau!
        </p>
      </div>
    </div>
  );
};

export default RutX10;
