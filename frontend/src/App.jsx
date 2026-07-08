import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WeatherDisplay from './components/WeatherDisplay';
import ChiTiet from './components/ChiTiet';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<WeatherDisplay />} />
          <Route path="/chitiet" element={<ChiTiet />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
