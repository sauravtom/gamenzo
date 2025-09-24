import posthog from 'posthog-js';
import { 
  GAME_EVENTS, 
  GAME_PROPERTIES, 
  GAME_NAMES, 
  JUMP_TYPES, 
  POWERUP_TYPES, 
  OBSTACLE_TYPES, 
  PLATFORM_TYPES,
  checkMilestoneReached 
} from '@/lib/analytics';

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends GameObject {
  velocityY: number;
  velocityX: number;
  jumping: boolean;
  grounded: boolean;
  canDoubleJump: boolean;
  hasDoubleJumped: boolean;
  onPlatform: boolean;
}

export interface Obstacle extends GameObject {
  passed: boolean;
  type: 'ground' | 'flying' | 'moving' | 'spike';
  velocityY?: number;
  originalY?: number;
  moveRange?: number;
}

export interface Platform extends GameObject {
  passed: boolean;
  type: 'static' | 'moving';
  velocityY?: number;
  originalY?: number;
  moveRange?: number;
}

export interface PowerUp extends GameObject {
  type: 'speed' | 'invincibility' | 'doubleJump' | 'scoreMultiplier';
  collected: boolean;
  color: string;
}

export interface PowerUpEffect {
  type: string;
  duration: number;
  startTime: number;
}

interface TrumpWildRideGameConstructor {
    canvas: HTMLCanvasElement;
    infoBtn: HTMLButtonElement;
    infoDialog: HTMLDivElement;
    leftBtn: HTMLButtonElement;
    rightBtn: HTMLButtonElement;
    jumpBtn: HTMLButtonElement;
    startBtn: HTMLButtonElement;
    scoreElement: HTMLElement;
}

export class TrumpWildRideGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private obstacles: Obstacle[] = [];
  private platforms: Platform[] = [];
  private powerUps: PowerUp[] = [];
  private activePowerUps: PowerUpEffect[] = [];
  private smokeParticles: Array<{x: number, y: number, life: number, velocityX: number, velocityY: number}> = [];
  private gameRunning = false;
  private gameEnded = false;
  private score = 0;
  private lives = 3;
  private maxLives = 3;
  private gameSpeed = 2;
  private baseGameSpeed = 2;
  private gravity = 0.45;
  private jumpPower = -13;
  private moveSpeed = 5;
  private friction = 0.8;
  private groundY: number;
  private lastObstacleTime = 0;
  private lastPlatformTime = 0;
  private lastPowerUpTime = 0;
  private obstacleInterval = 1800;
  private platformInterval = 3500;
  private powerUpInterval = 8000;
  private keys: { [key: string]: boolean } = {};
  private animationId: number | null = null;
  private isInvincible = false;
  private invincibilityTime = 0;
  private scoreMultiplier = 1;

  // Image assets
  private images: { [key: string]: HTMLImageElement } = {};
  private imagesLoaded = 0;
  private totalImages = 6;
  private assetsReady = false;

  // Info dialog functionality
  private infoBtn: HTMLButtonElement;
  private infoDialog: HTMLDivElement;
  private isInfoDialogOpen = false;

  // Mobile controls
  private leftBtn: HTMLButtonElement;
  private rightBtn: HTMLButtonElement;
  private jumpBtn: HTMLButtonElement;

  private startBtn: HTMLButtonElement;
  private scoreElement: HTMLElement;

  // Analytics tracking variables
  private gameStartTime: number = 0;
  private totalJumps: number = 0;
  private totalPowerupsCollected: number = 0;
  private totalObstaclesAvoided: number = 0;
  private previousScore: number = 0;
  private highScore: number = 0;

  constructor({ canvas, infoBtn, infoDialog, leftBtn, rightBtn, jumpBtn, startBtn, scoreElement }: TrumpWildRideGameConstructor) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.groundY = this.canvas.height - 40;
    
    this.player = {
      x: 100,
      y: this.groundY - 80,
      width: 60,
      height: 80,
      velocityY: 0,
      velocityX: 0,
      jumping: false,
      grounded: true,
      canDoubleJump: false,
      hasDoubleJumped: false,
      onPlatform: false
    };

    this.infoBtn = infoBtn;
    this.infoDialog = infoDialog;

    this.leftBtn = leftBtn;
    this.rightBtn = rightBtn;
    this.jumpBtn = jumpBtn;
    this.startBtn = startBtn;
    this.scoreElement = scoreElement;

    this.loadAssets();
    this.setupEventListeners();
  }

  private loadAssets(): void {
    const imageNames = ['bg', 'ground', 'char', 'rock_a', 'rock_b', 'plant'];
    
    imageNames.forEach(name => {
      const img = new Image();
      img.onload = () => {
        this.imagesLoaded++;
        if (this.imagesLoaded === this.totalImages) {
          this.assetsReady = true;
          this.gameLoop(); // Start game loop once assets are loaded
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${name}.png`);
        this.imagesLoaded++;
        if (this.imagesLoaded === this.totalImages) {
          this.assetsReady = true;
          this.gameLoop();
        }
      };
      img.src = `/assets/trump-wild-ride/${name}.png`;
      this.images[name] = img;
    });
  }

  private setupEventListeners(): void {
    this.startBtn.addEventListener('click', () => this.startGame());

    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.jump();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const canvasWidth = this.canvas.width;
      
      if (x < canvasWidth * 0.3) {
        this.keys['ArrowLeft'] = true;
      } else if (x > canvasWidth * 0.7) {
        this.keys['ArrowRight'] = true;
      } else {
        this.jump();
      }
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys['ArrowLeft'] = false;
      this.keys['ArrowRight'] = false;
    });

    // Event listeners for info dialog
    this.infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleInfoDialog();
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (this.isInfoDialogOpen && !this.infoDialog.contains(e.target as Node) && e.target !== this.infoBtn) {
        this.hideInfoDialog();
      }
    });

    // Key press to close
    document.addEventListener('keydown', () => {
      this.hideInfoDialog();
    });

    // Prevent dialog clicks from closing the dialog
    this.infoDialog.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Mobile control event listeners
    this.setupMobileControls();
  }

  private setupMobileControls(): void {
    // Left button
    this.leftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys['ArrowLeft'] = true;
    });
    
    this.leftBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys['ArrowLeft'] = false;
    });

    this.leftBtn.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.keys['ArrowLeft'] = false;
    });

    this.leftBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.keys['ArrowLeft'] = true;
    });
    
    this.leftBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.keys['ArrowLeft'] = false;
    });

    this.leftBtn.addEventListener('mouseleave', (e) => {
      e.preventDefault();
      this.keys['ArrowLeft'] = false;
    });

    // Right button
    this.rightBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys['ArrowRight'] = true;
    });
    
    this.rightBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys['ArrowRight'] = false;
    });

    this.rightBtn.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.keys['ArrowRight'] = false;
    });

    this.rightBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.keys['ArrowRight'] = true;
    });
    
    this.rightBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.keys['ArrowRight'] = false;
    });

    this.rightBtn.addEventListener('mouseleave', (e) => {
      e.preventDefault();
      this.keys['ArrowRight'] = false;
    });

    // Jump button
    this.jumpBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.jump();
    });

    this.jumpBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.jump();
    });

    // Prevent context menu on long press
    [this.leftBtn, this.rightBtn, this.jumpBtn].forEach(btn => {
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    });
  }

  private startGame(): void {
    if (!this.assetsReady) return;
    
    this.gameRunning = true;
    this.gameEnded = false;
    this.score = 0;
    this.lives = this.maxLives;
    this.gameSpeed = this.baseGameSpeed;
    this.obstacles = [];
    this.platforms = [];
    this.powerUps = [];
    this.activePowerUps = [];
    this.isInvincible = false;
    this.invincibilityTime = 0;
    this.scoreMultiplier = 1;
    this.lastObstacleTime = Date.now();
    this.lastPlatformTime = Date.now();
    this.lastPowerUpTime = Date.now();
    this.player.x = 100;
    this.player.y = this.groundY - 80;
    this.player.velocityY = 0;
    this.player.velocityX = 0;
    this.player.jumping = false;
    this.player.grounded = true;
    this.player.onPlatform = false;
    this.player.canDoubleJump = false;
    this.player.hasDoubleJumped = false;
    
    // Reset analytics tracking
    this.gameStartTime = Date.now();
    this.totalJumps = 0;
    this.totalPowerupsCollected = 0;
    this.totalObstaclesAvoided = 0;
    this.previousScore = 0;
    
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('trump-wild-ride-high-score');
    this.highScore = savedHighScore ? parseInt(savedHighScore, 10) : 0;
    
    // Track game start event
    posthog.capture(GAME_EVENTS.GAME_STARTED, {
      [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
      [GAME_PROPERTIES.HIGH_SCORE]: this.highScore
    });
    
    // Show mobile controls during gameplay
    if (document.body) {
        document.body.classList.add('game-running');
    }
    
    this.startBtn.textContent = 'Restart Game';
    this.startBtn.disabled = true;
    
    setTimeout(() => {
      if(this.startBtn) this.startBtn.disabled = false;
    }, 1000);
  }

  private jump(): void {
    if (this.gameRunning) {
      if (this.player.grounded || this.player.onPlatform) {
        this.player.velocityY = this.jumpPower;
        this.player.jumping = true;
        this.player.grounded = false;
        this.player.onPlatform = false;
        this.player.hasDoubleJumped = false;
        this.totalJumps++;
        
        // Track single jump event
        posthog.capture(GAME_EVENTS.PLAYER_JUMPED, {
          [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
          [GAME_PROPERTIES.JUMP_TYPE]: JUMP_TYPES.SINGLE,
          [GAME_PROPERTIES.SCORE]: this.score,
          [GAME_PROPERTIES.TOTAL_JUMPS]: this.totalJumps
        });
      } else if (this.player.canDoubleJump && !this.player.hasDoubleJumped) {
        this.player.velocityY = this.jumpPower * 0.8;
        this.player.hasDoubleJumped = true;
        this.totalJumps++;
        
        // Track double jump event
        posthog.capture(GAME_EVENTS.PLAYER_JUMPED, {
          [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
          [GAME_PROPERTIES.JUMP_TYPE]: JUMP_TYPES.DOUBLE,
          [GAME_PROPERTIES.SCORE]: this.score,
          [GAME_PROPERTIES.TOTAL_JUMPS]: this.totalJumps
        });
      }
    }
  }

  private updatePlayer(): void {
    if (this.invincibilityTime > 0) {
      this.invincibilityTime -= 16;
    }

    // Add smoke particles when player is moving or grounded
    if (this.gameRunning && (this.player.grounded || this.player.onPlatform)) {
      this.addSmokeParticle();
    }

    if (this.gameRunning) {
      if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
        this.player.velocityX = -this.moveSpeed;
      } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
        this.player.velocityX = this.moveSpeed;
      } else {
        this.player.velocityX *= this.friction;
      }

      this.player.x += this.player.velocityX;

      if (this.player.x < 0) {
        this.player.x = 0;
        this.player.velocityX = 0;
      } else if (this.player.x + this.player.width > this.canvas.width) {
        this.player.x = this.canvas.width - this.player.width;
        this.player.velocityX = 0;
      }
    }

    this.player.velocityY += this.gravity;
    this.player.y += this.player.velocityY;

    this.player.onPlatform = false;
    this.checkPlatformCollisions();

    if (this.player.y >= this.groundY - this.player.height && !this.player.onPlatform) {
      this.player.y = this.groundY - this.player.height;
      this.player.velocityY = 0;
      this.player.jumping = false;
      this.player.grounded = true;
      this.player.hasDoubleJumped = false;
    } else if (this.player.onPlatform) {
      this.player.grounded = false;
      this.player.jumping = false;
      this.player.hasDoubleJumped = false;
    } else {
      this.player.grounded = false;
    }

    // Update smoke particles
    this.updateSmokeParticles();
  }

  private addSmokeParticle(): void {
    // Only add smoke occasionally to avoid overwhelming
    if (Math.random() < 0.3) {
      this.smokeParticles.push({
        x: this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 20,
        y: this.player.y + this.player.height - 5,
        life: 1.0,
        velocityX: (Math.random() - 0.5) * 2 - this.gameSpeed * 0.3,
        velocityY: -Math.random() * 2 - 1
      });
    }
  }

  private updateSmokeParticles(): void {
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const particle = this.smokeParticles[i];
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.life -= 0.02;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.smokeParticles.splice(i, 1);
      }
    }
  }

  private checkPlatformCollisions(): void {
    for (const platform of this.platforms) {
      if (this.player.velocityY >= 0 && 
          this.player.x + this.player.width > platform.x &&
          this.player.x < platform.x + platform.width &&
          this.player.y + this.player.height >= platform.y &&
          this.player.y + this.player.height <= platform.y + 20) {
        
        this.player.y = platform.y - this.player.height;
        this.player.velocityY = 0;
        this.player.onPlatform = true;
        break;
      }
    }
  }

  private spawnObstacle(): void {
    const now = Date.now();
    if (now - this.lastObstacleTime > this.obstacleInterval) {
      const obstacleTypes: Obstacle['type'][] = ['ground', 'flying', 'moving', 'spike'];
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      
      let obstacle: Obstacle;
      
      switch (type) {
        case 'ground':
          // Bigger ground rocks - positioned lower
          obstacle = {
            x: this.canvas.width,
            y: this.groundY - 100,
            width: 100,
            height: 100,
            passed: false,
            type: 'ground'
          };
          break;
          
        case 'flying':
          // Flying obstacles - lower but still airborne
          obstacle = {
            x: this.canvas.width,
            y: this.groundY - 120 - Math.random() * 80, // Reduced air range
            width: 45,
            height: 35,
            passed: false,
            type: 'flying'
          };
          break;
          
        case 'moving':
          // Moving rocks - lower starting position
          const baseY = this.groundY - 110;
          obstacle = {
            x: this.canvas.width,
            y: baseY,
            width: 90,
            height: 90,
            passed: false,
            type: 'moving',
            velocityY: 1 + Math.random() * 2,
            originalY: baseY,
            moveRange: 60 // Reduced range to stay lower
          };
          break;
          
        case 'spike':
          // Taller plants - attached to new ground level
          obstacle = {
            x: this.canvas.width,
            y: this.groundY - 150, // Adjusted for taller plants
            width: 80,
            height: 150, // Increased from 120 to 150
            passed: false,
            type: 'spike'
          };
          break;
      }
      
      this.obstacles.push(obstacle);
      this.lastObstacleTime = now;
      
      this.obstacleInterval = 1200 + Math.random() * 800;
    }
  }

  private spawnPlatform(): void {
    const now = Date.now();
    if (now - this.lastPlatformTime > this.platformInterval) {
      const platformTypes: Platform['type'][] = ['static', 'moving'];
      const type = platformTypes[Math.floor(Math.random() * platformTypes.length)];
      
      let platform: Platform;
      const height = 20;
      const width = 100 + Math.random() * 60;
      const y = this.groundY - 80 - Math.random() * 100; // Lower platform range
      
      if (type === 'static') {
        platform = {
          x: this.canvas.width,
          y: y,
          width: width,
          height: height,
          passed: false,
          type: 'static'
        };
      } else {
        platform = {
          x: this.canvas.width,
          y: y,
          width: width,
          height: height,
          passed: false,
          type: 'moving',
          velocityY: 0.5 + Math.random() * 1,
          originalY: y,
          moveRange: 30 // Reduced range to keep platforms lower
        };
      }
      
      this.platforms.push(platform);
      this.lastPlatformTime = now;
      
      this.platformInterval = 2500 + Math.random() * 3000;
    }
  }

  private spawnPowerUp(): void {
    const now = Date.now();
    if (now - this.lastPowerUpTime > this.powerUpInterval) {
      const types: PowerUp['type'][] = ['speed', 'invincibility', 'doubleJump', 'scoreMultiplier'];
      const colors = {
        speed: '#00FF00',
        invincibility: '#FFD700',
        doubleJump: '#00BFFF',
        scoreMultiplier: '#FF69B4'
      };
      
      const type = types[Math.floor(Math.random() * types.length)];
      const powerUp: PowerUp = {
        x: this.canvas.width,
        y: this.groundY - 80 - Math.random() * 80, // Lower powerup range
        width: 40,
        height: 40,
        type: type,
        collected: false,
        color: colors[type]
      };
      
      this.powerUps.push(powerUp);
      this.lastPowerUpTime = now;
      
      this.powerUpInterval = 6000 + Math.random() * 4000;
    }
  }

  private updateObstacles(): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.gameSpeed;

      if (obstacle.type === 'moving' && obstacle.velocityY !== undefined) {
        obstacle.y += obstacle.velocityY;
        
        if (obstacle.originalY !== undefined && obstacle.moveRange !== undefined) {
          if (obstacle.y <= obstacle.originalY - obstacle.moveRange || 
              obstacle.y >= obstacle.originalY + obstacle.moveRange) {
            obstacle.velocityY *= -1;
          }
        }
      }

      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        continue;
      }

      if (!obstacle.passed && obstacle.x + obstacle.width < this.player.x) {
        obstacle.passed = true;
        this.score += 10 * this.scoreMultiplier;
        this.gameSpeed += 0.015;
        this.totalObstaclesAvoided++;
        
        // Track obstacle avoided event
        posthog.capture(GAME_EVENTS.OBSTACLE_AVOIDED, {
          [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
          [GAME_PROPERTIES.OBSTACLE_TYPE]: obstacle.type,
          [GAME_PROPERTIES.SCORE]: this.score,
          [GAME_PROPERTIES.TOTAL_OBSTACLES_AVOIDED]: this.totalObstaclesAvoided
        });
      }

      if (!this.isInvincible && this.invincibilityTime <= 0 && this.checkCollision(this.player, obstacle)) {
        this.takeDamage();
        return;
      }
    }
  }

  private takeDamage(): void {
    this.lives--;
    this.invincibilityTime = 2000;
    
    // Track damage event
    posthog.capture(GAME_EVENTS.PLAYER_TOOK_DAMAGE, {
      [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
      [GAME_PROPERTIES.LIVES_REMAINING]: this.lives,
      [GAME_PROPERTIES.SCORE]: this.score
    });
    
    if (this.lives <= 0) {
      // Track player death event
      posthog.capture(GAME_EVENTS.PLAYER_DIED, {
        [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
        [GAME_PROPERTIES.FINAL_SCORE]: this.score,
        [GAME_PROPERTIES.TOTAL_JUMPS]: this.totalJumps,
        [GAME_PROPERTIES.TOTAL_POWERUPS_COLLECTED]: this.totalPowerupsCollected,
        [GAME_PROPERTIES.TOTAL_OBSTACLES_AVOIDED]: this.totalObstaclesAvoided
      });
      this.gameOver();
    }
  }

  private updatePlatforms(): void {
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const platform = this.platforms[i];
      platform.x -= this.gameSpeed;

      if (platform.type === 'moving' && platform.velocityY !== undefined) {
        platform.y += platform.velocityY;
        
        if (platform.originalY !== undefined && platform.moveRange !== undefined) {
          if (platform.y <= platform.originalY - platform.moveRange || 
              platform.y >= platform.originalY + platform.moveRange) {
            platform.velocityY *= -1;
          }
        }
      }

      if (platform.x + platform.width < 0) {
        this.platforms.splice(i, 1);
        continue;
      }

      if (!platform.passed && platform.x + platform.width < this.player.x) {
        platform.passed = true;
        this.score += 5 * this.scoreMultiplier;
        
        // Track platform used event
        posthog.capture(GAME_EVENTS.PLATFORM_USED, {
          [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
          [GAME_PROPERTIES.PLATFORM_TYPE]: platform.type,
          [GAME_PROPERTIES.SCORE]: this.score
        });
      }
    }
  }

  private updatePowerUps(): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.x -= this.gameSpeed;

      if (powerUp.x + powerUp.width < 0) {
        this.powerUps.splice(i, 1);
        continue;
      }

      if (!powerUp.collected && this.checkCollision(this.player, powerUp)) {
        this.collectPowerUp(powerUp);
        this.powerUps.splice(i, 1);
      }
    }
  }

  private collectPowerUp(powerUp: PowerUp): void {
    const now = Date.now();
    this.totalPowerupsCollected++;
    
    // Track powerup collection event
    posthog.capture(GAME_EVENTS.POWERUP_COLLECTED, {
      [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
      [GAME_PROPERTIES.POWERUP_TYPE]: powerUp.type,
      [GAME_PROPERTIES.SCORE]: this.score,
      [GAME_PROPERTIES.TOTAL_POWERUPS_COLLECTED]: this.totalPowerupsCollected
    });
    
    switch (powerUp.type) {
      case 'speed':
        this.activePowerUps.push({ type: 'speed', duration: 5000, startTime: now });
        this.gameSpeed = this.baseGameSpeed * 1.5;
        break;
      case 'invincibility':
        this.activePowerUps.push({ type: 'invincibility', duration: 4000, startTime: now });
        this.isInvincible = true;
        break;
      case 'doubleJump':
        this.activePowerUps.push({ type: 'doubleJump', duration: 8000, startTime: now });
        this.player.canDoubleJump = true;
        break;
      case 'scoreMultiplier':
        this.activePowerUps.push({ type: 'scoreMultiplier', duration: 6000, startTime: now });
        this.scoreMultiplier = 2;
        break;
    }
    
    // Track powerup activation event
    posthog.capture(GAME_EVENTS.POWERUP_ACTIVATED, {
      [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
      [GAME_PROPERTIES.POWERUP_TYPE]: powerUp.type,
      [GAME_PROPERTIES.SCORE]: this.score
    });
  }

  private updatePowerUpEffects(): void {
    const now = Date.now();
    
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const effect = this.activePowerUps[i];
      
      if (now - effect.startTime > effect.duration) {
        // Track powerup expiration event
        posthog.capture(GAME_EVENTS.POWERUP_EXPIRED, {
          [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
          [GAME_PROPERTIES.POWERUP_TYPE]: effect.type,
          [GAME_PROPERTIES.SCORE]: this.score
        });
        
        switch (effect.type) {
          case 'speed':
            this.gameSpeed = this.baseGameSpeed;
            break;
          case 'invincibility':
            this.isInvincible = false;
            break;
          case 'doubleJump':
            this.player.canDoubleJump = false;
            break;
          case 'scoreMultiplier':
            this.scoreMultiplier = 1;
            break;
        }
        this.activePowerUps.splice(i, 1);
      }
    }
  }

  private checkCollision(rect1: GameObject, rect2: GameObject): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  private gameOver(): void {
    this.gameRunning = false;
    this.gameEnded = true;
    
    const gameDuration = (Date.now() - this.gameStartTime) / 1000;
    const isNewHighScore = this.score > this.highScore;
    
    // Save new high score
    if (isNewHighScore) {
      const previousHighScore = this.highScore;
      this.highScore = this.score;
      localStorage.setItem('trump-wild-ride-high-score', this.score.toString());
      
      // Track high score achievement
      posthog.capture(GAME_EVENTS.HIGH_SCORE_ACHIEVED, {
        [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
        [GAME_PROPERTIES.HIGH_SCORE]: this.score,
        [GAME_PROPERTIES.PREVIOUS_HIGH_SCORE]: previousHighScore,
        [GAME_PROPERTIES.GAME_DURATION]: gameDuration,
        [GAME_PROPERTIES.TOTAL_JUMPS]: this.totalJumps,
        [GAME_PROPERTIES.TOTAL_POWERUPS_COLLECTED]: this.totalPowerupsCollected,
        [GAME_PROPERTIES.TOTAL_OBSTACLES_AVOIDED]: this.totalObstaclesAvoided
      });
    }
    
    // Track game end event
    posthog.capture(GAME_EVENTS.GAME_ENDED, {
      [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
      [GAME_PROPERTIES.FINAL_SCORE]: this.score,
      [GAME_PROPERTIES.LIVES_REMAINING]: this.lives,
      [GAME_PROPERTIES.GAME_DURATION]: gameDuration,
      [GAME_PROPERTIES.HIGH_SCORE]: this.highScore,
      [GAME_PROPERTIES.TOTAL_JUMPS]: this.totalJumps,
      [GAME_PROPERTIES.TOTAL_POWERUPS_COLLECTED]: this.totalPowerupsCollected,
      [GAME_PROPERTIES.TOTAL_OBSTACLES_AVOIDED]: this.totalObstaclesAvoided,
      [GAME_PROPERTIES.GAME_SPEED]: this.gameSpeed,
      is_new_high_score: isNewHighScore
    });
    
    // Hide mobile controls when game ends
    if(document.body) {
        document.body.classList.remove('game-running');
    }
    
    this.startBtn.textContent = 'Play Again';
    this.startBtn.disabled = false;
  }

  private draw(): void {
    if (!this.assetsReady) {
      this.ctx.fillStyle = '#87CEEB';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = 'bold 32px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading Assets...', this.canvas.width / 2, this.canvas.height / 2);
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    if (this.images.bg) {
      const bgWidth = this.images.bg.width;
      const bgHeight = this.images.bg.height;
      const scaleY = this.canvas.height / bgHeight;
      const scaledBgWidth = bgWidth * scaleY;
      
      const offset = -(Date.now() / 100) % scaledBgWidth;
      for (let x = -scaledBgWidth + offset; x < this.canvas.width; x += scaledBgWidth) {
        this.ctx.drawImage(this.images.bg, x, 0, scaledBgWidth, this.canvas.height);
      }
    }

    // Draw ground - layer over background at same dimensions
    if (this.images.ground) {
      const groundWidth = this.images.ground.width;
      const groundHeight = this.images.ground.height;
      const scaleY = this.canvas.height / groundHeight;
      const scaledGroundWidth = groundWidth * scaleY;
      
      const offset = -(Date.now() / 100) % scaledGroundWidth;
      for (let x = -scaledGroundWidth + offset; x < this.canvas.width; x += scaledGroundWidth) {
        this.ctx.drawImage(this.images.ground, x, 0, scaledGroundWidth, this.canvas.height);
      }
    }

    // Draw platforms using ground texture
    this.platforms.forEach(platform => {
      if (this.images.ground) {
        const platformHeight = platform.height;
        const aspectRatio = this.images.ground.width / this.images.ground.height;
        const platformWidth = platformHeight * aspectRatio;
        
        for (let x = platform.x; x < platform.x + platform.width; x += platformWidth) {
          const remainingWidth = Math.min(platformWidth, platform.x + platform.width - x);
          this.ctx.drawImage(
            this.images.ground,
            0, 0, this.images.ground.width * (remainingWidth / platformWidth), this.images.ground.height,
            x, platform.y, remainingWidth, platformHeight
          );
        }
      }
    });

    // Draw smoke particles before player
    this.drawSmokeParticles();

    // Draw player with effects
    let playerAlpha = 1;
    if (this.isInvincible) {
      playerAlpha = Math.sin(Date.now() / 100) * 0.3 + 0.7;
    } else if (this.invincibilityTime > 0) {
      playerAlpha = Math.sin(Date.now() / 80) * 0.4 + 0.6;
    }
    
    this.ctx.globalAlpha = playerAlpha;
    
    if (this.images.char) {
      this.ctx.drawImage(this.images.char, this.player.x, this.player.y, this.player.width, this.player.height);
    }
    
    // Draw hearts on character
    this.ctx.globalAlpha = 1;
    for (let i = 0; i < this.maxLives; i++) {
      const heartX = this.player.x + 12 + (i * 12); // Adjusted for bigger character
      const heartY = this.player.y + 25;
      
      if (i < this.lives) {
        this.ctx.fillStyle = '#FF0000';
      } else {
        this.ctx.fillStyle = '#666666';
      }
      
      this.ctx.beginPath();
      this.ctx.moveTo(heartX + 4, heartY);
      this.ctx.lineTo(heartX + 8, heartY + 4);
      this.ctx.lineTo(heartX + 4, heartY + 8);
      this.ctx.lineTo(heartX, heartY + 4);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Draw obstacles with sprites
    this.obstacles.forEach(obstacle => {
      switch (obstacle.type) {
        case 'ground':
          if (this.images.rock_a) {
            this.ctx.drawImage(this.images.rock_a, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          }
          break;
          
        case 'flying':
          this.ctx.fillStyle = '#4B0082';
          this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          this.ctx.fillStyle = '#8A2BE2';
          this.ctx.fillRect(obstacle.x + 7, obstacle.y + 5, obstacle.width - 14, obstacle.height - 10);
          break;
          
        case 'moving':
          if (this.images.rock_b) {
            this.ctx.drawImage(this.images.rock_b, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          }
          break;
          
        case 'spike':
          if (this.images.plant) {
            this.ctx.drawImage(this.images.plant, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          }
          break;
      }
    });

    // Draw power-ups (bigger)
    this.powerUps.forEach(powerUp => {
      const pulseScale = 1 + Math.sin(Date.now() / 200) * 0.1;
      const centerX = powerUp.x + powerUp.width / 2;
      const centerY = powerUp.y + powerUp.height / 2;
      const scaledWidth = powerUp.width * pulseScale;
      const scaledHeight = powerUp.height * pulseScale;
      
      this.ctx.fillStyle = powerUp.color;
      this.ctx.fillRect(
        centerX - scaledWidth / 2,
        centerY - scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );
      
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = 'bold 18px Arial'; // Bigger font for bigger powerups
      this.ctx.textAlign = 'center';
      let symbol = '';
      switch (powerUp.type) {
        case 'speed': symbol = 'S'; break;
        case 'invincibility': symbol = 'I'; break;
        case 'doubleJump': symbol = 'J'; break;
        case 'scoreMultiplier': symbol = 'X'; break;
      }
      this.ctx.fillText(symbol, centerX, centerY + 6);
    });

    this.drawPowerUpStatus();

    if (this.gameEnded) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 30);
      
      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      
      this.ctx.font = 'bold 18px Arial';
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText('You ran out of lives!', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
  }

  private drawSmokeParticles(): void {
    this.smokeParticles.forEach(particle => {
      const alpha = particle.life * 0.5;
      const size = (1 - particle.life) * 8 + 2;
      
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = '#888888';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
  }

  private drawPowerUpStatus(): void {
    let yOffset = 10;
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    
    this.activePowerUps.forEach(effect => {
      const timeLeft = Math.ceil((effect.duration - (Date.now() - effect.startTime)) / 1000);
      let text = '';
      let color = '#FFF';
      
      switch (effect.type) {
        case 'speed':
          text = `Speed Boost: ${timeLeft}s`;
          color = '#00FF00';
          break;
        case 'invincibility':
          text = `Invincible: ${timeLeft}s`;
          color = '#FFD700';
          break;
        case 'doubleJump':
          text = `Double Jump: ${timeLeft}s`;
          color = '#00BFFF';
          break;
        case 'scoreMultiplier':
          text = `2x Score: ${timeLeft}s`;
          color = '#FF69B4';
          break;
      }
      
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(10, yOffset, 150, 20);
      this.ctx.fillStyle = color;
      this.ctx.fillText(text, 15, yOffset + 15);
      yOffset += 25;
    });
  }

  private updateScore(): void {
    if(!this.scoreElement) return;
    
    // Check for score milestones
    const milestone = checkMilestoneReached(this.previousScore, this.score);
    if (milestone) {
      posthog.capture(GAME_EVENTS.SCORE_MILESTONE, {
        [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
        [GAME_PROPERTIES.MILESTONE_SCORE]: milestone,
        [GAME_PROPERTIES.SCORE]: this.score,
        [GAME_PROPERTIES.TOTAL_JUMPS]: this.totalJumps,
        [GAME_PROPERTIES.TOTAL_POWERUPS_COLLECTED]: this.totalPowerupsCollected,
        [GAME_PROPERTIES.TOTAL_OBSTACLES_AVOIDED]: this.totalObstaclesAvoided
      });
    }
    this.previousScore = this.score;
    
    let scoreText = `Score: ${this.score}`;
    if (this.scoreMultiplier > 1) {
      scoreText += ` (${this.scoreMultiplier}x)`;
    }
    scoreText += ` | Lives: ${this.lives}`;
    this.scoreElement.textContent = scoreText;
  }

  private gameLoop(): void {
    if (this.gameRunning) {
      this.updatePlayer();
      this.spawnObstacle();
      this.spawnPlatform();
      this.spawnPowerUp();
      this.updateObstacles();
      this.updatePlatforms();
      this.updatePowerUps();
      this.updatePowerUpEffects();
    }

    this.draw();
    this.updateScore();

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private toggleInfoDialog(): void {
    this.isInfoDialogOpen = !this.isInfoDialogOpen;
    if (this.isInfoDialogOpen) {
      this.infoDialog.classList.remove('hidden');
      
      // Track info dialog opened event
      posthog.capture(GAME_EVENTS.INFO_DIALOG_OPENED, {
        [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
        [GAME_PROPERTIES.SCORE]: this.score
      });
    } else {
      this.infoDialog.classList.add('hidden');
      
      // Track info dialog closed event
      posthog.capture(GAME_EVENTS.INFO_DIALOG_CLOSED, {
        [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
        [GAME_PROPERTIES.SCORE]: this.score
      });
    }
  }

  private hideInfoDialog(): void {
    if (this.isInfoDialogOpen) {
      this.isInfoDialogOpen = false;
      this.infoDialog.classList.add('hidden');
    }
  }

  public cleanup(): void {
      if (this.animationId) {
          cancelAnimationFrame(this.animationId);
      }
      // Here you should also remove any event listeners you've added
      // to document, window, or other elements that persist beyond 
      // the component's lifecycle.
  }
} 