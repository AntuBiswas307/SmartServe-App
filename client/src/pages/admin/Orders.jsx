import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // Update local state to reflect the change immediately
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Manage Orders</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.map(order => (
          <div key={order._id} className="glass-card" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderLeft: order.status === 'Delivered' ? '6px solid var(--color-success)' : '6px solid var(--color-primary)'
          }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Order #{order._id.slice(-6).toUpperCase()}</h3>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Customer:</strong> <span style={{ color: 'var(--color-text-muted)' }}>{order.user?.name} ({order.user?.email})</span></p>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Product:</strong> <span style={{ color: 'var(--color-text-muted)' }}>{order.product?.name}</span></p>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Table Number:</strong> <span style={{ fontSize: '1.2rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>{order.tableNumber}</span></p>
              <p style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
              <span style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '20px', 
                fontWeight: 'bold',
                backgroundColor: order.status === 'Pending' ? 'rgba(255, 87, 34, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                color: order.status === 'Pending' ? 'var(--color-primary)' : 'var(--color-success)',
                fontSize: '0.9rem',
                border: order.status === 'Pending' ? '1px solid var(--color-primary)' : '1px solid var(--color-success)'
              }}>
                {order.status}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Status:</label>
                <select 
                  value={order.status} 
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="input-field"
                  style={{ padding: '0.4rem', cursor: 'pointer', width: 'auto' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No orders have been placed yet.</p>}
      </div>
    </div>
  );
};

export default Orders;
