import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Packages from './pages/Packages';
import PlaceholderPage from './pages/PlaceholderPage';
import Configuracion from './pages/Configuracion';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Home />} />
          <Route path="cotizar" element={<PlaceholderPage title="Nueva Cotización" />} />
          <Route path="cotizaciones" element={<PlaceholderPage title="Historial de Cotizaciones" />} />
          <Route path="paquetes" element={<Packages />} />
          <Route path="articulos" element={<Catalog />} />
          <Route path="precios" element={<PlaceholderPage title="Precios y Servicios Escalonados" />} />
          <Route path="promociones" element={<PlaceholderPage title="Promociones y Descuentos" />} />
          <Route path="traslados" element={<PlaceholderPage title="Costos de Traslado" />} />
          <Route path="configuracion" element={<Configuracion />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
