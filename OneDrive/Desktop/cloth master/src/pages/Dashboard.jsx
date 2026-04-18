import React, { useState } from 'react';
import { TrendingUp, Package, DollarSign, AlertCircle, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { inventory, sales } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const totalItems = inventory.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);
  const totalRevenue = sales.reduce((acc, sale) => acc + (parseFloat(sale.salePrice) * parseInt(sale.quantity)), 0);
  
  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
  const revenueToday = todaySales.reduce((acc, sale) => acc + (parseFloat(sale.salePrice) * parseInt(sale.quantity)), 0);

  const lowStockItems = inventory.filter(i => parseInt(i.quantity) < 5).sort((a,b) => a.quantity - b.quantity);

  // Generate last 7 days chart data dynamically
  const generateChartData = () => {
    const days = [];
    const revenueMap = {};

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDateStr = d.toDateString();
      days.push({ name: dateStr, fullDateStr, revenue: 0 });
      revenueMap[fullDateStr] = 0;
    }

    // Populate actual sales
    sales.forEach(sale => {
      const saleDateStr = new Date(sale.date).toDateString();
      if (revenueMap[saleDateStr] !== undefined) {
        revenueMap[saleDateStr] += (parseFloat(sale.salePrice) * parseInt(sale.quantity));
      }
    });

    // Map back to array
    return days.map(day => ({
      name: day.name,
      revenue: revenueMap[day.fullDateStr]
    }));
  };

  const chartData = generateChartData();

  const formatCurrency = (val) => '$' + parseFloat(val).toFixed(2);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back to ClothMaster. Here's what's happening today.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</h3>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '0.5rem' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {formatCurrency(totalRevenue)}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Revenue Today</h3>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {formatCurrency(revenueToday)}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items in Stock</h3>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--warning)', borderRadius: '0.5rem' }}>
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {totalItems}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Low Stock Items</h3>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '0.5rem' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {lowStockItems.length}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Revenue Overview (Last 7 Days)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Low Stock Alerts</h3>
          {lowStockItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <Package size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p>All stock levels are healthy.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lowStockItems.slice(0, 5).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</h4>
                    <span className="badge badge-neutral">{item.category}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{item.quantity} left</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Quick Search */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Quick Stock Search</h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-control"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search inventory by name, category or color..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {searchTerm.trim() === '' ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>Start typing above to search your stock items.</p>
        ) : (() => {
          const results = inventory.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.color.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return results.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No items matched your search.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Buy Price</th>
                    <th>Sell Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600' }}>{item.name}</td>
                      <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{item.category}</span></td>
                      <td>{item.color}</td>
                      <td>{item.size}</td>
                      <td>{formatCurrency(item.buyPrice)}</td>
                      <td>{formatCurrency(item.sellPrice)}</td>
                      <td>
                        <span className={`badge ${
                          item.quantity <= 0 ? 'badge-danger' : item.quantity < 5 ? 'badge-warning' : 'badge-success'
                        }`}>
                          {item.quantity} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
