import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const { user } = useContext(AuthContext);

  if (user?.role === 'admin') {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, Admin!</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
          Here is your command center. What would you like to manage today?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Manage Orders</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', flexGrow: 1, lineHeight: '1.6' }}>
              View and update the status of incoming customer orders. Keep the kitchen running smoothly.
            </p>
            <Link to="/admin/orders" className="btn btn-primary" style={{ width: '100%' }}>View Orders</Link>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-success)' }}>Product Catalog</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', flexGrow: 1, lineHeight: '1.6' }}>
              Add new delicious items to your menu or remove ones that are no longer available.
            </p>
            <Link to="/admin/add-product" className="btn btn-success" style={{ width: '100%' }}>Manage Products</Link>
          </div>
        </div>
      </div>
    );
  }

  // Customer or Unauthenticated Landing
  return (
    <div className="container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 200px)',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: 'clamp(3rem, 8vw, 5rem)', 
        lineHeight: '1.1', 
        marginBottom: '1.5rem', 
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #ff8a65 100%)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        fontWeight: '700'
      }}>
        Delicious food,<br />straight to your table.
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', maxWidth: '600px', marginBottom: '3rem', lineHeight: '1.6' }}>
        Welcome to SmartServe. Skip the wait and order your favorite dishes directly from your device. Freshly prepared and served hot.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/menu" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2.5rem', borderRadius: '50px', boxShadow: '0 8px 24px rgba(255, 87, 34, 0.4)' }}>
          Explore Menu
        </Link>
      </div>
    </div>
  );
};

export default Landing;
