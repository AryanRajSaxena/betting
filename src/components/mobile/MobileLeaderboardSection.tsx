import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  Flame, 
  TrendingUp,
  Users,
  Target,
  Award,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { User } from '../../types';
import { getLeaderboard, getUserRank, LeaderboardUser, getTierInfo } from '../../services/leaderboard';

interface MobileLeaderboardSectionProps {
  currentUser: User;
}

export const MobileLeaderboardSection: React.FC<MobileLeaderboardSectionProps> = ({
  currentUser
}) => {
  const [players, setPlayers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number; percentile: number } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const tierInfo = getTierInfo();

  const getTierConfig = (tier: string) => {
    const info = tierInfo[tier as keyof typeof tierInfo];
    if (!info) return tierInfo.Bronze;

    switch (tier) {
      case 'Master':
        return {
          gradient: 'from-red-500 via-pink-500 to-purple-600',
          bgGradient: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
          borderColor: 'border-red-300 dark:border-red-600',
          textColor: 'text-red-700 dark:text-red-300',
          icon: <Crown className="w-4 h-4" />
        };
      case 'Diamond':
        return {
          gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
          bgGradient: 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20',
          borderColor: 'border-cyan-300 dark:border-cyan-600',
          textColor: 'text-cyan-700 dark:text-cyan-300',
          icon: <Star className="w-4 h-4" />
        };
      case 'Platinum':
        return {
          gradient: 'from-gray-300 via-gray-400 to-gray-600',
          bgGradient: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
          borderColor: 'border-gray-300 dark:border-gray-600',
          textColor: 'text-gray-700 dark:text-gray-300',
          icon: <Award className="w-4 h-4" />
        };
      case 'Gold':
        return {
          gradient: 'from-yellow-400 via-orange-400 to-orange-600',
          bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
          borderColor: 'border-yellow-300 dark:border-yellow-600',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          icon: <Trophy className="w-4 h-4" />
        };
      case 'Silver':
        return {
          gradient: 'from-gray-200 via-gray-300 to-gray-500',
          bgGradient: 'from-gray-50 to-slate-100 dark:from-gray-800/20 dark:to-slate-800/20',
          borderColor: 'border-gray-200 dark:border-gray-600',
          textColor: 'text-gray-600 dark:text-gray-400',
          icon: <Medal className="w-4 h-4" />
        };
      default:
        return {
          gradient: 'from-orange-300 via-amber-400 to-orange-600',
          bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
          borderColor: 'border-orange-200 dark:border-orange-600',
          textColor: 'text-orange-600 dark:text-orange-400',
          icon: <Target className="w-4 h-4" />
        };
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
    return null;
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const [leaderboardData, rankData] = await Promise.all([
          getLeaderboard(50, 0, 'total_points'),
          getUserRank(currentUser.id)
        ]);
        
        setPlayers(leaderboardData);
        setUserRank(rankData);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [currentUser.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading Rankings...</p>
        </div>
      </div>
    );
  }

  const top10Players = players.slice(0, 10);
  const remainingPlayers = players.slice(10, 25); // Show top 25 on mobile

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="px-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Global Rankings
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Top prediction masters worldwide
          </p>
          
          {userRank && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
              <p className="text-blue-800 dark:text-blue-300 font-medium">
                Your Rank: <span className="font-bold">#{userRank.rank}</span> out of {userRank.totalUsers}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                Top {userRank.percentile}% of all players
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top 10 - Horizontal Scroll */}
      <div>
        <div className="px-4 mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top 10 Champions
          </h3>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
          {top10Players.map((player, index) => {
            const tierConfig = getTierConfig(player.tier);
            const isTop3 = player.rank_position <= 3;
            
            return (
              <div
                key={player.id}
                className={`flex-shrink-0 w-72 relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                  isTop3 
                    ? `bg-gradient-to-br ${tierConfig.gradient} p-[3px] shadow-2xl` 
                    : `bg-white dark:bg-slate-800 ${tierConfig.borderColor} hover:shadow-xl`
                }`}
              >
                {isTop3 && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      TOP {player.rank_position}
                    </div>
                  </div>
                )}

                <div className={`
                  relative p-6 rounded-2xl transition-all duration-300
                  ${isTop3 ? 'bg-white dark:bg-slate-900' : `${tierConfig.bgGradient}`}
                `}>
                  {/* Rank and Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`
                      relative flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl
                      ${isTop3 
                        ? `bg-gradient-to-br ${tierConfig.gradient} text-white shadow-lg` 
                        : `bg-slate-100 dark:bg-slate-700 ${tierConfig.textColor}`
                      }
                    `}>
                      {getRankIcon(player.rank_position) || player.rank_position}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        {player.name}
                      </h4>
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1
                        bg-gradient-to-r ${tierConfig.gradient} text-white
                      `}>
                        {tierConfig.icon}
                        {player.tier}
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="mb-4">
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {player.total_points.toLocaleString()} pts
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {formatCurrency(player.total_winnings)} earned
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-slate-50/80 dark:bg-slate-700/80 rounded-lg">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {player.current_streak}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Streak</div>
                    </div>
                    <div className="text-center p-2 bg-slate-50/80 dark:bg-slate-700/80 rounded-lg">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {player.total_bets}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Bets</div>
                    </div>
                    <div className="text-center p-2 bg-slate-50/80 dark:bg-slate-700/80 rounded-lg">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(player.weekly_earnings || 0)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Week</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {top10Players.length > 3 && (
          <div className="text-center px-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Swipe to see more champions →
            </p>
          </div>
        )}
      </div>

      {/* Remaining Players - Compact List */}
      {remainingPlayers.length > 0 && (
        <div className="px-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Rising Stars (11-25)
          </h3>
          
          <div className="space-y-2">
            {remainingPlayers.map((player) => {
              const tierConfig = getTierConfig(player.tier);
              
              return (
                <div
                  key={player.id}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all"
                >
                  {/* Rank */}
                  <div className="flex items-center gap-2 min-w-[50px]">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${tierConfig.bgGradient} ${tierConfig.textColor}
                    `}>
                      {player.rank_position}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                        {player.name}
                      </h4>
                      <div className={`
                        px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1
                        bg-gradient-to-r ${tierConfig.gradient} text-white
                      `}>
                        {tierConfig.icon}
                        {player.tier}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {player.current_streak} streak • {player.total_bets} bets
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {player.total_points.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">points</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {players.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="text-slate-400 dark:text-slate-500 text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No rankings yet</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Be the first to make predictions and climb the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
};