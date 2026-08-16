import React from 'react';
import { Users, UserCheck, Target, Award, WifiOff, Plus } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';

export function TerritorialStats() {
  return (
    <div className="space-y-4">
      {/* Líderes y Votantes */}
      <Card className="bg-[#0b1b36] border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Líderes y Votantes</h3>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total Líderes</p>
              <p className="text-xl font-bold text-white">4,500</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total Votantes</p>
              <p className="text-xl font-bold text-white">350K</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Cobertura Territorial</span>
              <span className="text-indigo-400 font-bold">78%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '78%' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Operación Electoral */}
      <Card className="bg-[#0b1b36] border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operación Electoral</h3>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Testigos E-14</p>
                <p className="text-lg font-bold text-white">12,000</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase text-rose-400">Faltantes</p>
                <p className="text-sm font-bold text-rose-400">500</p>
              </div>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="85, 100" />
              </svg>
              <span className="absolute text-[10px] font-bold text-white">85%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Field Registration Action */}
      <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black p-4 rounded-2xl flex items-center justify-between transition-all group shadow-lg shadow-emerald-500/10">
        <div className="flex items-center gap-3">
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm">Registro en Campo (Offline)</span>
        </div>
        <WifiOff className="w-4 h-4 opacity-50" />
      </button>
    </div>
  );
}
