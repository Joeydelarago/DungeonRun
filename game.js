(function() {
    var canvas;
    var bossfight;
    var context;
    var width;
    var height;
    var widthunits; // width of the screen in units
    var alive = false; //game loop boolean
    var victory = false;
    var interval;
    var unit = 0; //unit that dungeon tiling is based on, defined based on screenwidth in init
    var player;
    var dungeon;
    var cooldowntime = 0;
    var rouge = {
        attack : 1,      //variable to be affected by picked up items
        health : 5,
        speed : .2, //Can only be a number that goes evenly into 1
        range : 2,
        knockback : .5,
        attackrate : 1,
        mana : 2,
        maxmana : 2,
        maxhealth : 5,

    }
    var archer = {
        attack : 2,      //variable to be affected by picked up items
        health : 4,
        speed : .2,
        range : 10,
        knockback : 0,
        attackrate : 3,
        mana : 2,
        maxmana : 2,
        bulletsize :.2,
        bulletcolor : 'black',
        maxhealth : 5,
        shotspeed : .2
    }
    var mage = {
        attack : 4.5,      //variable to be affected by picked up items
        health : 1,
        speed : .2, //Can only be a number that goes evenly into 1
        range : 5,
        knockback : 0,
        attackrate : 3,
        mana : 6,
        maxmana : 10,
        bulletsize :.5,
        bulletcolor : 'red',
        maxhealth : 2,
    }
    var tank = {
        attack : 4,      //variable to be affected by picked up items
        health : 10,
        speed : .2, //Can only be a number that goes evenly into 1
        range : 2,
        knockback : 1.5,
        attackrate : 4,
        mana : 2,
        maxmana : 2,
        maxhealth : 10,
    }
    
    var tiles = new Image();
    tiles.src = 'images/tiles.png'
    var items = new Image();
    items.src = 'images/items.png'
    var characters = new Image();
    characters.src = 'images/characters.png'
    var charactersflip = new Image();
    charactersflip.src = 'images/charactersflip.png'
    var title = new Image();
    title.src = 'images/title.png'
    var continuei = new Image();
    continuei.src = 'images/continue.png'
    var newgame = new Image();
    newgame.src = 'images/newgame.png'
    var options = new Image();
    options.src = 'images/options.png'
    
    document.addEventListener('DOMContentLoaded', init, false);
    function init(){
        canvas = document.querySelector('canvas');
        context = canvas.getContext('2d');
        width = canvas.width - canvas.height/2;
        height = canvas.height;
        widthunits = 30;
        unit = width /widthunits;
        context.imageSmoothingEnabled= false
        interval = window.setInterval(draw, 16);
        starttime = Date.now()
        window.addEventListener('keydown', activate, false);
        window.addEventListener('keyup', deactivate, false);
        canvas.addEventListener('click', click,false);
        //Variable setting
        charcreate = false;
        bossfight = false;
        mainmenu = true;
        player = {
        x : 50,
        y : 50,
        sprite: [2, 28],
        size : 1,
        score : 0,
        attack : 1,      //variable to be affected by picked up items
        health : 5,
        maxhealth : 7,
        speed : 1,
        mana : 0,
        range : 2,
        knockback : .5,
        attackrate : 1,
        cooldown : false,
        up : false,
        treasures : [],
        right : false,
        down : false,
        left : false,
        dir : 0,
        bullets : [],
        bulletsize: .5,
        bulletcolor : 'red',
        note : 0,
        shotspeed: .1,
        clasname : 'rouge'
        };        
        
    }
    
    function draw(){
        if(mainmenu){
            mainMenu()
        }
        
        else if(charcreate){
            characterCreation()
        }
        else if (alive){
            curtime = Date.now() - starttime
            context.clearRect(0, 0, width, height);
            updatePlayer();
            updateBullets();
            updateEnemies();
            updateTreasures();
            if(bossfight){
                updateBoss()
            }
            drawMap();
            drawBullets();
            drawTreasure();
            drawPlayer();
            drawEnemy();
            if(bossfight){
                drawBoss()
            }
            drawMenu();
        }
        if(!alive && !mainmenu && ! charcreate) {
            gameStateOver()
        }
    }

    function mainMenu(){
        //Drawing the main title screen menu
        context.fillStyle = 'black'
        var grd = context.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(1, "black");
        grd.addColorStop(0, "white");
        context.fillStyle = grd;
        context.fillRect(0,0, width + canvas.height/2, height)
        context.drawImage(title, unit *23 - (title.width)/2, unit *5)
        context.drawImage(continuei, unit *23 - (continuei.width)/2, unit *14)
        context.drawImage(newgame, unit *23 - (newgame.width)/2, unit *19)
        context.drawImage(options, unit *23 - (options.width)/2, unit *24)
        
        
    }
     
    function drawTreasure(){
        //Draws all of the treasures on the canvas relative to the player
        treasures = dungeon.treasures
        for (i = 0; i < treasures.length; i++){
            oncanvasx = (treasures[i].x - player.x)*(unit)
            oncanvasy = (treasures[i].y - player.y)*(unit)
            if (oncanvasx + unit > 0 && oncanvasx < width && oncanvasy + unit >0 && oncanvasy < height){
                context.drawImage(items,treasures[i].sprite[0],treasures[i].sprite[1],8,8, oncanvasx, oncanvasy, unit, unit)
            }
        }
    }
    
    function drawEnemy(){
        //Draws each of the enemies with their sprite relative to the player
        enemies = dungeon.enemies
        for (i = 0; i < enemies.length; i++){
            oncanvasx = (enemies[i].x - player.x + widthunits/2)*(unit)
            oncanvasy = (enemies[i].y - player.y + widthunits/2)*(unit)
            if (oncanvasx + unit*enemies[i].size > 0 && oncanvasx < width && oncanvasy + unit*enemies[i].size> 0 && oncanvasy < height){
                if(enemies[i].dir == 1){
                    context.drawImage(characters,enemies[i].sprite[0],enemies[i].sprite[1],8,8,oncanvasx, oncanvasy, unit*enemies[i].size, unit*enemies[i].size)
                }
                else if(enemies[i].dir == 3){
                    context.drawImage(charactersflip,67 - enemies[i].sprite[0],enemies[i].sprite[1],8,8,oncanvasx, oncanvasy, unit*enemies[i].size, unit*enemies[i].size)
                }
                context.fillStyle = 'green'
                context.fillRect(oncanvasx, oncanvasy - 5, (enemies[i].size / enemies[i].maxhealth * enemies[i].health)*unit, 5)
            }
        }
    }
    
    function drawBoss(){
        //Draws the boss when the player is in the 'bossroom' at the end of the game
        boss = dungeon.boss
        oncanvasx = (boss.x - player.x + widthunits/2)*(unit)
        oncanvasy = (boss.y - player.y + widthunits/2)*(unit)
        if(boss.dir == 1){
            context.drawImage(characters,29,57,8,8,oncanvasx, oncanvasy, unit*boss.size, unit*boss.size)
        }
        else if(boss.dir == 3){
            context.drawImage(charactersflip,38,57,8,8,oncanvasx, oncanvasy, unit*boss.size, unit*boss.size)
        }
        context.fillStyle = 'green'
        context.fillRect(oncanvasx, oncanvasy - 5, (boss.size / boss.maxhealth * boss.health)*unit, 5)
    }
    
    function drawPlayer(){
        //draws player in the centre of the screen
            context.fillStyle = 'blue';
            if (player.dir == 1){
                context.drawImage(characters, player.sprite[0], player.sprite[1],8,8,widthunits/2 *unit, widthunits/2* unit , player.size*unit, player.size*unit);
            }
            else {
                context.drawImage(charactersflip, 67 - player.sprite[0], player.sprite[1],8,8,widthunits/2 *unit, widthunits/2* unit , player.size*unit, player.size*unit);
            }
            //context.drawImage(run, shift, 0, widthunits/2 *unit, widthunits/2* unit , player.size*unit, player.size*unit);
    }
 
    function drawBullets(){
        //Draws all of the players bullets and the boss bullets if the player is in the bossfight
        bullets = player.bullets
        for (i = 0; i < bullets.length; i++){
            oncanvasx = (bullets[i].x - player.x + widthunits/2)*(unit)
            oncanvasy = (bullets[i].y - player.y + widthunits/2)*(unit)
            if (oncanvasx > 0 && oncanvasx < width && oncanvasy >0 && oncanvasy < height){
                context.fillStyle = player.bulletcolor
                context.fillRect(oncanvasx, oncanvasy, player.bulletsize*unit, player.bulletsize*unit)
            }
        }
        if (bossfight){
            bullets = dungeon.boss.bullets
            for (i = 0; i < bullets.length; i++){
                oncanvasx = (bullets[i].x - player.x + widthunits/2)*(unit)
                oncanvasy = (bullets[i].y - player.y + widthunits/2)*(unit)
                if (oncanvasx > 0 && oncanvasx < width && oncanvasy >0 && oncanvasy < height){
                context.fillStyle = 'red'
                context.fillRect(oncanvasx, oncanvasy, boss.bulletsize*unit, boss.bulletsize*unit)
                }
            }
        }
    }
    
    function drawMap(){
         //Draws the map using co ordinates relative to player.x and player.y
         for (i = 0  ; i < widthunits +2; i++){
             for (ii = 0; ii < widthunits+2; ii++){
                 if ((Math.floor(player.x) - (widthunits/2)-1 + i) < dungeon.size && (Math.floor(player.y)- (widthunits/2)-1 +ii)< dungeon.size && (Math.floor(player.x) - (widthunits/2)-1 + i) > 0 && (Math.floor(player.y)- (widthunits/2)-1 +ii) > 0){
                    if (dungeon.map[(Math.floor(player.x) - (widthunits/2)-1) + i][(Math.floor(player.y)- (widthunits/2)-1) + ii] == 0){
                        context.fillStyle = 'black';
                        context.fillRect(unit *i - unit - (player.x - Math.floor(player.x))*unit, unit*ii - unit -(player.y - Math.floor(player.y))*unit, unit+1, unit+1);
                    }
                    else if (dungeon.map[(Math.floor(player.x) - (widthunits/2)-1) + i][(Math.floor(player.y)- (widthunits/2)-1) + ii] == 1){
                        // the x is equal to i *units across the screen, this draws a square i squares across. One unit is taken for the player in the middle and the rest is for the
                        //non whole number movement
                        context.drawImage(tiles,1,46,8,8, unit *i - unit - (player.x - Math.floor(player.x))*unit, unit*ii - unit -(player.y - Math.floor(player.y))*unit, unit, unit);
                    }
                    else if (dungeon.map[(Math.floor(player.x) - (widthunits/2)-1) + i][(Math.floor(player.y)- (widthunits/2)-1) + ii] == 2){
                        context.fillStyle = 'grey';
                        context.drawImage(tiles,37,37,8,8,unit *i - unit - (player.x - Math.floor(player.x))*unit, unit*ii - unit -(player.y - Math.floor(player.y))*unit, unit, unit);
                    }
                 }
                 else {
                        context.fillStyle = 'black';
                        context.fillRect(unit *i -unit - (player.x - Math.floor(player.x))*unit, unit*ii -unit - (player.y - Math.floor(player.y))*unit, unit+1, unit+1);
                    }
                 
             }
        }
    }
    
    function drawMenu(){
        //Draws the menu on the right side of the screen when the player is alive
        treasures = player.treasures
        context.fillStyle = '#4d4d4d'
        context.fillRect(width, 0, width, height);
        context.fillStyle = '#7c7c7c'
        context.fillRect(width + unit/2, unit*.5, unit*14, unit*29);
        
        context.fillStyle = 'black'
        context.font = '40px VT323'
        context.fillText('HP:', width + unit ,2* unit)
        context.fillStyle = '#920707';
        context.fillRect(width + unit + unit*3 , unit, player.health*unit , unit);
        
        context.fillStyle = 'black'
        context.fillText('Mana:', width + unit ,3.8* unit)
        context.fillStyle = '#083d93';
        context.fillRect(width + unit + unit*3 , unit*3, player.mana*unit , unit);
        
        context.fillStyle = 'black'
        context.fillText('Score:' + player.score, width + unit ,5.5* unit)
        //context.fillText(player.score, width + 5*unit ,5.5* unit)

        context.fillStyle = 'black'
        context.fillText('Time:', width + unit ,7* unit)
        context.fillText(Math.round(curtime/1000), width + 5*unit ,7* unit)
        
        for (i = 0; i < treasures.length && i < 13*19; i++){
            context.drawImage(items,treasures[i].sprite[0],treasures[i].sprite[1],8,8, width + 1*unit + i*unit - Math.floor(i/13)*unit*13,10* unit + Math.floor(i/13)*unit, unit, unit)
        }
    }
    
    function updateEnemies(){
        //Draws all of the enemies in dungeon.enemies
        enemies = dungeon.enemies
        for (i = 0; i < enemies.length; i++){
            enemyx = enemies[i].x 
            enemyy = enemies[i].y 
            xdistance = Math.abs(enemyx - player.x)
            ydistance = Math.abs(enemyy - player.y)
            
            if (enemies[i].health <= 0){
                enemies.splice(i, 1)
            }
            else if (xdistance  < enemies[i].aggrorange && ydistance < enemies[i].aggrorange){
                if(player.y  < enemyy && dungeon.map[Math.floor(enemyx) ][Math.ceil(enemyy) -1] == 1 && dungeon.map[Math.ceil(enemyx) ][Math.ceil(enemyy) -1] == 1) {
                    enemies[i].y -= enemies[i].speed
                    enemies[i].y = Math.round(enemies[i].y * 10)/10
                }
                else if(player.y  > enemyy && dungeon.map[Math.ceil(enemyx) ][Math.floor(enemyy) +1] == 1 && dungeon.map[Math.floor(enemyx) ][Math.floor(enemyy) +1] == 1){
                    enemies[i].y += enemies[i].speed
                    enemies[i].y = Math.round(enemies[i].y * 10)/10
                }
                if(player.x  > enemyx && dungeon.map[Math.floor(enemyx)+ 1][Math.floor(enemyy)] == 1 && dungeon.map[Math.floor(enemyx)+ 1][Math.ceil(enemyy)] == 1){
                    enemies[i].x += enemies[i].speed
                    enemies[i].x = Math.round(enemies[i].x * 10)/10
                    enemies[i].dir = 1
                }
                else if(player.x  < enemyx && dungeon.map[Math.ceil(enemyx) -1][Math.ceil(enemyy)] == 1 && dungeon.map[Math.ceil(enemyx) -1][Math.floor(enemyy)] == 1){
                    enemies[i].x -= enemies[i].speed
                    enemies[i].x = Math.round(enemies[i].x * 10)/10
                    enemies[i].dir = 3
                }
            }
            if (xdistance < 1 && ydistance < 1){
                player.health -= .02
            }
        }
    }

    function updateBoss(){
        // Controls the bosses attack pattern, and stages.
        boss = dungeon.boss
        if(boss.health < 0){
            bossfight = false
            alive = false
            victory = true;
            player.score += 1000
        }
        if (player.x + player.bulletsize  > boss.x && player.x < boss.x + boss.size && player.y + player.bulletsize  > boss.y && player.y < boss.y + boss.size){
            player.health -= boss.attack/10
        }
        if (boss.x > player.x){
            boss.dir = 1
        }
        else { 
            boss.dir = 3
        }
        
        //boss stages
        
        if(Math.floor(boss.stage) == 1){
            if(boss.health < 50){
                boss.stage = 2
            }
            if(boss.cooldown == 0){
                bossAttack();
                boss.cooldown = 30 
            }
            else {
                boss.cooldown--
            }
            if (boss.stage == 1.1){
                boss.x -= boss.speed
                if (boss.x < 5){
                    boss.stage = 1.2
                }
            }
            else if (boss.stage == 1.2){
                boss.y += boss.speed
                if (boss.y > dungeon.size - 10){
                    boss.stage = 1.3
                }
            }
            else if (boss.stage == 1.3){
                boss.x += boss.speed
                if (boss.x >dungeon.size - 10){
                    boss.stage = 1.4
                }
            }
            else if (boss.stage == 1.4){
                boss.y -= boss.speed
                if (boss.y < 5){
                    boss.stage = 1.1
                }
            }

        }
        
        else if(Math.floor(boss.stage) == 2){
            if(boss.health < 25){
                boss.stage = 3.1
            }
            if(boss.cooldown < 0){
                bossAttack();
                boss.cooldown = 15 
            }
            else {
                boss.cooldown--
            }
        }
        
        else if(Math.floor(boss.stage) == 3){
            if(boss.cooldown < 0){
                enemy = {
                            id : 0,
                            attack: 1,
                            maxhealth: 5,
                            sprite : [2,37],
                            health: 3,
                            speed: .1,
                            aggrorange: 100,
                            dir: 1,
                            size: 1,
                            //The x and y is a position on the 2d array dungeon.map
                            x : Math.floor(boss.x) ,
                            y : Math.floor(boss.y)
                        }
                dungeon.enemies.push(enemy);
                boss.cooldown = 100 
            }
            else {
                boss.cooldown--
            }
            if (boss.stage == 3.1){
                boss.x -= boss.speed
                if (boss.x < 5){
                    boss.stage = 3.2
                }
            }
            else if (boss.stage == 3.2){
                boss.y += boss.speed
                if (boss.y > dungeon.size - 10){
                    boss.stage = 3.3
                }
            }
            else if (boss.stage == 3.3){
                boss.x += boss.speed
                if (boss.x >dungeon.size - 10){
                    boss.stage = 3.4
                }
            }
            else if (boss.stage == 3.4){
                boss.y -= boss.speed
                if (boss.y < 5){
                    boss.stage = 3.1
                }
            }
        }
    }
    
    function updatePlayer(){
        //updates the players x and y, mana if they are a mage, cooldown for attacks, if the player has gotten enough notes to be in the boss room.
        if (player.up && dungeon.map[Math.floor(player.x) ][Math.ceil(player.y) -1] == 1 && dungeon.map[Math.ceil(player.x) ][Math.ceil(player.y) -1] == 1){
            player.y -= player.speed;
            player.y = Math.round(player.y * 100)/100
        }
        if (player.right && dungeon.map[Math.floor(player.x)+ 1][Math.floor(player.y)] == 1 && dungeon.map[Math.floor(player.x)+ 1][Math.ceil(player.y)] == 1){
            player.x += player.speed;
            player.x = Math.round(player.x * 100)/100
        }
        if (player.down && dungeon.map[Math.ceil(player.x) ][Math.floor(player.y) +1] == 1 && dungeon.map[Math.floor(player.x) ][Math.floor(player.y) +1] == 1){
            player.y += player.speed;
            player.y = Math.round(player.y * 100)/100
        }
        if (player.left && dungeon.map[Math.ceil(player.x) -1][Math.ceil(player.y)] == 1 && dungeon.map[Math.ceil(player.x) -1][Math.floor(player.y)] == 1){
            player.x -= player.speed;
            player.x = Math.round(player.x * 100)/100
        }
        if(player.clasname == 'mage' && !(player.mana > player.maxmana)){
            player.mana += 0.001
        }
        if (player.health <= 0){
            alive = false;
        }
        if (player.cooldown){
            cooldowntime++
        }
        if(player.attackrate*10 < cooldowntime){
            cooldowntime = 0
            player.cooldown = false
        }
        if(player.note == 7){
            player.note = 0
            bossRoom()
        }
        
    }

    function updateBullets(){
        //updates the players bullets, deals with collisions and does the same for the boss if the player is in the bossfight
        bullets = player.bullets
        for (i = 0; i < bullets.length; i++){
            bullets[i].x += bullets[i].xchange
            bullets[i].y += bullets[i].ychange
            bullets[i].range += Math.abs(bullets[i].xchange + bullets[i].ychange)
            if(dungeon.map[Math.floor(bullets[i].x)][Math.floor(bullets[i].y)] != 1 || dungeon.map[Math.floor(bullets[i].x + player.bulletsize)][Math.floor(bullets[i].y + player.bulletsize)] != 1){
                bullets.splice(i, 1)
                continue   
            }
            //removes bullets out of players range
            else if(bullets[i].range > player.range){
                bullets.splice(i, 1)
                continue
            }
            if (dungeon.boss){
                boss = dungeon.boss
                if (bullets[i].x + player.bulletsize  > boss.x && bullets[i].x < boss.x + boss.size && bullets[i].y + player.bulletsize  > boss.y && bullets[i].y < boss.y + boss.size){
                    bullets.splice(i, 1);
                    boss.health -= player.attack
                    break
                }
            }
            for (ii = 0; ii < dungeon.enemies.length; ii++){ 
                xdistance = Math.abs((bullets[i].x + player.bulletsize/2)  - (enemies[ii].x + enemies[ii].size /2))
                ydistance = Math.abs((bullets[i].y + player.bulletsize/2)  - (enemies[ii].y + enemies[ii].size /2))
                if ((xdistance < 1 && ydistance < 1) && (bullets[i].x > enemies[ii].x || bullets[i].y > enemies[ii].y)){
                    enemies[ii].health -= player.attack
                    bullets.splice(i, 1)
                    break
                }
            }
        }
        if (bossfight){
            bullets = dungeon.boss.bullets
            for (i = 0; i < bullets.length; i++){
                bullets[i].x += bullets[i].xchange /5
                bullets[i].y += bullets[i].ychange /5
                xdistance = Math.abs(bullets[i].x - player.x)
                ydistance = Math.abs(bullets[i].y - player.y)
                xdistance = Math.abs((bullets[i].x + boss.bulletsize/2)  - (player.x + player.size /2))
                ydistance = Math.abs((bullets[i].y + boss.bulletsize/2)  - (player.y + player.size /2))
                if (xdistance < 1 && ydistance < 1){
                    bullets.splice(i, 1);
                    player.health -= .1
                    continue
                    
                }
                if (bullets[i].x > height || bullets[i].x < 0 || bullets[i].y > width || bullets[i].y < 0 ){
                    bullets.splice(i, 1);
                }
            }
        }
    }
    
    function updateTreasures(){
        //Updates the treasures if they are picked up by the player and adds health/mana/points to the player
        treasures = dungeon.treasures
        for (i = 0; i < treasures.length; i++){
            xdistance = Math.abs(treasures[i].x -widthunits/2- player.x)
            ydistance = Math.abs(treasures[i].y -widthunits/2- player.y)
            if (xdistance < 1 && ydistance < 1){
                for(key in treasures[i]){
                    if (key !== 'x' && key !== 'y' && key !== 'sprite'){
                        player[key] += treasures[i][key]
                    }
                }
                player.treasures.push( treasures.splice(i, 1)[0])
                if (player.health > player.maxhealth){
                    player.health = player.maxhealth
                }
                if (player.mana > player.maxmana){
                    player.mana = player.maxmana
                }
            }
        }
    }
    
    function attack(direction){
        //Checks collision for player attacks and deals damage, also creates player bullets when they attack
        enemies = dungeon.enemies
        boss = dungeon.boss
        if(!player.cooldown){
            if (bossfight){
                xdistance = Math.abs(boss.x  - player.x )
                ydistance = Math.abs(boss.y - player.y )
            }
            if(player.clasname === 'tank' || player.clasname=== 'rouge'){
                if (direction === 0){
                    for (i = 0; i < enemies.length; i++){
                        if ((enemies[i].x > player.x - player.range && enemies[i].x < player.x + player.range + player.size) && (enemies[i].y  < player.y && enemies[i].y  > player.y - player.range)){
                            enemies[i].y -= player.knockback;
                            enemies[i].health -= player.attack;
                            player.cooldown = true;
                        }
                    }
                    if ((bossfight) &&  (ydistance - boss.size < player.range) && (xdistance - boss.size/2 < player.range ) && (player.y > boss.y + boss.size)){
                        boss.health -= player.attack
                        player.cooldown = true;
                    }
                }
                else if (direction === 1){
                    for (i = 0; i < enemies.length; i++){
                        if ((enemies[i].x > player.x && enemies[i].x < player.x + player.range + player.size) && (enemies[i].y  < player.y + player.range + player.size && enemies[i].y  > player.y - player.range )){
                            enemies[i].x += player.knockback;
                            enemies[i].health -= player.attack;
                            player.cooldown = true;
                        }
                    }
                    if ((bossfight) &&  (ydistance - boss.size/2 < player.range) && (xdistance - player.size < player.range ) && (player.x + player.size < boss.x)){
                        boss.health -= player.attack
                        player.cooldown = true;
                    }
                }
                else if (direction === 2){
                    for (i = 0; i < enemies.length; i++){
                        if ((enemies[i].x > player.x - player.range && enemies[i].x < player.x + player.range + player.size) && (enemies[i].y  > player.y && enemies[i].y  < player.y + player.size + player.range)){
                            enemies[i].y += player.knockback;
                            enemies[i].health -= player.attack;
                            player.cooldown = true;
                        }
                    }
                    if ((bossfight) &&  (ydistance - player.size < player.range) && (xdistance - boss.size/2< player.range ) && (player.y < boss.y)){
                        boss.health -= player.attack
                        player.cooldown = true;
                    }
                }
                else if (direction === 3){
                    for (i = 0; i < enemies.length; i++){
                        if ((enemies[i].x < player.x + player.size && enemies[i].x > player.x - player.range) && (enemies[i].y  < player.y + player.range + player.size && enemies[i].y  > player.y - player.range )){
                            enemies[i].x -= player.knockback;
                            enemies[i].health -= player.attack;
                            player.cooldown = true;
                        }
                    }
                    if ((bossfight) &&  (ydistance - boss.size/2 < player.range) && (xdistance - boss.size < player.range ) && (player.x  > boss.x + boss.size)){
                        boss.health -= player.attack
                        player.cooldown = true;
                    }
                }
            }
            
            else if(player.mana > .25){
                if(player.clasname === 'mage'){
                    player.mana -= .25
                }
                bullet = {
                    x:player.x + (player.size/2) - (player.bulletsize/2),
                    y:player.y + (player.size/2) - (player.bulletsize/2),
                    xchange:.1,
                    ychange:.1,
                    range: 0
                }
                if (direction === 0){
                    bullet.xchange = 0
                    bullet.ychange = -1 * player.shotspeed
                    bullet.y -= player.size/2
                }
                if (direction === 1){
                    bullet.xchange = player.shotspeed
                    bullet.ychange = 0
                    bullet.x += player.size/2
                }
                if (direction === 2){
                    bullet.xchange = 0
                    bullet.ychange = player.shotspeed
                    bullet.y += player.size/2
                }
                if (direction === 3){
                    bullet.xchange = -1 * player.shotspeed
                    bullet.ychange = 0
                    bullet.x -= player.size/2
                }
                player.bullets.push(bullet)
                player.cooldown = true;
            }
        } 
    }
    
    function activate(event){
        //Handles player inputs
        var keycode = event.keyCode;
        if (keycode === 81){
            player.note = 7
        }
        if (keycode === 87){
            player.up = true;
        }
        if (keycode === 68){
            player.right = true;
            player.dir = 1;
        }
        if (keycode === 83){
            player.down = true;
        }
        if (keycode === 65){
            player.left = true;
            player.dir = 3;
        }
        if (keycode === 38){
            player.dir = 0;
            attack(player.dir);
        }
        else if (keycode === 39){
            player.dir = 1;
            attack(player.dir);
        }
        else if (keycode === 40){
            player.dir = 2;
            attack(player.dir);
        }
        else if (keycode === 37){
            player.dir = 3;
            attack(player.dir);
        }
        if (keycode === 27){
            if(alive){
                if(mainmenu){
                    mainmenu = false;
                }
                else{
                    mainmenu =true;
                }
            }
        }   
        if (keycode === 32 && !alive){
            window.removeEventListener('keydown', activate, false);
            window.removeEventListener('keyup', deactivate, false);
            canvas.removeEventListener('click', click,false);
            window.clearInterval(interval);
            init();
        }
        
        
    }
 
    function deactivate(event){
        //Handles keyups
        var keycode = event.keyCode
        if (keycode === 87){
            player.up = false;
        }
        if (keycode === 68){
            player.right = false;
        }
        if (keycode === 83){
            player.down = false;
        }
        if (keycode === 65){
            player.left = false;
        }  
    }

    function click(event){
        //handles player clicks in menus
        rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
        //Mainmenu clicks
        if(mainmenu){
            if(mouseX > 430 && mouseX < 800 && mouseY <470 && mouseY > 380 && alive == true){
                mainmenu = false;
            }
            else if(mouseX > 420 && mouseX < 800 && mouseY <605 && mouseY > 520){
                mainmenu = false;
                charcreate = true;
                player.clasname = 'rouge'
                player.sprite =[2, 28]
                alive = false
            }
        }
        //Character creation clicks
        else if (charcreate){
            if (mouseX > 85 && mouseX < 220 && mouseY > 55 && mouseY < 160){
                player.sprite =[2, 28]
                player.clas = rouge;
                player.clasname = 'rouge'
            }
            else if (mouseX > 220 && mouseX < 355 && mouseY > 55 && mouseY < 160){
                player.sprite =[11, 28];
                player.clas = rouge;
                player.clasname = 'rouge'
            }
            else if (mouseX > 355 && mouseX < 490 && mouseY > 55 && mouseY < 160){
                player.sprite =[20, 28];
                player.clas = archer;
                player.clasname = 'archer'
            }
            else if (mouseX > 490 && mouseX < 625 && mouseY > 55 && mouseY < 160){
                player.sprite =[29, 28];
                player.clas = archer;
                player.clasname = 'archer'
            }
            else if (mouseX > 620 && mouseX < 755 && mouseY > 55 && mouseY < 160){
                player.sprite =[38, 28];
                player.clas = mage;
                player.clasname = 'mage'
            }
            else if (mouseX > 755 && mouseX < 885 && mouseY > 55 && mouseY < 160){
                player.sprite =[47, 28];
                player.clas = mage;
                player.clasname = 'mage'
            }
            else if (mouseX > 885 && mouseX < 1020 && mouseY > 55 && mouseY < 160){
                player.sprite =[56, 28];
                player.clas = tank;
                player.clasname = 'tank'
            }
            else if (mouseX > 1020 && mouseX < 1155 && mouseY > 55 && mouseY < 160){
                player.sprite =[65, 28];
                player.clas = tank;
                player.clasname = 'tank'
            }
            else if (mouseX > 900 && mouseX < 1120 && mouseY > 270 && mouseY < 350){
                if(!player.clas){
                    player.clas = rouge;
                    player.clasname = 'rouge'
                }
                mainmenu = false;
                charcreate = false;
                alive = true;
                bossfight = false
                for(key in player.clas){
                   player[key] = player.clas[key]
                }
                dungeon = {
                    size : 100,
                    keys : 3,
                    roomcount : 12,
                    roomsize : [[10, 30], [10, 30]], //size variance x, y
                    monsterchance : 100, 
                    itemchance : 75 ,
                    map : [],
                    rooms : [],
                    halls : [],
                    treasures : [],
                    enemies : [],
                }
                buildDungeon(dungeon);
                player.x = dungeon.rooms[0].x + (Math.floor(dungeon.rooms[0].width/2));
                player.y = dungeon.rooms[0].y + (Math.floor(dungeon.rooms[0].height/2));
            }
        }
    }

    function buildDungeon(dungeon){
        //Creates random rooms at sizes defined by the dungeon variable then joins them using prims algorithm
        for (i = 0; i < dungeon.size; i++){
            dungeon.map.push([])
            for (ii = 0; ii < dungeon.size; ii++){
                dungeon.map[i].push([]);
            }
        }
        for (i = 0; i < dungeon.roomcount; i++){
            var room = {};
            room.width = getRandomNumber(dungeon.roomsize[0][0] , dungeon.roomsize[0][1]);
            room.height = getRandomNumber(dungeon.roomsize[1][0] , dungeon.roomsize[1][1]); // Gets random size for room
            room.x = getRandomNumber(2, dungeon.size- room.width -2);
            room.y = getRandomNumber(2, dungeon.size- room.height -2);
            if (collides(room)){
                i--;
                continue;
            } 
            dungeon.rooms.push(room)
        }
        
        //Uses Prim's algorithm to create a list of pairs of room objects to creat halls between(halls).
        var reached = [dungeon.rooms[0]]
        var unreached = dungeon.rooms.slice(1)
        var halls = []
        var closest
        var closestco
        while (reached.length < dungeon.roomcount){
            closest = 100000000
            for (i = 0; i < reached.length; i++){
                for (ii = 0; ii < unreached.length; ii++){
                    distance = Math.sqrt( Math.pow(((reached[i].x + Math.round(reached[i].width/2)) - (unreached[ii].x + Math.round(unreached[ii].width/2))), 2) + Math.pow(((reached[i].y + Math.round(reached[i].height/2)) - (unreached[ii].y + Math.round(unreached[ii].height/2))), 2))
                    if (closest > distance){
                        closest = distance
                        closestco = [i, ii]
                    }
                }
            }
            halls.push([reached[closestco[0]], unreached[closestco[1]]])
            reached.push(unreached.splice(closestco[1], 1)[0])
            
            
        }
        //Creates Halls for each pair of rooms in hall
        for (i = 0; i < halls.length; i++){
            var roomx = {}
            var roomy = {}
            var x1 = halls[i][0].x + Math.round(halls[i][0].width/2)
            var y1 = halls[i][0].y + Math.round(halls[i][0].height/2)
            var x2 = halls[i][1].x + Math.round(halls[i][1].width/2)
            var y2 = halls[i][1].y + Math.round(halls[i][1].height/2)
            if (x1 < x2){
                roomx.x = x1;
                roomx.y = y1;
                roomx.width = x2 - x1 +1;
                roomx.height = 1;
            }
            if (x1 >= x2){
                roomx.x = x2 ;
                roomx.y = y2;
                roomx.width = x1 - x2 +1;
                roomx.height = 1;
            }
            dungeon.halls.push(roomx)
            if(y1  < y2){
                roomy.x = roomx.x + roomx.width;
                roomy.y = y1;
                roomy.height = y2 - y1 +1;
                roomy.width = 1;
            }
            if(y1 >= y2){
                roomy.x = roomx.x + roomx.width;
                roomy.y = y2 ;
                roomy.height = y1 - y2 +1;
                roomy.width = 1;
            }
            dungeon.halls.push(roomy)
        }
        pushToMap()
        
    }

    function pushToMap(){
        //Placing numbers in the position of rooms on the dungeon.map 2d array and adding items to the treasure and enemy lists
        for (i = 0; i < dungeon.rooms.length; i++){
            for (ii = dungeon.rooms[i].x  ; ii < dungeon.rooms[i].x + dungeon.rooms[i].width; ii++){
                for (iii = dungeon.rooms[i].y ; iii < dungeon.rooms[i].y + dungeon.rooms[i].height; iii++){
                    //pushing 1s to the dungeon.map
                    dungeon.map[ii][iii].push(1);
                    
                    //enemies spawning
                    var chance = getRandomNumber(0, dungeon.monsterchance);
                    if ( chance === 1 && i != 0){
                        enemy = {
                            id : 0,
                            attack: 1,
                            maxhealth: 5,
                            sprite : [2,37],
                            health: 5,
                            speed: .1,
                            aggrorange: 10,
                            dir: 1,
                            size: 1,
                            //The x and y is a position on the 2d array dungeon.map
                            x : Math.floor(getRandomNumber(dungeon.rooms[i].x ,dungeon.rooms[i].x + dungeon.rooms[i].width-1) ) ,
                            y : Math.floor(getRandomNumber(dungeon.rooms[i].y ,dungeon.rooms[i].y + dungeon.rooms[i].height-1))
                        }
                        dungeon.enemies.push(enemy);
                    }
                    else if ( chance === 2 && i != 0){
                        enemy = {
                            id : 0,
                            attack: 1.4,
                            maxhealth: 10,
                            sprite : [11,37],
                            health: 10,
                            speed: .1,
                            aggrorange: 13,
                            dir: 1,
                            size: 1,
                            //The x and y is a position on the 2d array dungeon.map
                            x : Math.floor(getRandomNumber(dungeon.rooms[i].x ,dungeon.rooms[i].x + dungeon.rooms[i].width-1) ) ,
                            y : Math.floor(getRandomNumber(dungeon.rooms[i].y ,dungeon.rooms[i].y + dungeon.rooms[i].height-1))
                        }
                        dungeon.enemies.push(enemy);
                    }
                    
                    //item spawning
                    chance = getRandomNumber(0, dungeon.itemchance);
                    if(chance === 1 && i != 0){
                        chance = getRandomNumber(0, 600);
                        treasure = {
                            score : 1,
                            x : Math.floor(getRandomNumber(dungeon.rooms[i].x ,dungeon.rooms[i].x + dungeon.rooms[i].width-1) + widthunits/2) ,
                            y : Math.floor(getRandomNumber(dungeon.rooms[i].y ,dungeon.rooms[i].y + dungeon.rooms[i].height-1) + widthunits/2),
                            sprite : [11, 20]
                        }
                        if(chance > 0 && chance <= 200){
                            treasure.sprite = [11, 20]
                            treasure.score = 5
                        }
                        else if(chance > 200 && chance <= 400){
                            if(player.clas === mage && chance <= 300){
                                treasure.sprite = [2, 29]
                                treasure.mana = 2
                            }
                            else {
                                treasure.sprite = [20, 29]
                                treasure.health = 2
                            }
                        }
                        else if(chance > 400 && chance <= 600){
                            if(player.clas = mage && chance < 500){
                                treasure.sprite = [20, 20]
                                treasure.mana = 1
                            }
                            else {
                                treasure.sprite = [38, 20]
                                treasure.health = 1
                            }
                        }
                        dungeon.treasures.push(treasure);                           
                    }
                }
            }
        }
        for (i = 0; i < 7; i++){
            room = dungeon.rooms[getRandomNumber(0, dungeon.roomcount -1)]
            note = {
                x : Math.floor(getRandomNumber(room.x , room.x + room.width-1) + widthunits/2) ,
                y : Math.floor(getRandomNumber(room.y , room.y + room.height-1) + widthunits/2),
                sprite : [11 + i*9, 65],
                note : 1,
                score: 1
            }
            dungeon.treasures.push(note)
        }
        for (i = 0; i < dungeon.halls.length; i++){
            for (ii = dungeon.halls[i].x ; ii < dungeon.halls[i].x + dungeon.halls[i].width; ii++){
                for (iii = dungeon.halls[i].y; iii < dungeon.halls[i].y + dungeon.halls[i].height; iii++){
                    if (dungeon.map[ii][iii] == 0){
                        dungeon.map[ii][iii].push(1);
                    }
                }
            }
        }
        //Places twos around the rooms for rendering walls
        for (i = 0; i < dungeon.rooms.length; i++){
            for (ii = dungeon.rooms[i].x -1 ; ii < dungeon.rooms[i].x + dungeon.rooms[i].width +1; ii++){
                if (dungeon.map[ii][dungeon.rooms[i].y - 1] == 0){
                    dungeon.map[ii][dungeon.rooms[i].y - 1].push(2)
                }
                if (dungeon.map[ii][dungeon.rooms[i].y +dungeon.rooms[i].height ] == 0){
                    dungeon.map[ii][dungeon.rooms[i].y +dungeon.rooms[i].height ].push(2)
                }
            }
            for (ii = dungeon.rooms[i].y  ; ii < dungeon.rooms[i].y + dungeon.rooms[i].height; ii++){
                if (dungeon.map[dungeon.rooms[i].x -1][ii] == 0){
                    dungeon.map[dungeon.rooms[i].x - 1][ii].push(2)
                }
                if (dungeon.map[dungeon.rooms[i].x +dungeon.rooms[i].width ][ii] == 0){
                    dungeon.map[dungeon.rooms[i].x +dungeon.rooms[i].width ][ii].push(2)
                }
            }
        }
        //Places twos around halls
        for (i = 0; i < dungeon.halls.length; i++){
            if(dungeon.halls[i].width > dungeon.halls[i].height){
                for (ii = dungeon.halls[i].x -1; ii < dungeon.halls[i].x + dungeon.halls[i].width +1; ii++){
                    if (dungeon.map[ii][dungeon.halls[i].y - 1] == 0){
                        dungeon.map[ii][dungeon.halls[i].y - 1].push(2)
                    }
                    if (dungeon.map[ii][dungeon.halls[i].y + 1] == 0){
                        dungeon.map[ii][dungeon.halls[i].y + 1].push(2)
                    }
                }
            }
            else {
                for (ii = dungeon.halls[i].y -1; ii < dungeon.halls[i].y + dungeon.halls[i].height +1; ii++){
                    if (dungeon.map[dungeon.halls[i].x - 1][ii] == 0){
                        dungeon.map[dungeon.halls[i].x - 1][ii].push(2)
                    }
                    if (dungeon.map[dungeon.halls[i].x + 1][ii] == 0){
                        dungeon.map[dungeon.halls[i].x + 1][ii].push(2)
                    }
                }
            }
        }
    }
    
    function bossRoom(){
        //Generates the bossroom and moves the player there
        dungeon.size = 34
        dungeon.map = []
        dungeon.treasures = []
        dungeon.enemies = []
        for (i = 0; i < dungeon.size; i++){
            dungeon.map.push([])
            for (ii = 0; ii < dungeon.size; ii++){
                if (i <  2|| i == dungeon.size -1){
                    dungeon.map[i].push([2])
                }
                else if(ii < 2 || ii == dungeon.size -1){
                    dungeon.map[i].push([2])
                }
                else{
                    dungeon.map[i].push([1])
                }
            }
        }
        player.x = Math.floor(dungeon.size - dungeon.size/2);
        player.y = Math.floor(dungeon.size - dungeon.size/4);
        enemy = {
            attack: 1,
            maxhealth: 100,
            health: 100,
            speed: .1,
            aggrorange: 50,
            dir: 1,
            size: 4,
            stage: 1.1,
            size : 4,
            bullets : [],
            bulletsize: 1,
            cooldown: 0,
            //The x and y is a position on the 2d array dungeon.map
            x : dungeon.size/2,
            y : dungeon.size/5
        }
        dungeon.boss = enemy
        bossfight = true
        
    }

    function bossAttack(){
        //creates the boss bullets ojects
        boss = dungeon.boss
        bullet = {
                    x:boss.x + (boss.size/2) - (player.bulletsize/2),
                    y:boss.y + (boss.size/2) - (player.bulletsize/2),
                    xchange:.1,
                    ychange:.1,
                    range: 0
                }
        var dx = player.x - (boss.x + (boss.size/2))
        var dy = player.y - (boss.y + (boss.size/2))  
        var mag = Math.sqrt(dx * dx + dy * dy);
        bullet.xchange = (dx / mag)
        bullet.ychange = (dy / mag)
        boss.bullets.push(bullet)
                
    }
    
    function characterCreation(){
        //Draws the character creation menu
        context.clearRect(0, 0, width + canvas.height/2, height);
        context.fillStyle = '#4d4d4d';
        context.fillRect(0, 0, width + canvas.height/2, height);
        for (i = 0; i < 8; i++){
            if(player.sprite[0] == i*9 +2){
                context.fillStyle = 'grey';
                context.fillRect(unit*2.5 +unit*(i*5), unit*1.5, unit*5, unit*5)
            }
            context.drawImage(characters, 2 + (i * 9), 28,8,8,unit*3 +unit*(i*5), unit*2, unit*4, unit*4);
        }
        context.fillRect(unit, unit*9, 43*unit, unit *20)
        context.fillStyle = 'black'
        context.font = unit*3.7+ 'px VT323'
        if(player.sprite[0]<20){
            context.fillText('CLASS: Rogue', unit*2, unit*12)
            context.fillText('ATTACK: 1', unit*2, unit*16)
            context.fillText('HEALTH: 5', unit*2, unit*20)
            context.fillText('SPEED: 2.5', unit*2, unit*24)
            context.fillText('KNOCKBACK: .5', unit*20, unit*16)
            context.fillText('ATTACK RATE:1', unit*20, unit*20)
            context.fillText('MAX HEALTH: 5', unit*20, unit*24)
            context.fillText('Attacks quickly but is weak', unit*2, unit*28)
        }
        else if(player.sprite[0]<38){
            context.fillText('CLASS: Archer', unit*2, unit*12)
            context.fillText('ATTACK: 2', unit*2, unit*16)
            context.fillText('HEALTH: 4', unit*2, unit*20)
            context.fillText('SPEED: 2', unit*2, unit*24)
            context.fillText('KNOCKBACK: 0', unit*20, unit*16)
            context.fillText('ATTACK RATE: 3', unit*20, unit*20)
            context.fillText('MAX HEALTH: 5', unit*20, unit*24)
            context.fillText('Uses ranged attacks', unit*2, unit*28)
        }
        else if(player.sprite[0]<56){
            context.fillText('CLASS: Mage', unit*2, unit*12)
            context.fillText('ATTACK: 8', unit*2, unit*16)
            context.fillText('HEALTH: 1', unit*2, unit*20)
            context.fillText('SPEED: 2', unit*2, unit*24)
            context.fillText('KNOCKBACK: 0', unit*20, unit*16)
            context.fillText('ATTACK RATE: 3', unit*20, unit*20)
            context.fillText('MAX HEALTH: 2', unit*20, unit*24)
            context.fillText('Glass cannon, Uses ranged', unit*2, unit*28)
        }
        else if(player.sprite[0]<72){
            context.fillText('CLASS: Tank', unit*2, unit*12)
            context.fillText('ATTACK: 4', unit*2, unit*16)
            context.fillText('HEALTH: 10', unit*2, unit*20)
            context.fillText('SPEED: 1', unit*2, unit*24)
            context.fillText('KNOCKBACK: 1', unit*20, unit*16)
            context.fillText('ATTACK RATE: 5', unit*20, unit*20)
            context.fillText('MAX HEALTH: 10', unit*20, unit*24)
            context.fillText('Uses ranged attacks and', unit*2, unit*28)
        }
        context.fillStyle = 'green'
        context.fillRect(unit* 36.4, unit*9.5, unit*5, unit*3)
        context.fillStyle = 'black'
        context.fillText('GO', unit* 36.5, unit*12)
    }
 
    function collides(room){
        //checks for collision between a new room and all others for buildDungeon
        for (i = 0; i < dungeon.rooms.length; i++){
                if ((!(dungeon.rooms[i].x > room.x + room.width + 2 || dungeon.rooms[i].x + dungeon.rooms[i].width + 2 < room.x)
                    && !(dungeon.rooms[i].y > room.y + room.height +2 || dungeon.rooms[i].y + dungeon.rooms[i].height + 2 < room.y))){
                    return true
                }
            }
        return false
    }

    function gameStateOver(){
        //Draws the gameover screen
        if (victory){
            context.fillStyle = 'gold'
            context.fillRect(0, 0, width + 400, height);
            context.fillStyle = 'black'
            context.font = unit*4 + 'px VT323';
            context.fillText('YOU WIN!',16*unit , 10*unit);
            context.fillText('Score = ' + player.score, 14.5*unit, 15*unit);
            context.fillText('Press Space to play again', 3*unit, 20*unit);
        }
        else{
            context.fillStyle = 'grey'
            context.fillRect(0, 0, width + 400, height);
            context.fillStyle = 'black'
            context.font = unit*4 + 'px VT323';
            context.fillText('Game Over!',14*unit , 10*unit);
            context.fillText('Score = ' + player.score, 14.5*unit, 15*unit);
            context.fillText('Press Space to play again', 3*unit, 20*unit);
        }
        alive = false
        
    }
   
    function getRandomNumber (min, max){
        return Math.round(Math.random()*(max - min) +min)
    }
})();
