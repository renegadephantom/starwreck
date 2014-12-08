var sprites = {
  ironyman: { sx: 0, sy: 0, w: 100, h: 140, frames: 1 },
  missile: { sx: 0, sy: 150, w: 50, h: 50, frames: 1 },
  enemy_yellow: { sx: 100, sy: 0, w: 100, h: 140, frames: 1 },
  enemy_camo: { sx: 200, sy: 0, w: 100, h: 150, frames: 1 },
  enemy_red: { sx: 300, sy: 0, w: 100, h: 150, frames: 1 },
  explosion: { sx: 0, sy: 250, w: 30, h: 30, frames: 6 }
};

var enemies = {
  wiggle:   { x: 100, y: -50, sprite: 'enemy_yellow', health: 20, B: 50, C: 4, E: 100 },
  straight: {x: 0, y: -50, sprite: 'enemy_camo',health: 10,E: 100},
  step:    {x: 0, y: -50, sprite: 'enemy_red', health: 10,B: 150, C: 1.2, E: 75 }
};


var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8;



var level1 = [
    [ 0,     4000,     500,      'wiggle' ],
    [ 6000,  13000,    800,      'straight' ]
];

var winGame = function() {

};

var loseGame = function() {

};


window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});

var playGame = function() {
//  Game.setBoard(0,new movingSky(100,0.4));
//  Game.setBoard(1,new ironyMan());

  var board = new GameBoard();
	board.add(new movingSky(100,0.4));
	Game.setBoard(0,board);	
	board.add(new ironyMan());
//Game.setBoard(1,board);
	board.add(new Level(level1,winGame));
	Game.setBoard(1,board);
	Game.setBoard(2,new TouchControls());
};

var startGame = function(){
	Game.setBoard(0,new splashScreen());
//	playGame();
//  Game.setBoard(1,new movingSky());
}


/*
var ironyMan = function(){
  this.w = SpriteSheet.map['ironyman'].w;
  this.h = SpriteSheet.map['ironyman'].h;
  this.x = Game.width/2 - this.w/2;
  this.y = Game.height - 10 - this.h;
  this.vx = 0;
  this.reloadTime = 0.25;  // Quarter second reload
  this.reload = this.reloadTime;
  this.maxVel = 200;

  this.step = function(dt) {
    if(Game.keys['left']){
      this.vx = -this.maxVel;
    }
    else if(Game.keys['right']){
      this.vx = this.maxVel;
    }
    else {
      this.vx = 0;
    }
    this.x += this.vx*dt;

    if(this.x < 0) {this.x = 0;}
    else if(this.x > Game.width - this.w){
      this.x = Game.width - this.w;
    }

	this.reload-=dt;
     if(Game.keys['fire'] && this.reload < 0) {
       Game.keys['fire'] = false;
       this.reload = this.reloadTime;

       this.board.add(new ironymanMissile(this.x,this.y+this.h/2));
       this.board.add(new ironymanMissile(this.x+this.w,this.y+this.h/2));
     }

  }

  this.draw = function(ctx){
    SpriteSheet.draw(ctx,'ironyman',this.x,this.y,0);
  }
};
*/

var ironyMan = function() {
  this.setup('ironyman', { vx: 0, reloadTime: 0.25, maxVel: 200 });

  this.reload = this.reloadTime;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - 10 - this.h;

  this.step = function(dt) {
    if(Game.keys['left']) { 
    	this.vx = -this.maxVel; }
    else if(Game.keys['right']) { 
    	this.vx = this.maxVel; }
    else { this.vx = 0; }

    this.x += this.vx * dt;

    if(this.x < 0) { this.x = 0; }
    else if(this.x > Game.width - this.w) {
      this.x = Game.width - this.w;
    }

    this.reload-=dt;
    if(Game.keys['fire'] && this.reload < 0) {
      Game.keys['fire'] = false;
      this.reload = this.reloadTime;

      this.board.add(new ironymanMissile(this.x,this.y+this.h/2));
      this.board.add(new ironymanMissile(this.x+this.w,this.y+this.h/2));
    }
  };
};

ironyMan.prototype = new Sprite();
ironyMan.prototype.type = OBJECT_PLAYER;

ironyMan.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    loseGame();
  }
};



var ironymanMissile = function(x,y) {
  this.setup('missile',{ vy: -700, damage: 10 });
  this.x = x - this.w/2;
  this.y = y - this.h;
};

ironymanMissile.prototype = new Sprite();
ironymanMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

ironymanMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y < -this.h) {
      this.board.remove(this);
  }
};


var Enemy = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0,
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0 };

Enemy.prototype.step = function(dt) {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

  this.x += this.vx * dt;
  this.y += this.vy * dt;

  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      this.board.add(new Explosion(this.x + this.w/2,
                                   this.y + this.h/2));
    }
  }
};



/* Explosion Code */
var Explosion = function(centerX, centerY) {
  this.setup('explosion', {frame: 0});
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt) {
  this.frame++;
  if(this.frame >= 12) {
    this.board.remove(this);
  }
}

var splashScreen = function(){
  var timeOut = 0;
  var img = new Image();
  img.onload = function() {
    Game.ctx.drawImage(img,0,0,Game.width,Game.height,0,0,Game.width,Game.height);
  };
  img.src = "images/splash.png";

  this.step = function(dt){
     timeOut += dt*1000;
     if(timeOut >= 2000) {
         playGame();
     }
  };

  this.draw = function(ctx){

  }
};

var movingSky = function(speed,opacity){
  var offset = 0;
  var sky = document.createElement("canvas");
  sky.width = Game.width;
  sky.height = Game.height;
  var skyCtx = sky.getContext("2d");
  var img = document.createElement("img");
  img.onload = function() {
    skyCtx.drawImage(img,0,0);
  }
  img.src = "images/starfield.png";

  this.step = function(dt) {
    offset += dt * speed;
    offset = offset % sky.height;
  }

  this.draw = function(ctx){
    var intOffset = Math.floor(offset);
    var remaining = sky.height - intOffset;

    if(intOffset > 0) {
      ctx.drawImage(sky,
                0, remaining,
                sky.width, intOffset,
                0, 0,
                sky.width, intOffset);
    }

    if(remaining > 0) {
      ctx.drawImage(sky,
              0, 0,
              sky.width, remaining,
              0, intOffset,
              sky.width, remaining);
    }
  };
};





