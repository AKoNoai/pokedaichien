import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

const ICONS = {
  'Mưa': 'fa-solid fa-cloud-rain',
  'Mưa lớn': 'fa-solid fa-cloud-showers-heavy',
  'Mưa giông': 'fa-solid fa-cloud-bolt',
  'Tuyết': 'fa-solid fa-snowflake',
  'Tuyết nhiều': 'fa-regular fa-snowflake',
  'Bão tuyết': 'fa-solid fa-wind',
  'Sương mù': 'fa-solid fa-smog',
  'Bão cát': 'fa-solid fa-tornado',
  'Trời đẹp': 'fa-solid fa-cloud-sun'
};

const ChiTiet = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedResult, templates } = location.state || {};

  if (!selectedResult) {
    return <Navigate to="/" />;
  }

  const BASE_URL = import.meta.env.DEV
    ? 'http://localhost:5000'
    : 'https://pokedaichienbackend.vercel.app';

  const resolveImageUrl = (url) => {
    if (!url) return '';
    let finalUrl = url;
    if (import.meta.env.PROD && finalUrl.includes('localhost:5000')) {
      finalUrl = finalUrl.replace(/https?:\/\/localhost:5000/g, 'https://pokedaichienbackend.vercel.app');
    }
    if (finalUrl.startsWith('/uploads')) {
      finalUrl = `${BASE_URL}${finalUrl}`;
    }
    return finalUrl;
  };

  return (
    <div className="chitiet-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginRight: '15px' }}>
          <i className="fa-solid fa-arrow-left"></i> Quay lại
        </button>
      </div>

      <div className="weather-item-full" style={{ background: '#3b82f6', color: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.5)', paddingBottom: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold' }}>
          <i className={ICONS[selectedResult.weatherType] || 'fa-solid fa-cloud'}></i>
          <span>{selectedResult.weatherType}:</span>
          <span style={{ fontWeight: 'normal' }}>{selectedResult.startTime}-{selectedResult.endTime}</span>
        </div>

        {/* Labels */}
        <div style={{ display: 'flex', marginBottom: '10px', fontSize: '20px', textAlign: 'center' }}>
          <div style={{ flex: 1 }}>Thường</div>
          <div style={{ flex: 1 }}>Cao cấp</div>
        </div>

        {/* Small Pokemons Box */}
        <div style={{ background: '#f8f9fa', borderRadius: '4px', padding: '15px', display: 'flex', minHeight: '100px', marginBottom: '15px' }}>
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', alignContent: 'center' }}>
            {selectedResult.normalPokemons && selectedResult.normalPokemons.map((url, i) => (
              <img key={i} src={resolveImageUrl(url)} alt="Normal" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', alignContent: 'center' }}>
            {selectedResult.rarePokemons && selectedResult.rarePokemons.map((url, i) => (
              <img key={i} src={resolveImageUrl(url)} alt="Rare" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            ))}
          </div>
        </div>

        {/* Template Reference Images */}
        {(() => {
          const tmpl = templates?.find(t => t.weatherType === selectedResult.weatherType);
          if (tmpl && (tmpl.normalImage || tmpl.rareImage)) {
            return (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <div style={{ flex: 1 }}>
                  {tmpl.normalImage ? (
                    <img src={resolveImageUrl(tmpl.normalImage)} alt="Normal Template" style={{ width: '100%', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'white' }} />
                  ) : (
                    <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  {tmpl.rareImage ? (
                    <img src={resolveImageUrl(tmpl.rareImage)} alt="Rare Template" style={{ width: '100%', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'white' }} />
                  ) : (
                    <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};

export default ChiTiet;
