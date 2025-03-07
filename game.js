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
        // Create initial asteroids
        for (let i = 0; i < 5; i++) {
            this.asteroids.push(new Asteroid(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                30
            ));
        }
    }
    
    update() {
        if (!this.isGameStarted) return;
        if (this.gameOver) return;
        
        // Update weapon cooldowns
        if (this.laserCooldown > 0) {
            this.laserCooldown--;
        }
        if (this.missileCooldown > 0) {
            this.missileCooldown--;
        }
        
        // Update player
        this.player.update(this.keys);
        this.player.wrap(this.canvas.width, this.canvas.height);
        
        // Update asteroids
        this.asteroids.forEach(asteroid => {
            asteroid.update();
            asteroid.wrap(this.canvas.width, this.canvas.height);
        });

        // Update satellites
        this.satellites.forEach(satellite => {
            satellite.update();
            satellite.wrap(this.canvas.width, this.canvas.height);
        });
        
        // Update bullets
        this.bullets.forEach((bullet, index) => {
            bullet.update();
            bullet.wrap(this.canvas.width, this.canvas.height);
            
            // Remove bullets that are too old
            if (bullet.life <= 0) {
                this.bullets.splice(index, 1);
            }
        });

        // Update missiles
        this.missiles.forEach((missile, index) => {
            missile.update();
            missile.wrap(this.canvas.width, this.canvas.height);
            
            // Remove missiles that are too old
            if (missile.life <= 0) {
                this.missiles.splice(index, 1);
            }
        });

        // Update lasers
        this.lasers.forEach((laser, index) => {
            laser.update();
            laser.wrap(this.canvas.width, this.canvas.height);
            
            if (laser.life <= 0) {
                this.lasers.splice(index, 1);
            }
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Spawn new asteroids if needed
        if (this.asteroids.length < 5) {
            this.asteroids.push(new Asteroid(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                30
            ));
        }

        // Spawn satellites periodically
        const currentTime = Date.now();
        if (currentTime - this.lastSatelliteSpawn > this.satelliteSpawnInterval) {
            this.spawnSatellite();
            this.lastSatelliteSpawn = currentTime;
        }
    }
    
    spawnSatellite() {
        // Randomly choose which edge to spawn from (0: top, 1: right, 2: bottom, 3: left)
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(edge) {
            case 0: // top
                x = Math.random() * this.canvas.width;
                y = -20;
                break;
            case 1: // right
                x = this.canvas.width + 20;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 20;
                break;
            case 3: // left
                x = -20;
                y = Math.random() * this.canvas.height;
                break;
        }
        
        this.satellites.push(new Satellite(x, y));
    }
    
    checkCollisions() {
        // Bullet-Asteroid collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (this.bullets[i].collidesWith(this.asteroids[j])) {
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
                    
                    // Create explosion effect
                    this.createExplosion(missileX, missileY);
                    
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
    }

    createExplosion(x, y) {
        // Create visual explosion effect
        const explosion = new Explosion(x, y);
        this.explosions.push(explosion);
    }
    
    activateNuke() {
        if (!this.hasNuke || this.gameOver) return;

        // Add points for all asteroids and satellites that will be destroyed
        this.score += this.asteroids.length * 100; // 100 points per asteroid
        this.score += this.satellites.length * 500; // 500 points per satellite
        this.scoreElement.textContent = `Score: ${this.score}`;

        // Create massive explosion at player position
        const nukeExplosion = new NukeExplosion(this.player.x, this.player.y);
        this.explosions.push(nukeExplosion);

        // Destroy all asteroids and satellites
        this.asteroids = [];
        this.satellites = [];

        // End the game
        this.gameOver = true;
        this.hasNuke = false;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.isGameStarted) return;
        
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
        
        // Draw health bar
        const barWidth = 200;
        const barHeight = 20;
        const barX = (this.canvas.width - barWidth) / 2; // Center the health bar
        const barY = 20;
        
        // Draw background of health bar
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Draw health segments
        const segmentWidth = barWidth / 10;
        for (let i = 0; i < this.health; i++) {
            this.ctx.fillStyle = '#0f0';
            this.ctx.fillRect(barX + i * segmentWidth, barY, segmentWidth - 2, barHeight - 2);
        }
        
        // Draw weapon indicator
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Weapon: ${this.currentWeapon.toUpperCase()}`, this.canvas.width - 20, 30);

        // Draw weapon cooldowns
        if (this.currentWeapon === 'laser' && this.laserCooldown > 0) {
            this.ctx.fillStyle = '#f00';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`LASER COOLDOWN: ${Math.ceil(this.laserCooldown / 60)}s`, this.canvas.width - 20, 90);
        } else if (this.currentWeapon === 'missile' && this.missileCooldown > 0) {
            this.ctx.fillStyle = '#f00';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`MISSILE COOLDOWN: ${Math.ceil(this.missileCooldown / 60)}s`, this.canvas.width - 20, 90);
        }

        // Draw nuke indicator
        if (this.hasNuke) {
            this.ctx.fillStyle = '#f00';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText('NUKE READY', this.canvas.width - 20, 60);
        }
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press Space to Restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
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
    }
    
    update(keys) {
        // Rotation (slowed down from 0.1 to 0.05)
        if (keys['ArrowLeft']) this.angle -= 0.05;
        if (keys['ArrowRight']) this.angle += 0.05;
        
        // Thrust
        if (keys['ArrowUp']) {
            this.velocity.x += Math.cos(this.angle) * this.acceleration;
            this.velocity.y += Math.sin(this.angle) * this.acceleration;
            
            // Limit speed
            const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > this.maxSpeed) {
                this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
                this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
            }
        }
        
        // Apply velocity
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Apply friction
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
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
        
        // Draw ship
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius, -this.radius/2);
        ctx.lineTo(-this.radius/2, 0);
        ctx.lineTo(-this.radius, this.radius/2);
        ctx.closePath();
        
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        
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
    constructor(x, y, angle, speed = 5) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.radius = 3;
        this.life = 120; // Missiles live longer than bullets
        this.explosionRadius = 100; // Large explosion radius
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
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + other.radius;
    }
}

// Add new NukeExplosion class
class NukeExplosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = Math.max(window.innerWidth, window.innerHeight); // Cover entire screen
        this.life = 60; // Longer duration for nuke effect
        this.particles = [];
        
        // Create many particles for dramatic effect
        for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 * i) / 100;
            const speed = 3 + Math.random() * 3;
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
        this.radius += 20; // Faster expansion
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
        // Draw main explosion circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 50, 0, ${this.life / 60})`;
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Draw inner flash
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 0, ${this.life / 60})`;
        ctx.fill();
        
        // Draw particles
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
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
            // Shoot based on current weapon
            if (game.currentWeapon === 'bullet') {
                game.bullets.push(new Bullet(
                    game.player.x + Math.cos(game.player.angle) * game.player.radius,
                    game.player.y + Math.sin(game.player.angle) * game.player.radius,
                    game.player.angle
                ));
            } else if (game.currentWeapon === 'missile' && game.missileCooldown === 0) {
                game.missiles.push(new Missile(
                    game.player.x + Math.cos(game.player.angle) * game.player.radius,
                    game.player.y + Math.sin(game.player.angle) * game.player.radius,
                    game.player.angle
                ));
                game.missileCooldown = game.missileCooldownTime;
            } else if (game.currentWeapon === 'laser' && game.laserCooldown === 0) {
                game.lasers.push(new Laser(
                    game.player.x + Math.cos(game.player.angle) * game.player.radius,
                    game.player.y + Math.sin(game.player.angle) * game.player.radius,
                    game.player.angle
                ));
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