import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  TrendingUp, 
  Wallet, 
  Trophy, 
  Settings, 
  Bell,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { User as UserType } from '../../types';
import { ThemeToggle } from '../ThemeToggle';

interface MobileHeaderProps {
  user: UserType & { netPL?: number };
  onSignOut: () => void;
  onMenuToggle: (isOpen: boolean) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  user,
  onSignOut,
  onMenuToggle
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleMenuToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    onMenuToggle(newState);
  };

  const netPL = user.netPL || 0;

  return (
    <>
      {/* Main Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-40 transition-colors duration-300">
        <div className="px-4 py-3">
          {/* Top Row - Logo and Menu */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">PredictBet</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Welcome, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleMenuToggle}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 rounded-2xl p-4 text-white shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Available Balance</span>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {showBalance ? formatCurrency(user.balance) : '₹ ••••••'}
                </div>
                <div className="text-sm opacity-80">
                  {user.isAdmin ? 'Admin Account' : 'Ready to bet'}
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${netPL >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                  {netPL >= 0 ? '+' : ''}{formatCurrency(netPL)}
                </div>
                <div className="text-xs opacity-80">Net P&L</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Menu */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${
        isMenuOpen ? 'visible' : 'invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={handleMenuToggle}
        />
        
        {/* Menu Panel */}
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6">
            {/* User Profile Section */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {user.isAdmin ? 'Administrator' : 'Member'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user.totalBets} bets placed
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(user.totalWinnings)}
                </div>
                <div className="text-sm text-green-600 dark:text-green-500">Total Winnings</div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {user.totalBets}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-500">Total Bets</div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-white">Profile Settings</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-white">Notifications</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left">
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-white">App Settings</span>
              </button>
            </nav>

            {/* Sign Out Button */}
            <button
              onClick={onSignOut}
              className="w-full mt-8 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};