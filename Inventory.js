class Inventory {
    constructor() {
        this.size = settings.inventorySize;
        this.content = [];
        this.open = false;

        //this.armorSlot = new Armor();
        this.quickSlot0 = null;
        this.quickSlot1 = null;
        this.quickSlot2 = null;
        this.quickSlot3 = null;
        //this.ringSlot = null;

        this._setup();
    }
    
    _setup() {   // Sets up an empty inventory
        for (var i = 0; i < this.size; i++) {
            this.content[i] = [null, 1];   // What kind of item, quantity
        }
    }

    addItem(id) {   // Tries to place an item in the inventory
        for (var i = 0; i < this.size; i++) {
            if (this.content[i][0] === id) {   // If the exact item is alreaady in the inventory, just increase the quantity
                this.content[i][1]++;
                return true;
            } else if (this.content[i][0] == null) {   // Else add it to the inventory
                this.content[i][0] = id;
                console.log(this.content)
                return true;
            }
        }
        return false;   // Inventory full
    }

    draw() {   // Draws the inventory
        fill(100);
        rect(settings.canvasWidth * 0.2, settings.canvasHeight * 0.15, settings.canvasWidth * 0.6, settings.canvasHeight * 0.7);

        for (var x = 0; x < Math.ceil(sqrt(this.size)); x++) {
            for (var y = 0; y < Math.ceil(sqrt(this.size)); y++) {
                if (x + y < this.size) {
                    break;
                }
                // Draw content[x + y * Math.ceil(sqrt(this.size))].sprite at x and y
            }
        }
        console.log(this.content);
    }
}