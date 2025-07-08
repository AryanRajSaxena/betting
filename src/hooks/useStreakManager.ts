/**
 * React hook for managing user streaks
 */
import { useState, useEffect, useCallback } from 'react';
import { 
  checkAndUpdateStreakStatus, 
  scheduleStreakChecks, 
  getStreakWarningStatus,
  updateLastBetTimestamp
} from '../services/streakManager';

interface UseStreakManagerProps {
  userId: string;
  onStreakReset?: (message: string) => void;
  onStreakWarning?: (warning: string) => void;
}

interface StreakStatus {
  currentStreak: number;
  hoursRemaining: number;
  isLoading: boolean;
  lastChecked: Date | null;
  warning: {
    showWarning: boolean;
    urgencyLevel: 'low' | 'medium' | 'high';
    message: string;
    color: string;
  };
}

export const useStreakManager = ({ 
  userId, 
  onStreakReset, 
  onStreakWarning 
}: UseStreakManagerProps) => {
  const [streakStatus, setStreakStatus] = useState<StreakStatus>({
    currentStreak: 0,
    hoursRemaining: 24,
    isLoading: true,
    lastChecked: null,
    warning: {
      showWarning: false,
      urgencyLevel: 'low',
      message: '',
      color: ''
    }
  });

  const [streakResetMessage, setStreakResetMessage] = useState<string | null>(null);

  // Check streak status
  const checkStreak = useCallback(async () => {
    if (!userId) return;

    try {
      setStreakStatus(prev => ({ ...prev, isLoading: true }));
      
      const result = await checkAndUpdateStreakStatus(userId);
      const warning = getStreakWarningStatus(result.hoursRemaining);

      setStreakStatus({
        currentStreak: result.currentStreak,
        hoursRemaining: result.hoursRemaining,
        isLoading: false,
        lastChecked: new Date(),
        warning
      });

      // Handle streak reset notification
      if (result.streakReset && result.message) {
        setStreakResetMessage(result.message);
        onStreakReset?.(result.message);
      }

      // Handle streak warning
      if (warning.showWarning) {
        onStreakWarning?.(warning.message);
      }

    } catch (error) {
      console.error('Error checking streak status:', error);
      setStreakStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        lastChecked: new Date()
      }));
    }
  }, [userId, onStreakReset, onStreakWarning]);

  // Update streak when user places a bet
  const onBetPlaced = useCallback(async () => {
    if (!userId) return;
    
    try {
      await updateLastBetTimestamp(userId);
      // Refresh streak status after bet placement
      await checkStreak();
    } catch (error) {
      console.error('Error updating bet timestamp:', error);
    }
  }, [userId, checkStreak]);

  // Dismiss streak reset message
  const dismissStreakResetMessage = useCallback(() => {
    setStreakResetMessage(null);
  }, []);

  // Initial check and periodic updates
  useEffect(() => {
    if (!userId) return;

    // Initial check
    checkStreak();

    // Schedule periodic checks
    const cleanup = scheduleStreakChecks(userId, (message) => {
      setStreakResetMessage(message);
      onStreakReset?.(message);
    });

    return cleanup;
  }, [userId, checkStreak, onStreakReset]);

  // Manual refresh function
  const refreshStreak = useCallback(() => {
    checkStreak();
  }, [checkStreak]);

  return {
    streakStatus,
    streakResetMessage,
    onBetPlaced,
    refreshStreak,
    dismissStreakResetMessage
  };
};