/**
 * Streak Management Service
 * Handles automatic streak reset logic and validation
 */
import { supabase } from '../lib/supabase';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastBetTimestamp: Date | null;
  lastStreakCheck: Date;
  streakResetReason?: string;
}

export interface StreakValidationResult {
  shouldReset: boolean;
  timeSinceLastBet: number;
  hoursRemaining: number;
  isExpired: boolean;
}

/**
 * Check if streak should be reset based on 24-hour rule
 */
export const validateStreakStatus = (lastBetTimestamp: Date | null): StreakValidationResult => {
  const now = new Date();
  const STREAK_TIMEOUT_HOURS = 24;
  const STREAK_TIMEOUT_MS = STREAK_TIMEOUT_HOURS * 60 * 60 * 1000;

  if (!lastBetTimestamp) {
    return {
      shouldReset: false,
      timeSinceLastBet: 0,
      hoursRemaining: STREAK_TIMEOUT_HOURS,
      isExpired: false
    };
  }

  const timeSinceLastBet = now.getTime() - lastBetTimestamp.getTime();
  const hoursRemaining = Math.max(0, STREAK_TIMEOUT_HOURS - (timeSinceLastBet / (60 * 60 * 1000)));
  const isExpired = timeSinceLastBet > STREAK_TIMEOUT_MS;

  return {
    shouldReset: isExpired,
    timeSinceLastBet,
    hoursRemaining,
    isExpired
  };
};

/**
 * Get user's current streak data from database
 */
export const getUserStreakData = async (userId: string): Promise<StreakData | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('current_streak, longest_streak, last_activity')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user streak data:', error);
      return null;
    }

    // Get last bet timestamp
    const { data: lastBet, error: betError } = await supabase
      .from('bets')
      .select('placed_at')
      .eq('user_id', userId)
      .order('placed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (betError) {
      console.error('Error fetching last bet:', betError);
    }

    return {
      currentStreak: user.current_streak || 0,
      longestStreak: user.longest_streak || 0,
      lastBetTimestamp: lastBet ? new Date(lastBet.placed_at) : null,
      lastStreakCheck: new Date(user.last_activity || user.created_at)
    };
  } catch (error) {
    console.error('Exception in getUserStreakData:', error);
    return null;
  }
};

/**
 * Reset user's streak to 0 and log the reason
 */
export const resetUserStreak = async (
  userId: string, 
  reason: string = 'Missed 24-hour betting window'
): Promise<boolean> => {
  try {
    console.log(`[StreakManager] Resetting streak for user ${userId}: ${reason}`);

    // Update user's streak data
    const { error: updateError } = await supabase
      .from('users')
      .update({
        current_streak: 0,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error resetting user streak:', updateError);
      return false;
    }

    // Log the streak reset activity
    const { error: logError } = await supabase
      .from('user_activity_log')
      .insert({
        user_id: userId,
        action_type: 'streak_bonus',
        points_earned: 0,
        description: `Streak reset: ${reason}`,
        metadata: {
          reset_reason: reason,
          reset_timestamp: new Date().toISOString(),
          previous_streak: 0
        }
      });

    if (logError) {
      console.error('Error logging streak reset:', logError);
      // Don't fail the operation if logging fails
    }

    console.log(`[StreakManager] Successfully reset streak for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Exception in resetUserStreak:', error);
    return false;
  }
};

/**
 * Check and update user streak status
 * This is the main function called during login/session checks
 */
export const checkAndUpdateStreakStatus = async (userId: string): Promise<{
  streakReset: boolean;
  currentStreak: number;
  hoursRemaining: number;
  message?: string;
}> => {
  try {
    console.log(`[StreakManager] Checking streak status for user ${userId}`);

    const streakData = await getUserStreakData(userId);
    if (!streakData) {
      return {
        streakReset: false,
        currentStreak: 0,
        hoursRemaining: 24,
        message: 'Unable to fetch streak data'
      };
    }

    const validation = validateStreakStatus(streakData.lastBetTimestamp);
    
    if (validation.shouldReset && streakData.currentStreak > 0) {
      // Reset the streak
      const resetSuccess = await resetUserStreak(
        userId, 
        `No bet placed within 24 hours (${Math.floor(validation.timeSinceLastBet / (60 * 60 * 1000))} hours since last bet)`
      );

      if (resetSuccess) {
        return {
          streakReset: true,
          currentStreak: 0,
          hoursRemaining: 24,
          message: `Your ${streakData.currentStreak}-day streak has been reset. Start a new streak by placing a bet!`
        };
      }
    }

    return {
      streakReset: false,
      currentStreak: streakData.currentStreak,
      hoursRemaining: validation.hoursRemaining,
      message: validation.hoursRemaining < 6 ? 
        `⚠️ Place a bet within ${Math.floor(validation.hoursRemaining)} hours to maintain your streak!` : 
        undefined
    };
  } catch (error) {
    console.error('Exception in checkAndUpdateStreakStatus:', error);
    return {
      streakReset: false,
      currentStreak: 0,
      hoursRemaining: 24,
      message: 'Error checking streak status'
    };
  }
};

/**
 * Update last bet timestamp when user places a bet
 */
export const updateLastBetTimestamp = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last bet timestamp:', error);
    }
  } catch (error) {
    console.error('Exception in updateLastBetTimestamp:', error);
  }
};

/**
 * Get streak warning status for UI display
 */
export const getStreakWarningStatus = (hoursRemaining: number): {
  showWarning: boolean;
  urgencyLevel: 'low' | 'medium' | 'high';
  message: string;
  color: string;
} => {
  if (hoursRemaining <= 2) {
    return {
      showWarning: true,
      urgencyLevel: 'high',
      message: `🚨 Only ${Math.floor(hoursRemaining)} hours left to maintain your streak!`,
      color: 'text-red-600 dark:text-red-400'
    };
  } else if (hoursRemaining <= 6) {
    return {
      showWarning: true,
      urgencyLevel: 'medium',
      message: `⚠️ ${Math.floor(hoursRemaining)} hours remaining to keep your streak alive`,
      color: 'text-orange-600 dark:text-orange-400'
    };
  } else if (hoursRemaining <= 12) {
    return {
      showWarning: true,
      urgencyLevel: 'low',
      message: `💡 ${Math.floor(hoursRemaining)} hours left in your streak window`,
      color: 'text-yellow-600 dark:text-yellow-400'
    };
  }

  return {
    showWarning: false,
    urgencyLevel: 'low',
    message: '',
    color: ''
  };
};

/**
 * Schedule periodic streak checks (for web version)
 */
export const scheduleStreakChecks = (userId: string, onStreakReset?: (message: string) => void): () => void => {
  const CHECK_INTERVAL = 30 * 60 * 1000; // Check every 30 minutes
  
  const intervalId = setInterval(async () => {
    const result = await checkAndUpdateStreakStatus(userId);
    if (result.streakReset && onStreakReset && result.message) {
      onStreakReset(result.message);
    }
  }, CHECK_INTERVAL);

  // Return cleanup function
  return () => clearInterval(intervalId);
};