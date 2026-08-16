import React from 'react';
import PollingPlaceLookupView from '@/src/components/polling/PollingPlaceLookupView';

export default function TerritoryPollingPlaceLookupPage() {
  return (
    <PollingPlaceLookupView 
      moduleSource="TERRITORY"
      title="Consulta lugar de votación"
      subtitle="Módulo de Gestión Territorial • Validación de puestos, zonas y mesas para la red de líderes y votantes."
    />
  );
}
