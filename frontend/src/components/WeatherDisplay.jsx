import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Icons mapping for weather types
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

const WEATHER_TYPES = Object.keys(ICONS);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://pokedaichienbackend.vercel.app';

const resolveImageUrl = (url) => {
  if (!url) return '';
  let finalUrl = url;
  // If production, replace hardcoded localhost with Vercel backend
  if (import.meta.env.PROD && finalUrl.includes('localhost:5000')) {
    finalUrl = finalUrl.replace(/https?:\/\/localhost:5000/g, 'https://pokedaichienbackend.vercel.app');
  }
  // Handle relative URLs
  if (finalUrl.startsWith('/uploads')) {
    finalUrl = `${BASE_URL}${finalUrl}`;
  }
  return finalUrl;
};

const WeatherDisplay = () => {
  const [data, setData] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedType, setSelectedType] = useState('Mưa giông');

  const fetchData = useCallback(async () => {
    try {
      // Fetch all weather data and templates
      const [weatherRes, templateRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/weather`),
        axios.get(`${BASE_URL}/api/templates`)
      ]);
      setData(weatherRes.data);
      setTemplates(templateRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Track visitor on page load
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await axios.post(`${BASE_URL}/api/visitors/track`, {
          page: window.location.pathname
        });
      } catch {
        // Silently fail — tracking should never break the app
      }
    };
    trackVisit();
  }, []);

  // Helper to format date "DD/MM/YYYY"
  const formatDateStr = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Get dates for Today, Tomorrow, Day After Tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const getForecastData = (targetDate) => {
    const targetDateStr = targetDate.toISOString().split('T')[0];
    return data.filter(item => {
      const itemDateStr = new Date(item.date).toISOString().split('T')[0];
      return itemDateStr === targetDateStr;
    });
  };

  const todayData = getForecastData(today);
  const tomorrowData = getForecastData(tomorrow);
  const dayAfterData = getForecastData(dayAfter);

  // Filtered data for the lower section
  const currentYear = new Date().getFullYear();
  const filteredData = data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.getMonth() + 1 === selectedMonth &&
      itemDate.getFullYear() === currentYear &&
      item.weatherType === selectedType;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', fontWeight: 600 }}>Đang tải dữ liệu thời tiết...</p>
      </div>
    );
  }

  return (
    <>
      <div className="weather-header">
        <h1>Dự Báo Thời Tiết</h1>
        <p>Hệ thống theo dõi thời tiết tự động cho game Poke Đại Chiến</p>
      </div>

      {/* 3-Day Forecast */}
      <div className="forecast-grid">
        {/* Today */}
        <div className="forecast-card">
          <div className="fc-header">
            <div className="fc-label">HÔM NAY ({formatDateStr(today)})</div>
          </div>
          <div className="fc-body">
            {todayData.length === 0 ? (
              <div className="fc-empty">Chưa có dữ liệu thời tiết</div>
            ) : (
              todayData.map(item => (
                <div key={item._id} className="weather-item">
                  <div className="wi-row">
                    <div className="wi-icon">
                      <i className={ICONS[item.weatherType] || 'fa-solid fa-cloud'}></i>
                    </div>
                    <div className="wi-type">{item.weatherType}:</div>
                    <div className="wi-time">{item.startTime}-{item.endTime}</div>
                  </div>
                  <div className="pkmn-container">
                    <div className="pkmn-header-row">
                      <div>Thường</div>
                      <div>Cao cấp</div>
                    </div>
                    <div className="pkmn-content-row">
                      <div className="pkmn-col">
                        {item.normalPokemons && item.normalPokemons.map((url, i) => (
                          <img key={i} src={resolveImageUrl(url)} alt="Normal" className="pkmn-img" />
                        ))}
                      </div>
                      <div className="pkmn-col">
                        {item.rarePokemons && item.rarePokemons.map((url, i) => (
                          <img key={i} src={resolveImageUrl(url)} alt="Rare" className="pkmn-img" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tomorrow */}
        <div className="forecast-card">
          <div className="fc-header">
            <div className="fc-label">NGÀY MAI ({formatDateStr(tomorrow)})</div>
          </div>
          <div className="fc-body">
            {tomorrowData.length === 0 ? (
              <div className="fc-empty">Chưa có dữ liệu thời tiết</div>
            ) : (
              tomorrowData.map(item => (
                <div key={item._id} className="weather-item">
                  <div className="wi-row">
                    <div className="wi-icon">
                      <i className={ICONS[item.weatherType] || 'fa-solid fa-cloud'}></i>
                    </div>
                    <div className="wi-type">{item.weatherType}:</div>
                    <div className="wi-time">{item.startTime}-{item.endTime}</div>
                  </div>
                  {((item.normalPokemons && item.normalPokemons.length > 0) || (item.rarePokemons && item.rarePokemons.length > 0)) && (
                    <div className="pkmn-container">
                      <div className="pkmn-header-row">
                        <div>Thường</div>
                        <div>Cao cấp</div>
                      </div>
                      <div className="pkmn-content-row">
                        <div className="pkmn-col">
                          {item.normalPokemons && item.normalPokemons.map((url, i) => (
                            <img key={i} src={resolveImageUrl(url)} alt="Normal" className="pkmn-img" />
                          ))}
                        </div>
                        <div className="pkmn-col">
                          {item.rarePokemons && item.rarePokemons.map((url, i) => (
                            <img key={i} src={resolveImageUrl(url)} alt="Rare" className="pkmn-img" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Day After Tomorrow */}
        <div className="forecast-card">
          <div className="fc-header">
            <div className="fc-label">NGÀY KIA ({formatDateStr(dayAfter)})</div>
          </div>
          <div className="fc-body">
            {dayAfterData.length === 0 ? (
              <div className="fc-empty">Chưa có dữ liệu thời tiết</div>
            ) : (
              dayAfterData.map(item => (
                <div key={item._id} className="weather-item">
                  <div className="wi-row">
                    <div className="wi-icon">
                      <i className={ICONS[item.weatherType] || 'fa-solid fa-cloud'}></i>
                    </div>
                    <div className="wi-type">{item.weatherType}:</div>
                    <div className="wi-time">{item.startTime}-{item.endTime}</div>
                  </div>
                  {((item.normalPokemons && item.normalPokemons.length > 0) || (item.rarePokemons && item.rarePokemons.length > 0)) && (
                    <div className="pkmn-container">
                      <div className="pkmn-header-row">
                        <div>Thường</div>
                        <div>Cao cấp</div>
                      </div>
                      <div className="pkmn-content-row">
                        <div className="pkmn-col">
                          {item.normalPokemons && item.normalPokemons.map((url, i) => (
                            <img key={i} src={resolveImageUrl(url)} alt="Normal" className="pkmn-img" />
                          ))}
                        </div>
                        <div className="pkmn-col">
                          {item.rarePokemons && item.rarePokemons.map((url, i) => (
                            <img key={i} src={resolveImageUrl(url)} alt="Rare" className="pkmn-img" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h2 className="filter-title">Tra cứu Lịch Thời Tiết</h2>

        <div className="filter-group">
          <div className="filter-label">Chọn Tháng</div>
          <div className="chip-row">
            {MONTHS.map(m => (
              <button
                key={m}
                className={`chip ${selectedMonth === m ? 'active' : ''}`}
                onClick={() => setSelectedMonth(m)}
              >
                Tháng {m}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-label">Loại Thời Tiết</div>
          <div className="chip-row">
            {WEATHER_TYPES.map(type => (
              <button
                key={type}
                className={`chip ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                <i className={ICONS[type]}></i> {type}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="results-container">
          <div className="filter-label" style={{ marginTop: '30px' }}>Kết Quả</div>

          {filteredData.length === 0 ? (
            <div className="results-empty">
              Không có dữ liệu {selectedType} trong Tháng {selectedMonth}.
            </div>
          ) : (
            <div className="results-grid">
              {filteredData.map(item => (
                <div key={item._id} className="result-card" onClick={() => navigate('/chitiet', { state: { selectedResult: item, templates } })} style={{ cursor: 'pointer' }}>
                  <div className="rc-icon">
                    <i className={ICONS[item.weatherType]}></i>
                  </div>
                  <div className="rc-info">
                    <div className="rc-date">Ngày {new Date(item.date).getDate().toString().padStart(2, '0')}</div>
                    <div className="rc-time">{item.startTime} - {item.endTime}</div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WeatherDisplay;
