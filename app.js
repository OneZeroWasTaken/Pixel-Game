// // // Pixel Game \\ \\ \\
var sprite = [];               // Holds all sprites
var settings = new Config();   // Holds settings and boring global variables

var level;                     // Holds the level and all its information
var player;                    // Holds the player and its information
var mob = [];                  // Holds all mobs and their information
var currentPos = [];           // Used bland annat when a level is generated and in the findPath function


// - Level tile id's - //

// 0 = void
// 1 = wall
// 2 = empty floor
// 3 = ghost room wall
// 4 = illution wall
// 5 = door
// 6 = stair up, entry
// 7 = stair down, exit

function setup() {
    createCanvas(settings.canvasWidth, settings.canvasHeight);
    background(40);
    settings.ctx = document.getElementById("defaultCanvas0").getContext("2d");
    settings.ctx.webkitImageSmoothingEnabled = settings.ctx.imageSmoothingEnabled = settings.ctx.mozImageSmoothingEnabled = settings.ctx.oImageSmoothingEnabled = false;   // Antialiasing disabled

    try {
        level = new Level(1);
        level.generate();
    }
    catch (error) {
        level = new Level(1);
        level.generate();
        console.log("DUDE THERE WAS LIKE A DANGEROUS VIRUS AND I LIKE DUCKS");
    }

    player = new Player();



    mob.push(new Mob(player.x + 2, player.y, 1));
    



    setTimeout(function delayDraw() {   // Initialize-draws the level and canvas after a delay to make sure the sprites have time to load
        level.draw(); 
    }, 10);
}



function turnHandler(playerTrue, action) {   // Handles when something should take action and calculates how many turns 
    // Player Turn Handler. Wait for any player input (action)
    
    if (playerTrue) {
        if (action == "attack") {   // The player has attacked:
            if ((player.attackSpeed % 1) > Math.random() && !player.attackSkip) {   // The value after the decimal point is the % chance of skipping that action taking up a turn
                player.attackSkip = true;
            } else {
                player.turns--;
            }
        } else if (action == "move") {   // The player has moved:
            if ((player.walkSpeed % 1) > Math.random() && !player.walkSkip) {   // The value after the decimal point is the % chance of skipping that action taking up a turn
                player.walkSkip = true;
            } else {
                player.turns--;
            }
        } else if (action == "idle") {
            player.turns--;
        }
    }
    console.log(player.turns)
    if (player.turns == 0) {   // Teh following piece of code is executed when the player has run out of turns
        // Add stuff here when the player has run out of moves
        

        for (var i = 0; i < mob.length; i++) {   // Mob Turn Handler
            while (mob[i].turns) {
                var action = mob[i].update();
                console.log(action)

                if (action == "attack") {
                    if ((mob[i].attackSpeed % 1) > Math.random() && !mob[i].attackSkip) {
                        mob[i].attackSkip = true;
                    } else {
                        mob[i].turns--;
                    }
                } else if (action == "move") {
                    if ((mob[i].walkSpeed % 1) > Math.random() && !mob[i].walkSkip) {   // The value after the decimal point is the % chance of skipping that action taking up a turn
                        mob[i].walkSkip = true;
                    } else {
                        mob[i].turns--;
                    }
                } else if (action == "idle") {
                    mob[i].turns--;
                }
                break;
            }
            mob[i].turns = Math.floor(mob[i].walkSpeed);
        }

        // Tile State Handler

        player.turns = Math.floor(player.walkSpeed);   // Reset to make the player able to do turns again
        player.walkSkip = false;
        player.attackSkip = false;
    }
}




function draw() {   // Handles time and moving the player at a smooth interval both when holding and auto-walk
    settings.time++;

    if (player.turns) {   // Only if the player has turns left
        if (player.path.length && settings.time % settings.walkSpeed == 0) {   // Either auto walk or manual walk, not both at the same time
            player.move(player.path[0]);
            player.path.splice(0, 1);
    
        } else if (!player.inventory.open){   // If the inventory is open, no other key input should happen
            if (keyIsDown(83) && settings.time % settings.walkSpeed == 0) {   // Moves the player when holding the key S
                player.move(0);
            } else if (keyIsDown(65) && settings.time % settings.walkSpeed == 0) {   // A
                player.move(1);
            } else if (keyIsDown(87) && settings.time % settings.walkSpeed == 0) {   // W
                player.move(2);
            } else if (keyIsDown(68) && settings.time % settings.walkSpeed == 0) {   // D
                player.move(3);
            }
        }
    }
}


function keyPressed() {   // Handles every key tapped
    if (keyCode == 69) {   // E - Open or close inventory
        player.inventory.open = !player.inventory.open;

        if (player.inventory.open) {
            player.inventory.draw();

            player.pausedPath = player.path;   // Pauses the player's auto-walk
            player.path = [];
        } else {
            level.draw();

            player.path = player.pausedPath;   // Unpauses
            player.pausedPath = [];
        }
    } else {
        player.path = [];   // Stops the player
    }

    if (!player.inventory.open){   // If the inventory is open, no other key input should happen
        switch (keyCode) {
            case 83:   // S - Moves the player
                if (player.turns) {
                    player.move(0);
                    settings.time = 0;
                }
                break;
            case 65:   // A
                if (player.turns) {
                    player.move(1);
                    settings.time = 0;
                }
                break;
            case 87:   // W
                if (player.turns) {
                    player.move(2);
                    settings.time = 0;
                }
                break;
            case 68:   // D
                if (player.turns) {
                    player.move(3);
                    settings.time = 0;
                }   
                break;

            case 70:   // F - Picks up items on the ground
                player.pickUp();
                break;
            case 67:   // C - Continue walking
                player.path = player.pausedPath;
                player.pausedPath = [];
                break;
            case 81:   // Q - Do nothing this turn
                turnHandler(true, "idle");
                break;
            case 0:   // 

                break;
            case 0:   // 
                
                break;
            case 0:   // 

                break;
        }
    }
}

function mouseClicked() {
    player.pausedPath = player.path;
    player.path = [];

    var tile = [
        player.x - Math.ceil(player.parallax[0]) + Math.floor(mouseX / settings.zoom - player.parallax[0] + Math.ceil(player.parallax[0])),   // Calculates which tile coordinate was clicked
        player.y - Math.ceil(player.parallax[1]) + Math.floor(mouseY / settings.zoom - player.parallax[1] + Math.ceil(player.parallax[1]))];

    try {
        if (level.content[tile[0]][tile[1]][0] != 0 && level.content[tile[0]][tile[1]][0] != 1 && !player.inventory.open && level.content[tile[0]][tile[1]][1] == 2) {
            player.path = findPath([player.x, player.y], [tile[0], tile[1]]);
        }
    }
    catch (error) {   // If the tile clicked is outside of effectiveSize
        console.log("Unable to process input");
    }


    console.log(tile);
}


function mouseWheel(value) {   // Zooms in and out with the scroll wheel
    if (!player.inventory.open) {
        if (value.delta > 0) {   // Zoom out
            settings.zoom *= (1 - settings.scrollSpeed);
            player.parallax = [settings.canvasWidth / settings.zoom / 2 - 0.5, settings.canvasHeight / settings.zoom / 2 - 0.5];

            level.draw();
        } else if (value.delta < 0) {   // Zoom in
            settings.zoom *= (1 + settings.scrollSpeed);
            player.parallax = [settings.canvasWidth / settings.zoom / 2 - 0.5, settings.canvasHeight / settings.zoom / 2 - 0.5];

            level.draw();
        }
    }
    return false;
}