import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getAllWeather,
  createWeather,
  updateWeather,
  deleteWeather,
  importWeather,
  uploadImage,
  resolveImageUrl,
  getVisitorStats,
  getTemplates,
  updateTemplate,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getNews,
  createNews,
  updateNews,
  deleteNews
} from '../services/api';

const WEATHER_TYPES = [
  'Mưa', 'Mưa lớn', 'Mưa giông', 'Tuyết', 'Tuyết nhiều',
  'Bão tuyết', 'Sương mù', 'Bão cát', 'Trời đẹp'
];

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

const TimePicker = ({ label, value, onChange }) => {
  const [hours = '00', minutes = '00'] = (value || '00:00').split(':');
  
  return (
    <div className="form-group" style={{ flex: 1 }}>
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select 
          value={hours}
          onChange={(e) => onChange(`${e.target.value}:${minutes}`)}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'var(--font)' }}
        >
          {Array.from({length: 24}).map((_, i) => {
            const v = i.toString().padStart(2, '0');
            return <option key={v} value={v}>{v} giờ</option>;
          })}
        </select>
        <span style={{ fontWeight: 'bold' }}>:</span>
        <select 
          value={minutes}
          onChange={(e) => onChange(`${hours}:${e.target.value}`)}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'var(--font)' }}
        >
          {Array.from({length: 60}).map((_, i) => {
            const v = i.toString().padStart(2, '0');
            return <option key={v} value={v}>{v} phút</option>;
          })}
        </select>
      </div>
    </div>
  );
};

export default function Dashboard({ token, onLogout, theme, setTheme }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Visitor stats
  const [visitorStats, setVisitorStats] = useState(null);
  const [visitorLoading, setVisitorLoading] = useState(false);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: '',
    weatherType: 'Mưa',
    startTime: '',
    endTime: '',
    rarity: 'Thường',
    note: '',
    normalPokemons: [],
    rarePokemons: []
  });

  // Banner State
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({ imageUrl: '', link: '', isActive: true, order: 0 });

  // News State
  const [newsList, setNewsList] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsForm, setNewsForm] = useState({ title: '', content: '', imageUrl: '', isActive: true });

  // Import State
  const [importJson, setImportJson] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllWeather();
      setData((res.data || []).map((item) => ({
        ...item,
        normalPokemons: (item.normalPokemons || []).map(resolveImageUrl),
        rarePokemons: (item.rarePokemons || []).map(resolveImageUrl)
      })));
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorStats = useCallback(async () => {
    setVisitorLoading(true);
    try {
      const res = await getVisitorStats();
      setVisitorStats(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn');
        onLogout();
      } else {
        toast.error('Lỗi khi tải thống kê: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setVisitorLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    setTemplateLoading(true);
    try {
      const res = await getTemplates();
      setTemplates(res.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải mẫu thời tiết');
    } finally {
      setTemplateLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activePage === 'visitors') {
      fetchVisitorStats();
    } else if (activePage === 'templates') {
      fetchTemplates();
    } else if (activePage === 'home') {
      fetchBanners();
    } else if (activePage === 'news') {
      fetchNewsList();
    }
  }, [activePage, fetchVisitorStats, fetchTemplates]);

  const fetchNewsList = async () => {
    setNewsLoading(true);
    try {
      const res = await getNews();
      setNewsList(res.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách tin tức');
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchBanners = async () => {
    setBannerLoading(true);
    try {
      const res = await getBanners();
      setBanners(res.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách banner');
    } finally {
      setBannerLoading(false);
    }
  };

  // Handlers
  const handleImageUpload = async (e, type, wIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading('Đang tải ảnh lên...', { id: 'upload' });
      const res = await uploadImage(file);
      const url = res.data.url;
      setFormData(prev => {
        const newWeathers = [...prev.weathers];
        newWeathers[wIndex][type] = [...newWeathers[wIndex][type], url];
        return { ...prev, weathers: newWeathers };
      });
      toast.success('Tải ảnh thành công', { id: 'upload' });
    } catch (err) {
      toast.error('Lỗi khi tải ảnh', { id: 'upload' });
    }
  };

  const handleRemoveImage = (type, index, wIndex) => {
    setFormData(prev => {
      const newWeathers = [...prev.weathers];
      newWeathers[wIndex][type] = newWeathers[wIndex][type].filter((_, i) => i !== index);
      return { ...prev, weathers: newWeathers };
    });
  };

  const handleStartTimeChange = (val, wIndex) => {
    let newEndTime = formData.weathers[wIndex].endTime;
    
    if (val) {
      const [hours, minutes] = val.split(':').map(Number);
      const endHours = (hours + 2) % 24;
      newEndTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    setFormData(prev => {
      const newWeathers = [...prev.weathers];
      newWeathers[wIndex].startTime = val;
      newWeathers[wIndex].endTime = newEndTime;
      return { ...prev, weathers: newWeathers };
    });
  };

  const getDefaultsForWeather = (type) => {
    // Find the most recent record for this type in 'data'
    const latest = [...data].sort((a, b) => new Date(b.date) - new Date(a.date)).find(d => d.weatherType === type);
    if (latest) {
      return {
        normalPokemons: latest.normalPokemons || [],
        rarePokemons: latest.rarePokemons || []
      };
    }
    return { normalPokemons: [], rarePokemons: [] };
  };

  const handleTemplateImageUpload = async (e, weatherType, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading('Đang tải ảnh lên...', { id: 'template-upload' });
      const uploadRes = await uploadImage(file);
      const url = uploadRes.data.url;

      await updateTemplate({
        weatherType,
        [imageType]: url
      });
      
      toast.success('Cập nhật mẫu thành công', { id: 'template-upload' });
      fetchTemplates(); // refresh
    } catch (err) {
      toast.error('Lỗi tải ảnh lên', { id: 'template-upload' });
    }
  };

  const handleTemplateImageDelete = async (weatherType, imageType) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    try {
      toast.loading('Đang xóa ảnh...', { id: 'template-delete' });
      await updateTemplate({
        weatherType,
        [imageType]: ''
      });
      toast.success('Đã xóa ảnh', { id: 'template-delete' });
      fetchTemplates(); // refresh
    } catch (err) {
      toast.error('Lỗi khi xóa ảnh', { id: 'template-delete' });
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    const defaults = getDefaultsForWeather('Mưa');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weathers: [{
        weatherType: 'Mưa',
        startTime: '00:00',
        endTime: '23:59',
        rarity: 'Thường',
        note: '',
        normalPokemons: defaults.normalPokemons,
        rarePokemons: defaults.rarePokemons
      }]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      date: new Date(item.date).toISOString().split('T')[0],
      weathers: [{
        weatherType: item.weatherType,
        startTime: item.startTime,
        endTime: item.endTime,
        rarity: item.rarity,
        note: item.note || '',
        normalPokemons: (item.normalPokemons || []).map(resolveImageUrl),
        rarePokemons: (item.rarePokemons || []).map(resolveImageUrl)
      }]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      try {
        await deleteWeather(id);
        toast.success('Xóa thành công');
        fetchData();
      } catch (err) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateWeather(editingItem._id, { date: formData.date, ...formData.weathers[0] });
        toast.success('Cập nhật thành công');
        setShowModal(false);
      } else {
        for (const w of formData.weathers) {
          await createWeather({ date: formData.date, ...w });
        }
        toast.success('Thêm mới thành công');
        setShowModal(false);
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = async () => {
    try {
      const parsedData = JSON.parse(importJson);
      setIsSubmitting(true);
      const res = await importWeather(parsedData);
      toast.success(res.data.message);
      setShowImportModal(false);
      setImportJson('');
      fetchData();
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error('Định dạng JSON không hợp lệ');
      } else {
        toast.error(err.response?.data?.message || 'Lỗi import');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Banner Handlers
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerForm({ imageUrl: '', link: '', isActive: true, order: 0 });
    setShowBannerModal(true);
  };

  const handleOpenEditBanner = (item) => {
    setEditingBanner(item);
    setBannerForm({
      imageUrl: item.imageUrl,
      link: item.link || '',
      isActive: item.isActive,
      order: item.order || 0
    });
    setShowBannerModal(true);
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        await deleteBanner(id);
        toast.success('Xóa thành công');
        fetchBanners();
      } catch (err) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const handleSubmitBanner = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingBanner) {
        await updateBanner(editingBanner._id, bannerForm);
        toast.success('Cập nhật thành công');
      } else {
        await createBanner(bannerForm);
        toast.success('Thêm mới thành công');
      }
      setShowBannerModal(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading('Đang tải ảnh lên...', { id: 'banner-upload' });
      const uploadRes = await uploadImage(file);
      setBannerForm(prev => ({ ...prev, imageUrl: uploadRes.data.url }));
      toast.success('Tải ảnh thành công', { id: 'banner-upload' });
    } catch (err) {
      toast.error('Lỗi tải ảnh lên', { id: 'banner-upload' });
    }
  };

  // News Handlers
  const handleOpenAddNews = () => {
    setEditingNews(null);
    setNewsForm({ title: '', content: '', imageUrl: '', isActive: true });
    setShowNewsModal(true);
  };

  const handleOpenEditNews = (item) => {
    setEditingNews(item);
    setNewsForm({
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || '',
      isActive: item.isActive
    });
    setShowNewsModal(true);
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản tin này?')) {
      try {
        await deleteNews(id);
        toast.success('Xóa thành công');
        fetchNewsList();
      } catch (err) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const handleSubmitNews = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingNews) {
        await updateNews(editingNews._id, newsForm);
        toast.success('Cập nhật thành công');
      } else {
        await createNews(newsForm);
        toast.success('Thêm mới thành công');
      }
      setShowNewsModal(false);
      fetchNewsList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading('Đang tải ảnh lên...', { id: 'news-upload' });
      const uploadRes = await uploadImage(file);
      setNewsForm(prev => ({ ...prev, imageUrl: uploadRes.data.url }));
      toast.success('Tải ảnh thành công', { id: 'news-upload' });
    } catch (err) {
      toast.error('Lỗi tải ảnh lên', { id: 'news-upload' });
    }
  };

  // Filtering & Pagination
  const filteredData = data.filter(item => {
    const matchesSearch = item.weatherType.toLowerCase().includes(search.toLowerCase());
    
    let matchesMonth = true;
    if (filterMonth !== '') {
      const itemMonth = new Date(item.date).getMonth() + 1;
      matchesMonth = itemMonth === parseInt(filterMonth);
    }
    
    return matchesSearch && matchesMonth;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const today = new Date().toISOString().split('T')[0];
  const todayCount = data.filter(d => new Date(d.date).toISOString().split('T')[0] === today).length;
  
  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-brand">
          <img src="/banner.png" alt="Logo" className="brand-icon" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <h2>Quản Trị</h2>
        </div>
        <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/banner.png" alt="Logo" className="brand-icon" style={{ width: '40px', height: '40px', objectFit: 'contain', marginBottom: '10px' }} />
          <h2>Poke Đại Chiến</h2>
          <p>Hệ thống thời tiết</p>
        </div>
        
        <div className="sidebar-nav">
          <button className={`nav-item ${activePage === 'home' ? 'active' : ''}`} onClick={() => { setActivePage('home'); setIsSidebarOpen(false); }}>
            <i className="fa-solid fa-house nav-icon"></i> Trang Chủ
          </button>
          <button className={`nav-item ${activePage === 'weather' ? 'active' : ''}`} onClick={() => { setActivePage('weather'); setIsSidebarOpen(false); }}>
            <i className="fa-solid fa-cloud-sun nav-icon"></i> Thời Tiết
          </button>
          <button className={`nav-item ${activePage === 'server_schedule' ? 'active' : ''}`} onClick={() => { setActivePage('server_schedule'); setIsSidebarOpen(false); }}>
            <i className="fa-solid fa-calendar-alt nav-icon"></i> Lịch ra server
          </button>
          <button className={`nav-item ${activePage === 'draw_x10' ? 'active' : ''}`} onClick={() => { setActivePage('draw_x10'); setIsSidebarOpen(false); }}>
            <i className="fa-solid fa-gift nav-icon"></i> Rút x10
          </button>
          <button className={`nav-item ${activePage === 'news' ? 'active' : ''}`} onClick={() => { setActivePage('news'); setIsSidebarOpen(false); }}>
            <i className="fa-solid fa-newspaper nav-icon"></i> Tin tức
          </button>
          <div style={{ borderTop: '1px solid var(--border)', margin: '10px 15px' }}></div>
          <button className={`nav-item ${activePage === 'visitors' ? 'active' : ''}`} onClick={() => { setActivePage('visitors'); setIsSidebarOpen(false); }}>
            <i className="fa-solid fa-chart-line nav-icon"></i> Thống Kê
          </button>
          <button className={`nav-item ${activePage === 'templates' ? 'active' : ''}`} onClick={() => { setActivePage('templates'); setIsSidebarOpen(false); }}>
            <i className="fa-solid fa-image nav-icon"></i> Mẫu Thời Tiết
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            {theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}
          </button>
          <button className="logout-btn" onClick={onLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {activePage === 'home' && (
          <>
            <div className="page-header">
              <div>
                <h1>Quản lý Trang Chủ (Banner)</h1>
                <p>Thêm, sửa, xóa Banner trên trang chủ.</p>
              </div>
              <div className="header-actions">
                <button className="btn btn-primary" onClick={handleOpenAddBanner}>
                  <i className="fa-solid fa-plus"></i> Thêm Banner
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ảnh Banner</th>
                    <th>Liên kết</th>
                    <th>Thứ tự</th>
                    <th>Trạng thái</th>
                    <th style={{ width: '120px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {bannerLoading ? (
                    <tr>
                      <td colSpan="5" className="tbl-empty">
                        <div className="spinner"></div>
                      </td>
                    </tr>
                  ) : banners.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="tbl-empty">Chưa có banner nào</td>
                    </tr>
                  ) : (
                    banners.map(item => (
                      <tr key={item._id}>
                        <td>
                          <img src={resolveImageUrl(item.imageUrl)} alt="Banner" style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                        </td>
                        <td>
                          {item.link ? <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{item.link}</a> : <i>Không có</i>}
                        </td>
                        <td>{item.order}</td>
                        <td>
                          <span className={`badge ${item.isActive ? 'badge-weather' : ''}`} style={!item.isActive ? { background: '#64748b', color: '#fff' } : {}}>
                            {item.isActive ? 'Hoạt động' : 'Đã ẩn'}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditBanner(item)}>
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBanner(item._id)}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Mobile Card List for Banners */}
              <div className="weather-card-list">
                {!bannerLoading && banners.map(item => (
                  <div className="weather-mobile-card" key={item._id}>
                    <div className="wmc-top">
                      <div className="wmc-type">
                        <span className={`badge ${item.isActive ? 'badge-weather' : ''}`} style={!item.isActive ? { background: '#64748b', color: '#fff' } : {}}>
                          {item.isActive ? 'Hoạt động' : 'Đã ẩn'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Thứ tự: {item.order}</div>
                    </div>
                    <div style={{ margin: '5px 0' }}>
                      <img src={resolveImageUrl(item.imageUrl)} alt="Banner" style={{ width: '100%', height: 'auto', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                    <div className="wmc-rows">
                      <div className="wmc-row" style={{ wordBreak: 'break-all' }}>
                        <span className="wmc-label">Liên kết:</span>
                        {item.link ? <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{item.link}</a> : <i>Không có</i>}
                      </div>
                    </div>
                    <div className="wmc-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditBanner(item)}>
                        Sửa
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBanner(item._id)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Modal */}
            {showBannerModal && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '500px' }}>
                  <div className="modal-header">
                    <h2>{editingBanner ? 'Cập nhật Banner' : 'Thêm Banner Mới'}</h2>
                    <button className="btn-close" onClick={() => setShowBannerModal(false)}><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <form onSubmit={handleSubmitBanner} className="modal-body">
                    <div className="form-group">
                      <label>Ảnh Banner</label>
                      {bannerForm.imageUrl && (
                        <div style={{ marginBottom: '10px' }}>
                          <img src={resolveImageUrl(bannerForm.imageUrl)} alt="Banner preview" style={{ width: '100%', height: 'auto', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleBannerImageUpload} className="form-control" style={{ padding: '8px' }} />
                      {!bannerForm.imageUrl && <p style={{ fontSize: '0.85rem', color: 'red', marginTop: '5px' }}>Vui lòng tải ảnh lên</p>}
                    </div>

                    <div className="form-group">
                      <label>Đường dẫn liên kết (Tùy chọn)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://..."
                        value={bannerForm.link}
                        onChange={(e) => setBannerForm({...bannerForm, link: e.target.value})}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Thứ tự hiển thị</label>
                        <input
                          type="number"
                          className="form-control"
                          value={bannerForm.order}
                          onChange={(e) => setBannerForm({...bannerForm, order: Number(e.target.value)})}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '30px' }}>
                        <input
                          type="checkbox"
                          id="bannerActive"
                          checked={bannerForm.isActive}
                          onChange={(e) => setBannerForm({...bannerForm, isActive: e.target.checked})}
                          style={{ width: '20px', height: '20px' }}
                        />
                        <label htmlFor="bannerActive" style={{ margin: 0, cursor: 'pointer' }}>Hiển thị Banner</label>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button type="button" className="btn btn-ghost" onClick={() => setShowBannerModal(false)}>Hủy</button>
                      <button type="submit" className="btn btn-primary" disabled={isSubmitting || !bannerForm.imageUrl}>
                        {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</> : 'Lưu Banner'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {activePage === 'server_schedule' && (
          <div className="page-header">
            <div>
              <h1>Quản lý Lịch ra server</h1>
              <p>Tính năng đang được phát triển...</p>
            </div>
          </div>
        )}

        {activePage === 'draw_x10' && (
          <div className="page-header">
            <div>
              <h1>Quản lý Rút x10</h1>
              <p>Tính năng đang được phát triển...</p>
            </div>
          </div>
        )}

        {activePage === 'news' && (
          <>
            <div className="page-header">
              <div>
                <h1>Quản lý Tin Tức</h1>
                <p>Thêm, sửa, xóa bài viết tin tức.</p>
              </div>
              <div className="header-actions">
                <button className="btn btn-primary" onClick={handleOpenAddNews}>
                  <i className="fa-solid fa-plus"></i> Thêm Bản Tin
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tiêu đề</th>
                    <th>Ngày đăng</th>
                    <th>Trạng thái</th>
                    <th style={{ width: '120px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {newsLoading ? (
                    <tr>
                      <td colSpan="5" className="tbl-empty">
                        <div className="spinner"></div>
                      </td>
                    </tr>
                  ) : newsList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="tbl-empty">Chưa có tin tức nào</td>
                    </tr>
                  ) : (
                    newsList.map(item => (
                      <tr key={item._id}>
                        <td>
                          {item.imageUrl ? (
                            <img src={resolveImageUrl(item.imageUrl)} alt="News" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                          ) : (
                            <div style={{ width: '80px', height: '60px', background: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="fa-solid fa-image" style={{ color: '#94a3b8' }}></i>
                            </div>
                          )}
                        </td>
                        <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ fontWeight: '500' }}>{item.title}</span>
                        </td>
                        <td>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <span className={`badge ${item.isActive ? 'badge-weather' : ''}`} style={!item.isActive ? { background: '#64748b', color: '#fff' } : {}}>
                            {item.isActive ? 'Hoạt động' : 'Đã ẩn'}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditNews(item)}>
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteNews(item._id)}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Mobile Card List for News */}
              <div className="weather-card-list">
                {!newsLoading && newsList.map(item => (
                  <div className="weather-mobile-card" key={item._id}>
                    <div className="wmc-top">
                      <span className={`badge ${item.isActive ? 'badge-weather' : ''}`} style={!item.isActive ? { background: '#64748b', color: '#fff' } : {}}>
                        {item.isActive ? 'Hoạt động' : 'Đã ẩn'}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', margin: '8px 0' }}>
                      {item.imageUrl ? (
                        <img src={resolveImageUrl(item.imageUrl)} alt="News" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: '80px', height: '60px', background: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa-solid fa-image" style={{ color: '#94a3b8' }}></i>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '36px', lineHeight: '1.5' }}>
                          {item.content}
                        </div>
                      </div>
                    </div>
                    <div className="wmc-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditNews(item)}>
                        Sửa
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteNews(item._id)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* News Modal */}
            {showNewsModal && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '600px' }}>
                  <div className="modal-header">
                    <h2>{editingNews ? 'Cập nhật Bản Tin' : 'Thêm Bản Tin Mới'}</h2>
                    <button className="btn-close" onClick={() => setShowNewsModal(false)}><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <form onSubmit={handleSubmitNews} className="modal-body">
                    <div className="form-group">
                      <label>Tiêu đề</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newsForm.title}
                        onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>Nội dung</label>
                      <textarea
                        className="form-control"
                        required
                        rows="6"
                        value={newsForm.content}
                        onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>Ảnh bìa (Tùy chọn)</label>
                      {newsForm.imageUrl && (
                        <div style={{ marginBottom: '10px' }}>
                          <img src={resolveImageUrl(newsForm.imageUrl)} alt="News preview" style={{ width: '100%', height: 'auto', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleNewsImageUpload} className="form-control" style={{ padding: '8px' }} />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px' }}>
                      <input
                        type="checkbox"
                        id="newsActive"
                        checked={newsForm.isActive}
                        onChange={(e) => setNewsForm({...newsForm, isActive: e.target.checked})}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <label htmlFor="newsActive" style={{ margin: 0, cursor: 'pointer' }}>Hiển thị bản tin</label>
                    </div>

                    <div className="modal-footer">
                      <button type="button" className="btn btn-ghost" onClick={() => setShowNewsModal(false)}>Hủy</button>
                      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</> : 'Lưu Bản Tin'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {activePage === 'weather' && (
          <>
            <div className="page-header">
              <div>
                <h1>Quản lý Thời tiết</h1>
                <p>Thêm, sửa, xóa lịch thời tiết trong game.</p>
              </div>
              <div className="header-actions">
                <button className="btn btn-accent" onClick={() => setShowImportModal(true)}>
                  <i className="fa-solid fa-file-import"></i> Nhập JSON
                </button>
                <button className="btn btn-primary" onClick={handleOpenAdd}>
                  <i className="fa-solid fa-plus"></i> Thêm Mới
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon purple"><i className="fa-solid fa-database"></i></div>
                <div>
                  <div className="stat-label">Tổng số bản ghi</div>
                  <div className="stat-value">{data.length}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><i className="fa-solid fa-calendar-day"></i></div>
                <div>
                  <div className="stat-label">Lịch hôm nay</div>
                  <div className="stat-value">{todayCount}</div>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <select 
                className="search-input" 
                style={{ width: '200px', cursor: 'pointer', fontFamily: 'var(--font)', padding: '10px 15px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                value={filterMonth}
                onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Tất cả các tháng</option>
                {Array.from({length: 12}).map((_, i) => (
                  <option key={i+1} value={i+1}>Tháng {i+1}</option>
                ))}
              </select>

              <input 
                type="text" 
                className="search-input" 
                style={{ flex: 1, padding: '10px 15px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'var(--font)' }}
                placeholder="Tìm kiếm theo loại thời tiết..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Data List */}
            <div className="table-wrapper">
              {/* Desktop Table */}
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Thời tiết</th>
                    <th>Thời gian</th>
                    <th style={{ width: '120px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="tbl-empty">
                        <div className="spinner"></div>
                      </td>
                    </tr>
                  ) : currentData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="tbl-empty">Chưa có dữ liệu</td>
                    </tr>
                  ) : (
                    currentData.map(item => (
                      <tr key={item._id}>
                        <td>
                          <div className="date-text">{new Date(item.date).toLocaleDateString('vi-VN')}</div>
                        </td>
                        <td>
                          <span className="badge badge-weather">{item.weatherType}</span>
                        </td>
                        <td>
                          <span className="time-text">{item.startTime} - {item.endTime}</span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(item)}>
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Mobile Card List */}
              <div className="weather-card-list">
                {!loading && currentData.map(item => (
                  <div className="weather-mobile-card" key={item._id}>
                    <div className="wmc-top">
                      <div className="wmc-type">
                        <span className="badge badge-weather">{item.weatherType}</span>
                      </div>
                    </div>
                    <div className="wmc-rows">
                      <div className="wmc-row">
                        <span className="wmc-label">Ngày:</span>
                        <span>{new Date(item.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="wmc-row">
                        <span className="wmc-label">Giờ:</span>
                        <span>{item.startTime} - {item.endTime}</span>
                      </div>
                    </div>
                    <div className="wmc-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(item)}>
                        Sửa
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <span className="page-info">Trang {currentPage} / {totalPages}</span>
                  <button 
                    className="page-btn" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activePage === 'visitors' && (
          <>
            <div className="page-header">
              <div>
                <h1>Thống Kê Truy Cập</h1>
                <p>Theo dõi lượng người dùng truy cập website.</p>
              </div>
              <div className="header-actions">
                <button className="btn btn-primary" onClick={fetchVisitorStats} disabled={visitorLoading}>
                  <i className={`fa-solid fa-rotate ${visitorLoading ? 'fa-spin' : ''}`}></i> Làm mới
                </button>
              </div>
            </div>

            {visitorLoading && !visitorStats ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="spinner"></div>
              </div>
            ) : visitorStats ? (
              <>
                {/* Visitor Stats Cards */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white' }}>
                      <i className="fa-solid fa-eye"></i>
                    </div>
                    <div>
                      <div className="stat-label">Hôm nay</div>
                      <div className="stat-value">{visitorStats.todayVisits.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white' }}>
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div>
                      <div className="stat-label">Khách hôm nay</div>
                      <div className="stat-value">{visitorStats.todayUnique.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: 'white' }}>
                      <i className="fa-solid fa-calendar-week"></i>
                    </div>
                    <div>
                      <div className="stat-label">Tuần này</div>
                      <div className="stat-value">{visitorStats.weekVisits.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)', color: 'white' }}>
                      <i className="fa-solid fa-calendar"></i>
                    </div>
                    <div>
                      <div className="stat-label">Tháng này</div>
                      <div className="stat-value">{visitorStats.monthVisits.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: 'white' }}>
                      <i className="fa-solid fa-chart-simple"></i>
                    </div>
                    <div>
                      <div className="stat-label">Tổng lượt xem</div>
                      <div className="stat-value">{visitorStats.totalVisits.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', color: 'white' }}>
                      <i className="fa-solid fa-users"></i>
                    </div>
                    <div>
                      <div className="stat-label">Tổng khách</div>
                      <div className="stat-value">{visitorStats.totalUnique.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* 7-Day Chart */}
                <div className="table-wrapper" style={{ marginTop: '24px' }}>
                  <h3 style={{ marginBottom: '20px', fontWeight: 700, fontSize: '16px' }}>
                    <i className="fa-solid fa-chart-bar" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
                    Biểu đồ 7 ngày gần nhất
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', padding: '0 10px' }}>
                    {visitorStats.last7Days.map((day, idx) => {
                      const maxVal = Math.max(...visitorStats.last7Days.map(d => d.visits), 1);
                      const heightPct = (day.visits / maxVal) * 100;
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>{day.visits}</span>
                          <div style={{
                            width: '100%',
                            maxWidth: '50px',
                            height: `${Math.max(heightPct, 4)}%`,
                            background: 'linear-gradient(180deg, #6366f1, #818cf8)',
                            borderRadius: '6px 6px 2px 2px',
                            minHeight: '8px',
                            transition: 'height 0.5s ease',
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: `${Math.max((day.unique / Math.max(day.visits, 1)) * 100, 10)}%`,
                              background: 'rgba(255,255,255,0.3)',
                              borderRadius: '0 0 2px 2px'
                            }} />
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>{day.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-dim)' }}>
                    <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#6366f1', marginRight: '6px' }}></span>Lượt xem</span>
                    <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(99,102,241,0.5)', marginRight: '6px' }}></span>Khách duy nhất</span>
                  </div>
                </div>

                {/* Recent Visitors */}
                <div className="table-wrapper" style={{ marginTop: '24px' }}>
                  <h3 style={{ marginBottom: '20px', fontWeight: 700, fontSize: '16px' }}>
                    <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
                    Truy cập gần đây
                  </h3>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>IP</th>
                        <th>Trình duyệt</th>
                        <th>Trang</th>
                        <th>Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitorStats.recentVisitors.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="tbl-empty">Chưa có dữ liệu</td>
                        </tr>
                      ) : (
                        visitorStats.recentVisitors.map((v, idx) => (
                          <tr key={idx}>
                            <td><code style={{ fontSize: '12px', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '4px' }}>{v.ip}</code></td>
                            <td><span className="badge badge-weather">{v.browser}</span></td>
                            <td>{v.page}</td>
                            <td style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{new Date(v.time).toLocaleString('vi-VN')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Cards for recent visitors */}
                  <div className="weather-card-list">
                    {visitorStats.recentVisitors.map((v, idx) => (
                      <div className="weather-mobile-card" key={idx}>
                        <div className="wmc-rows">
                          <div className="wmc-row">
                            <span className="wmc-label">IP:</span>
                            <code style={{ fontSize: '12px' }}>{v.ip}</code>
                          </div>
                          <div className="wmc-row">
                            <span className="wmc-label">Trình duyệt:</span>
                            <span className="badge badge-weather">{v.browser}</span>
                          </div>
                          <div className="wmc-row">
                            <span className="wmc-label">Thời gian:</span>
                            <span style={{ fontSize: '13px' }}>{new Date(v.time).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}

        {activePage === 'templates' && (
        <>
          <div className="page-header">
            <div>
              <h1>Quản lý Mẫu Thời tiết</h1>
              <p>Thêm ảnh khung lưới Pokemon Thường và Cao cấp cho các loại thời tiết.</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-primary" onClick={fetchTemplates} disabled={templateLoading}>
                <i className={`fa-solid fa-rotate ${templateLoading ? 'fa-spin' : ''}`}></i> Làm mới
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Loại Thời Tiết</th>
                  <th>Ảnh Khung Thường</th>
                  <th>Ảnh Khung Cao Cấp</th>
                </tr>
              </thead>
              <tbody>
                {WEATHER_TYPES.map(type => {
                  const tmpl = templates.find(t => t.weatherType === type);
                  return (
                    <tr key={type}>
                      <td><span className="badge badge-weather"><i className={ICONS?.[type] || 'fa-solid fa-cloud'}></i> {type}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {tmpl?.normalImage ? (
                            <>
                              <img src={resolveImageUrl(tmpl.normalImage)} alt="Normal Grid" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0, padding: '5px 10px' }} title="Sửa ảnh">
                                <i className="fa-solid fa-pen"></i> Sửa
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleTemplateImageUpload(e, type, 'normalImage')} />
                              </label>
                              <button className="btn btn-danger btn-sm" style={{ padding: '5px 10px' }} onClick={() => handleTemplateImageDelete(type, 'normalImage')} title="Xóa ảnh">
                                <i className="fa-solid fa-trash"></i> Xóa
                              </button>
                            </>
                          ) : (
                            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                              <i className="fa-solid fa-upload"></i> Tải ảnh
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleTemplateImageUpload(e, type, 'normalImage')} />
                            </label>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {tmpl?.rareImage ? (
                            <>
                              <img src={resolveImageUrl(tmpl.rareImage)} alt="Rare Grid" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0, padding: '5px 10px' }} title="Sửa ảnh">
                                <i className="fa-solid fa-pen"></i> Sửa
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleTemplateImageUpload(e, type, 'rareImage')} />
                              </label>
                              <button className="btn btn-danger btn-sm" style={{ padding: '5px 10px' }} onClick={() => handleTemplateImageDelete(type, 'rareImage')} title="Xóa ảnh">
                                <i className="fa-solid fa-trash"></i> Xóa
                              </button>
                            </>
                          ) : (
                            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                              <i className="fa-solid fa-upload"></i> Tải ảnh
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleTemplateImageUpload(e, type, 'rareImage')} />
                            </label>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card List for Weather Templates */}
            <div className="weather-card-list">
              {!templateLoading && WEATHER_TYPES.map(type => {
                const tmpl = templates.find(t => t.weatherType === type);
                return (
                  <div className="weather-mobile-card" key={type}>
                    <div className="wmc-top">
                      <div className="wmc-type">
                        <span className="badge badge-weather"><i className={ICONS?.[type] || 'fa-solid fa-cloud'}></i> {type}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '8px 0' }}>
                      {/* Normal Grid */}
                      <div style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--muted)' }}>Khung thường:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {tmpl?.normalImage ? (
                            <>
                              <img src={resolveImageUrl(tmpl.normalImage)} alt="Normal Grid" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0, padding: '5px 10px' }} title="Sửa ảnh">
                                <i className="fa-solid fa-pen"></i> Sửa
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleTemplateImageUpload(e, type, 'normalImage')} />
                              </label>
                              <button className="btn btn-danger btn-sm" style={{ padding: '5px 10px' }} onClick={() => handleTemplateImageDelete(type, 'normalImage')} title="Xóa ảnh">
                                <i className="fa-solid fa-trash"></i> Xóa
                              </button>
                            </>
                          ) : (
                            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                              <i className="fa-solid fa-upload"></i> Tải ảnh
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleTemplateImageUpload(e, type, 'normalImage')} />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Rare Grid */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--muted)' }}>Khung cao cấp:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {tmpl?.rareImage ? (
                            <>
                              <img src={resolveImageUrl(tmpl.rareImage)} alt="Rare Grid" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0, padding: '5px 10px' }} title="Sửa ảnh">
                                <i className="fa-solid fa-pen"></i> Sửa
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleTemplateImageUpload(e, type, 'rareImage')} />
                              </label>
                              <button className="btn btn-danger btn-sm" style={{ padding: '5px 10px' }} onClick={() => handleTemplateImageDelete(type, 'rareImage')} title="Xóa ảnh">
                                <i className="fa-solid fa-trash"></i> Xóa
                              </button>
                            </>
                          ) : (
                            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                              <i className="fa-solid fa-upload"></i> Tải ảnh
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleTemplateImageUpload(e, type, 'rareImage')} />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <h3 className="modal-title">
              <i className="fa-solid fa-cloud-sun"></i> 
              {editingItem ? 'Sửa thông tin' : 'Thêm thời tiết mới'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Ngày</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              
              {formData.weathers.map((w, wIndex) => (
                <div key={wIndex} style={{ position: 'relative', marginBottom: '20px', paddingBottom: '20px', borderBottom: wIndex < formData.weathers.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ margin: 0 }}>Loại thời tiết</label>
                        {wIndex === 0 && !editingItem && formData.weathers.length < 2 && (
                          <button 
                            type="button" 
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 12px', borderRadius: '6px' }}
                            onClick={() => {
                              const defaults = getDefaultsForWeather('Mưa');
                              setFormData(prev => ({...prev, weathers: [...prev.weathers, { weatherType: 'Mưa', startTime: '00:00', endTime: '23:59', rarity: 'Thường', note: '', normalPokemons: defaults.normalPokemons, rarePokemons: defaults.rarePokemons }]}))
                            }}
                            title="Thêm thời tiết nữa"
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        )}
                        {wIndex > 0 && !editingItem && (
                          <button 
                            type="button" 
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)', padding: '4px 12px' }}
                            onClick={() => setFormData(prev => ({...prev, weathers: prev.weathers.filter((_, i) => i !== wIndex)}))}
                            title="Xóa thời tiết này"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                      </div>
                      <select 
                        value={w.weatherType}
                        onChange={e => {
                          const newType = e.target.value;
                          const defaults = getDefaultsForWeather(newType);
                          setFormData(prev => {
                            const nw = [...prev.weathers];
                            nw[wIndex].weatherType = newType;
                            nw[wIndex].normalPokemons = defaults.normalPokemons;
                            nw[wIndex].rarePokemons = defaults.rarePokemons;
                            return { ...prev, weathers: nw };
                          });
                        }}
                        style={{ width: '100%' }}
                      >
                        {WEATHER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                    <TimePicker 
                      label="Giờ bắt đầu"
                      value={w.startTime}
                      onChange={(val) => handleStartTimeChange(val, wIndex)}
                    />
                    <TimePicker 
                      label="Giờ kết thúc"
                      value={w.endTime}
                      onChange={(val) => setFormData(prev => {
                        const nw = [...prev.weathers];
                        nw[wIndex].endTime = val;
                        return { ...prev, weathers: nw };
                      })}
                    />
                  </div>

                  <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Pokemon Thường</label>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {w.normalPokemons.map((url, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            <img src={resolveImageUrl(url)} alt="pokemon" style={{ width: '50px', height: '50px', objectFit: 'contain', background: '#f1f5f9', borderRadius: '4px' }} />
                            <button type="button" onClick={() => handleRemoveImage('normalPokemons', idx, wIndex)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontSize: '12px' }}>&times;</button>
                          </div>
                        ))}
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'normalPokemons', wIndex)} className="form-control" style={{ padding: '8px', border: '1px dashed var(--border)' }} />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Pokemon Cao cấp</label>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {w.rarePokemons.map((url, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            <img src={resolveImageUrl(url)} alt="pokemon" style={{ width: '50px', height: '50px', objectFit: 'contain', background: '#f1f5f9', borderRadius: '4px' }} />
                            <button type="button" onClick={() => handleRemoveImage('rarePokemons', idx, wIndex)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontSize: '12px' }}>&times;</button>
                          </div>
                        ))}
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'rarePokemons', wIndex)} className="form-control" style={{ padding: '8px', border: '1px dashed var(--border)' }} />
                    </div>
                  </div>
                </div>
              ))}

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowImportModal(false)}>
          <div className="modal-box modal-lg">
            <h3 className="modal-title">
              <i className="fa-solid fa-file-import"></i> Nhập dữ liệu JSON
            </h3>
            
            <div className="json-sample">
              <strong>Mẫu JSON hợp lệ (Array các Object):</strong>
              [<br/>
              &nbsp;&nbsp;{'{'}<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;"date": "2026-07-08",<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;"weatherType": "Mưa giông",<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;"startTime": "08:00",<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;"endTime": "10:00"<br/>
              &nbsp;&nbsp;{'}'}<br/>
              ]
            </div>

            <div className="form-group">
              <textarea 
                className="json-textarea" 
                placeholder="Dán JSON vào đây..."
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowImportModal(false)}>Hủy</button>
              <button type="button" className="btn btn-accent" onClick={handleImport} disabled={!importJson || isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Nhập'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
