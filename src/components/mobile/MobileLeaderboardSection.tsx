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
  ChevronRight,
  Eye,
  User as UserIcon,
  RefreshCw,
  Gem,
  Shield
} from 'lucide-react';
import { User } from '../../types';
import { getLeaderboard, getUserRank, LeaderboardUser, getTierInfo, refreshLeaderboard } from '../../services/leaderboard';

interface MobileLeaderboardSectionProps {
  currentUser: User;
}

export const MobileLeaderboardSection: React.FC<MobileLeaderboardSectionProps> = ({
  currentUser
}) => {
  const [players, setPlayers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number; percentile: number } | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardUser | null>(null);

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
          gradient: 'from-indigo-500 via-purple-500 to-blue-600',
          bgGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
          borderColor: 'border-indigo-300 dark:border-indigo-600',
          textColor: 'text-indigo-700 dark:text-indigo-300',
          icon: <Shield className="w-4 h-4" />,
          aura: true,
          glowColor: 'shadow-indigo-500/50',
          metallic: 'bg-gradient-to-r from-indigo-400/20 via-purple-400/30 to-blue-400/20'
        };
      case 'Diamond':
        return {
          gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
          bgGradient: 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20',
          borderColor: 'border-cyan-300 dark:border-cyan-600',
          textColor: 'text-cyan-700 dark:text-cyan-300',
          icon: <Gem className="w-4 h-4" />,
          sparkle: true,
          glowColor: 'shadow-cyan-500/50',
          metallic: 'bg-gradient-to-r from-cyan-400/20 via-blue-400/30 to-indigo-400/20'
        };
      case 'Platinum':
        return {
          gradient: 'from-gray-300 via-gray-400 to-gray-600',
          bgGradient: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
          borderColor: 'border-gray-300 dark:border-gray-600',
          textColor: 'text-gray-700 dark:text-gray-300',
          icon: <Crown className="w-4 h-4" />,
          glow: true,
          glowColor: 'shadow-gray-400/50',
          metallic: 'bg-gradient-to-r from-gray-300/20 via-slate-300/30 to-gray-400/20'
        };
      case 'Gold':
        return {
          gradient: 'from-yellow-400 via-orange-400 to-orange-600',
          bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
          borderColor: 'border-yellow-300 dark:border-yellow-600',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          icon: <Trophy className="w-4 h-4" />,
          shine: true,
          glowColor: 'shadow-yellow-500/50',
          metallic: 'bg-gradient-to-r from-yellow-400/20 via-orange-400/30 to-yellow-500/20'
        };
      case 'Silver':
        return {
          gradient: 'from-gray-200 via-gray-300 to-gray-500',
          bgGradient: 'from-gray-50 to-slate-100 dark:from-gray-800/20 dark:to-slate-800/20',
          borderColor: 'border-gray-200 dark:border-gray-600',
          textColor: 'text-gray-600 dark:text-gray-400',
          icon: <Medal className="w-4 h-4" />,
          metallic: 'bg-gradient-to-r from-gray-200/20 via-gray-300/30 to-gray-400/20',
          glowColor: 'shadow-gray-300/40'
        };
      case 'Bronze':
        return {
          gradient: 'from-orange-300 via-amber-400 to-orange-600',
          bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
          borderColor: 'border-orange-200 dark:border-orange-600',
          textColor: 'text-orange-600 dark:text-orange-400',
          icon: <Award className="w-4 h-4" />,
          metallic: 'bg-gradient-to-r from-orange-300/20 via-amber-400/30 to-orange-500/20',
          glowColor: 'shadow-orange-400/40'
        };
      default:
        return {
          gradient: 'from-gray-300 to-gray-500',
          bgGradient: 'from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20',
          borderColor: 'border-gray-200 dark:border-gray-600',
          textColor: 'text-gray-600 dark:text-gray-400',
          icon: <Star className="w-4 h-4" />,
          metallic: 'bg-gradient-to-r from-gray-300/20 via-gray-400/30 to-gray-500/20',
          glowColor: 'shadow-gray-300/30'
        };
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
    return null;
  };

  const loadLeaderboard = async () => {
    try {
      console.log('[MobileLeaderboard] Loading leaderboard data...');
      
      const [leaderboardData, rankData] = await Promise.all([
        getLeaderboard(50, 0, 'total_winnings'),
        getUserRank(currentUser.id)
      ]);
      
      console.log('[MobileLeaderboard] Loaded data:', {
        playersCount: leaderboardData.length,
        userRank: rankData
      });
      
      setPlayers(leaderboardData);
      setUserRank(rankData);
    } catch (error) {
      console.error('[MobileLeaderboard] Failed to load leaderboard:', error);
      setPlayers([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLeaderboard();
      await loadLeaderboard();
    } catch (error) {
      console.error('[MobileLeaderboard] Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initializeLeaderboard = async () => {
      setLoading(true);
      await loadLeaderboard();
      setLoading(false);
    };

    initializeLeaderboard();
  }, [currentUser.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading Rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Enhanced Header with Premium Gradient */}
      <div className="px-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Global Rankings
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Top prediction masters worldwide
          </p>
          
          {userRank && (
            <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-4 shadow-lg">
              <p className="text-indigo-800 dark:text-indigo-300 font-medium">
                Your Rank: <span className="font-bold">#{userRank.rank}</span> out of {userRank.totalUsers}
              </p>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm">
                Top {userRank.percentile}% of all players
              </p>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Rankings'}
          </button>
        </div>
      </div>

      {/* Enhanced Compact Horizontal Ranking Bars */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Top Rankings
        </h3>
        
        <div className="space-y-3 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {players.map((player) => {
            const tierConfig = getTierConfig(player.tier);
            const isTop3 = player.rank_position <= 3;
            
            return (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className={`relative cursor-pointer transition-all duration-300 active:scale-95 ${
                  isTop3 ? 'transform hover:scale-105' : 'hover:scale-102'
                }`}
              >
                <div className={`
                  flex items-center gap-4 p-4 rounded-2xl border transition-all shadow-lg
                  ${isTop3 
                    ? `bg-gradient-to-r ${tierConfig.gradient} text-white shadow-2xl ${tierConfig.glowColor}` 
                    : `bg-white dark:bg-slate-800 ${tierConfig.borderColor} hover:shadow-xl ${tierConfig.glowColor}`
                  }
                `}>
                  
                  {/* Metallic Texture Overlay */}
                  <div className={`absolute inset-0 ${tierConfig.metallic} opacity-30 rounded-2xl pointer-events-none`}></div>
                  
                  {/* Special Effects for Top Tiers */}
                  {tierConfig.aura && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-600/20 animate-pulse rounded-2xl"></div>
                  )}
                  {tierConfig.sparkle && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse opacity-30"></div>
                      <div className="absolute top-2 right-2 w-1 h-1 bg-cyan-300 rounded-full animate-ping"></div>
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    </>
                  )}
                  {tierConfig.glow && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-300/10 via-white/20 to-gray-300/10 animate-pulse rounded-2xl"></div>
                  )}
                  {tierConfig.shine && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/20 to-transparent -skew-x-12 animate-pulse opacity-40"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                    </>
                  )}

                  {/* Crown for #1 Position */}
                  {player.rank_position === 1 && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                      <Crown className="w-6 h-6 text-yellow-300 animate-bounce" />
                    </div>
                  )}

                  {/* Rank */}
                  <div className="flex items-center gap-2 min-w-[50px] relative z-10">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md
                      ${isTop3 
                        ? 'bg-white/20 backdrop-blur-sm text-white' 
                        : `${tierConfig.bgGradient} ${tierConfig.textColor}`
                      }
                    `}>
                      {getRankIcon(player.rank_position) || player.rank_position}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-lg relative z-10 ${
                    isTop3 ? 'bg-white/20 backdrop-blur-sm text-white' : 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white'
                  } ${tierConfig.glowColor}`}>
                    {player.name.split(' ').map(n => n[0]).join('')}
                    {(player.current_streak || 0) > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                        <Flame className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold truncate ${
                        isTop3 ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}>
                        {player.name}
                      </h4>
                      <div className={`
                        px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm
                        ${isTop3 
                          ? 'bg-white/20 backdrop-blur-sm text-white' 
                          : `bg-gradient-to-r ${tierConfig.gradient} text-white`
                        }
                      `}>
                        {tierConfig.icon}
                        {player.tier}
                      </div>
                    </div>
                    <div className={`text-xs flex items-center gap-3 ${
                      isTop3 ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {player.current_streak || 0} streak
                      </span>
                      <span>{player.total_bets} bets</span>
                    </div>
                  </div>

                  {/* Money Earned with Enhanced Styling */}
                  <div className="text-right relative z-10">
                    <div className={`font-bold ${
                      isTop3 ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {formatCurrency(player.total_winnings)}
                    </div>
                    <div className={`text-xs ${
                      isTop3 ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      <strong>money earned</strong>
                    </div>
                  </div>

                  {/* Tap to expand indicator */}
                  <div className={`${
                    isTop3 ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'
                  } relative z-10`}>
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {players.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="text-slate-400 dark:text-slate-500 text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No rankings yet</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Be the first to make predictions and climb the leaderboard!
          </p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
          >
            Refresh Rankings
          </button>
        </div>
      )}

      {/* Enhanced Mobile Profile Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl ${getTierConfig(selectedPlayer.tier).glowColor}`}>
                    {selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedPlayer.name}
                      {selectedPlayer.is_verified && (
                        <Star className="w-5 h-5 text-blue-500" />
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 dark:text-slate-400">
                        Rank #{selectedPlayer.rank_position}
                      </span>
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md
                        bg-gradient-to-r ${getTierConfig(selectedPlayer.tier).gradient} text-white
                      `}>
                        {getTierConfig(selectedPlayer.tier).icon}
                        {selectedPlayer.tier}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedPlayer(null)}
                  className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-md"
                >
                  ✕
                </button>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-xl">
                  <div className="text-2xl font-bold">{formatCurrency(selectedPlayer.total_winnings)}</div>
                  <div className="text-green-100 text-sm">Money Earned</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-4 rounded-xl shadow-xl">
                  <div className="text-2xl font-bold">{selectedPlayer.total_bets}</div>
                  <div className="text-blue-100 text-sm">Total Bets</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 rounded-xl shadow-xl">
                  <div className="text-2xl font-bold">{selectedPlayer.current_streak || 0}</div>
                  <div className="text-orange-100 text-sm">Current Streak</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-4 rounded-xl shadow-xl">
                  <div className="text-2xl font-bold">{selectedPlayer.total_points?.toLocaleString() || 0}</div>
                  <div className="text-purple-100 text-sm">Total Points</div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Weekly Earnings</span>
                  <span className={`font-semibold ${
                    (selectedPlayer.weekly_earnings || 0) >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(selectedPlayer.weekly_earnings || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Longest Streak</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedPlayer.longest_streak || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Member Since</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedPlayer.created_at).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};