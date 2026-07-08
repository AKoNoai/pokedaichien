import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import WeatherDisplay from './components/WeatherDisplay';
import ChiTiet from './components/ChiTiet';
import NewsDetail from './pages/NewsDetail';
import LichRaServer from './pages/LichRaServer';
import RutX10 from './pages/RutX10';

function App() {
  return (
    <Router>
      <div className="app-container" style={{ padding: 0, maxWidth: 'none' }}>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/trangchu" replace />} />
          <Route path="/trangchu" element={<Home />} />
          <Route path="/trangchu/news/:id" element={<NewsDetail />} />
          <Route path="/thoitiet" element={<div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}><WeatherDisplay /></div>} />
          <Route path="/thoitiet/chitiet" element={<div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}><ChiTiet /></div>} />
          <Route path="/lichraserver" element={<LichRaServer />} />
          <Route path="/rutx10" element={<RutX10 />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
