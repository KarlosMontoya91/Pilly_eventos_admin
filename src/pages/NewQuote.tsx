import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Save, ArrowLeft, PlusCircle, MinusCircle, User, Calendar, Phone, FileText } from 'lucide-react';
import { fetchFromSheet } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface QuoteItem {
  id: string; // Puede ser un ID real o generado (para conceptos libres)
  name: string;
  quantity: number;
  salePrice: number; // Precio de Venta Unitario
  internalCost: number; // Costo de Inversión Unitario
  type: 'ARTICULO' | 'PAQUETE' | 'PRECIO' | 'LIBRE';
}

interface SearchableCatalogItem {
  id: string;
  name: string;
  salePrice: number;
  internalCost: number;
  type: 'ARTICULO' | 'PAQUETE' | 'PRECIO';
  originalData: any;
}

const NewQuote = () => {
  const navigate = useNavigate();
  
  // Data de catálogos
  const [catalog, setCatalog] = useState<SearchableCatalogItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Estados de la cotización
  const [clientData, setClientData] = useState({
    nombre: '',
    telefono: '',
    fechaEvento: '',
    notas: ''
  });
  
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    setLoadingCatalog(true);
    try {
      const [articulos, paquetes, precios] = await Promise.all([
        fetchFromSheet({ action: "GET_ALL", sheet: "ARTICULOS" }),
        fetchFromSheet({ action: "GET_ALL", sheet: "PAQUETES" }),
        fetchFromSheet({ action: "GET_ALL", sheet: "PRECIOS" })
      ]);

      const formattedCatalog: SearchableCatalogItem[] = [];

      // Procesar Artículos
      (articulos || []).forEach((art: any) => {
        if (art.Estatus === 'Activo') {
          formattedCatalog.push({
            id: art.ID,
            name: art.Nombre,
            salePrice: Number(art.PrecioSugerido) || 0,
            internalCost: Number(art.CostoInterno) || 0,
            type: 'ARTICULO',
            originalData: art
          });
        }
      });

      // Procesar Paquetes
      (paquetes || []).forEach((pkg: any) => {
        if (pkg.Estatus === 'Activo') {
          let internalCost = 0;
          try {
            if (pkg.Articulos) {
              const parsed = JSON.parse(pkg.Articulos);
              internalCost = parsed.reduce((sum: number, item: any) => sum + (Number(item.CostoInterno) * Number(item.Cantidad)), 0);
            }
          } catch(e) {}

          formattedCatalog.push({
            id: pkg.ID,
            name: `(Paquete) ${pkg.Nombre}`,
            salePrice: Number(pkg.PrecioBase) || 0,
            internalCost: internalCost,
            type: 'PAQUETE',
            originalData: pkg
          });
        }
      });

      // Procesar Precios
      (precios || []).forEach((pr: any) => {
        if (pr.Estatus === 'Activo') {
          formattedCatalog.push({
            id: pr.ID,
            name: pr.NombreServicio,
            salePrice: Number(pr.Precio) || 0,
            internalCost: 0, // Las tarifas fijas (ej. envío) usualmente no tienen costo interno (o es subjetivo)
            type: 'PRECIO',
            originalData: pr
          });
        }
      });

      setCatalog(formattedCatalog);
    } catch (error: any) {
      console.error("Error al cargar catálogos:", error);
    }
    setLoadingCatalog(false);
  };

  const filteredCatalog = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return catalog.filter(item => item.name.toLowerCase().includes(term)).slice(0, 8);
  }, [searchTerm, catalog]);

  const addItemToQuote = (catalogItem: SearchableCatalogItem) => {
    const existing = items.find(i => i.id === catalogItem.id);
    if (existing) {
      setItems(items.map(i => i.id === catalogItem.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, {
        id: catalogItem.id,
        name: catalogItem.name,
        quantity: 1,
        salePrice: catalogItem.salePrice,
        internalCost: catalogItem.internalCost,
        type: catalogItem.type
      }]);
    }
    setSearchTerm('');
  };

  const addCustomItem = () => {
    const customId = `custom_${Date.now()}`;
    setItems([...items, {
      id: customId,
      name: 'Concepto Nuevo / Libre',
      quantity: 1,
      salePrice: 0,
      internalCost: 0,
      type: 'LIBRE'
    }]);
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSaveQuote = async () => {
    if (!clientData.nombre) {
      alert("El nombre del cliente es obligatorio.");
      return;
    }
    if (items.length === 0) {
      alert("La cotización debe tener al menos un concepto.");
      return;
    }

    setIsSaving(true);
    try {
      const totales = calculateTotals();
      
      await fetchFromSheet({
        action: "CREATE",
        sheet: "COTIZACIONES",
        data: {
          FechaCreacion: new Date().toISOString(),
          ClienteNombre: clientData.nombre,
          ClienteTelefono: clientData.telefono,
          FechaEvento: clientData.fechaEvento,
          Notas: clientData.notas,
          Items: JSON.stringify(items),
          TotalInversion: totales.inversion,
          TotalVenta: totales.venta,
          Ganancia: totales.ganancia,
          Estatus: 'Borrador'
        }
      });
      
      alert("¡Cotización guardada con éxito!");
      navigate('/cotizaciones');
    } catch (error: any) {
      console.error(error);
      alert("Error al guardar: " + error.message);
    }
    setIsSaving(false);
  };

  const calculateTotals = () => {
    let inversion = 0;
    let venta = 0;

    items.forEach(item => {
      inversion += (Number(item.internalCost) * item.quantity);
      venta += (Number(item.salePrice) * item.quantity);
    });

    const ganancia = venta - inversion;
    const margen = venta > 0 ? (ganancia / venta) * 100 : 0;

    return { inversion, venta, ganancia, margen };
  };

  const totales = calculateTotals();

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--pilly-muted)', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ margin: 0, color: 'var(--pilly-purple)' }}>Generar Nueva Cotización</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* PANEL: Datos del Cliente */}
        <section className="card" style={{ borderTop: '4px solid var(--pilly-pink)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} /> Datos del Cliente y Evento
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Nombre del Cliente *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pilly-muted)' }} />
                <input type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} value={clientData.nombre} onChange={e => setClientData({...clientData, nombre: e.target.value})} placeholder="Ej. Ana P." />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pilly-muted)' }} />
                <input type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} value={clientData.telefono} onChange={e => setClientData({...clientData, telefono: e.target.value})} placeholder="Ej. 81 1234 5678" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha del Evento</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pilly-muted)' }} />
                <input type="date" className="form-control" style={{ paddingLeft: '2.5rem' }} value={clientData.fechaEvento} onChange={e => setClientData({...clientData, fechaEvento: e.target.value})} />
              </div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Lugar del Evento / Notas</label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--pilly-muted)' }} />
                <textarea className="form-control" style={{ paddingLeft: '2.5rem' }} rows={2} value={clientData.notas} onChange={e => setClientData({...clientData, notas: e.target.value})} placeholder="Dirección, color de temática, etc..."></textarea>
              </div>
            </div>
          </div>
        </section>

        {/* PANEL: Conceptos */}
        <section className="card" style={{ borderTop: '4px solid var(--pilly-turquoise)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={20} /> Armar Cotización
            </h3>
            <button className="btn btn-outline" onClick={addCustomItem} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
              <Plus size={16} /> Concepto Libre
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder={loadingCatalog ? "Cargando catálogos..." : "Escribe para buscar artículos, paquetes o tarifas..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={loadingCatalog}
              style={{ fontSize: '1.1rem', padding: '0.75rem 1rem', borderColor: 'var(--pilly-turquoise)' }}
            />
            {searchTerm && filteredCatalog.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                {filteredCatalog.map(catItem => (
                  <div 
                    key={catItem.id} 
                    style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                    onClick={() => addItemToQuote(catItem)}
                  >
                    <div>
                      <span style={{ fontWeight: '600' }}>{catItem.name}</span>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--pilly-muted)' }}>
                        {catItem.type}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ color: 'var(--pilly-purple)', fontWeight: 'bold' }}>${catItem.salePrice.toFixed(2)}</span>
                      <span style={{ color: 'var(--pilly-turquoise)' }}><Plus size={18} /></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchTerm && filteredCatalog.length === 0 && (
               <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', padding: '1rem', textAlign: 'center', color: 'var(--pilly-muted)', zIndex: 10 }}>
                 No se encontraron resultados para "{searchTerm}"
               </div>
            )}
          </div>

          <div className="table-wrapper">
            <table className="table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Concepto</th>
                  <th style={{ width: '15%' }}>Cantidad</th>
                  <th style={{ width: '15%' }}>Costo (Inversión)</th>
                  <th style={{ width: '15%' }}>Precio al Cliente</th>
                  <th style={{ width: '15%' }}>Subtotal Venta</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--pilly-muted)' }}>
                      No has agregado ningún artículo a la cotización.<br/>Busca en la barra superior o agrega un concepto libre.
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} style={{ backgroundColor: item.type === 'LIBRE' ? 'rgba(255, 235, 59, 0.05)' : 'transparent' }}>
                      <td>
                        {item.type === 'LIBRE' ? (
                          <input 
                            type="text" 
                            className="form-control" 
                            value={item.name} 
                            onChange={e => updateItem(item.id, 'name', e.target.value)}
                            style={{ padding: '0.4rem', fontSize: '0.875rem' }}
                          />
                        ) : (
                          <span style={{ fontWeight: '500' }}>{item.name}</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button onClick={() => updateItem(item.id, 'quantity', Math.max(1, item.quantity - 1))} style={{ background:'none', border:'none', color:'var(--pilly-pink)', cursor:'pointer' }}><MinusCircle size={18}/></button>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={item.quantity} 
                            onChange={e => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                            style={{ width: '60px', padding: '0.2rem', textAlign: 'center' }}
                          />
                          <button onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)} style={{ background:'none', border:'none', color:'var(--pilly-turquoise)', cursor:'pointer' }}><PlusCircle size={18}/></button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ color: 'var(--pilly-muted)' }}>$</span>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={item.internalCost} 
                            onChange={e => updateItem(item.id, 'internalCost', Number(e.target.value))}
                            style={{ padding: '0.4rem', fontSize: '0.875rem' }}
                          />
                        </div>
                      </td>
                      <td>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ color: 'var(--pilly-muted)' }}>$</span>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={item.salePrice} 
                            onChange={e => updateItem(item.id, 'salePrice', Number(e.target.value))}
                            style={{ padding: '0.4rem', fontSize: '0.875rem' }}
                          />
                        </div>
                      </td>
                      <td style={{ fontWeight: 'bold', color: 'var(--pilly-purple)' }}>
                        ${(item.salePrice * item.quantity).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--pilly-muted)', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* PANEL: Resumen Financiero y Acciones */}
        {items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-end' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', borderTop: '4px solid var(--pilly-purple)' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Resumen</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--pilly-muted)' }}>
                <span>Costo Total (Inversión)</span>
                <span>${totales.inversion.toFixed(2)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--pilly-purple)' }}>
                <span>Precio al Cliente</span>
                <span>${totales.venta.toFixed(2)}</span>
              </div>
              
              <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: '1rem' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>Ganancia Estimada</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--pilly-turquoise-deep)' }}>
                    ${totales.ganancia.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pilly-muted)', marginTop: '0.25rem' }}>
                    Margen: {totales.margen.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ padding: '1rem 2rem', fontSize: '1.1rem', width: '100%', maxWidth: '400px' }}
              onClick={handleSaveQuote}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando Cotización...' : <><Save size={20} /> Guardar Cotización</>}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default NewQuote;
