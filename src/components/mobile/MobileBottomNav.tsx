import React from 'react';
import { 
  Home, 
  TrendingUp, 
  Wallet, 
  Trophy, 
  Shield,
  BarChart3
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  isAdmin
}) => {
  const tabs = [
    { id: 'events', label: 'Events', icon: Home },
    { id: 'leaderboard', label: 'Rankings', icon: TrendingUp },
    { id: 'payments', label: 'Wallet', icon: Wallet },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-700/50 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-[60px] ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};