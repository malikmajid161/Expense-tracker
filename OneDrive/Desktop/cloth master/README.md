# 🧵 ClothMaster — Clothing Store Management System

A complete, multi-page **React + Vite** web application for managing a clothing retail business. Built with a premium light theme, persistent localStorage, and fully interconnected page navigation via React Router.

---

## 🚀 Features

- 🔐 **Authentication** — Secure login with session persistence (`admin` / `admin123`)
- 📊 **Dashboard** — Real-time revenue chart (last 7 days of actual sales), stat cards, low-stock alerts, and live inventory search
- 📦 **Inventory Management** — Full CRUD (Add, Edit, Delete), category filter, color/name search, stock-level badges
- 🧾 **Point of Sale (POS)** — Select item, set quantity, auto-calculate total, process sale and auto-deduct from stock
- 📈 **Reports & Analytics** — Download full JSON snapshot of all data (inventory + sales)
- 👥 **Customer Directory** — Add, edit, search, and delete customer profiles
- 🚚 **Vendor/Supplier Directory** — Manage textile supplier companies and representative contacts
- ⚙️ **Settings** — Store configuration options

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI Framework |
| [Vite](https://vitejs.dev/) | Build Tool & Dev Server |
| [React Router v6](https://reactrouter.com/) | Client-side Routing |
| [Recharts](https://recharts.org/) | Revenue Charts |
| [Lucide React](https://lucide.dev/) | Icons |
| `localStorage` | Data Persistence (no backend needed) |

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/malikmajid161/gdg-project.git
cd gdg-project

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Login Credentials
| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

---

## 📁 Project Structure

```
src/
├── context/
│   └── StoreContext.jsx   # Global state (inventory, sales, customers, suppliers)
├── components/
│   ├── Layout.jsx         # App shell with Sidebar
│   └── Sidebar.jsx        # Navigation sidebar
├── pages/
│   ├── Login.jsx          # Auth page
│   ├── Dashboard.jsx      # Overview + quick search
│   ├── Inventory.jsx      # Stock CRUD
│   ├── Sales.jsx          # POS + history
│   ├── Reports.jsx        # Data export
│   ├── Customers.jsx      # CRM
│   ├── Suppliers.jsx      # Vendor directory
│   └── Settings.jsx       # Preferences
├── App.jsx                # Router config
├── main.jsx               # Entry point
└── index.css              # Global light theme styles
```

---

## 📸 Pages

- **Dashboard** — Real metrics, revenue chart, low-stock panel, and inventory search
- **Inventory** — Complete product catalogue with stock status badges
- **POS/Sales** — Streamlined point-of-sale with live total calculation
- **Reports** — One-click data export to `.json`
- **Customers & Suppliers** — Full directory management

---

## 🤝 License

MIT License — free to use and modify.
