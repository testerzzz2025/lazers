class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.scoreElement = document.getElementById('score');
        
        // Game state
        this.gameOver = false;
        this.keys = {};
        this.currentWeapon = 'bullet'; // 'bullet', 'missile', or 'laser'
        this.health = 10; // Add health tracking
        this.hasNuke = true; // Track if nuke is available
        this.isGameStarted = false; // Track if game has started
        
        // Weapon cooldowns
        this.laserCooldown = 0;
        this.laserCooldownTime = 300; // 5 seconds at 60fps
        this.missileCooldown = 0;
        this.missileCooldownTime = 120; // 2 seconds at 60fps
        
        // Game objects
        this.asteroids = [];
        this.satellites = [];
        this.bullets = [];
        this.missiles = [];
        this.lasers = []; // New array for lasers
        this.explosions = []; // Initialize explosions array
        this.playerExplosions = []; // Initialize player explosions array
        
        // Satellite spawn timing
        this.lastSatelliteSpawn = 0;
        this.satelliteSpawnInterval = 30000; // Spawn a satellite every 30 seconds
        
        // Set initial canvas size and create player
        this.resizeCanvas();
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Event listeners
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        // Add start button listener
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        
        // Debug logging
        console.log('Game initialized');
        
        // Start game loop
        this.gameLoop();

        // Add camera and world properties
        this.camera = {
            x: 0,
            y: 0,
            scale: 1
        };
        
        // Increase world size significantly
        this.worldSize = {
            width: 20000,  // 5x larger
            height: 15000  // 5x larger
        };

        // Add border properties
        this.borderWidth = 50;
        this.borderGlow = 20;
        
        // Generate more stars for the larger world
        this.stars = this.generateStars(2000);

        // Add mouse state
        this.mousePressed = false;
        
        // Add mouse event listeners
        this.canvas.addEventListener('mousedown', () => this.mousePressed = true);
        this.canvas.addEventListener('mouseup', () => this.mousePressed = false);
        this.canvas.addEventListener('mouseleave', () => this.mousePressed = false);

        // Add health packs array and spawn timer
        this.healthPacks = [];
        this.lastHealthPackSpawn = 0;
        this.healthPackSpawnInterval = 15000; // Spawn every 15 seconds
    }
    
    startGame() {
        // Hide menu
        document.getElementById('menu').style.display = 'none';
        this.isGameStarted = true;
        
        // Initialize game
        this.init();
    }
    
    resizeCanvas() {
        // Set canvas size to match window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Debug logging
        console.log('Canvas size:', this.canvas.width, this.canvas.height);
        
        // If game is in progress and player exists, adjust player position to stay within bounds
        if (!this.gameOver && this.player) {
            this.player.x = Math.min(this.player.x, this.canvas.width - this.player.radius);
            this.player.y = Math.min(this.player.y, this.canvas.height - this.player.radius);
        }
    }
    
    init() {
        // Create more initial asteroids spread across the world
        for (let i = 0; i < 50; i++) {  // Increased from 15 to 50
            const buffer = 100;
            // Random position within world bounds
            const x = buffer + Math.random() * (this.worldSize.width - buffer * 2);
            const y = buffer + Math.random() * (this.worldSize.height - buffer * 2);
            // Random size between 25 and 40
            const radius = 25 + Math.random() * 15;
            
            this.asteroids.push(new Asteroid(x, y, radius));
        }

        // Spawn initial health packs
        this.spawnHealthPack();
        this.spawnHealthPack();
    }
    
    generateStars(count) {
        const stars = [];
        // Create more stars than needed to ensure good coverage
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.worldSize.width,
                y: Math.random() * this.worldSize.height,
                size: Math.random() * 2 + 1,
                brightness: Math.random() * 0.5 + 0.5,
                parallaxFactor: Math.random() * 0.3 + 0.2 // Random parallax effect for each star
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
        
        // Update player
        this.player.update(this.keys);
        this.player.thrusterActive = this.mousePressed;  // Update thruster state
        
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
        // Replace wrapping with boundary collision
        if (obj.x < this.borderWidth) {
            obj.x = this.borderWidth;
            if (obj.velocity) obj.velocity.x *= -0.5; // Bounce with reduced velocity
        } else if (obj.x > this.worldSize.width - this.borderWidth) {
            obj.x = this.worldSize.width - this.borderWidth;
            if (obj.velocity) obj.velocity.x *= -0.5;
        }
        
        if (obj.y < this.borderWidth) {
            obj.y = this.borderWidth;
            if (obj.velocity) obj.velocity.y *= -0.5;
        } else if (obj.y > this.worldSize.height - this.borderWidth) {
            obj.y = this.worldSize.height - this.borderWidth;
            if (obj.velocity) obj.velocity.y *= -0.5;
        }
    }

    spawnAsteroids() {
        while (this.asteroids.length < 50) {  // Increased from 15 to 50
            // Spawn asteroids just outside the visible area but inside world bounds
            const spawnSide = Math.floor(Math.random() * 4);
            let x, y;
            const buffer = 100; // Distance from border to spawn
            
            switch(spawnSide) {
                case 0: // top
                    x = Math.max(buffer, Math.min(this.camera.x + Math.random() * this.canvas.width * 3, this.worldSize.width - buffer));
                    y = Math.max(buffer, this.camera.y - 200);
                    break;
                case 1: // right
                    x = Math.min(this.worldSize.width - buffer, this.camera.x + this.canvas.width * 3);
                    y = Math.max(buffer, Math.min(this.camera.y + Math.random() * this.canvas.height * 3, this.worldSize.height - buffer));
                    break;
                case 2: // bottom
                    x = Math.max(buffer, Math.min(this.camera.x + Math.random() * this.canvas.width * 3, this.worldSize.width - buffer));
                    y = Math.min(this.worldSize.height - buffer, this.camera.y + this.canvas.height * 3);
                    break;
                case 3: // left
                    x = Math.max(buffer, this.camera.x - 200);
                    y = Math.max(buffer, Math.min(this.camera.y + Math.random() * this.canvas.height * 3, this.worldSize.height - buffer));
                    break;
            }
            
            // Add some variation to asteroid sizes
            const radius = 25 + Math.random() * 15; // Random size between 25 and 40
            
            // Add variation to asteroid velocities
            const speed = 1 + Math.random() * 2; // Random speed between 1 and 3
            const angle = Math.random() * Math.PI * 2; // Random direction
            const asteroid = new Asteroid(x, y, radius);
            asteroid.velocity.x = Math.cos(angle) * speed;
            asteroid.velocity.y = Math.sin(angle) * speed;
            
            this.asteroids.push(asteroid);
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
                if (this.bullets[i].collidesWith(this.asteroids[j])) {
                    // Create small explosion at collision point
                    const explosionX = this.bullets[i].x;
                    const explosionY = this.bullets[i].y;
                    this.explosions.push(new SmallExplosion(explosionX, explosionY));
                    
                    this.bullets.splice(i, 1);
                    this.asteroids.splice(j, 1);
                    this.score += 100;
                    this.scoreElement.textContent = `Score: ${this.score}`;
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

        // Missile-Asteroid collisions
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (this.missiles[i].collidesWith(this.asteroids[j])) {
                    // Store missile position before removing it
                    const missileX = this.missiles[i].x;
                    const missileY = this.missiles[i].y;
                    const explosionRadius = this.missiles[i].explosionRadius;
                    const isNuke = this.missiles[i].isNuke;
                    
                    // Create explosion effect
                    if (isNuke) {
                        const nukeExplosion = new NukeExplosion(missileX, missileY);
                        this.explosions.push(nukeExplosion);
                    } else {
                        this.createExplosion(missileX, missileY);
                    }
                    
                    // Remove missile
                    this.missiles.splice(i, 1);
                    
                    // Check for asteroids within explosion radius
                    for (let k = this.asteroids.length - 1; k >= 0; k--) {
                        const dx = missileX - this.asteroids[k].x;
                        const dy = missileY - this.asteroids[k].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < explosionRadius) {
                            this.asteroids.splice(k, 1);
                            this.score += 100;
                            this.scoreElement.textContent = `Score: ${this.score}`;
                        }
                    }

                    // If it's a nuke, also check for satellites within blast radius
                    if (isNuke) {
                        for (let k = this.satellites.length - 1; k >= 0; k--) {
                            const dx = missileX - this.satellites[k].x;
                            const dy = missileY - this.satellites[k].y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            if (distance < explosionRadius) {
                                this.satellites.splice(k, 1);
                                this.score += 500;
                                this.scoreElement.textContent = `Score: ${this.score}`;
                            }
                        }
                    }
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
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.isGameStarted) return;

        this.ctx.save();
        
        // Apply camera transform
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw background stars with improved wrapping
        const visibleArea = {
            left: this.camera.x - this.canvas.width * 0.5,
            right: this.camera.x + this.canvas.width * 1.5,
            top: this.camera.y - this.canvas.height * 0.5,
            bottom: this.camera.y + this.canvas.height * 1.5
        };

        this.stars.forEach(star => {
            // Calculate base position with parallax
            let baseX = star.x - this.camera.x * star.parallaxFactor;
            let baseY = star.y - this.camera.y * star.parallaxFactor;
            
            // Calculate wrapped positions
            const positions = [
                { x: baseX, y: baseY },
                { x: baseX + this.worldSize.width, y: baseY },
                { x: baseX - this.worldSize.width, y: baseY },
                { x: baseX, y: baseY + this.worldSize.height },
                { x: baseX, y: baseY - this.worldSize.height },
                { x: baseX + this.worldSize.width, y: baseY + this.worldSize.height },
                { x: baseX + this.worldSize.width, y: baseY - this.worldSize.height },
                { x: baseX - this.worldSize.width, y: baseY + this.worldSize.height },
                { x: baseX - this.worldSize.width, y: baseY - this.worldSize.height }
            ];

            // Draw star at all relevant positions
            positions.forEach(pos => {
                if (pos.x >= visibleArea.left && pos.x <= visibleArea.right &&
                    pos.y >= visibleArea.top && pos.y <= visibleArea.bottom) {
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, star.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
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
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    spawnHealthPack() {
        const buffer = 100;
        // Random position within world bounds
        const x = buffer + Math.random() * (this.worldSize.width - buffer * 2);
        const y = buffer + Math.random() * (this.worldSize.height - buffer * 2);
        
        this.healthPacks.push(new HealthPack(x, y));
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
        this.thrusterActive = false;  // Track if thruster is active
        this.normalMaxSpeed = 5;      // Normal max speed
        this.thrusterMaxSpeed = 10;   // Max speed with thruster
        this.thrusterParticles = [];  // Particles for thruster effect
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
        
        // Draw ship
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius, -this.radius/2);
        ctx.lineTo(-this.radius/2, 0);
        ctx.lineTo(-this.radius, this.radius/2);
        ctx.closePath();
        
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        
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
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        };
        // Generate random points for the asteroid shape
        this.points = this.generatePoints();
    }
    
    generatePoints() {
        const points = [];
        const numPoints = 12 + Math.floor(Math.random() * 4); // Random number of points between 12-15
        const baseRadius = this.radius;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            // Add random variation to the radius for each point
            const radiusVariation = 0.7 + Math.random() * 0.6; // Random between 0.7 and 1.3
            const radius = baseRadius * radiusVariation;
            
            points.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        
        return points;
    }
    
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
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
        
        // Draw main asteroid shape
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        
        // Draw asteroid outline
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

// Start the game
const game = new Game();

// Handle shooting and weapon switching
window.addEventListener('keydown', (e) => {
    if (!game.isGameStarted) return;
    
    if (e.key === ' ') {
        if (game.gameOver) {
            // Reset game
            game.player = new Player(game.canvas.width / 2, game.canvas.height / 2);
            game.asteroids = [];
            game.satellites = [];
            game.bullets = [];
            game.missiles = [];
            game.lasers = []; // Reset lasers
            game.explosions = [];
            game.playerExplosions = [];
            game.score = 0;
            game.health = 10; // Reset health
            game.hasNuke = true; // Reset nuke availability
            game.laserCooldown = 0; // Reset laser cooldown
            game.missileCooldown = 0; // Reset missile cooldown
            game.scoreElement.textContent = 'Score: 0';
            game.gameOver = false;
            game.init();
        } else {
            // Calculate weapon spawn position in world coordinates
            const spawnX = game.player.x + Math.cos(game.player.angle) * game.player.radius;
            const spawnY = game.player.y + Math.sin(game.player.angle) * game.player.radius;

            // Shoot based on current weapon
            if (game.currentWeapon === 'bullet') {
                game.bullets.push(new Bullet(spawnX, spawnY, game.player.angle));
            } else if (game.currentWeapon === 'missile' && game.missileCooldown === 0) {
                game.missiles.push(new Missile(spawnX, spawnY, game.player.angle, 12, game.player.velocity));
                game.missileCooldown = game.missileCooldownTime;
            } else if (game.currentWeapon === 'laser' && game.laserCooldown === 0) {
                game.lasers.push(new Laser(spawnX, spawnY, game.player.angle));
                game.laserCooldown = game.laserCooldownTime;
            }
        }
    } else if (e.key.toLowerCase() === 'x') {
        // Toggle weapon
        if (game.currentWeapon === 'bullet') {
            game.currentWeapon = 'missile';
        } else if (game.currentWeapon === 'missile') {
            game.currentWeapon = 'laser';
        } else {
            game.currentWeapon = 'bullet';
        }
    } else if (e.key.toLowerCase() === 'n') {
        // Activate nuke
        game.activateNuke();
    }
}); 