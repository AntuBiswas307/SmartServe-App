import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { ToastContext } from '../context/ToastContext';

const Menu = () => {
  const [products, setProducts] = useState([]);
  const { addToast } = useContext(ToastContext);
  const [orderModal, setOrderModal] = useState({ isOpen: false, productId: null, tableNumber: '' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();
  }, []);

  const handleOpenOrderModal = (productId) => {
    setOrderModal({ isOpen: true, productId, tableNumber: '' });
  };

  const handleConfirmOrder = async () => {
    const { productId, tableNumber } = orderModal;
    if (!tableNumber.trim()) return;

    try {
      await api.post('/orders', { product: productId, tableNumber });
      addToast('Order received! Your food will be delivered shortly.', 'success');
      setOrderModal({ isOpen: false, productId: null, tableNumber: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Our Menu</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {products.map(product => (
          <div key={product._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            <img 
              src={`http://localhost:5000${product.imageUrl}`} 
              alt={product.name} 
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.25rem' }} 
            />
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
            <p style={{ margin: '0 0 1rem 0', flexGrow: 1, color: 'var(--color-text-muted)' }}>{product.details}</p>
            <p style={{ margin: '0 0 1.25rem 0', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--color-primary)' }}>${product.price.toFixed(2)}</p>
            <button 
              onClick={() => handleOpenOrderModal(product._id)}
              className="btn btn-success"
              style={{ width: '100%' }}
            >
              Order Now
            </button>
          </div>
        ))}
        {products.length === 0 && <p>Loading menu items...</p>}
      </div>

      {/* Order Modal */}
      {orderModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ margin: 0, textAlign: 'center' }}>Enter Table Number</h3>
            <input 
              type="text" 
              placeholder="e.g. 12" 
              value={orderModal.tableNumber} 
              onChange={(e) => setOrderModal({ ...orderModal, tableNumber: e.target.value })}
              className="input-field"
              style={{ textAlign: 'center', fontSize: '1.25rem' }}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setOrderModal({ isOpen: false, productId: null, tableNumber: '' })}
                className="btn"
                style={{ flex: 1, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmOrder}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
