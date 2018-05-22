//Inventory UI constructor
function InventoryUI(game, x, y, key, frame){
    //Call to Phaser.Sprite(game, x, y, key, frame)
    Phaser.Sprite.call(this, game, x, y, key, frame);
    
    this.textStyle = {font: "16px Arial", fill: "#FFF"};
    this.tileName = ["Grass", "Sand", "Stone", "Water", "Bridge"];
    
    this.scale.x = 1.7;
    
    //TODO should be image-based instead of text-based
    this.itemsText = game.add.text(x + 4, y + 4, "", this.textStyle);
}

InventoryUI.prototype = Object.create(Phaser.Sprite.prototype);
InventoryUI.prototype.constructor = InventoryUI;

InventoryUI.prototype.updateDisplay = function(inventory){
    let tempText = "";
    for(let i = 0; i < inventory.length; i++){
        if(inventory[i] > 0){
            //this.items.push([this.tileName[i] + ": x" + inventory[i]]);
            tempText += this.tileName[i] + " x" + inventory[i] + "\n";
        }
    }
    this.itemsText.text = tempText;
};