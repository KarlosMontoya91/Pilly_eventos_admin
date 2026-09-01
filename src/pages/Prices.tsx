import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save } from 'lucide-react';
import { fetchFromSheet } from '../services/api';

const Prices = () => {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    NombreServicio: '',
    Descripcion: '',
    Precio: '',
    Estatus: 'Activo'
  });

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const data = await fetchFromSheet({ action: "GET_ALL", sheet: "PRECIOS" });
      setPrices(data || []);
    } catch (e: any) {
      console.error(e);
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetchFromSheet({
        action: editingId ? "UPDATE" : "CREATE",
        sheet: "PRECIOS",
        id: editingId || undefined,
        data: formData
      });
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ NombreServicio: '', Descripcion: '', Precio: '', Estatus: 'Activo' });
      await loadPrices();
    } catch (error: any) {
      console.error(error);
      alert("Error al guardar el precio: " + error.message);
    }
    setIsSaving(false);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.ID);
    setFormData({
      NombreServicio: item.NombreServicio || '',
      Descripcion: item.Descripcion || '',
      Precio: item.Precio || '',
      Estatus: item.Estatus || 'Activo'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la tarifa "${nombre}"?`)) return;
    try {
      await fetchFromSheet({ action: "DELETE", sheet: "PRECIOS", id: id });
      await loadPrices();
    } catch (error: any) {
      console.error(error);
      alert("Error al eliminar: " + error.message);
    }
  };

  const filteredPrices = prices.filter(item => 
    item.NombreServicio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Gestión de Precios Especiales</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingId(null);
          setFormData({ NombreServicio: '', Descripcion: '', Precio: '', Estatus: 'Activo' });
          setIsModalOpen(true);
        }}>
          <Plus size={20} />
          Nueva Tarifa
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pilly-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por nombre del servicio..." 
              style={{ paddingLeft: '3rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Servicio / Concepto</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Estatus</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Cargando tarifas...</td></tr>
            ) : filteredPrices.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>No hay tarifas registradas.</td></tr>
            ) : (
              filteredPrices.map((item, idx) => (
                <tr key={item.ID || idx}>
                  <td style={{ fontWeight: 'bold' }}>{item.NombreServicio}</td>
                  <td>{item.Descripcion}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--pilly-purple)' }}>${item.Precio}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.875rem',
                      backgroundColor: item.Estatus === 'Activo' ? 'rgba(55, 195, 184, 0.2)' : 'rgba(115, 95, 118, 0.2)',
                      color: item.Estatus === 'Activo' ? 'var(--pilly-turquoise-deep)' : 'var(--pilly-muted)'
                    }}>
                      {item.Estatus || 'Desconocido'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn" style={{ padding: '0.5rem', color: 'var(--pilly-turquoise)', border: 'none', background: 'transparent' }} onClick={() => handleEdit(item)}>
                      <Edit2 size={18} />
                    </button>
                    <button className="btn" style={{ padding: '0.5rem', color: 'var(--pilly-pink)', border: 'none', background: 'transparent' }} onClick={() => handleDelete(item.ID, item.NombreServicio)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(36, 16, 47, 0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editingId ? 'Editar Tarifa' : 'Agregar Tarifa'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pilly-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nombre del servicio o tarifa</label>
                <input required type="text" className="form-control" value={formData.NombreServicio} onChange={e => setFormData({...formData, NombreServicio: e.target.value})} placeholder="Ej. Hora Extra de Servicio" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" value={formData.Descripcion} onChange={e => setFormData({...formData, Descripcion: e.target.value})} placeholder="Detalles de lo que incluye la tarifa..." rows={3}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Precio ($)</label>
                  <input required type="number" className="form-control" value={formData.Precio} onChange={e => setFormData({...formData, Precio: e.target.value})} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Estatus</label>
                  <select className="form-control" value={formData.Estatus} onChange={e => setFormData({...formData, Estatus: e.target.value})}>
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : <><Save size={20} /> {editingId ? 'Actualizar' : 'Guardar'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prices;
