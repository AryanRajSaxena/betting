import React from 'react';
import { Clock, Users, Trophy, XCircle, CheckCircle } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  isAdmin?: boolean;
  userBet?: {
    amount: number;
    optionId: string;
    status: 'active' | 'won' | 'lost';
    payout?: number;
  } | null;
  onBet: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isAdmin = false, userBet, onBet }) => {
  const timeLeft = Math.max(0, event.expiresAt.getTime() - Date.now());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const getCategoryColor = (category: string) => {
    const colors = {
      Weather: 'bg-blue-500',
      Cryptocurrency: 'bg-orange-500',
      Sports: 'bg-green-500',
      Technology: 'bg-purple-500',
      Finance: 'bg-indigo-500',
      Politics: 'bg-red-500',
      Entertainment: 'bg-pink-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getUserBetOption = () => {
    if (!userBet) return null;
    return event.options.find(opt => opt.id === userBet.optionId);
  };

  const userBetOption = getUserBetOption();

  // Determine if user won or lost based on event resolution
  const getUserBetResult = () => {
    if (!userBet || event.status !== 'resolved' || !event.winningOption) {
      return userBet?.status || null;
    }
    
    // If event is resolved, determine win/loss based on winning option
    if (userBet.optionId === event.winningOption) {
      return 'won';
    } else {
      return 'lost';
    }
  };

  const userBetResult = getUserBetResult();

  const getResultDisplay = () => {
    if (!userBet || event.status !== 'resolved') return null;

    const isWinner = userBetResult === 'won';
    const winningOption = event.options.find(opt => opt.id === event.winningOption);

    return (
      <div className={`mt-4 p-4 rounded-lg border-2 ${
        isWinner 
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400' 
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {isWinner ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
          <span className={`font-bold ${
            isWinner ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {isWinner ? 'You Won!' : 'Better luck next time'}
          </span>
        </div>
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Your bet:</span>
            <span className="font-medium text-gray-900 dark:text-white">{userBetOption?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(userBet.amount)}</span>
          </div>
          {isWinner && userBet.payout && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Payout:</span>
              <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(userBet.payout)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
            <span className="text-gray-600 dark:text-gray-400">Result:</span>
            <span className="font-medium text-gray-900 dark:text-white">{winningOption?.label}</span>
          </div>
        </div>

        {isWinner && userBet.payout && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
              <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Profit: {formatCurrency((userBet.payout || 0) - userBet.amount)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Determine card styling - no more faded colors for lost bets
  const getCardStyling = () => {
    return "bg-white dark:bg-gray-800"; // Always use clean backgrounds
  };

  const getBorderStyling = () => {
    if (!userBet) return "border-gray-100 dark:border-gray-700";
    if (event.status === 'resolved') {
      if (userBetResult === 'won') return "border-green-200 dark:border-green-700";
      if (userBetResult === 'lost') return "border-gray-200 dark:border-gray-600"; // Clean gray border instead of faded
    }
    return "border-gray-100 dark:border-gray-700";
  };

  return (
    <div className={`${getCardStyling()} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border ${getBorderStyling()} max-w-sm`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(event.category)}`}>
            {event.category}
          </span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              event.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 
              event.status === 'closed' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' : 
              'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
            }`}>
              {event.status.toUpperCase()}
            </span>
            {userBet && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                userBet.status === 'active' && event.status === 'active' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' :
                userBetResult === 'won' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                userBetResult === 'lost' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
              }`}>
                {userBet.status === 'active' && event.status === 'active' ? 'BETTING' : 
                 userBetResult === 'won' ? 'WON' : 
                 userBetResult === 'lost' ? 'LOST' : 'BETTING'}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight text-gray-900 dark:text-white">
          {event.title}
        </h3>

        <div className="relative mb-4">
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-lg p-4 text-white shadow-lg overflow-hidden flex flex-col items-center justify-center">
            <div className="text-4xl font-extrabold tracking-tight text-center">
              {formatCurrency(event.totalPool)}
            </div>
            <div className="text-sm opacity-80 mt-1">Total Pool</div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse opacity-30"></div>
            <div className="absolute top-2 right-8 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute bottom-3 left-12 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="truncate">
              {event.status === 'resolved' ? 'Resolved' :
               hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : 
               minutesLeft > 0 ? `${minutesLeft}m left` : 'Expired'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{event.participantCount} bettors</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {event.options.slice(0, 2).map((option) => {
            const isWinningOption = event.winningOption === option.id;
            const isUserOption = userBet?.optionId === option.id;
            
            return (
              <div 
                key={option.id} 
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isWinningOption ? 'bg-green-100 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600' :
                  isUserOption ? 'bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600' :
                  'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate block text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                    {isWinningOption && <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    {isUserOption && !isWinningOption && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        YOUR BET
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.bettors} bets • {formatCurrency(option.totalBets)}
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {option.odds.toFixed(2)}x
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    live returns
                  </div>
                </div>
              </div>
            );
          })}

          {event.options.length > 2 && (
            <div className="text-center text-xs py-1 text-gray-500 dark:text-gray-400">
              +{event.options.length - 2} more options
            </div>
          )}
        </div>

        {/* Show result for resolved events */}
        {getResultDisplay()}

        <button
          onClick={() => onBet(event)}
          disabled={event.status !== 'active' || timeLeft <= 0}
          className="w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white"
        >
          {event.status !== 'active' ? 'Event Closed' : 
           timeLeft <= 0 ? 'Expired' : 
           userBet && event.status === 'active' ? 'Update Bet' : 'Place Bet'}
        </button>
      </div>
    </div>
  );
};