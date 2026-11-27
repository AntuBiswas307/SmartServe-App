import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [details, setDetails] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
  const [activeTab, setActiveTab] = useState('add');
  const { addToast } = useContext(ToastContext);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('details', details);
    if (image) {
      formData.append('image', image);
    }

    try {
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast('Product added successfully!', 'success');
      setName('');
      setPrice('');
      setDetails('');
      setImage(null);
      // Refresh the product list
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (id) => {
    setDeleteModal({ isOpen: true, productId: id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteModal.productId;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      setDeleteModal({ isOpen: false, productId: null });
      addToast('Product deleted successfully', 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('add')}
          className={`btn ${activeTab === 'add' ? 'btn-primary' : ''}`}
          style={{ 
            border: activeTab !== 'add' ? '1px solid var(--color-border)' : 'none', 
            background: activeTab !== 'add' ? 'transparent' : '', 
            color: activeTab !== 'add' ? 'var(--color-text)' : 'white' 
          }}
        >
          Add New Product
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`btn ${activeTab === 'list' ? 'btn-primary' : ''}`}
          style={{ 
            border: activeTab !== 'list' ? '1px solid var(--color-border)' : 'none', 
            background: activeTab !== 'list' ? 'transparent' : '', 
            color: activeTab !== 'list' ? 'var(--color-text)' : 'white' 
          }}
        >
          View Available Products
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Add New Product</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Name</label>
            <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price ($)</label>
            <input type="number" name="price" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" required min="0" step="0.01" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Details/Description</label>
            <textarea name="details" value={details} onChange={(e) => setDetails(e.target.value)} className="input-field" required rows="3" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Image</label>
            <label className="file-dropzone">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>{image ? image.name : 'Click to choose a file'}</span>
              <input type="file" name="image" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required style={{ display: 'none' }} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
        </div>
      )}

      {/* Product List */}
      {activeTab === 'list' && (
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>Available Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
          {products.map(product => (
            <div key={product._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
              <img 
                src={`http://localhost:5000${product.imageUrl}`} 
                alt={product.name} 
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} 
              />
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h4>
              <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', flexGrow: 1, color: 'var(--color-primary)' }}>${product.price.toFixed(2)}</p>
              <button 
                onClick={() => handleOpenDeleteModal(product._id)}
                className="btn btn-danger"
                style={{ width: '100%' }}
              >
                Delete
              </button>
            </div>
          ))}
          {products.length === 0 && <p>No products available.</p>}
        </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>Confirm Deletion</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, productId: null })}
                className="btn"
                style={{ flex: 1, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="btn btn-danger"
                style={{ flex: 1 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
