// PostHog Analytics Constants and Utilities

// Game Event Names
export const GAME_EVENTS = {
  GAME_STARTED: 'game_started',
  GAME_ENDED: 'game_ended',
  GAME_PAUSED: 'game_paused',
  GAME_RESUMED: 'game_resumed',
  PLAYER_JUMPED: 'player_jumped',
  PLAYER_TOOK_DAMAGE: 'player_took_damage',
  PLAYER_DIED: 'player_died',
  POWERUP_COLLECTED: 'powerup_collected',
  POWERUP_ACTIVATED: 'powerup_activated',
  POWERUP_EXPIRED: 'powerup_expired',
  OBSTACLE_AVOIDED: 'obstacle_avoided',
  PLATFORM_USED: 'platform_used',
  SCORE_MILESTONE: 'score_milestone',
  HIGH_SCORE_ACHIEVED: 'high_score_achieved',
  INFO_DIALOG_OPENED: 'info_dialog_opened',
  INFO_DIALOG_CLOSED: 'info_dialog_closed'
} as const;

// Game Property Names
export const GAME_PROPERTIES = {
  GAME_NAME: 'game_name',
  SCORE: 'score',
  FINAL_SCORE: 'final_score',
  LIVES_REMAINING: 'lives_remaining',
  GAME_DURATION: 'game_duration_seconds',
  POWERUP_TYPE: 'powerup_type',
  OBSTACLE_TYPE: 'obstacle_type',
  PLATFORM_TYPE: 'platform_type',
  JUMP_TYPE: 'jump_type',
  DAMAGE_SOURCE: 'damage_source',
  MILESTONE_SCORE: 'milestone_score',
  HIGH_SCORE: 'high_score',
  PREVIOUS_HIGH_SCORE: 'previous_high_score',
  GAME_SPEED: 'game_speed',
  TOTAL_JUMPS: 'total_jumps',
  TOTAL_POWERUPS_COLLECTED: 'total_powerups_collected',
  TOTAL_OBSTACLES_AVOIDED: 'total_obstacles_avoided'
} as const;

// Jump Types
export const JUMP_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double'
} as const;

// PowerUp Types
export const POWERUP_TYPES = {
  SPEED: 'speed',
  INVINCIBILITY: 'invincibility',
  DOUBLE_JUMP: 'doubleJump',
  SCORE_MULTIPLIER: 'scoreMultiplier'
} as const;

// Obstacle Types
export const OBSTACLE_TYPES = {
  GROUND: 'ground',
  FLYING: 'flying',
  MOVING: 'moving',
  SPIKE: 'spike'
} as const;

// Platform Types
export const PLATFORM_TYPES = {
  STATIC: 'static',
  MOVING: 'moving'
} as const;

// Game Names
export const GAME_NAMES = {
  TRUMP_WILD_RIDE: 'trump_wild_ride',
  COLORING_BOOK_MAKER: 'coloring_book_maker'
} as const;

// Score milestones to track
export const SCORE_MILESTONES = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];

// Utility function to get the next milestone
export function getNextMilestone(currentScore: number): number | null {
  return SCORE_MILESTONES.find(milestone => milestone > currentScore) || null;
}

// Utility function to check if a score reached a new milestone
export function checkMilestoneReached(previousScore: number, currentScore: number): number | null {
  for (const milestone of SCORE_MILESTONES) {
    if (previousScore < milestone && currentScore >= milestone) {
      return milestone;
    }
  }
  return null;
} 