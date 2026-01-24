import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/ui/Button';
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
  Award,
  CheckCircle,
  Package,
  Target,
  Check,
  Zap
} from 'lucide-react';
import { getRankTitle } from '../utils/gamification';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  if (!user) {
    navigate('/login');
    return null;
  }

  const rankTitle = getRankTitle(user.level);
  const currentLevelPoints = user.points % 500;
  const progressPercent = (currentLevelPoints / 500) * 100;
  const pointsToNextLevel = 500 - currentLevelPoints;
  
  const achievements = [
    { 
      icon: Package, 
      title: 'First Post', 
      description: 'Posted a found item',
      unlocked: user.itemsPosted >= 1,
      color: 'blue'
    },
    { 
      icon: CheckCircle, 
      title: 'Reunited', 
      description: 'Claimed your lost item',
      unlocked: user.itemsClaimed >= 1,
      color: 'green'
    },
    { 
      icon: Award, 
      title: 'Good Samaritan', 
      description: 'Returned an item to its owner',
      unlocked: user.itemsReturned >= 1,
      color: 'yellow'
    },
    { 
      icon: Target, 
      title: 'Lucky Finder', 
      description: 'Claimed 5 lost items',
      unlocked: user.itemsClaimed >= 5,
      color: 'purple'
    },
    { 
      icon: Trophy, 
      title: 'Level 5', 
      description: 'Reached level 5',
      unlocked: user.level >= 5,
      color: 'orange'
    },
    { 
      icon: Star, 
      title: 'Legend', 
      description: 'Reached level 20',
      unlocked: user.level >= 20,
      color: 'pink'
    },
  ];

  const getRankColor = (level: number): string => {
    if (level >= 20) return 'from-purple-500 via-fuchsia-500 to-pink-500';
    if (level >= 15) return 'from-yellow-500 via-amber-500 to-orange-500';
    if (level >= 10) return 'from-cyan-400 via-blue-500 to-indigo-500';
    if (level >= 5) return 'from-emerald-400 via-green-500 to-teal-500';
    return 'from-slate-400 to-slate-500';
  };

  const getAchievementColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 shadow-blue-500/50',
      green: 'bg-green-500 shadow-green-500/50',
      yellow: 'bg-yellow-500 shadow-yellow-500/50',
      purple: 'bg-purple-500 shadow-purple-500/50',
      orange: 'bg-orange-500 shadow-orange-500/50',
      pink: 'bg-pink-500 shadow-pink-500/50',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:bg-white/10 text-white"
          >
            <ArrowLeft size={20} />
            Back to Map
          </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pt-20">
        
        <div className="glass-panel chamfered-box rounded-3xl overflow-hidden relative group">
          <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(user.level)} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-700`} />
          <div className="relative p-8 flex flex-col items-center justify-center text-center">
             
             <div className="relative mb-6">
                <div className={`absolute -inset-4 bg-gradient-to-r ${getRankColor(user.level)} rounded-full blur-lg opacity-60 animate-pulse`} />
                <div className={`relative h-32 w-32 rounded-full bg-gradient-to-br ${getRankColor(user.level)} flex items-center justify-center border-4 border-[#050505] shadow-2xl z-10`}>
                    <Trophy size={56} className="text-white drop-shadow-md" />
                </div>
                <div className="absolute bottom-0 right-0 z-20 bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                    Lvl {user.level}
                </div>
             </div>

             <h1 className="text-4xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{user.name}</h1>
             <p className="text-cyan-400 font-mono text-sm tracking-wider uppercase mb-6">{rankTitle} Agent</p>
             
             <div className="flex gap-8 text-center">
                 <div>
                    <div className="text-3xl font-bold text-white mb-1">{user.points}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total XP</div>
                 </div>
                 <div className="w-px bg-white/10" />
                 <div>
                    <div className="text-3xl font-bold text-white mb-1">{user.itemsReturned}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Returned</div>
                 </div>
             </div>
          </div>
        </div>

        <div className="glass-panel chamfered-box p-8 relative overflow-hidden">
             <div className="flex items-center justify-between mb-4 relative z-10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Zap className="text-yellow-400 fill-yellow-400" size={24} />
                    Level Progress
                </h2>
                <span className="text-sm font-bold text-gray-400">{currentLevelPoints} <span className="text-gray-600">/</span> 500 XP</span>
             </div>
             
             <div className="relative h-4 bg-black/40 rounded-full overflow-hidden mb-2 border border-white/5">
                <div 
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getRankColor(user.level)} shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-1000 ease-out`}
                    style={{ width: `${progressPercent}%` }}
                />
             </div>
             <p className="text-right text-xs text-gray-500 font-mono mt-2">{pointsToNextLevel} XP needed for Level {user.level + 1}</p>
        </div>


        <div className="grid grid-cols-3 gap-6">
          <div className="glass-panel p-6 text-center transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-500/10 mx-auto mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Package size={28} className="text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{user.itemsPosted}</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Posted</div>
          </div>
          
          <div className="glass-panel p-6 text-center transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-green-500/10 mx-auto mb-4 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
              <CheckCircle size={28} className="text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{user.itemsClaimed}</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Claimed</div>
          </div>
          
          <div className="glass-panel p-6 text-center transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-yellow-500/10 mx-auto mb-4 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
              <Award size={28} className="text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{user.itemsReturned}</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Returned</div>
          </div>
        </div>

        <div className="glass-panel chamfered-box p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award size={24} className="text-purple-400" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.title}
                className={`rounded-xl p-5 text-center transition-all bg-white/5 border border-white/5 hover:border-white/20 group ${!achievement.unlocked && 'grayscale opacity-40'}`}
              >
                <div className={`flex items-center justify-center h-14 w-14 rounded-full mx-auto mb-4 shadow-lg ${
                  achievement.unlocked ? getAchievementColor(achievement.color) : 'bg-gray-700'
                } group-hover:scale-110 transition-transform`}>
                  <achievement.icon size={26} className="text-white" />
                </div>
                <div className="text-sm font-bold text-white mb-1">{achievement.title}</div>
                <div className="text-xs text-gray-400 mb-2 leading-snug">{achievement.description}</div>
                {achievement.unlocked && (
                  <div className="text-[10px] font-bold text-green-400 flex items-center justify-center gap-1 uppercase tracking-wide bg-green-900/20 py-1 rounded-full border border-green-500/20">
                    <Check size={10} strokeWidth={4} />
                    Unlocked
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
