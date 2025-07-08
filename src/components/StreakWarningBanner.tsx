/**
 * Streak warning banner component for dashboard display
 */
import React from 'react';
import { Clock, Flame, AlertTriangle, Zap } from 'lucide-react';

interface StreakWarningBannerProps {
  hoursRemaining: number;
  currentStreak: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  onActionClick?: () => void;
}

export const StreakWarningBanner: React.FC<StreakWarningBannerProps> = ({
  hoursRemaining,
  currentStreak,
  urgencyLevel,
  onActionClick
}) => {
  const getStyles = () => {
    switch (urgencyLevel) {
      case 'high':
        return {
          container: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
          icon: <AlertTriangle className="w-5 h-5" />,
          pulse: 'animate-pulse'
        };
      case 'medium':
        return {
          container: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white',
          icon: <Clock className="w-5 h-5" />,
          pulse: ''
        };
      default:
        return {
          container: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
          icon: <Clock className="w-5 h-5" />,
          pulse: ''
        };
    }
  };

  const styles = getStyles();

  const getMessage = () => {
    const hours = Math.floor(hoursRemaining);
    const minutes = Math.floor((hoursRemaining % 1) * 60);

    if (hours === 0) {
      return `🚨 Only ${minutes} minutes left to maintain your ${currentStreak}-day streak!`;
    } else if (hours === 1) {
      return `⚠️ 1 hour ${minutes > 0 ? `${minutes}m` : ''} left to keep your ${currentStreak}-day streak alive`;
    } else {
      return `💡 ${hours} hours remaining to maintain your ${currentStreak}-day streak`;
    }
  };

  if (hoursRemaining >= 12 || currentStreak === 0) {
    return null;
  }

  return (
    <div className={`${styles.container} rounded-xl p-4 shadow-lg ${styles.pulse} mx-4 mb-4`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">
            {getMessage()}
          </p>
          <p className="text-xs opacity-90 mt-1">
            Place a bet now to continue your winning streak!
          </p>
        </div>
        {onActionClick && (
          <button
            onClick={onActionClick}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
          >
            Bet Now
          </button>
        )}
      </div>
    </div>
  );
};