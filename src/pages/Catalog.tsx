import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save } from 'lucide-react';
import { fetchFromSheet } from '../services/api';

const Catalog = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    Nombre: '',
    Categoria: 'Complementos para barra',
    Unidad: 'Pieza',
    CostoInterno: '',
    PrecioSugerido: '',
    Estatus: 'Activo'
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchFromSheet({ action: "GET_ALL", sheet: "ARTICULOS" });
      setItems(data || []);
    } catch (e: any) {
      console.error(e);
      alert("Error: " + e.message + "\n\n1. Verifica que la pestaña se llame exactamente 'ARTICULOS'.\n2. Verifica que el Apps Script tenga permisos para 'Cualquier persona'.");
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetchFromSheet({
        action: editingId ? "UPDATE" : "CREATE",
        sheet: "ARTICULOS",
        id: editingId || undefined,
        data: formData
      });
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ Nombre: '', Categoria: 'Complementos para barra', Unidad: 'Pieza', CostoInterno: '', PrecioSugerido: '', Estatus: 'Activo' });
      await loadItems();
    } catch (error: any) {
      console.error(error);
      alert("Error al guardar el artículo: " + error.message);
    }
    setIsSaving(false);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.ID);
    setFormData({
      Nombre: item.Nombre || '',
      Categoria: item.Categoria || 'Complementos para barra',
      Unidad: item.Unidad || 'Pieza',
      CostoInterno: item.CostoInterno || '',
      PrecioSugerido: item.PrecioSugerido || '',
      Estatus: item.Estatus || 'Activo'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el artículo "${nombre}"?`)) return;
    
    try {
      await fetchFromSheet({
        action: "DELETE",
        sheet: "ARTICULOS",
        id: id
      });
      await loadItems();
    } catch (error: any) {
      console.error(error);
      alert("Error al eliminar: " + error.message);
    }
  };

  const filteredItems = items.filter(item => 
    item.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.Categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Catálogo de Artículos</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingId(null);
          setFormData({ Nombre: '', Categoria: 'Complementos para barra', Unidad: 'Pieza', CostoInterno: '', PrecioSugerido: '', Estatus: 'Activo' });
          setIsModalOpen(true);
        }}>
          <Plus size={20} />
          Nuevo Artículo
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pilly-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por nombre o categoría..." 
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
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th>Costo Interno</th>
              <th>Precio Sugerido</th>
              <th>Estatus</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Cargando artículos desde Google Sheets...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No hay artículos en el catálogo aún.</td></tr>
            ) : (
              filteredItems.map((item, idx) => (
                <tr key={item.ID || idx}>
                  <td style={{ fontWeight: 'bold' }}>{item.Nombre}</td>
                  <td>{item.Categoria}</td>
                  <td>{item.Unidad}</td>
                  <td className="text-muted">${item.CostoInterno}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--pilly-purple)' }}>${item.PrecioSugerido}</td>
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
                    <button className="btn" style={{ padding: '0.5rem', color: 'var(--pilly-turquoise)' }} onClick={() => handleEdit(item)}>
                      <Edit2 size={18} />
                    </button>
                    <button className="btn" style={{ padding: '0.5rem', color: 'var(--pilly-pink)' }} onClick={() => handleDelete(item.ID, item.Nombre)}>
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
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editingId ? 'Editar Artículo' : 'Agregar Artículo'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pilly-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nombre del artículo</label>
                <input required type="text" className="form-control" value={formData.Nombre} onChange={e => setFormData({...formData, Nombre: e.target.value})} placeholder="Ej. Balde con elote" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-control" value={formData.Categoria} onChange={e => setFormData({...formData, Categoria: e.target.value})}>
                    <option>Complementos para barra</option>
                    <option>Salsas y complementos</option>
                    <option>Dulces y Salados</option>
                    <option>Piñatas y Decoración</option>
                    <option>Mobiliario y Extras</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unidad de medida</label>
                  <select className="form-control" value={formData.Unidad} onChange={e => setFormData({...formData, Unidad: e.target.value})}>
                    <option>Pieza</option>
                    <option>Persona</option>
                    <option>Kilogramo</option>
                    <option>Litro</option>
                    <option>Charola</option>
                    <option>Recipiente</option>
                    <option>Balde</option>
                    <option>Paquete</option>
                    <option>Hora</option>
                    <option>Servicio</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Costo interno ($)</label>
                  <input required type="number" className="form-control" value={formData.CostoInterno} onChange={e => setFormData({...formData, CostoInterno: e.target.value})} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio de Venta Sugerido ($)</label>
                  <input required type="number" className="form-control" value={formData.PrecioSugerido} onChange={e => setFormData({...formData, PrecioSugerido: e.target.value})} placeholder="0.00" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Estatus</label>
                  <select className="form-control" value={formData.Estatus} onChange={e => setFormData({...formData, Estatus: e.target.value})}>
                    <option>Activo</option>
                    <option>Pendiente de definir</option>
                    <option>Inactivo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : <><Save size={20} /> {editingId ? 'Actualizar' : 'Guardar'} Artículo</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
