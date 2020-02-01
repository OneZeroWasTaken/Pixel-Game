class Config {
    constructor() {
        // Technical Stuff
        this.ctx;
        this.canvasWidth = Math.round(window.innerWidth * 0.95);
        this.canvasHeight = Math.round(window.innerHeight * 0.95);
        this.time = 0;                    // Global time. Note: Not total passed time, but will always increase with 1, 30 times / second

        // Technical Settings
        this.zoom = 30;                    // Default zoom. Tile length when drawing
        this.scrollSpeed = 0.1;            // How quickly you will zoom in and out. Less is slower
        this.walkSpeed = 8;                // Amount of frames between each player-move when holding a key down
        this.fieldOfViewAccuracy = 0.1;    // The smaller the number, the more iterations which yeilds better field of view accuracy at larger distances but lowered preformance
        this.maxIterations = 1000;         // To prevent infinite loops when generating the level

        // Level Settings
        this.levelWidth = 70;
        this.levelHeight = 70;
        this.maxRoomSizeX = 11;
        this.maxRoomSizeY = 11;
        this.inventorySize = 20;

        // Gameplay Settings
        this.movesPerTurn = 2.05           // How many turns the player should have each turn where one turn is one move in a direction
        this.doors = 15;
        this.ringPower = 1.25;             // The power-level of rings were 1 is no added power
        this.pillarChance = [0.3, 0.08];   // Chance of a room having a pillar, chance of a room being a pillar room with many pillars
        this.maxPillars = [3, 15];         // Maximum amount of pillars for a normal room, many-pillar room
        this.sleepConstant = 20;           // How quickly mobs will fall asleep after losing their target

        // Load the sprites
        this._loadSprites();
        this._randomizeSprites();   // Gives potions and muchrooms random sprites
    }
    

    setEffectiveSize() {   // Makes the "area" of the level content array just big enough to fit everything inside, effectively increasing preformance when drawingss
        One:
        for (var x = 0; x < level.width; x++) {   // Finds the Left-most tile to be displayed
            for (var y = 0; y < level.height; y++) {
                if (level.content[x][y][0] != 0) {
                    level.effectiveSize[0] = x;
                    break One;
                }
            }
        }
        Two:
        for (var y = 0; y < level.width; y++) {   // Top-most
            for (var x = 0; x < level.height; x++) {
                if (level.content[x][y][0] != 0) {
                    level.effectiveSize[1] = y;
                    break Two;
                }
            }
        }
        Three:
        for (var x = level.width - 1; x >= 0; x--) {   // Right-most
            for (var y = level.height - 1; y >= 0; y--) {
                if (level.content[x][y][0] != 0) {
                    level.effectiveSize[2] = x;
                    break Three;
                }
            }
        }
        Four:
        for (var y = level.height - 1; y >= 0; y--) {   // Bottom-most
            for (var x = level.width - 1; x >= 0; x--) {
                if (level.content[x][y][0] != 0) {
                    level.effectiveSize[3] = y;
                    break Four;
                }
            }
        }
    }


    _randomizeSprites() {
        this.potionSprite = [];   // Stores which potion id has what sprite id

        // Colors: Red, Orange, Yellow, Lime, Green, Cyan, Light Blue, Deep Blue, Purple, Violet, Pink, White, Black, Wine Red, Dark Gray, Glowing, Mint, Brown
        var table = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19];   // What sprite id's has not yet been taken, one is always left behind and I do not know why. Example table[0] == red

        while (table.length) {
            var i = rand(0, table.length - 1);
            this.potionSprite.push(table[i]);
            table.splice(i, 1);
        }
    }

    _loadSprites() {
        var n = 3;   // The number of sprites
        for (var i = 0; i < n; i++) {
            sprite[i] = new Image();
        }
        
        sprite[0].src = "Sprites/Wall-2.png";//"https://imgur.com/Rj7tyt3.png";   // Wall
        sprite[1].src = "Sprites/Floor-2.png";//"https://imgur.com/lKQeeX5.png";   // Floor
        sprite[2].src = "Sprites/Door.png";   // Door
        //sprite[3].src = "link";   // 
        //sprite[4].src = "link";   // 
        //sprite[5].src = "link";   // 
        //sprite[6].src = "link";   // 
        //sprite[7].src = "link";   // 
        //sprite[8].src = "link";   // 
        //sprite[9].src = "link";   // 
        //sprite[10].src = "link";   // 
        //sprite[11].src = "link";   // 
        //sprite[12].src = "link";   // 
        //sprite[13].src = "link";   // 
        //sprite[14].src = "link";   // 
        //sprite[15].src = "link";   // 
        //sprite[16].src = "link";   // 
    }
}
