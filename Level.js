class Level {
    constructor(depth) {
        this.depth = depth;
        this.content = [];   // Holds all map information
        this.width = settings.levelWidth;   // Number of tiles
        this.height = settings.levelHeight;
        this.effectiveSize = [0, 0, this.width, this.height];   // The coordinate where the effective size starts, the number of tiles [x, y, x2, y2]. This exists because it will increase preformance when drawing

        this.doors = settings.doors;   // The number of doors on the level
        this.rooms = [];   // Holds the room objects
        this.doorCoordinates = []   // Future room positions

        this.itemCount = 0;
        this.minItems = Math.floor(this.doors * 0.75);
        this.foodChance = 1.1;
    }

    generate() {   // Generates the level layout
        // Fills the level array with zeros
        for (var x = 0; x < this.width; x++) {
            this.content[x] = [];
            for (var y = 0; y < this.height; y++) {
                this.content[x][y] = [0, 0];   // [Tile id, lighting id]
            }
        }

        this.rooms[0] = new Room(0, 0, rand(0, 3), "start");   // Creates a start room
        this.content[this.rooms[0].x][this.rooms[0].y][0] = 6;   // Places the entry point tile

        // Generates rooms and places doors om vart annat
        var n = 0;   // Infinite loop prevention (very small chance but will eventually happen)
        while (this.doors) {
            if (this.doorCoordinates.length == 3) {   // If there is already a door, place a room there
                this.rooms.push(new Room(this.doorCoordinates[0], this.doorCoordinates[1], this.doorCoordinates[2], 0));
                this.doorCoordinates.splice(0, 3);
            } else {   // Else, place a door
                if (this.rooms[this.rooms.length - 1].error) {   // But first, check if the placed room was faulty, if yes remove it from the room array
                    this.rooms.splice(this.rooms.length - 1, 1);
                }
                do {
                    this.rooms[rand(0, this.rooms.length - 1)].placeDoor();
                    if (this.doorCoordinates.length == 3) {
                        break;
                    }
                    n++;
                } while (n < settings.maxIterations);
            }
            n++;
            if (n > settings.maxIterations) {
                console.log("Infinite loop prevented");
                break;
            }
        }
        this.rooms.push(new Room(this.doorCoordinates[0], this.doorCoordinates[1], this.doorCoordinates[2], 0));   // Places the last room on the last door
        this.doorCoordinates.splice(0, 3);
        if (this.rooms[this.rooms.length - 1].error) {   // Checks if the last room was faulty
            this.rooms.splice(level.rooms.length - 1, 1);
        }

        // Level generation clean up
        for (var x = 1; x < this.content.length - 1; x++) {
            for (var y = 1; y < this.content[x].length - 1; y++) {
                if (this.content[x][y][0] == 4) {   // Replaces all illution walls with normal
                    this.content[x][y][0] = 1;
                }
                if (this.content[x][y][0] == 1) {   // Removes all walls not connected to either a floor tile or door
                    var floor = false;
                    if (this.content[x - 1][y][0] == 2 || this.content[x - 1][y][0] == 5) {
                        floor = true;
                    } else if (this.content[x][y - 1][0] == 2 || this.content[x][y - 1][0] == 5) {
                        floor = true;
                    } else if (this.content[x + 1][y][0] == 2 || this.content[x + 1][y][0] == 5) {
                        floor = true;
                    } else if (this.content[x][y + 1][0] == 2 || this.content[x][y + 1][0] == 5) {
                        floor = true;
                    } else if (this.content[x - 1][y - 1][0] == 2) {   // If a wall has a floor-tile diagonal to it, keep it
                        floor = true;
                    } else if (this.content[x + 1][y - 1][0] == 2) {
                        floor = true;
                    } else if (this.content[x + 1][y + 1][0] == 2) {
                        floor = true;
                    } else if (this.content[x - 1][y + 1][0] == 2) {
                        floor = true;
                    }
                    if (!floor) {
                        this.content[x][y][0] = 0;
                    }
                }
            }
        }

        // Finds a suitable room and tile for the exit
        var i = 1;
        do {
            var end = this.rooms.length - i;   // Room id
            do {
                var distanceX = rand(2, this.rooms[end].sizeX - 2);
                var distanceY = rand(2, this.rooms[end].sizeX - 2);
            } while (this.content[this.rooms[end].topLeft[0] + distanceX][this.rooms[end].topLeft[1] + distanceY][0] != 2);   // Saftey precaution: Has to be a floor tile
            var endDistance = findPath([this.rooms[end].topLeft[0] + distanceX, this.rooms[end].topLeft[1] + distanceY], [this.rooms[0].x, this.rooms[1].y]);
            i++;
        } while (this.rooms[end].sizeX > 4 && this.rooms[end].sizeY > 4 && endDistance.length > settings.maxRoomSizeX + settings.maxRoomSizeY);   // The distance must be > 2 max room sizes away
        this.content[this.rooms[end].topLeft[0] + distanceX][this.rooms[end].topLeft[1] + distanceY][0] = 7;   // Places the exit
        

        this._decorate();
        settings.setEffectiveSize();
    }

    _decorate() {
        // Places pillars
        for (var i = 0; i < this.rooms.length; i++) {
            while (this.rooms[i].pillars) {
                do {   // Find a random position to place the pillar at least one block away from the wall
                    var distanceX = rand(2, this.rooms[i].sizeX - 2);
                    var distanceY = rand(2, this.rooms[i].sizeY - 2);
                } while (level.content[this.rooms[i].topLeft[0] + distanceX][this.rooms[i].topLeft[1] + distanceY][0] != 2);   // Tile has to be a floor tile

                this.content[this.rooms[i].topLeft[0] + distanceX][this.rooms[i].topLeft[1] + distanceY][0] = 1;
                this.rooms[i].pillars--;
            }
        } 


        // Places items on the level
        for (var i = 0; i < this.rooms.length; i++) {   // Start room has no items
            this._placeItem(i);
        }
        
        while (this.itemCount < this.minItems) {
            this._placeItem(rand(1, this.rooms.length - 1));

        }
        console.log("Items placed: " + this.itemCount);
    }

    // The following beautiful piece of code places random items in random rooms at random coordinates
    _placeItem(i) {
        if (this.rooms[i].type == 0) {
            var chance = map(this.rooms[i].sizeX * this.rooms[i].sizeY, 9, settings.maxRoomSizeX * settings.maxRoomSizeY, 0.3, 0.05);   // % Chance of there being an item in that room. Gets higher every time it fails and lower when it succeeds

            var iterations = 0;
            for (var k = 0; k < 4; k++) {   // Tries to place an item 4 - number of doors the room has
                if (this.rooms[i].doors[k] == 0) {
                    iterations++;
                }
            }
            for (var j = 0; j < iterations; j++) {   // Try to place an item 4 - number of doors times

                if (chance > Math.random() || (iterations == 3 && j == 0)) {   // If [Chance] is greater than Math.random() place item. Or guaranteed the first iteration for a dead-end room
                    chance *= map(this.rooms[i].sizeX * this.rooms[i].sizeY, 9, settings.maxRoomSizeX * settings.maxRoomSizeY, 0.10, 0.25);   // Decrease chace
                    
                    var item = rand(100, 150);   // Randomize an item and so on

                    do {   // Find a random position to place the item
                        var distanceX = rand(1, this.rooms[i].sizeX - 1);
                        var distanceY = rand(1, this.rooms[i].sizeY - 1);
                    } while (level.content[this.rooms[i].topLeft[0] + distanceX][this.rooms[i].topLeft[1] + distanceY][0] != 2);

                    this.content[this.rooms[i].topLeft[0] + distanceX][this.rooms[i].topLeft[1] + distanceY].push(new Item(item));   // Push a new item in the level content array
                    this.itemCount++;

                } else {   // No item: Increase chance
                    chance *= map(this.rooms[i].sizeX * this.rooms[i].sizeY, 9, settings.maxRoomSizeX * settings.maxRoomSizeY, 1.05, 1.3);
                }
            }
        }
    }

    spawn(x, y, mob) {
        mob.push(new Mob(x, y, mob));
        console.log(mob)
    }



    draw() {   // Draws the map and all its content as it is stored in the level content array
        player.fieldOfView();   // Update the players field of view
        background(0);

        var parallaxX = player.x - player.parallax[0];
        var parallaxY = player.y - player.parallax[1];

        for (var x = Math.floor(parallaxX); x < Math.ceil(player.x + player.parallax[0] + 1); x++) {
            for (var y = Math.floor(parallaxY); y < Math.ceil(player.y + player.parallax[1] + 1); y++) {
                if (x < this.effectiveSize[0] || x > this.effectiveSize[2] || y < this.effectiveSize[1] || y > this.effectiveSize[3]) {   // Makes sure nothing is drawn when it does not have to be drawn
                    continue;
                }

                if (this.content[x][y][1] == 0) {   // If the tile has not been explored, do not show it
                    continue;
                }

                switch (this.content[x][y][0]) {   // Switch what type of tile it is (to be displayed)
                    case 1:   // Wall
                        switch (this.content[x][y][1]) {   // Switch what kind of lighting on the tile there is. - Yoda
                            case 1:   // Seen previously
                                
                                break;
                            case 2:   // Currently seeing
                                settings.ctx.drawImage(sprite[0], (x - parallaxX) * settings.zoom, (y - parallaxY) * settings.zoom, settings.zoom, settings.zoom);
                                break;
                        }
                        break;

                    case 2:   // Floor
                        switch (this.content[x][y][1]) {
                            case 1:   // Seen previously
                                
                                break;
                            case 2:   // Currently seeing
                                settings.ctx.drawImage(sprite[1], (x - parallaxX) * settings.zoom, (y - parallaxY) * settings.zoom, settings.zoom, settings.zoom);
                                break;
                        }
                        break;

                    case 5:   // Door
                        switch (this.content[x][y][1]) {
                            case 1:   // Seen previously
                                
                                break;
                            case 2:   // Currently seeing
                                settings.ctx.drawImage(sprite[2], (x - parallaxX) * settings.zoom, (y - parallaxY) * settings.zoom, settings.zoom, settings.zoom);
                                break;
                        }
                        break;
                    case 0:   // 

                        break;
                }



                if (level.content[x][y][2] != undefined) {   // Item testing drawing
                    fill(255, 0, 255);
                    rect((x - parallaxX) * settings.zoom, (y - parallaxY) * settings.zoom, settings.zoom, settings.zoom);
                }
            }
        }

        for (var i = 0; i < mob.length; i++) {   // Draws all mobs
            fill(30, 100, 50);
            rect((mob[i].x - parallaxX) * settings.zoom, (mob[i].y - parallaxY) * settings.zoom, settings.zoom, settings.zoom);
        }

        player.draw();
    }
}

/*if (this.content[x][y][0] == 1) {
    settings.ctx.drawImage(sprite[0], (x - parallaxX) * settings.zoom, (y - parallaxY) * settings.zoom, settings.zoom, settings.zoom);   // Wall
} else if (this.content[x][y][0] == 2) {
    settings.ctx.drawImage(sprite[1], (x - parallaxX) * settings.zoom, (y - parallaxY) * settings.zoom, settings.zoom, settings.zoom);   // Floor
} else if (this.content[x][y][0] == 3) {   // Ghost Wall - Outlines a room before it is placed
    fill(120, 0, 120);
} else if (this.content[x][y][0] == 4) {   // Illution wall - Looks and acts like a wall but will not interfear with anything when generating. Will be turned to [1] at the end
    fill(100);
} else if (this.content[x][y][0] == 5) {   // Door
    fill(0, 255, 0);
    rect((x - parallaxX) * settings.zoom, (y - parallaxY) * settings.zoom, settings.zoom, settings.zoom);
} else if (this.content[x][y][0] == 6) {   // Entry
    fill(150);
} else if (this.content[x][y][0] == 7) {   // Exit
    fill(80);
} else {   // Other
    fill(0);
    rect((x - parallaxX) * settings.zoom, (y - parallaxY) * settings.zoom, settings.zoom, settings.zoom);
}*/