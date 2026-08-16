import React from 'react';
import PollingPlaceLookupView from '@/src/components/polling/PollingPlaceLookupView';

export default function StrategyPollingPlaceLookupPage() {
  return (
    <PollingPlaceLookupView 
      moduleSource="STRATEGY"
      title="Consulta lugar de votación"
      subtitle="Módulo de Gestión Estratégica • Inteligencia territorial y localización de censo para metas de campaña."
    />
  );
}
