import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchFromSheet } from '../services/api';

const Configuracion = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [error, setError] = useState('');

  const log = (msg: string) => setProgress(p => [...p, msg]);

  const handleInitialize = async () => {
    if (!window.confirm("¿Estás seguro de que deseas inyectar los datos semilla? Asegúrate de que las pestañas estén 100% vacías antes de hacer esto para evitar duplicados.")) return;
    
    setIsInitializing(true);
    setError('');
    setProgress([]);

    try {
      // ARTICULOS
      const articulos = [
        { Nombre: "Balde con elote", Categoria: "Complementos para barra", Unidad: "Balde", CostoInterno: 200, PrecioSugerido: 350, Estatus: "Activo" },
        { Nombre: "Queso amarillo", Categoria: "Salsas y complementos", Unidad: "Recipiente", CostoInterno: 300, PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Galletas", Categoria: "Dulces y Salados", Unidad: "Paquete", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Gomitas", Categoria: "Dulces y Salados", Unidad: "Kilogramo", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Papas", Categoria: "Dulces y Salados", Unidad: "Kilogramo", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Cacahuates", Categoria: "Dulces y Salados", Unidad: "Kilogramo", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Pepino", Categoria: "Dulces y Salados", Unidad: "Kilogramo", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Zanahoria", Categoria: "Dulces y Salados", Unidad: "Kilogramo", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Jícama", Categoria: "Dulces y Salados", Unidad: "Kilogramo", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Mango", Categoria: "Dulces y Salados", Unidad: "Kilogramo", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Chamoy", Categoria: "Salsas y complementos", Unidad: "Litro", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Tajín", Categoria: "Salsas y complementos", Unidad: "Recipiente", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Vasos adicionales", Categoria: "Mobiliario y Extras", Unidad: "Paquete", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Persona de servicio adicional", Categoria: "Mobiliario y Extras", Unidad: "Persona", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Hora adicional", Categoria: "Mobiliario y Extras", Unidad: "Hora", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Piñata personalizada", Categoria: "Piñatas y Decoración", Unidad: "Pieza", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Relleno de piñata", Categoria: "Piñatas y Decoración", Unidad: "Paquete", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Mampara", Categoria: "Mobiliario y Extras", Unidad: "Pieza", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Guirnalda de globos", Categoria: "Piñatas y Decoración", Unidad: "Pieza", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" },
        { Nombre: "Figura temática", Categoria: "Piñatas y Decoración", Unidad: "Pieza", CostoInterno: "", PrecioSugerido: "", Estatus: "Pendiente de definir" }
      ];

      for (let art of articulos) {
        log(`Creando artículo: ${art.Nombre}`);
        await fetchFromSheet({ action: "CREATE", sheet: "ARTICULOS", data: art });
      }

      // PAQUETES
      const paquetes = [
        { Nombre: "Barra Piye Mini", Personas: 20, Modalidad: "Mixta fresca", PrecioBase: 2450, Nivel: "Mini", Duracion: "2 horas", Estatus: "Activo" },
        { Nombre: "Barra Piye Clásica", Personas: 50, Modalidad: "Mixta fresca", PrecioBase: 3950, Nivel: "Clásico", Duracion: "2 horas", Estatus: "Activo" },
        { Nombre: "Barra Piye Plus", Personas: 70, Modalidad: "Mixta fresca", PrecioBase: 5050, Nivel: "Plus", Duracion: "2 horas", Estatus: "Activo" },
        { Nombre: "Barra Piye Fiesta", Personas: 100, Modalidad: "Mixta fresca", PrecioBase: 6650, Nivel: "Fiesta", Duracion: "2 horas", Estatus: "Activo" },
        { Nombre: "Decoración Piye Mini", Personas: 20, Modalidad: "Decoración", PrecioBase: 2500, Nivel: "Mini", Duracion: "-", Estatus: "Activo" },
        { Nombre: "Decoración Piye Clásico", Personas: 50, Modalidad: "Decoración", PrecioBase: 4000, Nivel: "Clásico", Duracion: "-", Estatus: "Activo" },
        { Nombre: "Decoración Piye Plus", Personas: 70, Modalidad: "Decoración", PrecioBase: 5500, Nivel: "Plus", Duracion: "-", Estatus: "Activo" },
        { Nombre: "Decoración Piye Premium", Personas: 100, Modalidad: "Decoración", PrecioBase: 7500, Nivel: "Premium", Duracion: "-", Estatus: "Activo" }
      ];

      for (let pq of paquetes) {
        log(`Creando paquete: ${pq.Nombre}`);
        await fetchFromSheet({ action: "CREATE", sheet: "PAQUETES", data: pq });
      }

      // SERVICIOS ESCALONADOS
      const serviciosEscalonados = [
        { Servicio: "Mesa dulce", Personas20: 1590, Personas50: 2990, Personas70: 3790, Personas100: 4990 },
        { Servicio: "Mesa salada", Personas20: 1690, Personas50: 3190, Personas70: 4090, Personas100: 5490 },
        { Servicio: "Mesa mixta", Personas20: 1640, Personas50: 3090, Personas70: 3940, Personas100: 5190 },
        { Servicio: "Dulce a granel", Personas20: 1900, Personas50: 3050, Personas70: 3850, Personas100: 4950 },
        { Servicio: "Salada a granel", Personas20: 2050, Personas50: 3300, Personas70: 4200, Personas100: 5450 },
        { Servicio: "Mixta a granel", Personas20: 2150, Personas50: 3550, Personas70: 4550, Personas100: 5950 },
        { Servicio: "Mixta con fruta y verdura", Personas20: 2450, Personas50: 3950, Personas70: 5050, Personas100: 6650 },
        { Servicio: "Solo dulce (Individual)", Personas20: 1100, Personas50: 2750, Personas70: 3850, Personas100: 5500 },
        { Servicio: "Solo salado (Individual)", Personas20: 1200, Personas50: 3000, Personas70: 4200, Personas100: 6000 },
        { Servicio: "Mixto (Individual)", Personas20: 1160, Personas50: 2900, Personas70: 4060, Personas100: 5800 }
      ];

      for (let srv of serviciosEscalonados) {
        log(`Creando servicio: ${srv.Servicio}`);
        await fetchFromSheet({ action: "CREATE", sheet: "SERVICIOS_ESCALONADOS", data: srv });
      }

      // INICIALIZAR ENCABEZADOS RESTANTES
      log("Inicializando encabezados de tablas vacías...");
      const tablasVacias = [
        { sheet: "CONFIGURACION", data: { Clave: "IVA", Valor: "16", Estatus: "Activo" } },
        { sheet: "PAQUETE_DETALLE", data: { IdPaquete: "", IdArticulo: "", Cantidad: 1, Incluido: "Sí", PrecioAdicional: 0 } },
        { sheet: "PROMOCIONES", data: { Nombre: "Promo Buen Fin", Descuento: 10, Tipo: "Porcentaje", Activo: "No" } },
        { sheet: "TRANSPORTES", data: { Zona: "Monterrey Centro", Costo: 300, Estatus: "Activo" } },
        { sheet: "COTIZACIONES", data: { Cliente: "Ejemplo", Fecha: "2026-08-30", Invitados: 50, Total: 0, Anticipo: 0, Estatus: "Borrador" } },
        { sheet: "COTIZACION_DETALLE", data: { IdCotizacion: "", TipoRenglon: "Paquete", IdOriginal: "", NombreGuardado: "", PrecioUnitarioGuardado: 0, CostoInternoGuardado: 0, Importe: 0 } },
        { sheet: "HISTORIAL_CAMBIOS", data: { Fecha: "2026-08-30", Modulo: "Sistema", Accion: "Inicialización", Usuario: "Admin" } }
      ];

      for (let tabla of tablasVacias) {
        await fetchFromSheet({ action: "CREATE", sheet: tabla.sheet, data: tabla.data });
      }

      log("¡Proceso completado con éxito!");
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      log("ERROR CRÍTICO: El proceso se detuvo.");
    }
    
    setIsInitializing(false);
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 1rem 0' }}>Configuración del Sistema</h1>
      
      <div className="card" style={{ maxWidth: '800px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: 'var(--pilly-purple)' }}>
          <Database size={24} /> Base de Datos (Google Sheets)
        </h3>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Utiliza esta herramienta para inyectar los datos iniciales y configurar automáticamente los encabezados de todas las pestañas de tu Google Sheet.
        </p>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 68, 136, 0.1)', color: 'var(--pilly-pink)', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <button 
          className="btn btn-secondary" 
          onClick={handleInitialize} 
          disabled={isInitializing}
          style={{ marginBottom: '1.5rem' }}
        >
          {isInitializing ? 'Inyectando datos...' : 'Inicializar Datos Semilla'}
        </button>

        {progress.length > 0 && (
          <div style={{ backgroundColor: 'var(--pilly-paper)', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', maxHeight: '300px', overflowY: 'auto' }}>
            {progress.map((msg, i) => (
              <div key={i} style={{ color: msg.includes('ERROR') ? 'red' : 'var(--pilly-turquoise-deep)', display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <CheckCircle size={16} /> {msg}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuracion;
