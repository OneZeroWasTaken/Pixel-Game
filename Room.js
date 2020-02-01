class Room {   // Handles room creation and generation
    constructor(x, y, direction, type) {   // X, y and direction of the first door. Type is presets with warying sizes and contents
        this.x = x;   // Entry point coordinates
        this.y = y;
        this.direction = direction;   // 0 = Down and clockwise. Always pointing towards the center of the (next) room and parallell to the direction of the enrty point
        this.type = type;
        
        this.doors = [0, 0, 0, 0];   // Which sides of the room has a door one it. No wall can have two doors. Not for corridors. Start room can have four doors because it has no entry door on a wall
        this.entry = 2;   // Where the door is in relation to the room. 2 is default
        this.error = false;   // If error is true the room will not be placed but destroyed instead
        this.topLeft = [];   // For customized item-placing with lots of control

        if (this.type == "start") {   // For start rooms
            this.x = Math.round(level.width / 2);   // Sets the startpoint at the middle of the array
            this.y = Math.round(level.height / 2);
            
            this.sizeX = rand(6, settings.maxRoomSizeX);
            this.sizeY = rand(6, settings.maxRoomSizeY);

        } else if (this.type == 0) {   // For all other rooms
            this.sizeX = rand(3, settings.maxRoomSizeX);
            this.sizeY = rand(3, settings.maxRoomSizeY);

            this.doors[(this.direction + 2) % 4] = 1;
        }

        currentPos = [this.x, this.y];   // Current Position is set to the entry door

        if (this.type == "start" || this.type == 0) {   // Starts the evaluating of the space. 0 & 2 Clock-wise, 1 & 3 Counter-clockwise
            this.evaluateSpace(this.direction, this.entry);
        }

        // Decides the amount of pillars each room should have
        if (!this.error) {
            if (this.sizeX <= 4 || this.sizeY <= 4) {   // Room too small
                this.pillars = 0;
            } else if (settings.pillarChance[1] > Math.random()) {   // Room with many pillars
                this.pillars = Math.floor(map(this.sizeX * this.sizeY, 9, settings.maxRoomSizeX * settings.maxRoomSizeY, 1, settings.maxPillars[1]))
            } else if (settings.pillarChance[0] > Math.random()) {   // Room with a few pillars
                this.pillars = Math.floor(map(this.sizeX * this.sizeY, 9, settings.maxRoomSizeX * settings.maxRoomSizeY, 1, settings.maxPillars[0]))
            } else {
                this.pillars = 0;
            }
        }
    }


    evaluateSpace(direction, entry) {   // Evaluates if there is enough room to place the room there. Evaluates two opposite walls at the same time, starting with the entry door wall
        if (entry) {   // Creates the first wall and its opposite (entry = first)
            switch (direction) {
                case 0:   // // First wall, direction Down
                    if (this.type == "start") {   // Start room
                        this.entry = rand(2, this.sizeX - 2);   // Makes the start position on a random tile on the first wall and two tiles away from it
                        currentPos[0] += this.entry;
                        currentPos[1] -= 2;
                    } else {   // All other rooms
                        this.entry = rand(1, this.sizeX - 1);   // Makes the entry on a random tile on the first wall
                        currentPos[0] += this.entry; 
                    }
                    this.evaluateSpace(this.direction, false);   // Evaluates space for the two walls parallell to the entry direction
                    if (this.error) {   // If there is an error, do not continue
                        break;
                    }
                    this.evaluateSpace((this.direction + 1) % 4, false);   // Evaluates space for entry wall and its opposite
                    break;
                case 1:   // // First wall, direction Left
                    if (this.type == "start" && entry) {
                        this.entry = rand(2, this.sizeY - 2);
                        currentPos[1] -= this.entry;
                        currentPos[0] += 2;
                    } else {
                    this.entry = rand(1, this.sizeY - 1);
                    currentPos[1] -= this.entry;
                    }
                    this.evaluateSpace(this.direction, false);
                    if (this.error) {
                        break;
                    }
                    this.evaluateSpace((this.direction + 3) % 4, false);
                    break;
                case 2:   // // First wall, direction Up
                    if (this.type == "start" && entry) {
                        this.entry = rand(2, this.sizeX - 2);
                        currentPos[0] -= this.entry;
                        currentPos[1] += 2;
                    } else {
                        this.entry = rand(1, this.sizeX - 1);
                        currentPos[0] -= this.entry;
                    }
                    this.evaluateSpace(this.direction, false);
                    if (this.error) {
                        break;
                    }
                    this.evaluateSpace((this.direction + 1) % 4, false);
                    break;
                case 3:   // // First wall, direction Right
                    if (this.type == "start" && entry) {
                        this.entry = rand(2, this.sizeY - 2);
                        currentPos[1] += this.entry;
                        currentPos[0] -= 2;
                    } else {
                        this.entry = rand(1, this.sizeY - 1);
                        currentPos[1] += this.entry;
                    }
                    this.evaluateSpace(this.direction, false);
                    if (this.error) {
                        break;
                    }
                    this.evaluateSpace((this.direction + 3) % 4, false);
                    break;
            }

            if (!this.error) {   // The room gets placed if there is no error
                this.placeRoom();
            }
        } else {
            switch (direction) {   // Creates the two walls in the same direction as the entry
                case 0:   // // Down
                //console.log("down")
                    if (currentPos[1] + this.sizeY >= level.height || currentPos[0] - this.sizeX <= 0) {   // Checks if there is enough space in the level content array to place the room there
                        this.error = true;
                        this.destroyRoom();
                        break;
                    }
                    for (var i = 0; i < this.sizeY + 1; i++) {
                        if (level.content[currentPos[0]][currentPos[1] + i][0] == 2 || level.content[currentPos[0] - this.sizeX][currentPos[1] + i][0] == 2) {   // If a floor-tile is reached, remove the room
                            this.error = true;
                            this.destroyRoom();
                            if (i > this.sizeY / 2 && this.sizeY > settings.maxRoomSizeY / 2) {   // Try to shrink the room if it is big and it found the floor-tile a large distance from the corner
                                this.shrink();
                            } else {
                                // Make corridor or remove door
                            }
                            break;
                        } /*else if (this.direction % 2 == 1 && i > 3 && (level.content[currentPos[0]][currentPos[1] + i] == 1 || level.content[currentPos[0] - this.sizeX][currentPos[1] + i] == 1)) {   // If it finds a wall, stop
                            if (i < 3) {   // If i is greater than the minimum size, set the size to wwhatever iteration the loop was at, else destroy the room (it was too small)
                                this.error = true;
                                this.destroyRoom();
                            }
                            break;
                        } */else {
                            if (level.content[currentPos[0]][currentPos[1] + i][0] != 5 /*&& level.content[currentPos[0]][currentPos[1] + i] != 1*/) {   // If there is a door there, just skip it
                                level.content[currentPos[0]][currentPos[1] + i][0] = 3;   // If the space is free (not floor-tile or wall) place a ghost tile there
                            }
                            if (level.content[currentPos[0] - this.sizeX][currentPos[1] + i][0] != 5 && level.content[currentPos[0] - this.sizeX][currentPos[1] + i][0] != 1) {
                                level.content[currentPos[0] - this.sizeX][currentPos[1] + i][0] = 3;   // And parallell to it one x/y size away
                            }
                            
                        }
                    }
                    break;

                case 1:   // // Left
                //console.log("left")
                    if (currentPos[0] - this.sizeX <= 0 || currentPos[1] + this.sizeY >= level.height) {
                        this.error = true;
                        this.destroyRoom();
                        break;
                    }
                    for (var i = 0; i < this.sizeX + 1; i++) {
                        if (level.content[currentPos[0] - i][currentPos[1]][0] == 2 || level.content[currentPos[0] - i][currentPos[1] + this.sizeY][0] == 2) {
                            this.error = true;
                            this.destroyRoom();
                            if (i > this.sizeX / 2 && this.sizeX > settings.maxRoomSizeX / 2) {
                                this.shrink();
                            } else {
                                // Make corridor or remove door
                            }
                            break;
                        } /*else if (this.direction % 2 == 0 && i > 3 && (level.content[currentPos[0] - i][currentPos[1]] == 1 || level.content[currentPos[0] - i][currentPos[1] + this.sizeY] == 1)) {
                            if (i < 3) {
                                this.error = true;
                                this.destroyRoom();
                            }
                            break;
                        } */else {
                            if (level.content[currentPos[0] - i][currentPos[1]][0] != 5 /*&& level.content[currentPos[0] - i][currentPos[1]] != 1*/) {
                                level.content[currentPos[0] - i][currentPos[1]][0] = 3;
                            }
                            if (level.content[currentPos[0] - i][currentPos[1] + this.sizeY][0] != 5 && level.content[currentPos[0] - i][currentPos[1] + this.sizeY][0] != 1) {
                                level.content[currentPos[0] - i][currentPos[1] + this.sizeY][0] = 3;
                            }
                            
                        }
                    }
                    break;

                case 2:   // // Up
                //console.log("up")
                    if (currentPos[1] - this.sizeY <= 0 || currentPos[0] + this.sizeX >= level.width) {
                        this.error = true;
                        this.destroyRoom();
                        break;
                    }
                    for (var i = 0; i < this.sizeY + 1; i++) {
                        if (level.content[currentPos[0]][currentPos[1] - i][0] == 2 || level.content[currentPos[0] + this.sizeX][currentPos[1] - i][0] == 2) {
                            this.error = true;
                            this.destroyRoom();
                            if (i > this.sizeY / 2 && this.sizeY > settings.maxRoomSizeY / 2) {
                                this.shrink();
                            } else {
                                // Make corridor or remove door
                            }
                            break;
                        } /*else if (this.direction % 2 == 1 && i > 3 && (level.content[currentPos[0]][currentPos[1] - i] == 1 || level.content[currentPos[0] + this.sizeX][currentPos[1] - i] == 1)) {
                            if (i < 3) {
                                this.error = true;
                                this.destroyRoom();
                            }
                            break;
                        } */else {
                            if (level.content[currentPos[0]][currentPos[1] - i][0] != 5 /*&& level.content[currentPos[0]][currentPos[1] - i] != 1*/) {
                                level.content[currentPos[0]][currentPos[1] - i][0] = 3;
                            }
                            if (level.content[currentPos[0] + this.sizeX][currentPos[1] - i][0] != 5 && level.content[currentPos[0] + this.sizeX][currentPos[1] - i][0] != 1) {
                                level.content[currentPos[0] + this.sizeX][currentPos[1] - i][0] = 3;
                            }
                            
                        }
                    }
                    break;

                case 3:   // // Right
                //console.log("right")
                    if (currentPos[0] + this.sizeX >= level.width || currentPos[1] - this.sizeY <= 0) {
                        this.error = true;
                        this.destroyRoom();
                        break;
                    }
                    for (var i = 0; i < this.sizeX + 1; i++) {
                        if (level.content[currentPos[0] + i][currentPos[1]][0] == 2 || level.content[currentPos[0] + i][currentPos[1] - this.sizeY][0] == 2) {
                            this.error = true;
                            this.destroyRoom();
                            if (i > this.sizeX / 2 && this.sizeX > settings.maxRoomSizeX / 2) {
                                this.shrink();
                            } else {
                                // Make corridor or remove door
                            }
                            break;
                        } /*else if (this.direction % 2 == 0 && i > 3 && (level.content[currentPos[0] + i][currentPos[1]] == 1 || level.content[currentPos[0] + i][currentPos[1] - this.sizeY] == 1)) {
                            if (i < 3) {
                                this.error = true;
                                this.destroyRoom();
                            }
                            break;
                        } */else {
                            if (level.content[currentPos[0] + i][currentPos[1]][0] != 5 /*&& level.content[currentPos[0] + i][currentPos[1]] != 1*/) {
                                level.content[currentPos[0] + i][currentPos[1]][0] = 3;
                            }
                            if (level.content[currentPos[0] + i][currentPos[1] - this.sizeY][0] != 5 && level.content[currentPos[0] + i][currentPos[1] - this.sizeY][0] != 1) {
                                level.content[currentPos[0] + i][currentPos[1] - this.sizeY][0] = 3; 
                            }
                            
                        }
                    }
                    break;
            }
        }
    }




    placeRoom() {   // Fills the room with a "floor" [2] and places "real" walls instead of ghost walls
        Loop1:
        for (var x = 0; x < level.content.length; x++) {   // Finds the top-left-most corner of the outlined room
            for (var y = 0; y < level.content[x].length; y++) {
                if (level.content[x][y][0] == 3) {
                    this.topLeft = [x, y];
                    break Loop1;   // Breaks both for-loops
                }
            }
        }

        for (var xi = 1; xi < this.sizeX; xi++) {   // Places the floor inside the walls
            for (var yi = 1; yi < this.sizeY; yi++) {
                level.content[this.topLeft[0] + xi][this.topLeft[1] + yi][0] = 2;
            }
        }

        for (var x = 0; x < level.content.length; x++) {   // Replaces every ghost wall in the level content with a real wall
            for (var y = 0; y < level.content[x].length; y++) {
                if (level.content[x][y][0] == 3) {
                    level.content[x][y][0] = 1;
                }
            }
        }
    }
    
    shrink() {
        this.error = true;   // Temporary
        this.destroyRoom();
    }
    
    destroyRoom() {
        //console.log("destroying room")
        
        for (var x = level.content.length - 1; x > 0; x--) {   // Replaces all ghost walls with illusion walls
            for (var y = level.content[x].length - 1; y > 0; y--) {
                if (level.content[x][y][0] == 3) {
                    level.content[x][y][0] = 4;
                }
            }
        }


        level.content[this.x][this.y][0] = 1;   // Removes the door 
        level.doors++;   // Adds a door
    }


    placeDoor() {   // Finds a random wall and places a door somewhere on it
        if (this.doors.toString() == [1, 1, 1, 1].toString()) {   // If the room has doors on all its walls, return
            //console.log("no walls avaliable")
            return false;
        }

        currentPos = [this.x, this.y];   // Updates currentPos
        
        switch (this.direction) {   // Places currentPos on the next corner clockwise from the entry
            case 0:
                currentPos[0] += this.entry;
                if (this.type == "start") {
                    currentPos[1] -= 2;
                }
                break;
            case 1:
                currentPos[1] += this.sizeY - this.entry;
                if (this.type == "start") {
                    currentPos[0] += 2;
                }
                break;
            case 2:
                currentPos[0] -= this.entry;
                if (this.type == "start") {
                    currentPos[1] += 2;
                }
                break;
            case 3:
                currentPos[1] -= this.sizeY - this.entry;
                if (this.type == "start") {
                    currentPos[0] -= 2;
                }
                break;
        }

        do {   // Finds a random side that has no door
            if (this.type == "start") {
                var side = rand(0, 3);   // Chooses one of four sides to place the door on
                if (this.doors[(this.direction + side + 3) % 4] == 0) {   // If choosen side has no door, break
                    break;
                }
            } else if (this.type == 0) {   // Chooses one of three sides to place the door on if it is not a start room
                var side = rand(0, 2);
                if (this.doors[(this.direction + side + 3) % 4] == 0) {
                    break;
                }
            }
        } while (this.doors[(this.direction + side + 3) % 4] == 1);

        for (var i = 0; i < side; i++) {   // Moves currenPos to the [side] ammounts of corners away from the previous position clockwise. 0 does nothing while 3 moves it to the same wall as the entry wall (only supported in start rooms)
            switch ((this.direction + i + 3) % 4) {
                case 0:
                    currentPos[0] -= this.sizeX;
                    break;
                case 1:
                    currentPos[1] -= this.sizeY;
                    break;
                case 2:
                    currentPos[0] += this.sizeX;
                    break;
                case 3:
                    currentPos[1] += this.sizeY;
                    break;
            }
        }

        if ((this.direction + side) % 4 == 0) {   // Decides where on the decided wall the door will be
            currentPos[1] += rand(1, this.sizeY - 1);
        } else if ((this.direction + side) % 4 == 1) {
            currentPos[0] -= rand(1, this.sizeX - 1);
        } else if ((this.direction + side) % 4 == 2) {
            currentPos[1] -= rand(1, this.sizeY - 1);
        } else if ((this.direction + side) % 4 == 3) {
            currentPos[0] += rand(1, this.sizeX - 1);
        }

        if (currentPos[0] <= 0 || currentPos[0] >= level.width || currentPos[1] <= 0 || currentPos[1] >= level.height) {   // Checks if currentPos is inside the level array
            //console.log("door is outside the thing")
            return false;
        }
        if (level.content[currentPos[0]][currentPos[1]][0] != 1) {   // CurrentPos has to be a wall to continue
            //console.log("door was almost placed wrong")
            return false;
        }

        level.doors--;   // Removes a door from the total
        this.doors[(this.direction + side + 3) % 4] = 1;   // Updates the array that holds which sides of the room has doors
        level.content[currentPos[0]][currentPos[1]][0] = 5;   // Places the door [5] in the level content array
        level.doorCoordinates.push(currentPos[0], currentPos[1], (this.direction + side + 3) % 4);   // Adds [x, y, direction] to the list of rooms to be added (where direction is (this.direction + side + 3) % 4)

        return true;
    }
}