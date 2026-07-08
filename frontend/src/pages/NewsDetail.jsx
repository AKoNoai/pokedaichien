import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NewsDetail.css';

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

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    const fetchNewsDetail = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/news/${id}`);
        setNews(res.data);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết tin tức:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="news-detail-container loading">
        <div className="spinner"></div>
        <p>Đang tải bản tin...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="news-detail-container error">
        <h2>Không tìm thấy bản tin</h2>
        <button className="btn-back" onClick={() => navigate('/trangchu')}>Quay lại Trang Chủ</button>
      </div>
    );
  }

  return (
    <div className="news-detail-container">
      <button className="btn-back" onClick={() => navigate('/trangchu')}>
        <i className="fa-solid fa-arrow-left"></i> Quay lại
      </button>

      <div className="news-detail-card">
        <h1 className="news-detail-title">{news.title}</h1>
        
        <div className="news-detail-meta">
          <span className="meta-item">
            <i className="fa-regular fa-clock"></i> {new Date(news.createdAt).toLocaleDateString('vi-VN')}
          </span>
          <span className="meta-item">
            <i className="fa-regular fa-eye"></i> {news.views || 0} lượt xem
          </span>
        </div>

        {news.imageUrl && (
          <div className="news-detail-image">
            <img src={resolveImageUrl(news.imageUrl)} alt="News Cover" />
          </div>
        )}

        <div className="news-detail-content">
          {news.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
