import React from 'react';
import PollingPlaceLookupView from '@/src/components/polling/PollingPlaceLookupView';

export default function PollingPlaceLookupPage() {
  return (
    <PollingPlaceLookupView 
      moduleSource="ADMINISTRATIVE"
      title="Consulta lugar de votación"
      subtitle="Función transversal del sistema • Localización y validación oficial de puestos y mesas de votación."
    />
  );
}
