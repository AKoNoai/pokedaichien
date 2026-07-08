import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-top">
        <div className="footer-col footer-col-1">
          <div className="footer-title">THEO DÕI THỜI TIẾT, SỰ KIỆN VÀ<br />CẬP NHẬT GAME NHANH CHÓNG</div>
          <p className="footer-desc">
            Cập nhật nhanh - Thông tin chính xác -<br />
            Đồng hành cùng cộng đồng Poke Đại<br />
            Chiến. Xin cảm ơn sự ủng hộ của các bạn!
          </p>
        </div>

        <div className="footer-col">
          <nav className="footer-nav">
            <Link to="/trangchu" className="footer-link">Trang Chủ</Link>
            <Link to="/thoitiet" className="footer-link">Thời tiết</Link>
            <Link to="/lichraserver" className="footer-link">Lịch ra server</Link>
            <Link to="/rutx10" className="footer-link">Rút x10</Link>
          </nav>
        </div>

        <div className="footer-col">
          <div className="footer-title">THÔNG TIN LIÊN HỆ</div>
          <div className="footer-contact">
            <div className="contact-item">
              <i className="fa-solid fa-angle-right"></i> Facebook Admin: Hào Kaka
            </div>
            <div className="contact-item">
              <i className="fa-solid fa-angle-right"></i> Mail: haokaka111@gmail.com
            </div>
            <div className="contact-item">
              <i className="fa-solid fa-angle-right"></i> SĐT/Zalo Hỗ Trợ 24/24: 0325318048
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copy">© Copyright 2026</div>
        <div className="footer-operated">
          Operated by <span className="footer-brand">PokeDaiChien1</span>, All Rights Reserved - Version 1.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;
