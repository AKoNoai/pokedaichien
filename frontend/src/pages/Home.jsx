import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

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

const Home = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/banners`);
        setBanners(res.data.filter(b => b.isActive));
      } catch (err) {
        console.error('Lỗi khi tải banner:', err);
      } finally {
        setLoading(false);
      }
    };
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/news`);
        setNewsList(res.data.filter(n => n.isActive));
      } catch (err) {
        console.error('Lỗi khi tải tin tức:', err);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchBanners();
    fetchNews();
  }, []);

  // Auto slide
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="home-container">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', fontWeight: 600, color: '#64748b' }}>Đang tải Banner...</p>
        </div>
      ) : banners.length > 0 ? (
        <div className="banner-carousel">
          {banners.map((banner, index) => (
            <div key={banner._id} className={`banner-slide ${index === currentSlide ? 'active' : ''}`}>
              {banner.link ? (
                <a href={banner.link} target="_blank" rel="noreferrer">
                  <img src={resolveImageUrl(banner.imageUrl)} alt={`Banner ${index + 1}`} />
                </a>
              ) : (
                <img src={resolveImageUrl(banner.imageUrl)} alt={`Banner ${index + 1}`} />
              )}
            </div>
          ))}
          
          {banners.length > 1 && (
            <div className="banner-dots">
              {banners.map((_, index) => (
                <span 
                  key={index} 
                  className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                ></span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="banner-placeholder">
          <p>Ở đây admin sẽ</p>
          <p>đăng Banner</p>
        </div>
      )}

      <div className="news-section">
        <h2 className="news-title">Tin tức</h2>
        
        {newsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', fontWeight: 600, color: '#64748b' }}>Đang tải tin tức...</p>
          </div>
        ) : newsList.length > 0 ? (
          <div className="news-list">
            {newsList.map(news => (
              <div 
                key={news._id} 
                className="news-card" 
                onClick={() => navigate(`/trangchu/news/${news._id}`)}
                style={{ cursor: 'pointer' }}
              >
                {news.imageUrl && (
                  <div className="news-image">
                    <img src={resolveImageUrl(news.imageUrl)} alt="News" />
                  </div>
                )}
                <div className="news-content">
                  <h3 className="news-item-title">{news.title}</h3>
                  <div className="news-date">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fa-regular fa-clock"></i> {new Date(news.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '15px' }}>
                      <i className="fa-regular fa-eye"></i> {news.views || 0}
                    </span>
                  </div>
                  <p className="news-text">
                    {news.content.length > 150 ? news.content.substring(0, 150) + '...' : news.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="news-placeholder">
            <p>Chưa có tin tức nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
