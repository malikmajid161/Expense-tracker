import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

export default function Inventory() {
  const { inventory, addOrUpdateItem, deleteItem } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const emptyForm = {
    name: '', category: 'shirt', color: '', size: '', quantity: '', buyPrice: '', sellPrice: ''
  };
  const [formData, setFormData] = useState(emptyForm);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    addOrUpdateItem({
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      buyPrice: parseFloat(formData.buyPrice) || 0,
      sellPrice: parseFloat(formData.sellPrice) || 0,
    });
    closeModal();
  };

  const filteredInventory = inventory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.color.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === 'all' || item.category === filterCat;
    return matchSearch && matchCat;
  }).sort((a,b) => b.quantity - a.quantity);

  const formatCurrency = (val) => '$' + parseFloat(val).toFixed(2);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Inventory Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your cloth materials and ready-to-wear items.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          Add New Item
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-control" 
              style={{ paddingLeft: '2.5rem' }} 
              placeholder="Search by name or color..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="input-control" 
            style={{ width: '200px' }}
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="shirt">Shirts</option>
            <option value="pant">Pants</option>
            <option value="suit">Suits</option>
            <option value="fabric">Fabrics</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Item Details</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No items found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Color: {item.color} | Size: {item.size}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{item.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${item.quantity <= 0 ? 'badge-danger' : item.quantity < 5 ? 'badge-warning' : 'badge-success'}`}>
                        {item.quantity} Units
                      </span>
                    </td>
                    <td>{formatCurrency(item.buyPrice)}</td>
                    <td style={{ fontWeight: '500' }}>{formatCurrency(item.sellPrice)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem', marginRight: '0.5rem' }} onClick={() => openModal(item)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => {
                        if(window.confirm('Are you sure you want to delete this item?')) deleteItem(item.id);
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="input-group">
                <label className="input-label">Item Name</label>
                <input type="text" className="input-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select className="input-control" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="shirt">Shirt</option>
                    <option value="pant">Pant</option>
                    <option value="suit">Suit</option>
                    <option value="fabric">Fabric</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Initial Stock Quantity</label>
                  <input type="number" min="0" className="input-control" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Color</label>
                  <input type="text" className="input-control" required value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Size / Measurement</label>
                  <input type="text" className="input-control" required value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Buy Price ($)</label>
                  <input type="number" step="0.01" min="0" className="input-control" required value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Sell Price ($)</label>
                  <input type="number" step="0.01" min="0" className="input-control" required value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
