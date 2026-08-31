import React from 'react';

const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div>
      <h1 style={{ margin: '0 0 1rem 0' }}>{title}</h1>
      <div className="card">
        <p className="text-muted">Este módulo está en construcción. Pronto podrás gestionar esta sección.</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
