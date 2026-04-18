import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCart } from 'lucide-react';

export default function Sales() {
  const { inventory, sales, processSale } = useStore();
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const availableItems = inventory.filter(i => i.quantity > 0);
  const selectedItem = availableItems.find(i => i.id === selectedItemId);

  const handleSale = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (quantity > selectedItem.quantity) {
      alert(`Only ${selectedItem.quantity} units available.`);
      return;
    }

    processSale({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity,
      buyPrice: selectedItem.buyPrice,
      salePrice: selectedItem.sellPrice
    });

    setSelectedItemId('');
    setQuantity(1);
    alert('Sale completed successfully!');
  };

  const formatCurrency = (val) => '$' + parseFloat(val).toFixed(2);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Point of Sale</h1>
        <p style={{ color: 'var(--text-muted)' }}>Register new sales and view transaction history.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <ShoppingCart size={20} className="text-primary" />
            <h3 style={{ fontSize: '1.25rem' }}>New Transaction</h3>
          </div>

          <form onSubmit={handleSale}>
            <div className="input-group">
              <label className="input-label">Select Item</label>
              <select className="input-control" required value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)}>
                <option value="">-- Choose Item --</option>
                {availableItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.color}) - {item.quantity} in stock
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Quantity</label>
              <input type="number" min="1" className="input-control" required value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--secondary)', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Unit Price</span>
                <span style={{ fontWeight: '500' }}>{selectedItem ? formatCurrency(selectedItem.sellPrice) : '$0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>{selectedItem ? formatCurrency(selectedItem.sellPrice * quantity) : '$0.00'}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1rem' }} disabled={!selectedItem}>
              Complete Sale Transaction
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Transactions</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No recent sales found.
                    </td>
                  </tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {new Date(sale.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td style={{ fontWeight: '500' }}>{sale.itemName}</td>
                      <td><span className="badge badge-neutral">{sale.quantity}x</span></td>
                      <td>{formatCurrency(sale.salePrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(sale.salePrice * sale.quantity)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
