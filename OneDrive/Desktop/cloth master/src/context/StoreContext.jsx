import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('clothmaster_auth') === 'true');

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('clothmaster_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('clothmaster_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('clothmaster_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('clothmaster_suppliers');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => localStorage.setItem('clothmaster_auth', isAuthenticated), [isAuthenticated]);
  useEffect(() => localStorage.setItem('clothmaster_inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('clothmaster_sales', JSON.stringify(sales)), [sales]);
  useEffect(() => localStorage.setItem('clothmaster_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('clothmaster_suppliers', JSON.stringify(suppliers)), [suppliers]);

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthenticated(false);

  const addOrUpdateItem = (item) => {
    setInventory(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = item;
        return updated;
      }
      return [...prev, { ...item, id: Date.now().toString() }];
    });
  };

  const deleteItem = (id) => setInventory(prev => prev.filter(i => i.id !== id));

  const processSale = (sale) => {
    // Reduce inventory
    setInventory(prev => prev.map(item => item.id === sale.itemId ? { ...item, quantity: item.quantity - sale.quantity } : item));
    // Add sale
    setSales(prev => [{ ...sale, id: Date.now().toString(), date: new Date().toISOString() }, ...prev]);
  };

  const addOrUpdateCustomer = (customer) => {
    setCustomers(prev => {
      const idx = prev.findIndex(c => c.id === customer.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = customer;
        return updated;
      }
      return [{ ...customer, id: Date.now().toString() }, ...prev];
    });
  };
  const deleteCustomer = (id) => setCustomers(prev => prev.filter(c => c.id !== id));

  const addOrUpdateSupplier = (supplier) => {
    setSuppliers(prev => {
      const idx = prev.findIndex(s => s.id === supplier.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = supplier;
        return updated;
      }
      return [{ ...supplier, id: Date.now().toString() }, ...prev];
    });
  };
  const deleteSupplier = (id) => setSuppliers(prev => prev.filter(s => s.id !== id));

  return (
    <StoreContext.Provider value={{
      isAuthenticated, inventory, sales, customers, suppliers,
      login, logout, addOrUpdateItem, deleteItem, processSale,
      addOrUpdateCustomer, deleteCustomer, addOrUpdateSupplier, deleteSupplier
    }}>
      {children}
    </StoreContext.Provider>
  );
}
