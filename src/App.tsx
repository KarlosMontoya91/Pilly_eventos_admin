import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Packages from './pages/Packages';
import Configuracion from './pages/Configuracion';
import Prices from './pages/Prices';
import NewQuote from './pages/NewQuote';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Home />} />
          <Route path="articulos" element={<Catalog />} />
          <Route path="paquetes" element={<Packages />} />
          <Route path="cotizar" element={<NewQuote />} />
          <Route path="cotizaciones" element={<PlaceholderPage title="Cotizaciones" />} />
          <Route path="precios" element={<Prices />} />
          <Route path="promociones" element={<PlaceholderPage title="Promociones" />} />
          <Route path="traslados" element={<PlaceholderPage title="Traslados y Zonas" />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
