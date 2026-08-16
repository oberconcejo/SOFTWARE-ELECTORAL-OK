import React from 'react';
import PollingPlaceLookupView from '@/src/components/polling/PollingPlaceLookupView';

export default function AdminPollingPlaceLookupPage() {
  return (
    <PollingPlaceLookupView 
      moduleSource="ADMINISTRATIVE"
      title="Consulta lugar de votación"
      subtitle="Módulo de Gestión Administrativa • Consulta individual y masiva con registro de trazabilidad electoral."
    />
  );
}
