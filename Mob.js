class Mob {
    constructor(x, y, type) {
        // Things that decide everything else
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = level;   // Calculated from the level depth value
        
        // Mob turn stuff
        this.walkSpeed = 1.00;
        this.walkSkip = false;
        this.attackSpeed = 2.00;
        this.attackSkip = false;
        this.turns = Math.floor(this.walkSpeed);   // How many turns the mob has. Gets reset every complete turn

        // Mob stats and buffs
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.heal = 4;
        this.buffs = [];
        this.immunity = [];   // If a mob is immune to some buff
        this.strength = 1;

        this.attackDamage = 1;   // Might be removed depending if they have a real weapon or not
        this.dodge = 0.2;
        this.accuracy = 0.5;
        this.defence = 0;
        this.criticalStrike = 0.03;
        
        // States, AI and other information
        this.AI = "fighter";   // Ranger, thief, magician, roaming, avoiding, rusher, statue, rook
        this.path = [];
        this.lastSeen = [];   // The last known position of the player
        this.turnsSinceLastSeen;   // For going back to sleep and yea
        this.friendly = false;
        this.dormant = true;
        this.sleepIntensity = rand(1, 5);   // How easy the mob wakes up. Bigger number equals more intense sleep
        this.aggression = rand(1, 5);   // 1: Loose interest right away (wander). 2: Go to last seen, then wander. 3 to 5: Go to last seen, then to the nearest door, then wander

        // Equipment
        this.weapon = null;
        this.armor = null;

        // Upon death
        this.drops = [];
        this.dropChance = [];
        this.experience = 100;
    }


    update() {   // Decides what the mob should do (attack, move, idle) and returns it to the turnHandler function
        console.log(this.path)
        if (this.AI == "fighter") {   // Fighter AI, 3 scenarios that decides how the mob reacts:
/* 1 */     if (!this.dormant && level.content[this.x][this.y][1] == 2) {   // 1 - If the mob (is awake and) is in line of sight to the player
                
                this.path = findPath([this.x, this.y], [player.x, player.y]);   // Update the path and lastSeen
                this.lastSeen = [player.x, player.y];
                this.timeSinceLastSeen = 0;

                if (this.path.length == 1) {   // If the mob is next to the player, attack
                    if (this.attack("player")) {
                        return "move";
                    }
                } else if (this.path.length > 1) {   // Else, move closer
                    if (this.move(this.path[0])) {
                        return "move";
                    }
                }

/* 2 */     } else if (this.dormant) {   // 2 - If the mob is sleeping, decide if it should wake up
                if (findPath([this.x, this.y], [player.x, player.y]).length <= Math.ceil(Math.pow(this.sleepIntensity, -0.04) * 100 - 92)) {
                    this.dormant = false;
                    return "idle";
                }

/* 3 */     } else {   //  3 - If the mob does not see the player (and awake)
                this.timeSinceLastSeen++;

                if (this.timeSinceLastSeen == 1 && this.lastSeen != undefined) {   // Right when the mob loses sight of the player:
                    this.path = findPath([this.x, this.y], [this.lastSeen[0], this.lastSeen[1]]);   // Store the path to the spot the player was last seen at and walk there
                }

                if (this.path.length > 0 && this.aggression >= 2) {   // Walk to lastSeen if it has a path
                    if (this.move(this.path[0])) {
                        return "move";
                    }
                } else if (this.path.length == 0 && this.aggression >= 3) {   // Go to the nearest door
                    this.path = findPath([this.x, this.y], [player.x, player.y], "door");
                }




                    /*if (this.timeSinceLastSeen % 2 == 1) {   // Every other turn move
                    if (this.move(this.path[0])) {
                        return "move";
                    }
                    
                } else {

                    if (this.sleepIntensity > 3) {   // If sleep intensity is less than 3, never go back to sleep
                        if (this.timeSinceLastSeen > settings.sleepConstant - this.sleepIntensity) {   // Check if the mob should go back to sleep
                            this.dormant = true;
                            this.path = [];
                            this.lastSeen = [];
                            this.timeSinceLastSeen = 0;

                            return "idle";
                        }
                    }
                }
                var direction = rand(0, 3);   // Wander

                if (this.move(direction)) {
                    return "move";
                }*/
            }
            return "idle";
        }
    }

    move(direction) {   // Moves the mob in the given direction
        switch (direction) {   // Handles not going into walls or simillar
            case 0:
                if (level.content[this.x][this.y + 1][0] != 1) {
                    this.y++;
                    return true;
                }
                break;
            case 1:
                if (level.content[this.x - 1][this.y][0] != 1) {
                    this.x--;
                    return true;
                }
                break;
            case 2:
                if (level.content[this.x][this.y - 1][0] != 1) {
                    this.y--;
                    return true;
                }
                break;
            case 3:
                if (level.content[this.x + 1][this.y][0] != 1) {
                    this.x++;
                    return true;
                }
                break;
        }
        return false;
    }

    attack(target) {

    }
}