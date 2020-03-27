var game = {
    state: "start1",
    level: 1,
};

var overlay = {
    counter: -1,
    title: "foo",
    subtitle: "bar",
};

var player = {
	x:250,
	y:600,
    life: 5,
	width: 20,
	height: 50,
	counter: 0,
    timegun: 0,
};

var keyboard = { };
var playerBullets = [];
var enemies = [];
var enemyBullets = [];

// =========== игра    ============
function updateGame() {

    if(game.state == "start1" )if(keyboard[32]) {game.state = "start"; updatetextlife(player.life);}
    if(game.state == "pause" ) if(keyboard[32]) game.state = "playing";  
    if(keyboard[27] && 	game.state == "playing") game.state = "pause"; 
    if(game.state == "playing" && enemies.length == 0)  game.state = "won";
    if(game.state == "load" && keyboard[32]) {game.level++; game.state = "start";}
    if(game.state == "over" && keyboard[27]) window.location.reload();
            
    if(game.state == "won" )
        {  
            let str=0
             ship_image.src = "img/ship2.png";
            if(player.x>240 && player.x<260)str++;
            else if(player.x>250) player.x-=9;
            else player.x+=9;
            
            if(player.y>590 && player.y<610) str++;
            else if(player.y>600)player.y-=7;
            else player.y+=7;
            
            if(str==2)game.state = "load" ; 
        }
    
    if(game.state == "over" && player.y < canvas.height) player.y+=4;
                  
}

function updatePlayer() {
    
    if(player.timegun!=0)player.timegun--;
        
    if(player.state == "dead") return;
  
    if(keyboard[38]) { 
	    player.y -= 10;	
         if(player.y < 100) player.y = 100;
	}	
    

    if(keyboard[40])  {    
	    player.y += 5;	 
        var down = canvas.height - player.height;
        if(player.y > down) player.y = down;  
	}	
    
    if(keyboard[37])  { 
        ship_image.src = "img/1.png";
	    player.x -= 10; 
	    if(player.x < 0) player.x = 0;
	}	
    
	if(keyboard[39] ) { 
        ship_image.src = "img/3.png";
	    player.x += 10;	
	    var right = canvas.width - player.width;
	    if(player.x > right) player.x = right;
	}	
    
    if(keyboard[39] ||keyboard[37])
        {
             player.width = 40;
             player.height = 38;
        }
    else
        {
            ship_image.src = "img/ship2.png";
            player.width = 37;
            player.height = 40;
            
             if(keyboard[32] && player.timegun==0) {
             player.timegun=Math.floor(10+game.level/2);
			firePlayerBullet(); 
                } 
        }
    
	if(player.life == 0) {
	        player.state = "dead";
	        game.state = "over";
	        overlay.title = "GAME OVER";
	        overlay.subtitle = "press to space";
	}
}

function updatePlayerBullets() {
	
	for(i in playerBullets) {
		var bullet = playerBullets[i];
		bullet.y -= 8;
		bullet.counter++;
	}

	playerBullets = playerBullets.filter(function(bullet){
		return bullet.y > 0;
	});
}

function updateBackground() {
}

function updatetextlife(t) {
    text1.innerHTML='Space battle     ';
     for(var i=0; i<t; i++)
         text1.innerHTML+='♥ ';
}

// ============== обьекты =============
function updateEnemies() {
    
    if(game.state == "start") {
        enemies = [];
        enemyBullets = [];
        for(var i=0; i<6; i++) {
            enemies.push({
                    x: 20 + i*90,
                    y: 50,
                    state: "alive", 
                    life: -1+game.level*2,
                    width: 55,
                    height: 35,
                    counter: 0,
            });
        }
        game.state = "playing";
    }
    
    for(var i=0; i<6; i++) {
        var enemy = enemies[i];
        if(!enemy) continue;
        
        if(enemy) {
            enemy.counter++;
            enemy.x += Math.sin(enemy.counter*Math.PI*2/100)*2;

            if((getRandomInt(-1, 100-game.level)) == 0) {
                enemyBullets.push(createEnemyBullet(enemy));
            }
        }
            if(enemy.life <= 0) { 
                enemy.y-=9;
                enemy.counter = 0;
            if(enemy.y+enemy.height<0)enemy.state = "dead";
            }
    }
    
    enemies = enemies.filter(function(e) {
            if(e && e.state != "dead") return true;
            return false;
    });
}


function updateEnemyBullets() {

    for(var i in enemyBullets) {
        var bullet = enemyBullets[i];   
        bullet.y += getRandomInt(1+game.level/2, 5+game.level);
        bullet.counter++;
    }
}
// =========== проверка ===

function checkCollisions() {
    for(var i in playerBullets) {
        var bullet = playerBullets[i];
        for(var j in enemies) {
            var enemy = enemies[j];
            if(collided(bullet,enemy)) {
                playerBullets.splice(i, 1); 
                enemy.life--;  
            }
        }
    }
    
     for(var i in playerBullets) {
        var bulletplay = playerBullets[i];
        for(var j in enemyBullets) {
            var bulletenemy = enemyBullets[j];
            if(collided(bulletplay,bulletenemy)) {
                  
               playerBullets.splice(i, 1); 
                enemyBullets[j].counter=0;
                bulletenemy.state="boom";
            }
        }
    }
    
    if(player.life == 0 ) return;
    for(var i in enemyBullets) {
        var bullet = enemyBullets[i];
        if(collided(bullet,player)) {
            enemyBullets.splice(i, 1); 
            player.life--; 
            updatetextlife(player.life);
        }
    }
}

function collided(a, b) {
    
    if(b.x + b.width >= a.x && b.x < a.x + a.width) {
        if(b.y + b.height >= a.y && b.y < a.y + a.height) {
            return true;
        }
    }
    
    if(b.x <= a.x && b.x + b.width >= a.x+a.width) {
        if(b.y <= a.y && b.y + b.height >= a.y + a.height) {
            return true;
        }
    }
    
    if(a.x <= b.x && a.x + a.width >= b.x+b.width) {
        if(a.y <= b.y && a.y + a.height >= b.y+b.height) {
            return true;
        }
    }
    return false;
}

//====================================

function doSetup() {
	attachEvent(document, "keydown", function(e) {
		keyboard[e.keyCode] = true;
	});
	attachEvent(document, "keyup", function(e) {
		keyboard[e.keyCode] = false;
	});
}

function attachEvent(node,name,func) {
    if(node.addEventListener) {
        node.addEventListener(name,func,false);
    } else if(node.attachEvent) {
        node.attachEvent(name,func);
    }
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}