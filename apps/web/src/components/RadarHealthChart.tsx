import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { DimensionScore, EvaluationRating } from '@designforge/shared';

interface RadarHealthChartProps {
  overallScore: number;
  rating: EvaluationRating;
  dimensions: DimensionScore[];
}

export const RadarHealthChart: React.FC<RadarHealthChartProps> = ({
  overallScore,
  rating,
  dimensions
}) => {
  const chartData = dimensions.map(d => ({
    dimension: d.dimension.length > 15 ? d.dimension.split(' ')[0] : d.dimension,
    fullDimension: d.dimension,
    score: d.score,
    maxScore: 10
  }));

  const getRatingBadgeClass = (r: EvaluationRating) => {
    switch (r) {
      case 'STRONG':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
      case 'GOOD':
        return 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40';
      case 'NEEDS ATTENTION':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/40';
      case 'CRITICAL':
      default:
        return 'bg-red-950/60 text-red-400 border-red-500/40';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center gap-6">
      {/* Score Summary Block */}
      <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 w-full md:w-56 text-center">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
          Design Health
        </span>
        <div className="text-5xl font-extrabold my-2 bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          {overallScore}
          <span className="text-xl font-normal text-slate-500">/100</span>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${getRatingBadgeClass(rating)}`}>
          {rating} DESIGN
        </span>
        <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
          Aggregated across 12 architectural and OOP dimensions
        </p>
      </div>

      {/* Radar Chart Visual */}
      <div className="w-full h-72 flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="dimension" 
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 10]} 
              tick={{ fill: '#64748b', fontSize: 9 }} 
            />
            <Radar
              name="Design Health"
              dataKey="score"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
