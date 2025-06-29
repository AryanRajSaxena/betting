import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Activity, 
  ChevronRight,
  Eye,
  EyeOff,
  Trophy,
  Target,
  Zap,
  Star
} from 'lucide-react';
import { User as UserType, Bet } from '../../types';

interface MobileDashboardProps {
  user: UserType & { netPL?: number };
  userBets: Bet[];
  onNavigate: (section: string) => void;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  user,
  userBets,
  onNavigate
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const activeBets = userBets.filter(bet => bet.status === 'active');
  const wonBets = userBets.filter(bet => bet.status === 'won');
  const resolvedBets = userBets.filter(bet => bet.status === 'won' || bet.status === 'lost');
  
  const totalActiveBetAmount = activeBets.reduce((sum, bet) => sum + bet.amount, 0);
  const netPL = user.netPL || 0;

  // Calculate current streak
  const calculateStreak = () => {
    const sortedBets = resolvedBets.sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime());
    let streak = 0;
    for (const bet of sortedBets) {
      if (bet.status === 'won') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  return (
    <div className="space-y-6 pb-6">
      {/* Available Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Available Balance</p>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-3xl font-bold">
                {showBalance ? formatCurrency(user.balance) : '₹ ••••••'}
              </h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Ready to win more</p>
            <p className="text-white font-semibold">Place your next bet!</p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
          >
            <span className="font-medium">Bet Now</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Total Profit Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                netPL >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                {netPL >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">Total Profit</p>
              <p className={`text-2xl font-bold ${
                netPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {netPL >= 0 ? '+' : ''}{formatCurrency(netPL)}
              </p>
              {netPL >= 0 && (
                <p className="text-green-600 dark:text-green-400 text-xs font-medium mt-1">
                  Great performance! 🎉
                </p>
              )}
            </div>
          </div>

          {/* Current Streak Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">Win Streak</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {currentStreak}
                {currentStreak >= 3 && <span className="text-lg ml-1">🔥</span>}
              </p>
              {currentStreak >= 3 && (
                <p className="text-orange-600 dark:text-orange-400 text-xs font-medium mt-1">
                  You're on fire!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Bets Section */}
      <div className="px-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="p-5 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Bets</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {activeBets.length} active • {formatCurrency(totalActiveBetAmount)} total
                  </p>
                </div>
              </div>
              {activeBets.length > 0 && (
                <button
                  onClick={() => onNavigate('events')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {activeBets.length > 0 ? (
              <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {activeBets.slice(0, 5).map((bet, index) => (
                  <div key={bet.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            Event #{bet.eventId.slice(-4)}
                          </p>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs">
                          Placed {bet.placedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(bet.amount)}
                        </p>
                        <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                          Active
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeBets.length > 5 && (
                  <div className="p-4 text-center">
                    <button
                      onClick={() => onNavigate('events')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      View all {activeBets.length} active bets
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Active Bets
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Ready to make your next winning prediction?
                </p>
                <button
                  onClick={() => onNavigate('events')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Browse Events
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Banner */}
      {currentStreak >= 5 && (
        <div className="mx-4">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Legendary Streak! 🏆</h3>
                <p className="text-yellow-100 text-sm">
                  {currentStreak} wins in a row! You're in the top 1% of predictors!
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentStreak}</div>
                <div className="text-yellow-100 text-xs">wins</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="px-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(user.totalWinnings)}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Total Winnings</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.totalBets}</p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Total Bets</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {resolvedBets.length > 0 ? ((wonBets.length / resolvedBets.length) * 100).toFixed(0) : 0}%
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Win Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};