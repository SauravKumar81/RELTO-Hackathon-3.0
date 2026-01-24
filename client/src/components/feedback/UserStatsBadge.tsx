import { Trophy, Star } from 'lucide-react';
import {type User } from '../../types/user';

type UserStatsBadgeProps = {
  user: User;
  onClick?: () => void;
};

const getRankTitle = (level: number): string => {
  if (level >= 20) return 'Legend';
  if (level >= 15) return 'Master';
  if (level >= 10) return 'Expert';
  if (level >= 5) return 'Helper';
  return 'Beginner';
};

const getRankColor = (level: number): string => {
  if (level >= 20) return 'from-purple-500 to-pink-500 shadow-purple-500/50';
  if (level >= 15) return 'from-yellow-500 to-orange-500 shadow-yellow-500/50';
  if (level >= 10) return 'from-blue-500 to-cyan-500 shadow-cyan-500/50';
  if (level >= 5) return 'from-green-500 to-emerald-500 shadow-green-500/50';
  return 'from-slate-400 to-slate-500';
};

export const UserStatsBadge = ({ user, onClick }: UserStatsBadgeProps) => {
  const level = user.level || 1;
  const points = user.points || 0;
  
  const rankTitle = getRankTitle(level);
  const rankColor = getRankColor(level);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 hover:bg-white/10 transition-all hover:scale-105 group"
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${rankColor} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
        <Trophy size={14} className="text-white" />
      </div>
      <div className="text-left">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Lv {level}</span>
          <span className="text-[10px] text-white/20">|</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{rankTitle}</span>
        </div>
        <div className="flex items-center gap-1 -mt-0.5">
          <Star size={8} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] text-gray-500 font-mono">{points} XP</span>
        </div>
      </div>
    </button>
  );
};
