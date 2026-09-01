import React, { useState, useEffect } from 'react';
import { Plus, Package as PackageIcon, Edit2, Trash2, X, Save, Search, PlusCircle, MinusCircle } from 'lucide-react';
import { fetchFromSheet } from '../services/api';

interface ArticleItem {
  ID: string;
  Nombre: string;
  PrecioSugerido: number;
  CostoInterno: number;
}

interface PackageArticle {
  ID: string;
  Nombre: string;
  Cantidad: number;
  PrecioSugerido: number;
  CostoInterno: number;
}

const Packages = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // States for the Modal Form
  const [formData, setFormData] = useState({
    Nombre: '',
    Personas: '10',
    PrecioBase: '',
    Estatus: 'Activo'
  });
  const [packageArticles, setPackageArticles] = useState<PackageArticle[]>([]);
  const [articleSearch, setArticleSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pkgsData, artsData] = await Promise.all([
        fetchFromSheet({ action: "GET_ALL", sheet: "PAQUETES" }),
        fetchFromSheet({ action: "GET_ALL", sheet: "ARTICULOS" })
      ]);
      setPackages(pkgsData || []);
      setArticles(artsData || []);
    } catch (e: any) {
      console.error(e);
      alert("Error al cargar los datos: " + e.message);
    }
    setLoading(false);
  };

  const calculateSuggestedPrice = () => {
    return packageArticles.reduce((sum, item) => sum + (Number(item.PrecioSugerido) * item.Cantidad), 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Preparamos los artículos como un string JSON para guardarlos en Google Sheets
      const articulosJson = JSON.stringify(packageArticles);
      
      await fetchFromSheet({
        action: editingId ? "UPDATE" : "CREATE",
        sheet: "PAQUETES",
        id: editingId || undefined,
        data: {
          ...formData,
          Articulos: articulosJson
        }
      });
      setIsModalOpen(false);
      setEditingId(null);
      resetForm();
      await loadData();
    } catch (error: any) {
      console.error(error);
      alert("Error al guardar el paquete: " + error.message);
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setFormData({ Nombre: '', Personas: '10', PrecioBase: '', Estatus: 'Activo' });
    setPackageArticles([]);
    setArticleSearch('');
  };

  const handleEdit = (pkg: any) => {
    setEditingId(pkg.ID);
    setFormData({
      Nombre: pkg.Nombre || '',
      Personas: pkg.Personas || '10',
      PrecioBase: pkg.PrecioBase || '',
      Estatus: pkg.Estatus || 'Activo'
    });
    
    // Intentar parsear los artículos si existen
    let parsedArticles = [];
    try {
      if (pkg.Articulos) {
        parsedArticles = JSON.parse(pkg.Articulos);
      }
    } catch (e) {
      console.warn("No se pudieron parsear los artículos del paquete", e);
    }
    
    setPackageArticles(parsedArticles);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el paquete "${nombre}"?`)) return;
    try {
      await fetchFromSheet({ action: "DELETE", sheet: "PAQUETES", id: id });
      await loadData();
    } catch (error: any) {
      console.error(error);
      alert("Error al eliminar: " + error.message);
    }
  };

  const addArticleToPackage = (article: ArticleItem) => {
    const existing = packageArticles.find(a => a.ID === article.ID);
    if (existing) {
      setPackageArticles(packageArticles.map(a => 
        a.ID === article.ID ? { ...a, Cantidad: a.Cantidad + 1 } : a
      ));
    } else {
      setPackageArticles([...packageArticles, { 
        ID: article.ID, 
        Nombre: article.Nombre, 
        Cantidad: 1, 
        PrecioSugerido: article.PrecioSugerido,
        CostoInterno: article.CostoInterno
      }]);
    }
  };

  const updateArticleQuantity = (id: string, change: number) => {
    setPackageArticles(packageArticles.map(a => {
      if (a.ID === id) {
        const newQty = Math.max(1, a.Cantidad + change);
        return { ...a, Cantidad: newQty };
      }
      return a;
    }));
  };

  const removeArticleFromPackage = (id: string) => {
    setPackageArticles(packageArticles.filter(a => a.ID !== id));
  };

  const filteredArticles = articles.filter(a => a.Nombre?.toLowerCase().includes(articleSearch.toLowerCase())).slice(0, 5);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Paquetes de Eventos</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingId(null);
          resetForm();
          setIsModalOpen(true);
        }}>
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
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Cargando paquetes...</td></tr>
            ) : packages.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <PackageIcon size={48} style={{ color: 'var(--pilly-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No tienes paquetes creados.</p>
                  <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => {
                    setEditingId(null);
                    resetForm();
                    setIsModalOpen(true);
                  }}>Crear el primero</button>
                </td>
              </tr>
            ) : (
              packages.map((pkg, idx) => (
                <tr key={pkg.ID || idx}>
                  <td style={{ fontWeight: 'bold' }}>{pkg.Nombre}</td>
                  <td>{pkg.Personas}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--pilly-purple)' }}>${pkg.PrecioBase}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.875rem',
                      backgroundColor: pkg.Estatus === 'Activo' ? 'rgba(55, 195, 184, 0.2)' : 'rgba(115, 95, 118, 0.2)',
                      color: pkg.Estatus === 'Activo' ? 'var(--pilly-turquoise-deep)' : 'var(--pilly-muted)'
                    }}>
                      {pkg.Estatus || 'Desconocido'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn" style={{ padding: '0.5rem', color: 'var(--pilly-turquoise)', border: 'none', background: 'transparent' }} onClick={() => handleEdit(pkg)} title="Ver/Editar Paquete">
                      <Edit2 size={18} />
                    </button>
                    <button className="btn" style={{ padding: '0.5rem', color: 'var(--pilly-pink)', border: 'none', background: 'transparent' }} onClick={() => handleDelete(pkg.ID, pkg.Nombre)} title="Eliminar Paquete">
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editingId ? 'Detalles del Paquete' : 'Armar Nuevo Paquete'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pilly-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre del paquete</label>
                  <input required type="text" className="form-control" value={formData.Nombre} onChange={e => setFormData({...formData, Nombre: e.target.value})} placeholder="Ej. Paquete Básico XV Años" />
                </div>
                <div className="form-group">
                  <label className="form-label">Para Personas</label>
                  <input required type="number" className="form-control" value={formData.Personas} onChange={e => setFormData({...formData, Personas: e.target.value})} placeholder="Ej. 50" />
                </div>
              </div>

              <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--pilly-purple)' }}>Artículos Incluidos</h4>
                
                {/* Buscador de artículos */}
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pilly-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Buscar en el catálogo para agregar..." 
                    style={{ paddingLeft: '2.5rem' }}
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                  />
                  {articleSearch && filteredArticles.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {filteredArticles.map(art => (
                        <div 
                          key={art.ID} 
                          style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                          onClick={() => { addArticleToPackage(art); setArticleSearch(''); }}
                        >
                          <span>{art.Nombre}</span>
                          <span style={{ color: 'var(--pilly-turquoise)' }}><Plus size={16} /></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de artículos del paquete */}
                {packageArticles.length === 0 ? (
                  <p className="text-muted" style={{ textAlign: 'center', fontStyle: 'italic' }}>No hay artículos en este paquete aún.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {packageArticles.map(art => (
                      <div key={art.ID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ flex: 1 }}>{art.Nombre}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
                          <button type="button" onClick={() => updateArticleQuantity(art.ID, -1)} style={{ border: 'none', background: 'none', color: 'var(--pilly-pink)', cursor: 'pointer' }}><MinusCircle size={18} /></button>
                          <span style={{ width: '20px', textAlign: 'center', fontWeight: 'bold' }}>{art.Cantidad}</span>
                          <button type="button" onClick={() => updateArticleQuantity(art.ID, 1)} style={{ border: 'none', background: 'none', color: 'var(--pilly-turquoise)', cursor: 'pointer' }}><PlusCircle size={18} /></button>
                        </div>
                        <div style={{ width: '80px', textAlign: 'right', marginRight: '1rem' }}>
                          ${(art.Cantidad * Number(art.PrecioSugerido)).toFixed(2)}
                        </div>
                        <button type="button" onClick={() => removeArticleFromPackage(art.ID)} style={{ border: 'none', background: 'none', color: 'var(--pilly-muted)', cursor: 'pointer' }}>
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 'bold', color: 'var(--pilly-purple)' }}>
                      Costo Sugerido de los artículos: ${calculateSuggestedPrice().toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Precio Final del Paquete ($)</label>
                  <input required type="number" className="form-control" value={formData.PrecioBase} onChange={e => setFormData({...formData, PrecioBase: e.target.value})} placeholder="Ej. 1500.00" />
                  <small className="text-muted" style={{ display: 'block', marginTop: '0.25rem' }}>
                    * El precio sugerido por los artículos es de ${calculateSuggestedPrice().toFixed(2)}. Puedes ajustar el precio final aquí.
                  </small>
                </div>
                <div className="form-group">
                  <label className="form-label">Estatus</label>
                  <select className="form-control" value={formData.Estatus} onChange={e => setFormData({...formData, Estatus: e.target.value})}>
                    <option>Activo</option>
                    <option>Suspendido</option>
                    <option>Desactivado</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : <><Save size={20} /> {editingId ? 'Actualizar' : 'Guardar'} Paquete</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;
