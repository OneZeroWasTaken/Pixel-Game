class Player {
    constructor() {
        // General information
        this.x = level.rooms[0].x;   // Entry point of the start room
        this.y = level.rooms[0].y;
        this.level = 1;
        this.experience = 0;

        // Player turn stuff
        this.walkSpeed = settings.movesPerTurn;   // How many tiles you can go each turn
        this.walkSkip = false;   // To make sure you only can skip a turn walking once
        this.attackSpeed = 1.00;
        this.attackSkip = false;
        this.turns = Math.floor(this.walkSpeed);

        // Player stats and buffs
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxFood = 1000;
        this.food = this.maxFood;

        this.heal = 1;   // Health gained per move not attacked
        this.hunger = 3;   // Hunger lost every turn
        this.buffs = [];
        this.strength = 1;

        this.dodge = 0.3;   // How many % of incomming attacks will be dodged
        this.accuracy = 0.5;   // Melee weapons increase this stat a lot while ranged not so much
        this.defence = 0;
        this.criticalStrike = 0.01;

        // Inventory and items
        this.gold = 0;
        this.inventory = new Inventory();
        this.identified = [];   // All potions and mushrooms that has been identified

        // Data
        this.path = [];   // Holds the path the player will go automatically if a tile has been clicked. If any input happens this gets moved to paused path
        this.pausedPath = [];   // Holds the path when the player is not moving
        this.parallax = [settings.canvasWidth / settings.zoom / 2 - 0.5, settings.canvasHeight / settings.zoom / 2 - 0.5];   // Parallax is how many tiles fits on the screen from the middle out depending on zoom
    }

    move(direction) {   // Moves the player
        switch (direction) {   // Handles not going into walls or simillar
            case 0:
                if (level.content[this.x][this.y + 1][0] != 1) {
                    this.y++;
                }
                break;
            case 1:
                if (level.content[this.x - 1][this.y][0] != 1) {
                    this.x--;
                }
                break;
            case 2:
                if (level.content[this.x][this.y - 1][0] != 1) {
                    this.y--;
                }
                break;
            case 3:
                if (level.content[this.x + 1][this.y][0] != 1) {
                    this.x++;
                }
                break;
        }


        
        level.draw();   // Update the canvas
        this.draw();
        turnHandler(true, "move");   // Update the turnHandler
    }

    attack(target) {

        turnHandler(true, "attack")
    }
    
    pickUp() {   // Checks if the player can pick up that item and some of the controls of what happens. Works closely together with player.inventory.addItem()
        if (level.content[player.x][player.y][2] != undefined) {
            if (player.inventory.addItem(level.content[player.x][player.y][2])) {   // Tries to place the item in the inventory
                level.content[player.x][player.y].splice(2, 1);   // Removes the second item in the z axis, aka the item displayed if there is one on that tile. The first one is always the floor/wall
                turnHandler(true, "idle");
            } else {
                console.log("inventory full");
            }
        } else {   // Remove later
            console.log("no item found");
        }
    }



    fieldOfView() {   // Calculates which tiles are in direct line of sight to the player. 0 - The tile is hidden, 1 - The tile has been seen before but not "updated", 2 - The tile is being looked at
        for (var x = 0; x < level.content.length; x++) {   // Resets the previous field of view
            for (var y = 0; y < level.content[x].length; y++) {
                if (level.content[x][y][1] == 2) {
                    level.content[x][y][1] = 0;
                }
            }
        }

        for (var i = 0; i < 4; i++) {   // No comments because I cannot really explain how it works, but k is like the angle and a is like the amount before a hop in a direction when a gets bigger or equal to k. k is always increased as well as some direction
            var a = settings.maxRoomSizeY;
            while (a > -settings.maxRoomSizeY) {
                var k = 0;
                currentPos = [player.x, player.y];
                while (level.content[currentPos[0]][currentPos[1]][0] != 1) {
                    k++;

                    switch (i) {
                        case 0:
                            currentPos[1]++;
                            break;
                        case 1:
                            currentPos[0]--;
                            break;
                        case 2:
                            currentPos[1]--;
                            break;
                        case 3:
                            currentPos[0]++;
                            break;
                    }

                    if (a >= 0) {
                        if (k - a >= 0) {
                            k -= a;
                            switch (i) {
                                case 0:
                                    currentPos[0]++;
                                    break;
                                case 1:
                                    currentPos[1]++;
                                    break;
                                case 2:
                                    currentPos[0]--;
                                    break;
                                case 3:
                                    currentPos[1]--;
                                    break;
                            }
                        }
                    } else if (a < 0) {
                        if (k + a >= 0) {
                            k += a;
                            switch (i) {
                                case 0:
                                    currentPos[0]--;
                                    break;
                                case 1:
                                    currentPos[1]--;
                                    break;
                                case 2:
                                    currentPos[0]++;
                                    break;
                                case 3:
                                    currentPos[1]++;
                                    break;
                            }
                        }
                    }

                    if (level.content[currentPos[0]][currentPos[1]][0] == 1 || level.content[currentPos[0]][currentPos[1]][0] == 5) {
                        level.content[currentPos[0]][currentPos[1]][1] = 2;   // Light it up
                        break;
                    } else if (level.content[currentPos[0]][currentPos[1]][0] == 2) {
                        level.content[currentPos[0]][currentPos[1]][1] = 2;   // Light it up
                    }
                }

                if (a > 1 || a <= -1) {
                    a -= settings.fieldOfViewAccuracy;
                } else if (a <= 1) {
                    a = -1;
                }
            }
        }
        level.content[player.x][player.y][1] = 2;   // The player's position
    }

    
    draw() {   // Draws the player in the middle of the canvas
        fill(255, 200, 0);
        rect(player.parallax[0] * settings.zoom, player.parallax[1] * settings.zoom, settings.zoom, settings.zoom);
    }
}