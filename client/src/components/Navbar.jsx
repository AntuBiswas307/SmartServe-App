import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-card" style={{ 
      margin: '0', 
      borderRadius: '0',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem'
    }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
<<<<<<< HEAD
        <h2 style={{ margin: 0, color: 'var(--color-primary)', marginRight: '1rem' }}>SmartServe Digital Restaurant</h2>
=======
        <h2 style={{ margin: 0, color: 'var(--color-primary)', marginRight: '1rem' }}>SmartServe Dine-In Portal</h2>
>>>>>>> feature/nav-header-update
        {user ? (
          <>
            <Link to="/" className={isActive('/')}>Home</Link>
            {user.role === 'admin' ? (
              <>
                <Link to="/admin/orders" className={isActive('/admin/orders')}>Orders</Link>
                <Link to="/admin/add-product" className={isActive('/admin/add-product')}>Add Product</Link>
              </>
            ) : (
              <Link to="/menu" className={isActive('/menu')}>Menu</Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')}>Login</Link>
            <Link to="/register" className={isActive('/register')}>Register</Link>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="theme-switch-wrapper" onClick={toggleTheme} title="Toggle Theme">
          <span style={{ fontSize: '1.1rem' }}>☀️</span>
          <label className="theme-switch" style={{ margin: 0, pointerEvents: 'none' }}>
            <input type="checkbox" checked={theme === 'dark'} readOnly />
            <span className="theme-slider"></span>
          </label>
          <span style={{ fontSize: '1.1rem' }}>🌙</span>
        </div>

        {user && (
          <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
