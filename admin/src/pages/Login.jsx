import { useState } from 'react';
import toast from 'react-hot-toast';
import { login } from '../services/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(username, password);
      toast.success(res.data.message || 'Đăng nhập thành công!');
      onLogin(res.data.token);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <img src="/pikachuchay.gif" alt="Logo" className="logo-icon" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          <h1>Quản Trị Thời Tiết</h1>
          <p>Poke Đại Chiến</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tài khoản</label>
            <input
              type="text"
              placeholder="Nhập username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '10px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                Đang xử lý...
              </>
            ) : (
              'Đăng Nhập'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
