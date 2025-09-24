# PostHog Analytics Implementation

This document outlines all the PostHog analytics events that have been implemented across the gaming platform.

## Analytics Constants

All event names and property names are defined in `lib/analytics.ts` to ensure consistency and prevent typos.

## Game Events (Trump's Wild Ride)

### Core Game Events
- **`game_started`** - Triggered when a game session begins
  - Properties: game_name, high_score
- **`game_ended`** - Triggered when a game session ends
  - Properties: game_name, final_score, lives_remaining, game_duration_seconds, high_score, total_jumps, total_powerups_collected, total_obstacles_avoided, game_speed, is_new_high_score
- **`player_died`** - Triggered when player runs out of lives
  - Properties: game_name, final_score, total_jumps, total_powerups_collected, total_obstacles_avoided

### Player Actions
- **`player_jumped`** - Triggered on every jump (single or double)
  - Properties: game_name, jump_type (single/double), score, total_jumps
- **`player_took_damage`** - Triggered when player hits an obstacle
  - Properties: game_name, lives_remaining, score

### Power-ups
- **`powerup_collected`** - Triggered when player collects a power-up
  - Properties: game_name, powerup_type, score, total_powerups_collected
- **`powerup_activated`** - Triggered when power-up effect starts
  - Properties: game_name, powerup_type, score
- **`powerup_expired`** - Triggered when power-up effect ends
  - Properties: game_name, powerup_type, score

### Gameplay Elements
- **`obstacle_avoided`** - Triggered when player successfully passes an obstacle
  - Properties: game_name, obstacle_type, score, total_obstacles_avoided
- **`platform_used`** - Triggered when player successfully uses a platform
  - Properties: game_name, platform_type, score

### Achievements
- **`score_milestone`** - Triggered when player reaches score milestones (100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000)
  - Properties: game_name, milestone_score, score, total_jumps, total_powerups_collected, total_obstacles_avoided
- **`high_score_achieved`** - Triggered when player sets a new personal high score
  - Properties: game_name, high_score, previous_high_score, game_duration_seconds, total_jumps, total_powerups_collected, total_obstacles_avoided

### UI Interactions
- **`info_dialog_opened`** - Triggered when player opens the game guide
  - Properties: game_name, score
- **`info_dialog_closed`** - Triggered when player closes the game guide
  - Properties: game_name, score

## Navigation Events

### Page Views
- **`game_page_visited`** - Triggered when user visits a game page
  - Properties: game_name, page_url, referrer
- **`game_page_back_clicked`** - Triggered when user navigates back from game page
  - Properties: game_name

### Game Selection
- **`game_clicked`** - Triggered when user clicks on a playable game
  - Properties: game_name, game_category, has_url, page_url
- **`coming_soon_game_clicked`** - Triggered when user clicks on a coming soon game
  - Properties: game_name, game_category, page_url

### Category Filtering
- **`category_filter_clicked`** - Triggered when user filters games by category
  - Properties: category, games_in_category (for specific categories), total_games, page_url

## AI Input Events

### Input Interactions
- **`ai_input_submitted`** - Triggered when user submits AI query
  - Properties: method (enter_key/button_click), query_length, query_preview (first 50 chars), page_url
- **`ai_input_attachment_clicked`** - Triggered when user clicks attachment button
  - Properties: page_url
- **`ai_input_web_search_clicked`** - Triggered when user clicks web search button
  - Properties: page_url

### Waitlist Events
- **`waitlist_dialog_opened`** - Triggered when waitlist dialog opens
  - Properties: page_url
- **`waitlist_dialog_closed`** - Triggered when waitlist dialog closes
  - Properties: page_url
- **`waitlist_cancelled`** - Triggered when user cancels waitlist signup
  - Properties: page_url
- **`waitlist_form_submitted`** - Triggered when user submits waitlist form
  - Properties: page_url

## Property Definitions

### Game Properties
- `game_name` - Name of the game (e.g., "trump_wild_ride")
- `score` - Current score
- `final_score` - Final score at game end
- `lives_remaining` - Number of lives left
- `game_duration_seconds` - How long the game lasted
- `high_score` - Player's high score
- `previous_high_score` - Previous high score before new achievement

### Gameplay Properties
- `jump_type` - Type of jump ("single" or "double")
- `powerup_type` - Type of power-up ("speed", "invincibility", "doubleJump", "scoreMultiplier")
- `obstacle_type` - Type of obstacle ("ground", "flying", "moving", "spike")
- `platform_type` - Type of platform ("static", "moving")
- `milestone_score` - Score milestone reached

### Tracking Properties
- `total_jumps` - Total number of jumps in session
- `total_powerups_collected` - Total power-ups collected in session
- `total_obstacles_avoided` - Total obstacles avoided in session
- `game_speed` - Current game speed
- `page_url` - Current page URL
- `referrer` - Page referrer

## Implementation Notes

1. **High Score Persistence**: High scores are stored in localStorage and tracked across sessions
2. **Score Milestones**: Predefined milestones trigger events when crossed
3. **Event Consistency**: All events use consistent naming from the analytics constants
4. **Property Types**: Properties are strongly typed using TypeScript enums and constants
5. **Privacy**: Only non-sensitive data is tracked; no personal information beyond what user explicitly provides in waitlist form

## Usage

The analytics system automatically tracks all user interactions. No additional setup is required beyond the initial PostHog configuration in the app.

To view analytics data, access your PostHog dashboard and filter by the event names listed above. 