import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: 'var(--sidebar-width)', 
        padding: '2rem 3rem',
        maxWidth: '100vw'
      }}>
        <Outlet />
      </main>
    </div>
  );
}
