class Game {
    constructor() {
        // Initialize canvas
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Could not find canvas element');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get canvas context');
            return;
        }

        // Initialize score element
        this.scoreElement = document.getElementById('score');
        if (!this.scoreElement) {
            console.error('Could not find score element');
            return;
        }

        // Initialize all properties
        this.initializeProperties();

        // Set up event listeners
        this.setupEventListeners();

        // Start game loop
        this.gameLoop();
    }

    initializeProperties() {
        // World properties
        this.worldSize = {
            width: 20000,
            height: 15000
        };

        // Camera
        this.camera = {
            x: 0,
            y: 0,
            scale: 1
        };

        // Game objects
        this.asteroids = [];
        this.satellites = [];
        this.bullets = [];
        this.missiles = [];
        this.lasers = [];
        this.explosions = [];
        this.playerExplosions = [];
        this.messages = [];
        this.weaponPacks = [];
        this.healthPacks = [];
        this.enemies = [];
        this.wormholes = [];

        // Game state
        this.gameOver = false;
        this.keys = {};
        this.currentWeapon = 'bullet';
        this.health = 10;
        this.hasNuke = true;
        this.isGameStarted = false;
        this.score = 0;
        this.mousePressed = false;

        // Spawn timers
        this.lastSatelliteSpawn = 0;
        this.satelliteSpawnInterval = 30000;
        this.lastHealthPackSpawn = 0;
        this.healthPackSpawnInterval = 15000;
        this.lastEnemySpawn = 0;
        this.enemySpawnInterval = 15000;
        this.maxEnemies = 4;
        this.lastWeaponPackSpawn = 0;
        this.weaponPackSpawnInterval = 45000;

        // Map system
        this.currentMap = 'Andromeda Sector';
        this.mapData = {
            'Andromeda Sector': {
                backgroundColor: '#000000',
                starColor: 'rgba(255, 255, 255, ',
                borderColor: '#0ff',
                connections: ['Orion Nebula', 'Carina Expanse', 'Cygnus Void']
            },
            'Orion Nebula': {
                backgroundColor: '#000022',
                starColor: 'rgba(200, 255, 220, ',
                borderColor: '#0f8',
                connections: ['Andromeda Sector', 'Pleiades Cluster']
            },
            'Carina Expanse': {
                backgroundColor: '#220000',
                starColor: 'rgba(255, 200, 200, ',
                borderColor: '#f44',
                connections: ['Andromeda Sector', 'Vela Remnant']
            },
            'Cygnus Void': {
                backgroundColor: '#002222',
                starColor: 'rgba(200, 255, 255, ',
                borderColor: '#4ff',
                connections: ['Andromeda Sector', 'Perseus Arm']
            },
            'Pleiades Cluster': {
                backgroundColor: '#002200',
                starColor: 'rgba(220, 255, 200, ',
                borderColor: '#4f4',
                connections: ['Orion Nebula', 'Taurus Gate']
            },
            'Vela Remnant': {
                backgroundColor: '#220022',
                starColor: 'rgba(255, 200, 255, ',
                borderColor: '#f4f',
                connections: ['Carina Expanse', 'Centaurus Web']
            },
            'Perseus Arm': {
                backgroundColor: '#222200',
                starColor: 'rgba(255, 255, 200, ',
                borderColor: '#ff4',
                connections: ['Cygnus Void', 'Cassiopeia Drift']
            },
            'Taurus Gate': {
                backgroundColor: '#110022',
                starColor: 'rgba(220, 200, 255, ',
                borderColor: '#88f',
                connections: ['Pleiades Cluster', 'Gemini Sector']
            },
            'Centaurus Web': {
                backgroundColor: '#221100',
                starColor: 'rgba(255, 220, 200, ',
                borderColor: '#f84',
                connections: ['Vela Remnant', 'Scorpius Maze']
            },
            'Cassiopeia Drift': {
                backgroundColor: '#002211',
                starColor: 'rgba(200, 255, 220, ',
                borderColor: '#4f8',
                connections: ['Perseus Arm']
            }
        };

        // Border
        this.borderWidth = 50;
        this.borderGlow = 20;

        // Game state
        this.gameOver = false;
        this.keys = {};
        this.currentWeapon = 'bullet';
        this.health = 10;
        this.hasNuke = true;
        this.isGameStarted = false;
        this.score = 0;
        this.mousePressed = false;

        // Ranking system
        this.ranks = {};
        this.ranks.cadet = { minScore: 0, maxScore: 1000, color: '#fff', shipSize: 20 };
        this.ranks.ensign = { minScore: 1000, maxScore: 5000, color: '#0f0', shipSize: 22 };
        this.ranks.lieutenant = { minScore: 5000, maxScore: 15000, color: '#0ff', shipSize: 24 };
        this.ranks.commander = { minScore: 15000, maxScore: 30000, color: '#ff0', shipSize: 26 };
        this.ranks.captain = { minScore: 30000, maxScore: 50000, color: '#f0f', shipSize: 28 };
        this.ranks.admiral = { minScore: 50000, maxScore: Infinity, color: '#f00', shipSize: 30 };
        this.currentRank = 'cadet';

        // Weapon systems
        this.laserCooldown = 0;
        this.laserCooldownTime = 300;
        this.missileCooldown = 0;
        this.missileCooldownTime = 120;

        // Game objects
        this.asteroids = [];
        this.satellites = [];
        this.bullets = [];
        this.missiles = [];
        this.lasers = [];
        this.explosions = [];
        this.playerExplosions = [];
        this.messages = [];
        this.weaponPacks = [];

        // Spawn timers
        this.lastSatelliteSpawn = 0;
        this.satelliteSpawnInterval = 30000;
        this.lastHealthPackSpawn = 0;
        this.healthPackSpawnInterval = 15000;
        this.lastEnemySpawn = 0;
        this.enemySpawnInterval = 15000;
        this.maxEnemies = 4;
        this.lastWeaponPackSpawn = 0;
        this.weaponPackSpawnInterval = 45000;

        // Special weapons
        this.specialWeapons = {
            plasma: { ammo: 0, cooldown: 0, cooldownTime: 20 },
            railgun: { ammo: 0, cooldown: 0, cooldownTime: 45 },
            shotgun: { ammo: 0, cooldown: 0, cooldownTime: 30 }
        };

        // Create player
        this.player = new Player(this.worldSize.width / 2, this.worldSize.height / 2);

        // Generate stars
        this.stars = this.generateStars(3000);

        // Set initial canvas size
        this.resizeCanvas();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'x' || e.key === 'X') this.cycleWeapon();
            if ((e.key === 'n' || e.key === 'N') && this.hasNuke) this.activateNuke();
            if (e.key === ' ' && !this.gameOver) this.shoot();
        });
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        this.canvas.addEventListener('mousedown', () => this.mousePressed = true);
        this.canvas.addEventListener('mouseup', () => this.mousePressed = false);
        this.canvas.addEventListener('mouseleave', () => this.mousePressed = false);
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
    }

    startGame() {
        console.log('Starting game...');
        // Hide menu
        
        // Generate more stars after world size is defined
        this.stars = this.generateStars(3000);  // Increased from 2000 to 3000

        // Add mouse state
        this.mousePressed = false;
        
        // Add health packs array and spawn timer
        this.healthPacks = [];
        this.lastHealthPackSpawn = 0;
        this.healthPackSpawnInterval = 15000;

        // Add map properties
        this.currentMap = 'Andromeda Sector';
        this.wormholes = [];
        this.mapData = {
            'Andromeda Sector': {
                backgroundColor: '#000000',
                starColor: 'rgba(255, 255, 255, ',
                borderColor: '#0ff',
                connections: ['Orion Nebula', 'Carina Expanse', 'Cygnus Void']
            },
            'Orion Nebula': {
                backgroundColor: '#000022',
                starColor: 'rgba(200, 255, 220, ',
                borderColor: '#0f8',
                connections: ['Andromeda Sector', 'Pleiades Cluster']
            },
            'Carina Expanse': {
                backgroundColor: '#220000',
                starColor: 'rgba(255, 200, 200, ',
                borderColor: '#f44',
                connections: ['Andromeda Sector', 'Vela Remnant']
            },
            'Cygnus Void': {
                backgroundColor: '#002222',
                starColor: 'rgba(200, 255, 255, ',
                borderColor: '#4ff',
                connections: ['Andromeda Sector', 'Perseus Arm']
            },
            'Pleiades Cluster': {
                backgroundColor: '#002200',
                starColor: 'rgba(220, 255, 200, ',
                borderColor: '#4f4',
                connections: ['Orion Nebula', 'Taurus Gate']
            },
            'Vela Remnant': {
                backgroundColor: '#220022',
                starColor: 'rgba(255, 200, 255, ',
                borderColor: '#f4f',
                connections: ['Carina Expanse', 'Centaurus Web']
            },
            'Perseus Arm': {
                backgroundColor: '#222200',
                starColor: 'rgba(255, 255, 200, ',
                borderColor: '#ff4',
                connections: ['Cygnus Void', 'Cassiopeia Drift']
            },
            'Taurus Gate': {
                backgroundColor: '#110022',
                starColor: 'rgba(220, 200, 255, ',
                borderColor: '#88f',
                connections: ['Pleiades Cluster', 'Gemini Sector']
            },
            'Centaurus Web': {
                backgroundColor: '#221100',
                starColor: 'rgba(255, 220, 200, ',
                borderColor: '#f84',
                connections: ['Vela Remnant', 'Scorpius Maze']
            },
            'Cassiopeia Drift': {
                backgroundColor: '#002211',
                starColor: 'rgba(200, 255, 220, ',
                borderColor: '#4f8',
                connections: ['Perseus Arm']
            }
        };

        // Event listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Weapon switching
            if (e.key === 'x' || e.key === 'X') {
                this.cycleWeapon();
            }
            
            // Nuke activation
            if ((e.key === 'n' || e.key === 'N') && this.hasNuke) {
                this.activateNuke();
            }
            
            // Shooting
            if (e.key === ' ' && !this.gameOver) {
                this.shoot();
            }
        });
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        this.canvas.addEventListener('mousedown', () => this.mousePressed = true);
        this.canvas.addEventListener('mouseup', () => this.mousePressed = false);
        this.canvas.addEventListener('mouseleave', () => this.mousePressed = false);
        
        // Add start button listener
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        
        // Debug logging
        console.log('Game initialized');
        console.log('Canvas dimensions:', this.canvas.width, this.canvas.height);
        console.log('World dimensions:', this.worldSize.width, this.worldSize.height);
        console.log('Player position:', this.player.x, this.player.y);
        
        // Start game loop
        this.gameLoop();

        // Add enemies array and spawn timer
        this.enemies = [];
        this.lastEnemySpawn = 0;
        this.enemySpawnInterval = 15000; // Increased from 5000 to 15000 (15 seconds between spawns)
        this.maxEnemies = 4; // Reduced from 8 to 4

        // Add special weapons array and spawn timer
        this.weaponPacks = [];
        this.lastWeaponPackSpawn = 0;
        this.weaponPackSpawnInterval = 45000; // 45 seconds between weapon pack spawns
        
        // Add special weapons ammo counts
        this.specialWeapons = {
            'plasma': { ammo: 0, cooldown: 0, cooldownTime: 20 },
            'railgun': { ammo: 0, cooldown: 0, cooldownTime: 45 },
            'shotgun': { ammo: 0, cooldown: 0, cooldownTime: 30 }
        };
    }
    
    startGame() {
        console.log('Starting game...');
        // Hide menu
        document.getElementById('menu').style.display = 'none';
        this.isGameStarted = true;
        console.log('Game started:', this.isGameStarted);
        
        // Initialize game
        this.init();
        
        // Ensure wormhole is spawned
        if (this.wormholes.length === 0) {
            console.log('No wormholes found, spawning new wormhole...');
            this.spawnWormhole();
        }
        
        console.log('Game initialized with', this.wormholes.length, 'wormholes');
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        // Set canvas size to match window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        console.log('Canvas resized:', this.canvas.width, this.canvas.height);
        
        // If game is in progress and player exists, adjust player position to stay within bounds
        if (!this.gameOver && this.player) {
            this.player.x = Math.min(this.player.x, this.canvas.width - this.player.radius);
            this.player.y = Math.min(this.player.y, this.canvas.height - this.player.radius);
        }
    }
    
    init() {
        console.log('Initializing game...');
        // Create more initial asteroids spread across the world
        for (let i = 0; i < 50; i++) {
            const buffer = 100;
            const x = buffer + Math.random() * (this.worldSize.width - buffer * 2);
            const y = buffer + Math.random() * (this.worldSize.height - buffer * 2);
            const radius = 25 + Math.random() * 15;
            
            this.asteroids.push(new Asteroid(x, y, radius));
        }
        console.log('Asteroids created:', this.asteroids.length);

        // Spawn initial health packs
        this.spawnHealthPack();
        this.spawnHealthPack();
        console.log('Health packs spawned');

        // Spawn wormhole
        this.spawnWormhole();
        console.log('Wormhole spawned');
        
        // Reset camera to player position
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;
        console.log('Camera position:', this.camera.x, this.camera.y);
    }
    
    generateStars(count) {
        const stars = [];
        // Create more stars with better visibility
        for (let i = 0; i < count * 2; i++) {  // Double the number of stars
            stars.push({
                x: Math.random() * this.worldSize.width * 2 - this.worldSize.width / 2,
                y: Math.random() * this.worldSize.height * 2 - this.worldSize.height / 2,
                size: Math.random() * 3 + 1.5,  // Increased size range (1.5 to 4.5)
                brightness: Math.random() * 0.7 + 0.3,  // Increased brightness (0.3 to 1.0)
                parallaxFactor: Math.random() * 0.7 + 0.3  // Increased parallax effect
            });
        }
        return stars;
    }

    updateCamera() {
        // Camera follows player smoothly
        const targetX = this.player.x - this.canvas.width / 2;
        const targetY = this.player.y - this.canvas.height / 2;
        
        // Smooth camera movement
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
    }

    update() {
        if (!this.isGameStarted) return;
        if (this.gameOver) return;
        
        // Update camera position
        this.updateCamera();

        // Update weapon cooldowns
        if (this.laserCooldown > 0) this.laserCooldown--;
        if (this.missileCooldown > 0) this.missileCooldown--;
        
        // Update special weapon cooldowns
        Object.values(this.specialWeapons).forEach(weapon => {
            if (weapon.cooldown > 0) weapon.cooldown--;
        });
        
        // Update player
        this.player.update(this.keys);
        this.player.thrusterActive = this.mousePressed;  // Update thruster state
        this.wrapObject(this.player);  // Use wrapObject for player instead of player.wrap
        
        // Update wormholes
        this.wormholes.forEach(wormhole => {
            wormhole.update();
            if (wormhole.collidesWith(this.player)) {
                this.switchMap(wormhole.destinationMap);
            }
        });
        
        // Update game objects with world wrapping
        this.updateGameObjects();
        
        // Check collisions
        this.checkCollisions();
        
        // Spawn new asteroids if needed
        this.spawnAsteroids();

        // Spawn satellites periodically
        const currentTime = Date.now();
        if (currentTime - this.lastSatelliteSpawn > this.satelliteSpawnInterval) {
            this.spawnSatellite();
            this.lastSatelliteSpawn = currentTime;
        }

        // Spawn health packs periodically
        if (currentTime - this.lastHealthPackSpawn > this.healthPackSpawnInterval) {
            this.spawnHealthPack();
            this.lastHealthPackSpawn = currentTime;
        }
        
        // Update health packs
        this.healthPacks.forEach(healthPack => {
            healthPack.update();
        });

        // Spawn enemies periodically
        if (currentTime - this.lastEnemySpawn > this.enemySpawnInterval && this.enemies.length < this.maxEnemies) {
            this.spawnEnemy();
            this.lastEnemySpawn = currentTime;
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player);
            this.wrapObject(enemy);
            
            // Enemy shooting
            const bullet = enemy.shoot();
            if (bullet) {
                this.bullets.push(bullet);
            }
        });

        // Spawn weapon packs periodically
        if (currentTime - this.lastWeaponPackSpawn > this.weaponPackSpawnInterval) {
            this.spawnWeaponPack();
            this.lastWeaponPackSpawn = currentTime;
        }
        
        // Update weapon packs
        this.weaponPacks.forEach(pack => {
            pack.update();
        });
    }
    
    updateGameObjects() {
        // Update asteroids
        this.asteroids.forEach(asteroid => {
            asteroid.update();
            this.wrapObject(asteroid);
        });

        // Update satellites
        this.satellites.forEach(satellite => {
            satellite.update();
            this.wrapObject(satellite);
        });

        // Update bullets
        this.bullets.forEach((bullet, index) => {
            bullet.update();
            this.wrapObject(bullet);
            if (bullet.life <= 0) {
                this.bullets.splice(index, 1);
            }
        });

        // Update missiles
        this.missiles.forEach((missile, index) => {
            missile.update();
            this.wrapObject(missile);
            if (missile.life <= 0) {
                this.missiles.splice(index, 1);
            }
        });

        // Update lasers
        this.lasers.forEach((laser, index) => {
            laser.update();
            this.wrapObject(laser);
            if (laser.life <= 0) {
                this.lasers.splice(index, 1);
            }
        });
    }

    wrapObject(obj) {
        // Enforce strict border rules - nothing can cross the borders
        if (obj.x - obj.radius < this.borderWidth) {
            obj.x = this.borderWidth + obj.radius;
            if (obj.velocity) {
                obj.velocity.x = Math.abs(obj.velocity.x); // Bounce right
            }
        } else if (obj.x + obj.radius > this.worldSize.width - this.borderWidth) {
            obj.x = this.worldSize.width - this.borderWidth - obj.radius;
            if (obj.velocity) {
                obj.velocity.x = -Math.abs(obj.velocity.x); // Bounce left
            }
        }
        
        if (obj.y - obj.radius < this.borderWidth) {
            obj.y = this.borderWidth + obj.radius;
            if (obj.velocity) {
                obj.velocity.y = Math.abs(obj.velocity.y); // Bounce down
            }
        } else if (obj.y + obj.radius > this.worldSize.height - this.borderWidth) {
            obj.y = this.worldSize.height - this.borderWidth - obj.radius;
            if (obj.velocity) {
                obj.velocity.y = -Math.abs(obj.velocity.y); // Bounce up
            }
        }
    }

    spawnAsteroids() {
        const minAsteroids = 10;
        if (this.asteroids.length < minAsteroids) {
            // Determine spawn position (off-screen)
            const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
            let x, y;
            
            switch(side) {
                case 0: // top
                    x = Math.random() * this.worldSize.width;
                    y = -100;
                    break;
                case 1: // right
                    x = this.worldSize.width + 100;
                    y = Math.random() * this.worldSize.height;
                    break;
                case 2: // bottom
                    x = Math.random() * this.worldSize.width;
                    y = this.worldSize.height + 100;
                    break;
                case 3: // left
                    x = -100;
                    y = Math.random() * this.worldSize.height;
                    break;
            }
            
            this.asteroids.push(new Asteroid(x, y));
        }
    }
    
    spawnSatellite() {
        const buffer = 100;
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(edge) {
            case 0: // top
                x = Math.max(buffer, Math.min(Math.random() * this.worldSize.width, this.worldSize.width - buffer));
                y = buffer;
                break;
            case 1: // right
                x = this.worldSize.width - buffer;
                y = Math.max(buffer, Math.min(Math.random() * this.worldSize.height, this.worldSize.height - buffer));
                break;
            case 2: // bottom
                x = Math.max(buffer, Math.min(Math.random() * this.worldSize.width, this.worldSize.width - buffer));
                y = this.worldSize.height - buffer;
                break;
            case 3: // left
                x = buffer;
                y = Math.max(buffer, Math.min(Math.random() * this.worldSize.height, this.worldSize.height - buffer));
                break;
        }
        
        this.satellites.push(new Satellite(x, y));
    }
    
    checkCollisions() {
        // Bullet-Asteroid collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (this.bullets[i] && this.asteroids[j] && this.bullets[i].collidesWith(this.asteroids[j])) {
                    // Create explosion
                    this.createExplosion(this.asteroids[j].x, this.asteroids[j].y);
                    
                    // Reduce asteroid health
                    this.asteroids[j].health--;
                    
                    if (this.asteroids[j].health <= 0) {
                        // Split asteroid if it's large or medium
                        const newAsteroids = this.asteroids[j].split();
                        this.asteroids.push(...newAsteroids);
                        
                        // Award score based on size
                        const scoreValue = this.asteroids[j].size === 'large' ? 100 :
                                         this.asteroids[j].size === 'medium' ? 50 : 25;
                        this.score += scoreValue;
                        
                        // Remove destroyed asteroid
                        this.asteroids.splice(j, 1);
                    }
                    
                    // Remove bullet
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }

        // Missile-Asteroid collisions
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (this.missiles[i] && this.asteroids[j] && this.missiles[i].collidesWith(this.asteroids[j])) {
                    // Create explosion
                    this.createExplosion(this.asteroids[j].x, this.asteroids[j].y);
                    
                    // Missiles always destroy asteroids regardless of size
                    // Split asteroid if it's large or medium
                    const newAsteroids = this.asteroids[j].split();
                    this.asteroids.push(...newAsteroids);
                    
                    // Award score based on size
                    const scoreValue = this.asteroids[j].size === 'large' ? 150 :
                                     this.asteroids[j].size === 'medium' ? 75 : 35;
                    this.score += scoreValue;
                    
                    // Remove destroyed asteroid and missile
                    this.asteroids.splice(j, 1);
                    this.missiles.splice(i, 1);
                    break;
                }
            }
        }

        // Bullet-Satellite collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.satellites.length - 1; j >= 0; j--) {
                if (this.bullets[i].collidesWith(this.satellites[j])) {
                    // Create small explosion at collision point
                    const explosionX = this.bullets[i].x;
                    const explosionY = this.bullets[i].y;
                    this.explosions.push(new SmallExplosion(explosionX, explosionY));
                    
                    this.bullets.splice(i, 1);
                    this.satellites.splice(j, 1);
                    this.score += 500;
                    this.scoreElement.textContent = `Score: ${this.score}`;
                    break;
                }
            }
        }

        // Missile-Satellite collisions
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            for (let j = this.satellites.length - 1; j >= 0; j--) {
                if (this.missiles[i].collidesWith(this.satellites[j])) {
                    const missileX = this.missiles[i].x;
                    const missileY = this.missiles[i].y;
                    const explosionRadius = this.missiles[i].explosionRadius;
                    
                    this.createExplosion(missileX, missileY);
                    this.missiles.splice(i, 1);
                    this.satellites.splice(j, 1);
                    this.score += 500;
                    this.scoreElement.textContent = `Score: ${this.score}`;
                    break;
                }
            }
        }
        
        // Laser collisions
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            let hits = 0;
            let laserRemoved = false;
            
            // Check asteroid collisions
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (this.lasers[i].collidesWith(this.asteroids[j])) {
                    // Store asteroid position before removing it
                    const asteroidX = this.asteroids[j].x;
                    const asteroidY = this.asteroids[j].y;
                    
                    this.asteroids.splice(j, 1);
                    this.score += 100;
                    this.scoreElement.textContent = `Score: ${this.score}`;
                    hits++;
                    
                    // Create explosion at asteroid position
                    this.createExplosion(asteroidX, asteroidY);
                    
                    // Remove laser after 3 hits
                    if (hits >= 3) {
                        this.lasers.splice(i, 1);
                        laserRemoved = true;
                        break;
                    }
                }
            }
            
            // Only check satellite collisions if the laser hasn't been removed
            if (!laserRemoved) {
                for (let j = this.satellites.length - 1; j >= 0; j--) {
                    if (this.lasers[i].collidesWith(this.satellites[j])) {
                        // Store satellite position before removing it
                        const satelliteX = this.satellites[j].x;
                        const satelliteY = this.satellites[j].y;
                        
                        this.satellites.splice(j, 1);
                        this.lasers.splice(i, 1);
                        this.score += 500;
                        this.scoreElement.textContent = `Score: ${this.score}`;
                        this.createExplosion(satelliteX, satelliteY);
                        break;
                    }
                }
            }
        }
        
        // Player-Asteroid collisions
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            if (this.player.collidesWith(this.asteroids[i])) {
                this.health--;
                // Create player explosion at collision point
                const collisionX = (this.player.x + this.asteroids[i].x) / 2;
                const collisionY = (this.player.y + this.asteroids[i].y) / 2;
                this.playerExplosions.push(new PlayerExplosion(collisionX, collisionY));
                this.asteroids.splice(i, 1); // Remove the asteroid after collision
                if (this.health <= 0) {
                    this.gameOver = true;
                }
                break;
            }
        }

        // Player-Satellite collisions
        for (let i = this.satellites.length - 1; i >= 0; i--) {
            if (this.player.collidesWith(this.satellites[i])) {
                this.health--;
                // Create player explosion at collision point
                const collisionX = (this.player.x + this.satellites[i].x) / 2;
                const collisionY = (this.player.y + this.satellites[i].y) / 2;
                this.playerExplosions.push(new PlayerExplosion(collisionX, collisionY));
                this.satellites.splice(i, 1); // Remove the satellite after collision
                if (this.health <= 0) {
                    this.gameOver = true;
                }
                break;
            }
        }

        // Player-HealthPack collisions
        for (let i = this.healthPacks.length - 1; i >= 0; i--) {
            const dx = this.player.x - this.healthPacks[i].x;
            const dy = this.player.y - this.healthPacks[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.radius + this.healthPacks[i].radius) {
                // Heal player to full health
                this.health = 10;
                
                // Create healing effect
                const healEffect = new HealEffect(this.player.x, this.player.y);
                this.explosions.push(healEffect);
                
                // Remove health pack
                this.healthPacks.splice(i, 1);
                break;
            }
        }

        // Player-Enemy bullet collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            if (this.bullets[i].isEnemyBullet && this.player.collidesWith(this.bullets[i])) {
                this.health--;
                this.bullets.splice(i, 1);
                
                // Create player explosion at collision point
                const collisionX = this.player.x;
                const collisionY = this.player.y;
                this.playerExplosions.push(new PlayerExplosion(collisionX, collisionY));
                
                if (this.health <= 0) {
                    this.gameOver = true;
                }
                break;
            }
        }

        // Player bullets-Enemy collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            if (!this.bullets[i].isEnemyBullet) {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    if (this.enemies[j].collidesWith(this.bullets[i])) {
                        this.enemies[j].health--;
                        this.bullets.splice(i, 1);
                        
                        if (this.enemies[j].health <= 0) {
                            // Create explosion at enemy position
                            const explosionX = this.enemies[j].x;
                            const explosionY = this.enemies[j].y;
                            this.explosions.push(new Explosion(explosionX, explosionY));
                            
                            // Remove enemy and add score
                            this.enemies.splice(j, 1);
                            this.score += this.enemies[j].type === 'fighter' ? 200 : 400;
                            this.scoreElement.textContent = `Score: ${this.score}`;
                        }
                        break;
                    }
                }
            }
        }

        // Player-Enemy collisions
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.player.collidesWith(this.enemies[i])) {
                this.health -= 2;
                // Create explosion at collision point
                const collisionX = (this.player.x + this.enemies[i].x) / 2;
                const collisionY = (this.player.y + this.enemies[i].y) / 2;
                this.explosions.push(new Explosion(collisionX, collisionY));
                this.enemies.splice(i, 1);
                
                if (this.health <= 0) {
                    this.gameOver = true;
                }
                break;
            }
        }

        // Player-WeaponPack collisions
        for (let i = this.weaponPacks.length - 1; i >= 0; i--) {
            const dx = this.player.x - this.weaponPacks[i].x;
            const dy = this.player.y - this.weaponPacks[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.radius + this.weaponPacks[i].radius) {
                // Add ammo to player's weapons
                const pack = this.weaponPacks[i];
                this.specialWeapons[pack.type].ammo += pack.ammo;
                
                // Create pickup effect
                const effect = new WeaponPickupEffect(pack.x, pack.y, pack.color);
                this.explosions.push(effect);
                
                // Remove weapon pack
                this.weaponPacks.splice(i, 1);
                break;
            }
        }

        // Update score and check rank after collisions
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.checkRank();
    }

    checkRank() {
        // Find the appropriate rank based on current score
        for (const [rank, data] of Object.entries(this.ranks)) {
            if (this.score >= data.minScore && this.score < data.maxScore) {
                if (this.currentRank !== rank) {
                    // Player achieved a new rank
                    this.currentRank = rank;
                    this.player.updateRank(rank, data);
                    
                    // Create rank-up effect
                    const effect = new RankUpEffect(this.player.x, this.player.y, data.color);
                    this.explosions.push(effect);
                    
                    // Display rank-up message
                    const rankDisplay = rank.charAt(0).toUpperCase() + rank.slice(1);
                    this.showMessage(`Promoted to ${rankDisplay}!`, data.color);
                }
                break;
            }
        }
    }

    showMessage(text, color) {
        // Add floating message
        const message = {
            text: text,
            color: color,
            life: 180, // 3 seconds at 60fps
            y: this.canvas.height / 3,
            opacity: 1
        };
        this.messages = this.messages || [];
        this.messages.push(message);
    }

    createExplosion(x, y) {
        // Create visual explosion effect
        const explosion = new Explosion(x, y);
        this.explosions.push(explosion);
    }
    
    activateNuke() {
        if (!this.hasNuke || this.gameOver) return;

        // Calculate spawn position in front of the player
        const spawnX = this.player.x + Math.cos(this.player.angle) * this.player.radius;
        const spawnY = this.player.y + Math.sin(this.player.angle) * this.player.radius;

        // Create a nuke projectile
        const nuke = new Missile(spawnX, spawnY, this.player.angle, 8, this.player.velocity);
        nuke.isNuke = true;
        nuke.explosionRadius = 1000; // 1 square = 1000 units (grid size)
        this.missiles.push(nuke);

        // Use up the nuke
        this.hasNuke = false;
    }
    
    draw() {
        if (!this.canvas || !this.ctx) {
            console.error('Canvas or context is not initialized');
            return;
        }

        // Clear canvas with map-specific background
        this.ctx.fillStyle = this.mapData[this.currentMap].backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.isGameStarted) {
            console.log('Game not started, skipping draw');
            return;
        }

        this.ctx.save();
        
        // Apply camera transform
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw stars before anything else
        this.stars.forEach(star => {
            // Calculate star position with parallax
            const x = star.x + (this.camera.x * (1 - star.parallaxFactor));
            const y = star.y + (this.camera.y * (1 - star.parallaxFactor));
            
            this.ctx.fillStyle = this.mapData[this.currentMap].starColor + star.brightness + ')';
            this.ctx.beginPath();
            this.ctx.arc(x, y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw wormholes with increased visibility
        this.wormholes.forEach(wormhole => {
            wormhole.draw(this.ctx);
            
            // Add a bright marker around the wormhole
            this.ctx.beginPath();
            this.ctx.arc(wormhole.x, wormhole.y, wormhole.radius + 20, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
            this.ctx.lineWidth = 5;
            this.ctx.stroke();

            // Draw destination label above the wormhole
            this.ctx.save();
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`To: ${wormhole.destinationMap}`, wormhole.x, wormhole.y - wormhole.radius - 30);
            this.ctx.restore();
        });

        // Draw world borders with glow effect
        this.ctx.save();
        
        // Create gradient for border glow
        const borderGradient = this.ctx.createLinearGradient(0, 0, this.borderGlow, 0);
        borderGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        borderGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

        // Draw borders
        this.ctx.strokeStyle = '#0ff';
        this.ctx.lineWidth = this.borderWidth;
        this.ctx.strokeRect(0, 0, this.worldSize.width, this.worldSize.height);

        // Draw border glow
        for (let i = 0; i < 360; i += 90) {
            this.ctx.save();
            this.ctx.translate(this.worldSize.width / 2, this.worldSize.height / 2);
            this.ctx.rotate((i * Math.PI) / 180);
            this.ctx.translate(-this.worldSize.width / 2, -this.worldSize.height / 2);

            // Outer glow
            this.ctx.fillStyle = borderGradient;
            this.ctx.fillRect(0, 0, this.worldSize.width, this.borderGlow);
            this.ctx.restore();
        }

        // Draw grid lines for scale reference
        const gridSize = 1000;
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Vertical grid lines
        for (let x = gridSize; x < this.worldSize.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.worldSize.height);
            this.ctx.stroke();
        }

        // Horizontal grid lines
        for (let y = gridSize; y < this.worldSize.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.worldSize.width, y);
            this.ctx.stroke();
        }

        // Draw large map name in the center of the map (not the screen)
        this.ctx.save();
        this.ctx.font = 'bold 240px Arial';  // Increased font size for better visibility
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Use the world center coordinates
        const mapCenterX = this.worldSize.width / 2;
        const mapCenterY = this.worldSize.height / 2;
        
        // Draw the map name at the world center
        this.ctx.fillText(this.currentMap, mapCenterX, mapCenterY);
        this.ctx.restore();

        this.ctx.restore();

        // Draw game objects
        this.player.draw(this.ctx);
        this.asteroids.forEach(asteroid => asteroid.draw(this.ctx));
        this.satellites.forEach(satellite => satellite.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.missiles.forEach(missile => missile.draw(this.ctx));
        this.lasers.forEach(laser => laser.draw(this.ctx));
        
        // Draw explosions
        this.explosions = this.explosions.filter(explosion => {
            explosion.update();
            explosion.draw(this.ctx);
            return explosion.life > 0;
        });

        // Draw player explosions
        this.playerExplosions = this.playerExplosions.filter(explosion => {
            explosion.update();
            explosion.draw(this.ctx);
            return explosion.life > 0;
        });

        // Draw health packs
        this.healthPacks.forEach(healthPack => healthPack.draw(this.ctx));

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw weapon packs with proper camera transform
        this.weaponPacks.forEach(pack => {
            pack.draw(this.ctx);
        });

        this.ctx.restore();
        
        // Draw UI elements (not affected by camera)
        // Draw health bar
        const barWidth = 200;
        const barHeight = 20;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = 20;
        
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const segmentWidth = barWidth / 10;
        for (let i = 0; i < this.health; i++) {
            this.ctx.fillStyle = '#0f0';
            this.ctx.fillRect(barX + i * segmentWidth, barY, segmentWidth - 2, barHeight - 2);
        }
        
        // Draw weapon indicator and other UI elements
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Weapon: ${this.currentWeapon.toUpperCase()}`, this.canvas.width - 20, 30);

        if (this.currentWeapon === 'laser' && this.laserCooldown > 0) {
            this.ctx.fillStyle = '#f00';
            this.ctx.fillText(`LASER COOLDOWN: ${Math.ceil(this.laserCooldown / 60)}s`, this.canvas.width - 20, 90);
        } else if (this.currentWeapon === 'missile' && this.missileCooldown > 0) {
            this.ctx.fillStyle = '#f00';
            this.ctx.fillText(`MISSILE COOLDOWN: ${Math.ceil(this.missileCooldown / 60)}s`, this.canvas.width - 20, 90);
        }

        if (this.hasNuke) {
            this.ctx.fillStyle = '#f00';
            this.ctx.fillText('NUKE READY', this.canvas.width - 20, 60);
        }
        
        if (this.gameOver) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press Space to Restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }

        // Draw minimap
        const minimapSize = 200;
        const padding = 20;
        const minimapX = padding;
        const minimapY = this.canvas.height - minimapSize - padding;
        
        // Draw map name above minimap
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(this.currentMap, minimapX, minimapY - 30);
        
        // Draw minimap background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Draw minimap border
        this.ctx.strokeStyle = '#0ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Calculate scale factors
        const scaleX = minimapSize / this.worldSize.width;
        const scaleY = minimapSize / this.worldSize.height;

        // Draw wormholes on minimap
        this.ctx.fillStyle = '#ff00ff'; // Bright purple for visibility
        this.wormholes.forEach(wormhole => {
            const wormholeX = minimapX + (wormhole.x * scaleX);
            const wormholeY = minimapY + (wormhole.y * scaleY);
            
            // Draw wormhole point
            this.ctx.beginPath();
            this.ctx.arc(wormholeX, wormholeY, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add a pulsing glow effect
            this.ctx.beginPath();
            this.ctx.arc(wormholeX, wormholeY, 8, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
            this.ctx.stroke();

            // Draw minimap label
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(wormhole.destinationMap.split(' ')[0], wormholeX, wormholeY - 10);
        });
        
        // Draw grid on minimap
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let x = 0; x < this.worldSize.width; x += 1000) {
            const scaledX = minimapX + x * scaleX;
            this.ctx.beginPath();
            this.ctx.moveTo(scaledX, minimapY);
            this.ctx.lineTo(scaledX, minimapY + minimapSize);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = 0; y < this.worldSize.height; y += 1000) {
            const scaledY = minimapY + y * scaleY;
            this.ctx.beginPath();
            this.ctx.moveTo(minimapX, scaledY);
            this.ctx.lineTo(minimapX + minimapSize, scaledY);
            this.ctx.stroke();
        }
        
        // Draw visible area rectangle
        const viewX = minimapX + (this.camera.x * scaleX);
        const viewY = minimapY + (this.camera.y * scaleY);
        const viewWidth = this.canvas.width * scaleX;
        const viewHeight = this.canvas.height * scaleY;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.strokeRect(viewX, viewY, viewWidth, viewHeight);
        
        // Draw player position on minimap
        const playerX = minimapX + (this.player.x * scaleX);
        const playerY = minimapY + (this.player.y * scaleY);
        
        this.ctx.fillStyle = '#0f0';
        this.ctx.beginPath();
        this.ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw asteroids on minimap
        this.ctx.fillStyle = '#fff';
        this.asteroids.forEach(asteroid => {
            const asteroidX = minimapX + (asteroid.x * scaleX);
            const asteroidY = minimapY + (asteroid.y * scaleY);
            this.ctx.beginPath();
            this.ctx.arc(asteroidX, asteroidY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw satellites on minimap
        this.ctx.fillStyle = '#0ff';
        this.satellites.forEach(satellite => {
            const satelliteX = minimapX + (satellite.x * scaleX);
            const satelliteY = minimapY + (satellite.y * scaleY);
            this.ctx.beginPath();
            this.ctx.arc(satelliteX, satelliteY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw health packs on minimap
        this.ctx.fillStyle = '#0f0';
        this.healthPacks.forEach(healthPack => {
            const healthPackX = minimapX + (healthPack.x * scaleX);
            const healthPackY = minimapY + (healthPack.y * scaleY);
            this.ctx.beginPath();
            this.ctx.arc(healthPackX, healthPackY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw coordinates near minimap
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`X: ${Math.round(this.player.x)}, Y: ${Math.round(this.player.y)}`, 
            minimapX, minimapY - 10);

        // Draw special weapons ammo counts
        let yOffset = 120;
        Object.entries(this.specialWeapons).forEach(([weapon, data]) => {
            if (data.ammo > 0) {
                this.ctx.fillStyle = '#fff';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(`${weapon.toUpperCase()}: ${data.ammo}`, this.canvas.width - 20, yOffset);
                
                if (data.cooldown > 0 && this.currentWeapon === weapon) {
                    this.ctx.fillStyle = '#f00';
                    this.ctx.fillText(`COOLDOWN: ${Math.ceil(data.cooldown / 60)}s`, this.canvas.width - 20, yOffset + 20);
                }
                yOffset += 40;
            }
        });

        // Draw weapon packs on minimap
        this.weaponPacks.forEach(pack => {
            const packX = minimapX + (pack.x * scaleX);
            const packY = minimapY + (pack.y * scaleY);
            this.ctx.fillStyle = pack.color;
            this.ctx.beginPath();
            this.ctx.arc(packX, packY, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw messages
        if (this.messages) {
            this.messages = this.messages.filter(msg => {
                msg.life--;
                msg.y -= 0.5; // Float upward
                msg.opacity = Math.max(0, msg.life / 60); // Fade out in the last second
                
                this.ctx.save();
                this.ctx.fillStyle = msg.color + Math.floor(msg.opacity * 255).toString(16).padStart(2, '0');
                this.ctx.font = 'bold 32px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(msg.text, this.canvas.width / 2, msg.y);
                this.ctx.restore();
                
                return msg.life > 0;
            });
        }

        // Draw current rank
        this.ctx.fillStyle = this.ranks[this.currentRank].color;
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'right';
        const rankDisplay = this.currentRank.charAt(0).toUpperCase() + this.currentRank.slice(1);
        this.ctx.fillText(`Rank: ${rankDisplay}`, this.canvas.width - 20, 120);
    }
    
    gameLoop() {
        if (!this.canvas || !this.ctx) {
            console.error('Canvas not initialized, stopping game loop');
            return;
        }
        
        this.update();
        this.draw();
        
        // Use arrow function to preserve 'this' context
        window.requestAnimationFrame(() => this.gameLoop());
    }

    spawnHealthPack() {
        const buffer = 100;
        // Random position within world bounds
        const x = buffer + Math.random() * (this.worldSize.width - buffer * 2);
        const y = buffer + Math.random() * (this.worldSize.height - buffer * 2);
        
        this.healthPacks.push(new HealthPack(x, y));
    }

    spawnWormhole() {
        // Clear existing wormholes first
        this.wormholes = [];
        
        const buffer = 200;
        const connections = this.mapData[this.currentMap].connections;
        
        // Create a wormhole for each connection
        connections.forEach(destinationMap => {
            // Generate position away from other wormholes
            let x, y, validPosition;
            do {
                validPosition = true;
                x = buffer + Math.random() * (this.worldSize.width - buffer * 2);
                y = buffer + Math.random() * (this.worldSize.height - buffer * 2);
                
                // Check distance from other wormholes
                for (const wormhole of this.wormholes) {
                    const dx = x - wormhole.x;
                    const dy = y - wormhole.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 500) { // Minimum distance between wormholes
                        validPosition = false;
                        break;
                    }
                }
            } while (!validPosition);
            
            // Create new wormhole
            const wormhole = new Wormhole(x, y, destinationMap);
            wormhole.radius = 80; // Increased size for better visibility
            this.wormholes.push(wormhole);
            
            console.log('Spawned wormhole at:', x, y, 'to', destinationMap);
        });
    }

    switchMap(newMap) {
        // Store current map properties
        const oldMap = this.currentMap;
        this.currentMap = newMap;

        // Regenerate stars with new color scheme
        this.stars = this.generateStars(3000);

        // Respawn wormhole in new location
        this.wormholes = [];
        this.spawnWormhole();

        // Reset player position to center of new map
        this.player.x = this.worldSize.width / 2;
        this.player.y = this.worldSize.height / 2;
        this.player.velocity = { x: 0, y: 0 };

        // Create teleport effect
        const effect = new WormholeEffect(this.player.x, this.player.y);
        this.explosions.push(effect);
    }

    shoot() {
        if (this.gameOver) return;

        const spawnX = this.player.x + Math.cos(this.player.angle) * this.player.radius;
        const spawnY = this.player.y + Math.sin(this.player.angle) * this.player.radius;

        let shouldSwitchWeapon = false;

        switch (this.currentWeapon) {
            case 'bullet':
                this.bullets.push(new Bullet(spawnX, spawnY, this.player.angle));
                break;
            case 'missile':
                if (this.missileCooldown <= 0) {
                    this.missiles.push(new Missile(spawnX, spawnY, this.player.angle, 12, this.player.velocity));
                    this.missileCooldown = this.missileCooldownTime;
                }
                break;
            case 'laser':
                if (this.laserCooldown <= 0) {
                    this.lasers.push(new Laser(spawnX, spawnY, this.player.angle));
                    this.laserCooldown = this.laserCooldownTime;
                }
                break;
            case 'plasma':
                if (this.specialWeapons.plasma.ammo > 0 && this.specialWeapons.plasma.cooldown <= 0) {
                    const plasma = new PlasmaShot(spawnX, spawnY, this.player.angle);
                    this.bullets.push(plasma);
                    this.specialWeapons.plasma.ammo--;
                    this.specialWeapons.plasma.cooldown = this.specialWeapons.plasma.cooldownTime;
                    if (this.specialWeapons.plasma.ammo === 0) {
                        shouldSwitchWeapon = true;
                    }
                }
                break;
            case 'railgun':
                if (this.specialWeapons.railgun.ammo > 0 && this.specialWeapons.railgun.cooldown <= 0) {
                    const rail = new RailgunShot(spawnX, spawnY, this.player.angle);
                    this.bullets.push(rail);
                    this.specialWeapons.railgun.ammo--;
                    this.specialWeapons.railgun.cooldown = this.specialWeapons.railgun.cooldownTime;
                    if (this.specialWeapons.railgun.ammo === 0) {
                        shouldSwitchWeapon = true;
                    }
                }
                break;
            case 'shotgun':
                if (this.specialWeapons.shotgun.ammo > 0 && this.specialWeapons.shotgun.cooldown <= 0) {
                    for (let i = -2; i <= 2; i++) {
                        const spread = this.player.angle + (i * 0.1);
                        const shot = new ShotgunPellet(spawnX, spawnY, spread);
                        this.bullets.push(shot);
                    }
                    this.specialWeapons.shotgun.ammo--;
                    this.specialWeapons.shotgun.cooldown = this.specialWeapons.shotgun.cooldownTime;
                    if (this.specialWeapons.shotgun.ammo === 0) {
                        shouldSwitchWeapon = true;
                    }
                }
                break;
        }

        // If we just used the last ammo of a special weapon, switch to the next available weapon
        if (shouldSwitchWeapon) {
            this.cycleWeapon();
        }
    }

    cycleWeapon() {
        // Start with basic weapons
        const weapons = ['bullet', 'missile', 'laser'];
        
        // Add special weapons that have ammo
        Object.entries(this.specialWeapons).forEach(([weapon, data]) => {
            if (data.ammo > 0) {
                weapons.push(weapon);
            }
        });

        // Find the next available weapon
        const currentIndex = weapons.indexOf(this.currentWeapon);
        if (currentIndex === -1) {
            // If current weapon is not in the list (because it ran out of ammo),
            // switch to the first available weapon
            this.currentWeapon = weapons[0];
        } else {
            // Otherwise cycle to the next weapon
            this.currentWeapon = weapons[(currentIndex + 1) % weapons.length];
        }
    }

    spawnEnemy() {
        const buffer = 100;
        const spawnSide = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(spawnSide) {
            case 0: // top
                x = Math.random() * this.worldSize.width;
                y = buffer;
                break;
            case 1: // right
                x = this.worldSize.width - buffer;
                y = Math.random() * this.worldSize.height;
                break;
            case 2: // bottom
                x = Math.random() * this.worldSize.width;
                y = this.worldSize.height - buffer;
                break;
            case 3: // left
                x = buffer;
                y = Math.random() * this.worldSize.height;
                break;
        }
        
        // Randomly choose enemy type
        const type = Math.random() < 0.7 ? 'fighter' : 'heavy';
        this.enemies.push(new Enemy(x, y, type));
    }

    spawnWeaponPack() {
        const buffer = 100;
        const x = buffer + Math.random() * (this.worldSize.width - buffer * 2);
        const y = buffer + Math.random() * (this.worldSize.height - buffer * 2);
        
        // Randomly choose weapon type
        const weaponTypes = ['plasma', 'railgun', 'shotgun'];
        const type = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
        
        this.weaponPacks.push(new WeaponPack(x, y, type));
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = 0.2;
        this.maxSpeed = 5;
        this.radius = 20;
        this.thrusterActive = false;
        this.normalMaxSpeed = 5;
        this.thrusterMaxSpeed = 10;
        this.thrusterParticles = [];
        this.rank = 'cadet';
    }
    
    updateRank(newRank, rankData) {
        this.rank = newRank;
        this.radius = rankData.shipSize;
        // Adjust speed based on rank
        this.normalMaxSpeed = 5 + (rankData.shipSize - 20) / 10;
        this.thrusterMaxSpeed = 10 + (rankData.shipSize - 20) / 5;
    }
    
    update(keys) {
        // Rotation (slowed down from 0.1 to 0.05)
        if (keys['ArrowLeft']) this.angle -= 0.05;
        if (keys['ArrowRight']) this.angle += 0.05;
        
        // Update max speed based on thruster
        this.maxSpeed = this.thrusterActive ? this.thrusterMaxSpeed : this.normalMaxSpeed;
        
        // Thrust
        if (keys['ArrowUp']) {
            const thrustMultiplier = this.thrusterActive ? 1.5 : 1;
            this.velocity.x += Math.cos(this.angle) * this.acceleration * thrustMultiplier;
            this.velocity.y += Math.sin(this.angle) * this.acceleration * thrustMultiplier;
            
            // Create thruster particles
            if (this.thrusterActive) {
                for (let i = 0; i < 2; i++) {
                    this.thrusterParticles.push({
                        x: this.x - Math.cos(this.angle) * this.radius,
                        y: this.y - Math.sin(this.angle) * this.radius,
                        vx: -Math.cos(this.angle) * (2 + Math.random() * 2) + (Math.random() - 0.5),
                        vy: -Math.sin(this.angle) * (2 + Math.random() * 2) + (Math.random() - 0.5),
                        life: 20
                    });
                }
            }
        }
        
        // Limit speed
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }
        
        // Apply velocity
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Apply friction
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
        
        // Update thruster particles
        this.thrusterParticles = this.thrusterParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }
    
    draw(ctx) {
        // Draw thruster particles
        this.thrusterParticles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            const alpha = particle.life / 20;
            ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
            ctx.fill();
        });
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw ship based on rank
        ctx.beginPath();
        switch(this.rank) {
            case 'cadet':
                // Basic triangular ship
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(-this.radius, -this.radius/2);
                ctx.lineTo(-this.radius/2, 0);
                ctx.lineTo(-this.radius, this.radius/2);
                break;
            case 'ensign':
                // More angular design
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(0, -this.radius/2);
                ctx.lineTo(-this.radius, -this.radius/2);
                ctx.lineTo(-this.radius/2, 0);
                ctx.lineTo(-this.radius, this.radius/2);
                ctx.lineTo(0, this.radius/2);
                break;
            case 'lieutenant':
                // Double-wing design
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(0, -this.radius/2);
                ctx.lineTo(-this.radius/2, -this.radius);
                ctx.lineTo(-this.radius, -this.radius/2);
                ctx.lineTo(-this.radius/2, 0);
                ctx.lineTo(-this.radius, this.radius/2);
                ctx.lineTo(-this.radius/2, this.radius);
                ctx.lineTo(0, this.radius/2);
                break;
            case 'commander':
                // Advanced angular design
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(this.radius/2, -this.radius/3);
                ctx.lineTo(0, -this.radius/2);
                ctx.lineTo(-this.radius/2, -this.radius);
                ctx.lineTo(-this.radius, -this.radius/2);
                ctx.lineTo(-this.radius/2, 0);
                ctx.lineTo(-this.radius, this.radius/2);
                ctx.lineTo(-this.radius/2, this.radius);
                ctx.lineTo(0, this.radius/2);
                ctx.lineTo(this.radius/2, this.radius/3);
                break;
            case 'captain':
                // Sleek advanced design
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(this.radius/2, -this.radius/4);
                ctx.lineTo(0, -this.radius/2);
                ctx.lineTo(-this.radius/2, -this.radius);
                ctx.lineTo(-this.radius, -this.radius/3);
                ctx.lineTo(-this.radius * 0.8, 0);
                ctx.lineTo(-this.radius, this.radius/3);
                ctx.lineTo(-this.radius/2, this.radius);
                ctx.lineTo(0, this.radius/2);
                ctx.lineTo(this.radius/2, this.radius/4);
                break;
            case 'admiral':
                // Elite ship design
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(this.radius/2, -this.radius/3);
                ctx.lineTo(0, -this.radius/2);
                ctx.lineTo(-this.radius/3, -this.radius);
                ctx.lineTo(-this.radius, -this.radius/2);
                ctx.lineTo(-this.radius * 0.8, 0);
                ctx.lineTo(-this.radius, this.radius/2);
                ctx.lineTo(-this.radius/3, this.radius);
                ctx.lineTo(0, this.radius/2);
                ctx.lineTo(this.radius/2, this.radius/3);
                // Add extra detail for admiral rank
                ctx.moveTo(this.radius/3, -this.radius/2);
                ctx.lineTo(this.radius/3, this.radius/2);
                break;
        }
        ctx.closePath();
        
        // Get rank color
        let glowColor;
        switch(this.rank) {
            case 'cadet':
                glowColor = [255, 255, 255]; // white
                break;
            case 'ensign':
                glowColor = [0, 255, 0]; // green
                break;
            case 'lieutenant':
                glowColor = [0, 255, 255]; // cyan
                break;
            case 'commander':
                glowColor = [255, 255, 0]; // yellow
                break;
            case 'captain':
                glowColor = [255, 0, 255]; // magenta
                break;
            case 'admiral':
                glowColor = [255, 0, 0]; // red
                break;
            default:
                glowColor = [255, 255, 255]; // white
        }
        
        ctx.strokeStyle = `rgb(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add rank-specific glow effect
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 1.5);
        glowGradient.addColorStop(0, `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, 0.25)`);
        glowGradient.addColorStop(1, `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, 0)`);
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // Draw thruster glow when active
        if (this.thrusterActive) {
            ctx.beginPath();
            ctx.moveTo(-this.radius, 0);
            ctx.lineTo(-this.radius * 1.5, -this.radius * 0.3);
            ctx.lineTo(-this.radius * 2, 0);
            ctx.lineTo(-this.radius * 1.5, this.radius * 0.3);
            ctx.closePath();
            
            const gradient = ctx.createLinearGradient(
                -this.radius, 0,
                -this.radius * 2, 0
            );
            gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    collidesWith(asteroid) {
        const dx = this.x - asteroid.x;
        const dy = this.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + asteroid.radius;
    }
}

class Asteroid {
    constructor(x, y, radius = 50, size = 'large') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.size = size;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1 + Math.random() * (size === 'large' ? 0.5 : size === 'medium' ? 1 : 2);
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.rotation = Math.random() * Math.PI * 2;
        this.points = this.generatePoints();
        this.health = size === 'large' ? 3 : size === 'medium' ? 2 : 1;
    }

    generatePoints() {
        const points = [];
        const numPoints = 12;
        const angleStep = (Math.PI * 2) / numPoints;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep;
            const radiusVariation = this.size === 'large' ? 0.4 : this.size === 'medium' ? 0.3 : 0.2;
            const distance = this.radius * (1 + (Math.random() - 0.5) * radiusVariation);
            points.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }
        
        return points;
    }

    split() {
        let newAsteroids = [];
        if (this.size === 'large') {
            // Split into 2-3 medium asteroids
            const count = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count;
                const distance = this.radius * 0.5;
                newAsteroids.push(new Asteroid(
                    this.x + Math.cos(angle) * distance,
                    this.y + Math.sin(angle) * distance,
                    35,
                    'medium'
                ));
            }
        } else if (this.size === 'medium') {
            // Split into 2-4 small asteroids
            const count = 2 + Math.floor(Math.random() * 3);
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count;
                const distance = this.radius * 0.5;
                newAsteroids.push(new Asteroid(
                    this.x + Math.cos(angle) * distance,
                    this.y + Math.sin(angle) * distance,
                    20,
                    'small'
                ));
            }
        }
        return newAsteroids;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        
        // Different colors based on size
        const color = this.size === 'large' ? '#666' : 
                     this.size === 'medium' ? '#888' : '#aaa';
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
}

class Bullet {
    constructor(x, y, angle, speed = 10) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.radius = 2;
        this.life = 60; // Bullet lives for 60 frames
    }
    
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life--;
    }
    
    wrap(width, height) {
        // Handle horizontal wrapping
        if (this.x < -this.radius) {
            this.x = width + this.radius;
        } else if (this.x > width + this.radius) {
            this.x = -this.radius;
        }
        
        // Handle vertical wrapping
        if (this.y < -this.radius) {
            this.y = height + this.radius;
        } else if (this.y > height + this.radius) {
            this.y = -this.radius;
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
    
    collidesWith(asteroid) {
        const dx = this.x - asteroid.x;
        const dy = this.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + asteroid.radius;
    }
}

class Missile {
    constructor(x, y, angle, speed = 12, playerVelocity = { x: 0, y: 0 }) {  // Increased speed from 5 to 12
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.velocity = {
            // Add player's velocity to missile's initial velocity
            x: Math.cos(angle) * speed + playerVelocity.x,
            y: Math.sin(angle) * speed + playerVelocity.y
        };
        this.radius = 3;
        this.life = 120;
        this.explosionRadius = 100;
        this.isNuke = false;
    }
    
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life--;
    }
    
    wrap(width, height) {
        // Handle horizontal wrapping
        if (this.x < -this.radius) {
            this.x = width + this.radius;
        } else if (this.x > width + this.radius) {
            this.x = -this.radius;
        }
        
        // Handle vertical wrapping
        if (this.y < -this.radius) {
            this.y = height + this.radius;
        } else if (this.y > height + this.radius) {
            this.y = -this.radius;
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw missile body
        ctx.beginPath();
        ctx.moveTo(this.radius * 2, 0);
        ctx.lineTo(-this.radius, -this.radius);
        ctx.lineTo(-this.radius, this.radius);
        ctx.closePath();
        
        ctx.fillStyle = '#ff0';
        ctx.fill();
        ctx.strokeStyle = '#ff8';
        ctx.stroke();
        
        // Draw engine flame
        ctx.beginPath();
        ctx.moveTo(-this.radius, 0);
        ctx.lineTo(-this.radius * 2, -this.radius/2);
        ctx.lineTo(-this.radius * 2, this.radius/2);
        ctx.closePath();
        
        ctx.fillStyle = '#f80';
        ctx.fill();
        
        ctx.restore();
    }
    
    collidesWith(asteroid) {
        const dx = this.x - asteroid.x;
        const dy = this.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + asteroid.radius;
    }
}

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 100;
        this.life = 30;
        this.particles = [];
        
        // Create explosion particles
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 2 + Math.random() * 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30
            });
        }
    }
    
    update() {
        this.radius += 5;
        this.life--;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
        });
        
        // Remove dead particles
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        // Draw explosion circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 200, 0, ${this.life / 30})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw particles
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 150, 0, ${particle.life / 30})`;
            ctx.fill();
        });
    }
}

class PlayerExplosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 30; // Smaller radius for player collisions
        this.life = 20; // Shorter life for player collisions
        this.particles = [];
        
        // Create explosion particles
        for (let i = 0; i < 10; i++) { // Fewer particles for player collisions
            const angle = (Math.PI * 2 * i) / 10;
            const speed = 1 + Math.random() * 1;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 20
            });
        }
    }
    
    update() {
        this.radius += 3;
        this.life--;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
        });
        
        // Remove dead particles
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        // Draw explosion circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 100, 0, ${this.life / 20})`; // Reddish color for player damage
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw particles
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 50, 0, ${particle.life / 20})`;
            ctx.fill();
        });
    }
}

class Satellite {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20; // Slightly larger
        this.angle = Math.atan2(this.y - window.innerHeight/2, this.x - window.innerWidth/2);
        this.speed = 0.8; // Slower speed (reduced from 2)
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        this.rotation = 0;
        this.rotationSpeed = 0.01; // Slower rotation
    }
    
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
    }
    
    wrap(width, height) {
        // Handle horizontal wrapping
        if (this.x < -this.radius) {
            this.x = width + this.radius;
        } else if (this.x > width + this.radius) {
            this.x = -this.radius;
        }
        
        // Handle vertical wrapping
        if (this.y < -this.radius) {
            this.y = height + this.radius;
        } else if (this.y > height + this.radius) {
            this.y = -this.radius;
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw main satellite body (hexagonal shape)
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * this.radius;
            const y = Math.sin(angle) * this.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw solar panels
        ctx.beginPath();
        ctx.moveTo(-this.radius * 1.2, -this.radius * 0.3);
        ctx.lineTo(-this.radius * 1.2, this.radius * 0.3);
        ctx.lineTo(-this.radius * 0.8, this.radius * 0.3);
        ctx.lineTo(-this.radius * 0.8, -this.radius * 0.3);
        ctx.closePath();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.radius * 0.8, -this.radius * 0.3);
        ctx.lineTo(this.radius * 0.8, this.radius * 0.3);
        ctx.lineTo(this.radius * 1.2, this.radius * 0.3);
        ctx.lineTo(this.radius * 1.2, -this.radius * 0.3);
        ctx.closePath();
        ctx.stroke();
        
        // Draw communication dish
        ctx.beginPath();
        ctx.arc(0, -this.radius * 0.5, this.radius * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw antenna array
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-this.radius * 0.3 + i * this.radius * 0.3, -this.radius * 0.8);
            ctx.lineTo(-this.radius * 0.3 + i * this.radius * 0.3, -this.radius * 1.2);
            ctx.stroke();
        }
        
        // Draw thrusters
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.2, this.radius * 0.8);
        ctx.lineTo(-this.radius * 0.2, this.radius * 1.2);
        ctx.moveTo(this.radius * 0.2, this.radius * 0.8);
        ctx.lineTo(this.radius * 0.2, this.radius * 1.2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    collidesWith(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dot = dx * Math.cos(this.angle) + dy * Math.sin(this.angle);
        
        // If the point is beyond the laser's length, check the endpoints
        if (dot > this.length) {
            const endX = this.x + Math.cos(this.angle) * this.length;
            const endY = this.y + Math.sin(this.angle) * this.length;
            const distance = Math.sqrt(
                Math.pow(other.x - endX, 2) + 
                Math.pow(other.y - endY, 2)
            );
            return distance < this.radius + other.radius;
        } else if (dot < -this.length) {
            const startX = this.x - Math.cos(this.angle) * this.length;
            const startY = this.y - Math.sin(this.angle) * this.length;
            const distance = Math.sqrt(
                Math.pow(other.x - startX, 2) + 
                Math.pow(other.y - startY, 2)
            );
            return distance < this.radius + other.radius;
        }
        
        // Calculate the perpendicular distance from the point to the laser line
        const perpX = dx - dot * Math.cos(this.angle);
        const perpY = dy - dot * Math.sin(this.angle);
        const distance = Math.sqrt(perpX * perpX + perpY * perpY);
        
        return distance < this.radius + other.radius;
    }
}

class SmallExplosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 30; // Smaller radius than regular explosion
        this.life = 20; // Shorter life than regular explosion
        this.particles = [];
        
        // Create fewer particles for the small explosion
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 1 + Math.random() * 1;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 20
            });
        }
    }
    
    update() {
        this.radius += 3;
        this.life--;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
        });
        
        // Remove dead particles
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        // Draw explosion circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 200, 0, ${this.life / 20})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw particles
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 150, 0, ${particle.life / 20})`;
            ctx.fill();
        });
    }
}

class HealthPack {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 25; // Increased from 15 to 25
        this.rotation = 0;
        this.pulsePhase = 0;
        this.glowIntensity = 0;
    }
    
    update() {
        this.rotation += 0.02;
        this.pulsePhase += 0.1;
        this.glowIntensity = Math.sin(this.pulsePhase) * 0.3 + 0.7;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw outer glow (increased size)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2); // Increased from 1.5 to 2
        gradient.addColorStop(0, `rgba(0, 255, 0, ${0.4 * this.glowIntensity})`); // Increased opacity from 0.3 to 0.4
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw cross (thicker lines)
        ctx.strokeStyle = `rgba(0, 255, 0, ${this.glowIntensity})`;
        ctx.lineWidth = 5; // Increased from 3 to 5
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(0, this.radius);
        ctx.stroke();
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(-this.radius, 0);
        ctx.lineTo(this.radius, 0);
        ctx.stroke();
        
        ctx.restore();
    }
}

class HealEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 50;
        this.life = 30;
        this.particles = [];
        
        // Create healing particles
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = 1 + Math.random();
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30
            });
        }
    }
    
    update() {
        this.radius += 2;
        this.life--;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
        });
        
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        // Draw healing circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 0, ${this.life / 30})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw particles
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 0, ${particle.life / 30})`;
            ctx.fill();
        });
    }
}

// Add new NukeExplosion class
class NukeExplosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 1000; // Match the explosion radius
        this.life = 60;
        this.particles = [];
        
        // Create many particles for dramatic effect
        for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 * i) / 100;
            const speed = 5 + Math.random() * 5;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 60
            });
        }
    }
    
    update() {
        this.radius += (this.maxRadius / 30); // Expand to full size over half the life
        this.life--;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
        });
        
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        // Draw shockwave
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 50, 0, ${this.life / 60})`;
        ctx.lineWidth = 8;
        ctx.stroke();
        
        // Draw inner explosion
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 0, ${this.life / 120})`;
        ctx.fill();
        
        // Draw particles
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 100, 0, ${particle.life / 60})`;
            ctx.fill();
        });
    }
}

// Add new Laser class
class Laser {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 15; // Faster than bullets
        this.velocity = {
            x: Math.cos(angle) * this.speed,
            y: Math.sin(angle) * this.speed
        };
        this.radius = 3;
        this.life = 120; // Longer life than bullets
        this.hits = 0;
        this.maxHits = 3;
        this.length = 100; // Length of the light saber beam
        this.pulsePhase = 0; // For smooth pulsing animation
        this.pulseSpeed = 0.1; // Speed of the pulse
    }
    
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life--;
        this.pulsePhase += this.pulseSpeed;
    }
    
    wrap(width, height) {
        // Handle horizontal wrapping
        if (this.x < -this.radius) {
            this.x = width + this.radius;
        } else if (this.x > width + this.radius) {
            this.x = -this.radius;
        }
        
        // Handle vertical wrapping
        if (this.y < -this.radius) {
            this.y = height + this.radius;
        } else if (this.y > height + this.radius) {
            this.y = -this.radius;
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Calculate pulse intensity
        const pulseIntensity = (Math.sin(this.pulsePhase) + 1) / 2; // Value between 0 and 1
        
        // Draw outer glow with pulse
        ctx.beginPath();
        ctx.moveTo(this.length, 0);
        ctx.lineTo(-this.length, 0);
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.2 + pulseIntensity * 0.1})`;
        ctx.lineWidth = 12;
        ctx.stroke();
        
        // Draw middle glow with pulse
        ctx.beginPath();
        ctx.moveTo(this.length, 0);
        ctx.lineTo(-this.length, 0);
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.4 + pulseIntensity * 0.2})`;
        ctx.lineWidth = 6;
        ctx.stroke();
        
        // Draw inner glow with pulse
        ctx.beginPath();
        ctx.moveTo(this.length, 0);
        ctx.lineTo(-this.length, 0);
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.6 + pulseIntensity * 0.3})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw core beam with pulse
        ctx.beginPath();
        ctx.moveTo(this.length, 0);
        ctx.lineTo(-this.length, 0);
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.8 + pulseIntensity * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw light saber handle glow with pulse
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + pulseIntensity * 0.3})`;
        ctx.fill();
        
        ctx.restore();
    }
    
    collidesWith(other) {
        // Calculate the closest point on the laser line to the other object
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dot = dx * Math.cos(this.angle) + dy * Math.sin(this.angle);
        
        // If the point is beyond the laser's length, check the endpoints
        if (dot > this.length) {
            const endX = this.x + Math.cos(this.angle) * this.length;
            const endY = this.y + Math.sin(this.angle) * this.length;
            const distance = Math.sqrt(
                Math.pow(other.x - endX, 2) + 
                Math.pow(other.y - endY, 2)
            );
            return distance < this.radius + other.radius;
        } else if (dot < -this.length) {
            const startX = this.x - Math.cos(this.angle) * this.length;
            const startY = this.y - Math.sin(this.angle) * this.length;
            const distance = Math.sqrt(
                Math.pow(other.x - startX, 2) + 
                Math.pow(other.y - startY, 2)
            );
            return distance < this.radius + other.radius;
        }
        
        // Calculate the perpendicular distance from the point to the laser line
        const perpX = dx - dot * Math.cos(this.angle);
        const perpY = dy - dot * Math.sin(this.angle);
        const distance = Math.sqrt(perpX * perpX + perpY * perpY);
        
        return distance < this.radius + other.radius;
    }
}

// Add WormholeEffect class for teleportation visual effect
class WormholeEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 100;
        this.life = 30;
        this.particles = [];
        
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const speed = 3 + Math.random() * 3;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30,
                hue: Math.random() * 60 + 240 // Blue to purple range
            });
        }
    }
    
    update() {
        this.radius += 5;
        this.life--;
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
        });
        
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 0, 255, ${this.life / 30})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${particle.life / 30})`;
            ctx.fill();
        });
    }
}

class Wormhole {
    constructor(x, y, destinationMap) {
        this.x = x;
        this.y = y;
        this.radius = 50;
        this.destinationMap = destinationMap;
        this.rotation = 0;
        this.rotationSpeed = 0.02;
        this.particles = [];
        this.ringRadius = 60;
        this.pulsePhase = 0;
    }

    update() {
        this.rotation += this.rotationSpeed;
        this.pulsePhase += 0.05;
        
        // Create new particles
        if (Math.random() < 0.3) {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.radius * (0.8 + Math.random() * 0.4);
            this.particles.push({
                x: this.x + Math.cos(angle) * distance,
                y: this.y + Math.sin(angle) * distance,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 30,
                hue: Math.random() * 60 + 240 // Blue to purple range
            });
        }

        // Update particles
        this.particles = this.particles.filter(particle => {
            // Move particles towards the center
            const dx = this.x - particle.x;
            const dy = this.y - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            particle.vx += (dx / dist) * 0.2;
            particle.vy += (dy / dist) * 0.2;
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            return particle.life > 0;
        });
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw outer ring with pulsing effect
        const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.1;
        
        // Draw multiple rotating rings
        for (let i = 0; i < 3; i++) {
            ctx.rotate(this.rotation + (i * Math.PI / 3));
            ctx.beginPath();
            ctx.ellipse(0, 0, this.ringRadius * pulseScale, this.ringRadius * 0.4 * pulseScale, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.3 - i * 0.1})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Draw inner portal effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(50, 100, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.restore();
        
        // Draw particles
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${particle.life / 30})`;
            ctx.fill();
        });
    }

    collidesWith(obj) {
        const dx = this.x - obj.x;
        const dy = this.y - obj.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + obj.radius;
    }
}

class Enemy {
    constructor(x, y, type = 'fighter') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 25;
        this.angle = 0;
        this.velocity = { x: 0, y: 0 };
        this.maxSpeed = 3;
        this.health = type === 'fighter' ? 3 : 5;
        this.shootCooldown = 0;
        this.shootCooldownTime = type === 'fighter' ? 60 : 90;
        this.color = type === 'fighter' ? '#f44' : '#f84';
        
        // Add new properties for aggro behavior
        this.aggroRange = type === 'fighter' ? 800 : 1000; // Detection range
        this.isAggro = false; // Whether enemy is actively pursuing player
        this.patrolAngle = Math.random() * Math.PI * 2; // Random patrol direction
        this.patrolSpeed = type === 'fighter' ? 1 : 0.5; // Slower patrol speed
    }
    
    update(player) {
        // Calculate distance to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        
        // Check if player is within aggro range
        this.isAggro = distanceToPlayer < this.aggroRange;
        
        if (this.isAggro) {
            // Aggressive behavior when player is in range
            const targetAngle = Math.atan2(dy, dx);
            
            // Smoothly rotate towards player
            const angleDiff = targetAngle - this.angle;
            this.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.05);
            
            // Move towards player if too far, away if too close
            const idealDistance = this.type === 'fighter' ? 300 : 400;
            const speedMultiplier = distanceToPlayer > idealDistance ? 1 : -1;
            
            // Update velocity for combat
            this.velocity.x += Math.cos(this.angle) * 0.1 * speedMultiplier;
            this.velocity.y += Math.sin(this.angle) * 0.1 * speedMultiplier;
            
            // Higher speed when aggressive
            this.maxSpeed = this.type === 'fighter' ? 3 : 2;
        } else {
            // Passive patrol behavior
            this.patrolAngle += (Math.random() - 0.5) * 0.02; // Slight random direction changes
            this.velocity.x = Math.cos(this.patrolAngle) * this.patrolSpeed;
            this.velocity.y = Math.sin(this.patrolAngle) * this.patrolSpeed;
            this.angle = this.patrolAngle;
            
            // Lower speed when patrolling
            this.maxSpeed = this.patrolSpeed;
        }
        
        // Limit speed
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }
        
        // Apply velocity
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Update shoot cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }
    
    shoot() {
        // Only shoot when aggro and within cooldown
        if (this.isAggro && this.shootCooldown <= 0) {
            const bulletSpeed = 8;
            const bullet = new Bullet(
                this.x + Math.cos(this.angle) * this.radius,
                this.y + Math.sin(this.angle) * this.radius,
                this.angle,
                bulletSpeed
            );
            bullet.isEnemyBullet = true;
            this.shootCooldown = this.shootCooldownTime;
            return bullet;
        }
        return null;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw enemy ship
        ctx.beginPath();
        if (this.type === 'fighter') {
            // Fighter shape (smaller, more angular)
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(-this.radius, -this.radius/2);
            ctx.lineTo(-this.radius/2, 0);
            ctx.lineTo(-this.radius, this.radius/2);
        } else {
            // Heavy shape (larger, more bulky)
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(0, -this.radius/2);
            ctx.lineTo(-this.radius, -this.radius/2);
            ctx.lineTo(-this.radius, this.radius/2);
            ctx.lineTo(0, this.radius/2);
        }
        ctx.closePath();
        
        // Change color based on aggro state
        ctx.strokeStyle = this.isAggro ? this.color : 'rgba(150, 150, 150, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw engine glow
        const glowColor = this.isAggro ? 
            (this.type === 'fighter' ? 'rgba(255, 68, 68, 0.5)' : 'rgba(255, 136, 68, 0.5)') :
            'rgba(150, 150, 150, 0.3)';
        const gradient = ctx.createLinearGradient(-this.radius, 0, -this.radius * 1.5, 0);
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.radius, -this.radius/4, -this.radius/2, this.radius/2);
        
        // Draw aggro range indicator when in debug mode or when first detecting player
        if (this.isAggro && this.shootCooldown > this.shootCooldownTime - 30) {
            ctx.restore();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.aggroRange, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.1)';
            ctx.stroke();
        } else {
            ctx.restore();
        }
    }
    
    collidesWith(obj) {
        const dx = this.x - obj.x;
        const dy = this.y - obj.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + obj.radius;
    }
}

class WeaponPack {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 20;
        this.rotation = 0;
        this.pulsePhase = 0;
        this.glowIntensity = 0;
        
        // Set color based on weapon type
        switch(type) {
            case 'plasma':
                this.color = '#0ff';
                this.ammo = 15;
                break;
            case 'railgun':
                this.color = '#f0f';
                this.ammo = 5;
                break;
            case 'shotgun':
                this.color = '#ff0';
                this.ammo = 10;
                break;
        }
    }
    
    update() {
        this.rotation += 0.02;
        this.pulsePhase += 0.1;
        this.glowIntensity = Math.sin(this.pulsePhase) * 0.3 + 0.7;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 1.5);
        gradient.addColorStop(0, `rgba(${this.type === 'plasma' ? '0, 255, 255' : 
            this.type === 'railgun' ? '255, 0, 255' : 
            '255, 255, 0'}, ${this.glowIntensity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw weapon icon
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        
        switch(this.type) {
            case 'plasma':
                // Draw plasma gun icon
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.radius * 0.6, 0);
                ctx.lineTo(this.radius, 0);
                ctx.stroke();
                break;
            case 'railgun':
                // Draw railgun icon
                ctx.beginPath();
                ctx.moveTo(-this.radius, 0);
                ctx.lineTo(this.radius, 0);
                ctx.moveTo(this.radius * 0.5, -this.radius * 0.3);
                ctx.lineTo(this.radius * 0.5, this.radius * 0.3);
                ctx.stroke();
                break;
            case 'shotgun':
                // Draw shotgun icon
                ctx.beginPath();
                ctx.moveTo(-this.radius * 0.5, 0);
                ctx.lineTo(this.radius, 0);
                ctx.moveTo(this.radius * 0.5, -this.radius * 0.3);
                ctx.lineTo(this.radius * 0.5, this.radius * 0.3);
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }
}

class PlasmaShot extends Bullet {
    constructor(x, y, angle) {
        super(x, y, angle, 12);
        this.radius = 6;
        this.damage = 3;
        this.life = 45;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw plasma glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw plasma core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class RailgunShot extends Bullet {
    constructor(x, y, angle) {
        super(x, y, angle, 20);
        this.radius = 3;
        this.damage = 5;
        this.life = 30;
        this.length = 40;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw trail
        const gradient = ctx.createLinearGradient(-this.length, 0, 0, 0);
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0.8)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-this.length, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();
        
        // Draw projectile
        ctx.fillStyle = '#f0f';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class ShotgunPellet extends Bullet {
    constructor(x, y, angle) {
        super(x, y, angle, 15);
        this.radius = 2;
        this.damage = 1;
        this.life = 20;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0';
        ctx.fill();
    }
}

// Add new WeaponPickupEffect class after ShotgunPellet class
class WeaponPickupEffect {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 0;
        this.maxRadius = 60;
        this.life = 30;
        this.particles = [];
        
        // Create particles
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = 2 + Math.random() * 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30
            });
        }
    }
    
    update() {
        this.radius += 3;
        this.life--;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
        });
        
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        // Draw expanding ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${this.color}${Math.floor((this.life / 30) * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw particles
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `${this.color}${Math.floor((particle.life / 30) * 255).toString(16).padStart(2, '0')}`;
            ctx.fill();
        });
    }
}

class RankUpEffect {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 0;
        this.maxRadius = 100;
        this.life = 60;
        this.particles = [];
        
        // Create particles for the effect
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 3 + Math.random() * 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 2,
                life: 60
            });
        }
    }
    
    update() {
        this.radius += (this.maxRadius - this.radius) * 0.1;
        this.life--;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
        });
        
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        // Draw expanding ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color + Math.floor((this.life / 60) * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw particles
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + Math.floor((particle.life / 60) * 255).toString(16).padStart(2, '0');
            ctx.fill();
        });
        
        // Draw stars
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5;
            const x = this.x + Math.cos(angle) * this.radius * 0.7;
            const y = this.y + Math.sin(angle) * this.radius * 0.7;
            this.drawStar(ctx, x, y, 5, 10, 5, this.color, this.life / 60);
        }
    }
    
    drawStar(ctx, x, y, spikes, outerRadius, innerRadius, color, alpha) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(x, y - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
            rot += step;
        }
        
        ctx.lineTo(x, y - outerRadius);
        ctx.closePath();
        ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
    }
}

// Start the game
const game = new Game();
// Start the game loop immediately
requestAnimationFrame(() => game.gameLoop()); 