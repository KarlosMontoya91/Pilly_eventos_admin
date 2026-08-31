import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Package, List, Tag, Settings, Truck, Gift, History, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const menuItems = [
    { name: 'Inicio', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Nueva cotización', path: '/cotizar', icon: <FileText size={20} /> },
    { name: 'Cotizaciones', path: '/cotizaciones', icon: <History size={20} /> },
    { name: 'Paquetes', path: '/paquetes', icon: <Package size={20} /> },
    { name: 'Artículos', path: '/articulos', icon: <List size={20} /> },
    { name: 'Precios', path: '/precios', icon: <Tag size={20} /> },
    { name: 'Promociones', path: '/promociones', icon: <Gift size={20} /> },
    { name: 'Traslados', path: '/traslados', icon: <Truck size={20} /> },
    { name: 'Configuración', path: '/configuracion', icon: <Settings size={20} /> },
  ];

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <img 
            src={`${import.meta.env.BASE_URL}pilly-logo-horizontal.webp`} 
            alt="Pilly Eventos" 
            style={{ maxWidth: '160px', height: 'auto', margin: '0 auto' }} 
          />
          <button className="mobile-only-btn" onClick={closeSidebar} style={{ background: 'none', border: 'none', color: 'var(--pilly-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                textDecoration: 'none',
                color: isActive ? 'var(--pilly-turquoise-deep)' : 'var(--pilly-purple)',
                backgroundColor: isActive ? 'rgba(55, 195, 184, 0.1)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                fontWeight: isActive ? '800' : '600',
                transition: 'all 0.2s'
              })}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-only-btn" onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'var(--pilly-purple)', cursor: 'pointer', marginRight: '1rem' }}>
            <Menu size={24} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }} className="hide-on-mobile">Administración</h2>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: '600', color: 'var(--pilly-purple)' }} className="hide-on-mobile">Administrador</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--pilly-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              A
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
