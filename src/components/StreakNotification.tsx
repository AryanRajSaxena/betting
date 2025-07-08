/**
 * Streak notification component for displaying streak warnings and reset messages
 */
import React from 'react';
import { X, Flame, AlertTriangle, Clock, Zap } from 'lucide-react';

interface StreakNotificationProps {
  message: string;
  type: 'reset' | 'warning' | 'info';
  urgencyLevel?: 'low' | 'medium' | 'high';
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
}

export const StreakNotification: React.FC<StreakNotificationProps> = ({
  message,
  type,
  urgencyLevel = 'low',
  onDismiss,
  autoHide = false,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  const getNotificationStyles = () => {
    switch (type) {
      case 'reset':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />,
          button: 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30'
        };
      case 'warning':
        const warningStyles = {
          high: {
            container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            text: 'text-red-800 dark:text-red-200',
            icon: <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />,
            button: 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30'
          },
          medium: {
            container: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
            text: 'text-orange-800 dark:text-orange-200',
            icon: <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
            button: 'text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-800/30'
          },
          low: {
            container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            text: 'text-yellow-800 dark:text-yellow-200',
            icon: <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
            button: 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-800/30'
          }
        };
        return warningStyles[urgencyLevel];
      default:
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          icon: <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          button: 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30'
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 animate-slide-down`}>
      <div className={`${styles.container} border rounded-xl p-4 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="flex-1">
            <p className={`${styles.text} text-sm font-medium leading-relaxed`}>
              {message}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className={`${styles.button} p-1 rounded-lg transition-colors flex-shrink-0`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};