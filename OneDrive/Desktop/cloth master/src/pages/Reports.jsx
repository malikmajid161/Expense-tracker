import React from 'react';
import { useStore } from '../context/StoreContext';
import { FileText, Download } from 'lucide-react';

export default function Reports() {
  const { inventory, sales } = useStore();

  const handleExport = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalInventoryValue: inventory.reduce((acc, i) => acc + (i.buyPrice * i.quantity), 0),
        totalRevenue: sales.reduce((acc, s) => acc + (s.salePrice * s.quantity), 0),
      },
      inventory,
      sales
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `ClothMaster_Report_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Reports & Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Generate and download comprehensive store data.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <FileText size={48} className="text-primary" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Export Store Data</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Download a complete JSON snapshot of your current inventory stock, sales history, and revenue metrics.
          </p>
          <button className="btn btn-primary" onClick={handleExport} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            <Download size={20} /> Generate & Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
