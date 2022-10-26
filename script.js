// 'load' event waits for all assets such as spritesheets and images to be fully loaded 
// before it executes code in its callback function
window.addEventListener('load', function() {
    const canvas = canvas1; // Access the HTML element by its id attribute
// ctx = context: instance of built-in canvas in 2D API that holds all drawing methods and properties needed to animate the game
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = false;
    
    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', e => {
                if ((   e.key === 'ArrowDown' || 
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight') 
                        && this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                }
                console.log(e.key, this.keys);
            });
            window.addEventListener('keyup', e => {
                if (    e.key === 'ArrowDown' || 
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
                console.log(e.key, this.keys);
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = playerImage;
            this.frameX = 0;
            this.maxFrame = 8;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps; // 1000 miliseconds / 20fps
            this.speed = 0;
            this.verticalVelocity = 0;
            this.gravity = 1;
        }

        draw(context) {
            // Player collider
            context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.beginPath();
            context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            context.stroke();

            // Collision area
            context.strokeStyle = 'blue';
            context.beginPath();
            context.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
            context.stroke();

            // Sprite
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, 
                this.width, this.height, this.x, this.y, this.width, this.height);
        }

        update(input, deltaTime, enemies) {
            // Collision detection
            enemies.forEach(enemy => {
                const distanceX = (enemy.x + enemy.width/2) - (this.x + this.width/2);
                const distanceY = (enemy.y + enemy.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                if (distance < enemy.width/2 + this.width/2) {
                    gameOver = true;
                }
            })
            // Sprite animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // Controls
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.verticalVelocity -= 30/3 * deltaTime;
            } else {
                this.speed = 0;
            }

            // Horizontal movement of player and boundaries
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;

            // Vertical movement
            this.y += this.verticalVelocity;
            if (!this.onGround()) {
                this.verticalVelocity += this.gravity;
                this.maxFrame = 5;  // Jump sprite
                this.frameY = 1;
            } else { 
                this.verticalVelocity = 0;
                this.maxFrame = 8;  // Run sprite
                this.frameY = 0;
            }
            // Vertical boundaries
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }

        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = backgroundImage;
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 2;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + (this.width - this.speed), this.y, this.width, this.height);
        }

        update() {
            this.x -= this.speed;
            if(this.x < 0 - this.width) this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = enemyImage;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxframe = 5;
            this.fps = 20;  
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;   // 1000 miliseconds / 20fps
            this.speed = 2;
            this.markedForDeletion = false;
        }

        draw(context) {
            // Enemy collider
            context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.beginPath();
            context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            context.stroke();

            // Collision area
            context.strokeStyle = 'blue';
            context.beginPath();
            context.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
            context.stroke();

            context.drawImage(this.image, this.frameX * this.width, 0, 
                this.width, this.height, this.x, this.y, this.width, this.height);
        }

        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
        }
    }

    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
        // filter() creates a new array with all the elements that pass the test implemented by the provided function
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function displayStatusText(context) {
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 20, 50);
        context.fillStyle = 'white';
        context.fillText('Score: ' + score, 22, 52);
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER, try again!', canvas.width/2, 200);
            context.fillStyle = 'white';
            context.fillText('GAME OVER, try again!', canvas.width/2 + 2, 202);
        }
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTimeStamp = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTimeStamp;
        lastTimeStamp = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        // background.update();
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemies(deltaTime);
        displayStatusText(ctx);
        if (!gameOver) requestAnimationFrame(animate);
    }
    animate(0);
});