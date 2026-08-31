import React, { useState, useEffect } from 'react';
import { Plus, Search, Package as PackageIcon } from 'lucide-react';
import { fetchFromSheet } from '../services/api';

const Packages = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await fetchFromSheet({ action: "GET_ALL", sheet: "PAQUETES" });
      setPackages(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Paquetes de Eventos</h1>
        <button className="btn btn-primary">
          <Plus size={20} />
          Nuevo Paquete
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre del Paquete</th>
              <th>Personas</th>
              <th>Precio Base</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Cargando paquetes...</td></tr>
            ) : packages.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>
                  <PackageIcon size={48} style={{ color: 'var(--pilly-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No tienes paquetes creados.</p>
                  <button className="btn btn-outline" style={{ marginTop: '1rem' }}>Crear el primero</button>
                </td>
              </tr>
            ) : (
              packages.map((pkg, idx) => (
                <tr key={pkg.ID || idx}>
                  <td style={{ fontWeight: 'bold' }}>{pkg.Nombre}</td>
                  <td>{pkg.Personas}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--pilly-purple)' }}>${pkg.PrecioBase}</td>
                  <td>{pkg.Estatus}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Packages;
