class Item {
    constructor(id, /*x, y,*/ data) {   // Data contains information like what armor or weapon
        this.depth = level.depth;   // For rendering on the right floor (might not be needed if I do not create a new content array every floor)
        //this.x = x;
        //this.y = y;
        this.id = id;
        this.sprite = sprite[this.id];
        this.name = name;   // Name of the item
        this.text = text;   // Description that tells you about the item

        this.quantity = 1;   // Random amounts of gold
        this.stackable = true;
        this.consumable = true;
        this.equipable = false;


        if (false) {   // Weapons
            this.damage = damage;
            this.attackSpeed = attackSpeed;
            this.penetration = penetration;   // Ranged and spear weapons have good penetration but less damage
            this.weight = weight;   // A specific strength is needed for you to handle the weapon correctly
            this.accuracy = accuracy;   // % Chance of hitting target

            this.enchantment1 = this.enchant(player.level);
            this.enchantment2 = this.enchant(player.level);

        } else if (false) {   // Armor
            this.defence = defence;   // General defence
            this.absorption = absorption;   // Damage absorption from penetration-heavy weapons

        } else if (false) {   // Rings
            this.enchantment1 = enchant(Math.ceil(player.level * settings.ringPower));
        }



        if (this.equipable) {
            this.durability = 100;
            
            this.enchant(2);
        }
    }

    enchant(power) {   // Puts an enchantment on weapons, armors and rings

    }
}