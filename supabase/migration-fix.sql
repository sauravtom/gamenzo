-- Migration script to fix UUID/TEXT mismatch for Privy DIDs
-- Run this in your Supabase SQL Editor

-- First, drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Recreate tables with correct types
-- Create profiles table (for user data)
-- Note: Using TEXT for id to support Privy DID format like "did:privy:..."
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  author TEXT,
  code TEXT NOT NULL,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS games_user_id_idx ON games(user_id);
CREATE INDEX IF NOT EXISTS games_slug_idx ON games(slug);
CREATE INDEX IF NOT EXISTS games_created_at_idx ON games(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Note: Since we're using Privy auth, we'll handle authorization in the application layer
CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL USING (true);

-- RLS Policies for games
-- Note: Since we're using Privy auth, we'll handle authorization in the application layer
CREATE POLICY "Allow all operations on games" ON games
  FOR ALL USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample games
INSERT INTO games (name, slug, description, author, code, user_id) VALUES
(
  'Snake Game',
  'snake',
  'Classic Snake game built with p5.js',
  'Gamenzo',
  '// Simple Snake Game
function setup() {
  createCanvas(400, 400);
}

let snake = [{x: 200, y: 200}];
let food = {x: 100, y: 100};
let dx = 20;
let dy = 0;

function draw() {
  background(220);
  
  // Move snake
  let head = {x: snake[0].x + dx, y: snake[0].y + dy};
  snake.unshift(head);
  
  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    food = {
      x: Math.floor(random(20)) * 20,
      y: Math.floor(random(20)) * 20
    };
  } else {
    snake.pop();
  }
  
  // Draw snake
  fill(0, 255, 0);
  for (let segment of snake) {
    rect(segment.x, segment.y, 20, 20);
  }
  
  // Draw food
  fill(255, 0, 0);
  rect(food.x, food.y, 20, 20);
}

function keyPressed() {
  if (keyCode === UP_ARROW && dy === 0) { dx = 0; dy = -20; }
  if (keyCode === DOWN_ARROW && dy === 0) { dx = 0; dy = 20; }
  if (keyCode === LEFT_ARROW && dx === 0) { dx = -20; dy = 0; }
  if (keyCode === RIGHT_ARROW && dx === 0) { dx = 20; dy = 0; }
}',
  NULL
),
(
  'Bouncing Ball',
  'bouncing-ball',
  'A simple bouncing ball animation',
  'Gamenzo',
  'function setup() {
  createCanvas(windowWidth, windowHeight);
}

let x = 100;
let y = 100;
let xSpeed = 5;
let ySpeed = 3;

function draw() {
  background(220);
  
  // Update position
  x += xSpeed;
  y += ySpeed;
  
  // Bounce off edges
  if (x > width - 25 || x < 25) {
    xSpeed *= -1;
  }
  if (y > height - 25 || y < 25) {
    ySpeed *= -1;
  }
  
  // Draw ball
  fill(255, 100, 100);
  ellipse(x, y, 50, 50);
}',
  NULL
) ON CONFLICT (slug) DO NOTHING;
