/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Quality ratings:
 * 0 - Complete blackout, total failure to recall
 * 1 - Incorrect, but upon seeing the correct answer it felt familiar
 * 2 - Incorrect, but the correct answer seemed easy to recall
 * 3 - Correct answer recalled with serious difficulty
 * 4 - Correct answer after some hesitation
 * 5 - Perfect response, immediate recall
 *
 * For code challenges, we simplify to:
 * - Failed (tests didn't pass): quality 1-2
 * - Passed with difficulty: quality 3
 * - Passed normally: quality 4
 * - Passed easily: quality 5
 */

export interface SM2Input {
  easeFactor: number;      // Current ease factor (starts at 2.5)
  interval: number;        // Current interval in days
  repetitions: number;     // Number of consecutive correct reviews
}

export interface SM2Output {
  easeFactor: number;      // New ease factor
  interval: number;        // New interval in days
  repetitions: number;     // New repetition count
  nextReviewDate: Date;    // When to review next
}

/**
 * Calculate SM-2 algorithm parameters after a review
 *
 * @param quality - Quality of response (0-5)
 * @param current - Current SM-2 parameters
 * @returns New SM-2 parameters
 */
export function calculateSM2(
  quality: number,
  current: SM2Input
): SM2Output {
  // Clamp quality to 0-5
  quality = Math.max(0, Math.min(5, quality));

  let { easeFactor, interval, repetitions } = current;

  // Quality >= 3 means correct response
  if (quality >= 3) {
    // Calculate new interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    repetitions += 1;
  } else {
    // Incorrect response - reset
    repetitions = 0;
    interval = 1;
  }

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Minimum ease factor is 1.3
  easeFactor = Math.max(1.3, easeFactor);

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
  };
}

/**
 * Convert pass/fail result to SM-2 quality rating
 *
 * @param passed - Whether the code challenge passed
 * @param timeSpent - Time spent in seconds
 * @param hints - Number of hints used
 * @returns Quality rating 0-5
 */
export function getQualityFromResult(
  passed: boolean,
  timeSpent: number,
  hintsUsed: number,
  expectedTime: number // Expected time in seconds
): number {
  if (!passed) {
    // Failed - return 1 or 2 based on how close they got
    return hintsUsed > 0 ? 1 : 2;
  }

  // Passed - rate based on time and hints
  if (hintsUsed >= 3) {
    return 3; // Needed significant help
  }

  if (hintsUsed > 0 || timeSpent > expectedTime * 1.5) {
    return 4; // Passed but with some difficulty
  }

  return 5; // Perfect - no hints, good time
}

/**
 * Get challenges due for review
 *
 * @param challenges - All challenge progress records
 * @returns Challenges due for review, sorted by urgency
 */
export function getDueChallenges<T extends { next_review_date: string }>(
  challenges: T[]
): T[] {
  const now = new Date();

  return challenges
    .filter((c) => new Date(c.next_review_date) <= now)
    .sort((a, b) =>
      new Date(a.next_review_date).getTime() - new Date(b.next_review_date).getTime()
    );
}

/**
 * Get upcoming challenges (due in the next X days)
 *
 * @param challenges - All challenge progress records
 * @param days - Number of days to look ahead
 * @returns Upcoming challenges
 */
export function getUpcomingChallenges<T extends { next_review_date: string }>(
  challenges: T[],
  days: number = 7
): T[] {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  return challenges
    .filter((c) => {
      const reviewDate = new Date(c.next_review_date);
      return reviewDate > now && reviewDate <= future;
    })
    .sort((a, b) =>
      new Date(a.next_review_date).getTime() - new Date(b.next_review_date).getTime()
    );
}

/**
 * Format time until review in human-readable format
 *
 * @param date - Next review date
 * @returns Human-readable string
 */
export function formatTimeUntilReview(date: Date | string): string {
  const reviewDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = reviewDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'now';
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m`;
  }

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  if (diffDays === 1) {
    return 'Tomorrow';
  }

  return `In ${diffDays} days`;
}

/**
 * Calculate streak from a list of study dates
 *
 * @param dates - Array of dates when user studied
 * @returns Current streak count
 */
export function calculateStreak(dates: (Date | string)[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = dates
    .map((d) => (typeof d === 'string' ? new Date(d) : d))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = today;

  for (const date of sortedDates) {
    const studyDate = new Date(date);
    studyDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - studyDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = studyDate;
    } else {
      break;
    }
  }

  return streak;
}
