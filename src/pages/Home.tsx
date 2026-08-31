import React from 'react';

const Home = () => {
  return (
    <div>
      <h1 style={{ color: 'var(--pilly-pink)' }}>¡Bienvenido a Pilly Eventos Admin!</h1>
      <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
        Este es tu centro de control para gestionar el catálogo, los paquetes y crear cotizaciones personalizadas de manera rápida y segura.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card" style={{ borderTop: '4px solid var(--pilly-turquoise)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Nueva Cotización</h3>
          <p className="text-muted">Inicia una cotización en blanco para un cliente.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Comenzar</button>
        </div>
        <div className="card" style={{ borderTop: '4px solid var(--pilly-pink)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Artículos</h3>
          <p className="text-muted">Gestiona tu catálogo de productos individuales.</p>
          <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>Ver catálogo</button>
        </div>
        <div className="card" style={{ borderTop: '4px solid var(--pilly-yellow)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Paquetes</h3>
          <p className="text-muted">Crea o modifica los paquetes compuestos.</p>
          <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>Ver paquetes</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
