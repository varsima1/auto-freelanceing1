import { SystemStats as Stats } from '../types';

interface Props { stats: Stats; }

const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-1`}>
    <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
    <span className={`text-2xl font-bold ${color}`}>{value}</span>
    {sub && <span className="text-gray-600 text-xs">{sub}</span>}
  </div>
);

export default function SystemStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} sub="All agents combined" color="text-green-400" />
      <StatCard label="Success Rate" value={`${stats.successRate}%`} sub={`${stats.tasksToday} tasks today`} color="text-cyan-400" />
      <StatCard label="Templates Stored" value={stats.templatesStored} sub="Reusable solutions" color="text-violet-400" />
      <StatCard label="Human Help" value={`${stats.humanInterventions}`} sub="0.0001% target" color="text-yellow-400" />
    </div>
  );
}
