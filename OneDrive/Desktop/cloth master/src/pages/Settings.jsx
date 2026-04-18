import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>System Preferences</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure app settings and administrative options.</p>
      </div>
      
      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <SettingsIcon size={24} className="text-muted" />
          <h3 style={{ fontSize: '1.25rem' }}>General Settings</h3>
        </div>

        <div className="input-group">
          <label className="input-label">Store Name</label>
          <input type="text" className="input-control" defaultValue="ClothMaster Default Store" />
        </div>

        <div className="input-group">
          <label className="input-label">Currency Symbol</label>
          <input type="text" className="input-control" defaultValue="$" />
        </div>

        <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Changes</button>
      </div>
    </div>
  );
}
