import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <header className="main-header">
      <div className="header-nav-container">
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
          <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        <div className="logo-container">
          <div className="logo-icon">
            <div className="pokeball">
              <div className="pokeball-button"></div>
            </div>
          </div>
          <span className="logo-text">Poke Đại Chiến 1</span>
        </div>

        <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/trangchu" className={`nav-link ${location.pathname === '/trangchu' || location.pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>Trang Chủ</Link>
          <Link to="/thoitiet" className={`nav-link ${location.pathname === '/thoitiet' ? 'active' : ''}`} onClick={closeMenu}>Thời tiết</Link>
          <Link to="/lichraserver" className={`nav-link ${location.pathname === '/lichraserver' ? 'active' : ''}`} onClick={closeMenu}>Lịch ra server</Link>
          <Link to="/rutx10" className={`nav-link ${location.pathname === '/rutx10' ? 'active' : ''}`} onClick={closeMenu}>Rút x10</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
