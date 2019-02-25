function theGame(){
    document.getElementById('bton').style.display = 'none';//je retire le bouton start: plus besoin.
    document.getElementById('bton2').style.display = 'none';//je retire le bouton start: plus besoin.
    //definition de mes variables globales
    let canvasWidth = 800;
    let canvasHeight = 400;
    let blockSize = 20;
    let ctx;
    let delay = 200;
    let xCoord = 0;
    let yCoord = 0;
    let snakee;
    let applee; 
    let widthInBlocks = canvasWidth/blockSize;
    let heightInBlocks = canvasHeight/blockSize;
    let score;
    let timeOut;
    let gloup = new Audio('assets/audio/gloup.ogg');
    let run = new Audio('assets/audio/moove.ogg');
    let power = new Audio ('assets/audio.powerup.ogg');
    let end = new Audio('assets/audio/end.ogg');
    let loop = new SeamlessLoop();//je créer une variable loop pour gérer la musique en boucle (bibliothèque js seamless)
    let loop2 = new SeamlessLoop();


    
    init();
    function music()//introduction de mes loop musicaux
    {
            //je déclare les paramètres de l'objet nommé loop
            //entre parenthèse : chemin vers le fichier audio, longueur du fichier en millisecondes, 
            loop.addUri('assets/audio/zen-loop.ogg', 10710, "sound1");
            loop.start("sound1");
    }

    
    function music2()
    {
        if(score==30)
        {
        loop.stop();
        loop2.addUri('assets/audio/Stress-loop.ogg', 2717, "sound1");
        loop2.start("sound1");
        }
    }

    // function powerup()
    // {
    //     if(score==2)
    //     {
    //         power.play();
    //     }
    // }
    
    function init(){
        let canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "20px solid #491117";
        canvas.style.margin = "40px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "rgba(211,211,211,0.6)";
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        snakee = new Snake([[6,4],[5,4],[4,4]],"right");
        applee = new Apple([10,10]);
        score = 0;
        music();
        refreshCanvas();
    }
    
    function refreshCanvas(){
        snakee.advance();
        if (snakee.checkCollision()){
            end.play();
            gameOver();
        } else {
            if (snakee.isEatingApple(applee)){
                gloup.play();
                score++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition(); 
                } while(applee.isOnSnake(snakee));
                if(score >= 10)
                {
                    delay = 150;
                }
                if(score >= 20)
                {
                    delay = 100;
                }
                if(score >= 30)
                {
                    delay =50;
                    music2();
                }
            }
            ctx.clearRect(0,0,canvasWidth,canvasHeight);
            drawScore();
            snakee.draw();
            applee.draw();
            timeOut = setTimeout(refreshCanvas,delay);
        }
    }

    
    function gameOver(){
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        let centreX = canvasWidth / 2;
        let centreY = canvasHeight / 2;
        ctx.strokeText("Game Over", centreX, centreY - 90);
        ctx.fillText("Game Over", centreX, centreY - 90);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 40);
        ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 40);
        delay = 200;
        loop.stop();
        loop2.stop();
        ctx.restore();
    }
    
    function restart(){
        snakee = new Snake([[6,4],[5,4],[4,4]],"right");
        applee = new Apple([10,10]);
        score = 0;
        music();
        clearTimeout(timeOut);
        refreshCanvas();
    }
    
    function drawScore(){
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let centreX = canvasWidth / 2;
        let centreY = canvasHeight / 2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    }
    
    function drawBlock(ctx, position){
        let x = position[0]*blockSize;
        let y = position[1]*blockSize;
        ctx.fillRect(x,y,blockSize,blockSize);
    }
    
    function Snake(body, direction){
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        
        this.draw = function(){
            ctx.save();
            ctx.fillStyle="#93A53F";
            for (let i=0 ; i < this.body.length ; i++){
                drawBlock(ctx,this.body[i]);
            }
            ctx.restore();
        };
        
        this.advance = function(){
            run.play();
            let nextPosition = this.body[0].slice();
            switch(this.direction){
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("invalid direction");
            }
            this.body.unshift(nextPosition);
            if (!this.ateApple)
                this.body.pop();
            else
                this.ateApple = false;
        };
        
        this.setDirection = function(newDirection){
            let allowedDirections;
            switch(this.direction){
                case "left":
                case "right":
                    allowedDirections=["up","down"];
                    break;
                case "down":
                case "up":
                    allowedDirections=["left","right"];
                    break;  
               default:
                    throw("invalid direction");
            }
            if (allowedDirections.indexOf(newDirection) > -1){
                this.direction = newDirection;
            }
        };
        
        this.checkCollision = function(){
            let wallCollision = false;
            let snakeCollision = false;
            let head = this.body[0];
            let rest = this.body.slice(1);
            let snakeX = head[0];
            let snakeY = head[1];
            let minX = 0;
            let minY = 0;
            let maxX = widthInBlocks - 1;
            let maxY = heightInBlocks - 1;
            let isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            let isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
            
            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
                wallCollision = true;
            
            for (let i=0 ; i<rest.length ; i++){
                if (snakeX === rest[i][0] && snakeY === rest[i][1])
                    snakeCollision = true;
            }
            
            return wallCollision || snakeCollision;        
        };
        
        this.isEatingApple = function(appleToEat){
            let head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
            else
                return false;
        }
        
    }
    
    function Apple(position){
        this.position = position;
        
        this.draw = function(){
          ctx.save();
          ctx.fillStyle = "red";
          ctx.beginPath();
          let radius = blockSize/2;
          let x = this.position[0]*blockSize + radius;
          let y = this.position[1]*blockSize + radius;
          ctx.arc(x, y, radius, 0, Math.PI*2, true);
          ctx.fill();
          ctx.restore();
        };
        
        this.setNewPosition = function(){
            let newX = Math.round(Math.random()*(widthInBlocks-1));
            let newY = Math.round(Math.random()*(heightInBlocks-1));
            this.position = [newX,newY];
        }; 
        
        this.isOnSnake = function(snakeToCheck){
            let isOnSnake = false;
            for (let i=0 ; i < snakeToCheck.body.length ; i++){
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
                    isOnSnake = true;     
                }
            }
            return isOnSnake;
        };

    }
    
    document.onkeydown = function handleKeyDown(e){
        let key = e.keyCode;
        let newDirection;
        switch(key){
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    };
}
