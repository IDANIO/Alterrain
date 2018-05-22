//Inventory UI constructor
function InventoryUI(game, x, y, key, frame){
    //Call to Phaser.Sprite(game, x, y, key, frame)
    Phaser.Sprite.call(this, game, x, y, key, frame);
    
    //this.textStyle = {font: "16px Arial", fill: "#FFF"};
    this.tileName = ["Grass", "Sand", "Stone", "Water", "Bridge"];
    
    this.stringMargin = 36;
    this.countOffsetX = 50;
    this.countOffsetY = 14;
    
    //this.itemsText = game.add.text(x + 4, y + 4, "", this.textStyle);
    //this.itemsText = game.add.bitmapText(x + 50, y + 14, "m5x7", "", 32);
    this.itemsText = [];
    for(let i = 0; i < 9; i++){
        this.itemsText[i] = game.add.bitmapText(x + (i * this.stringMargin) + this.countOffsetX, y + this.countOffsetY, "m5x7", "0", 32);
    }
}

InventoryUI.prototype = Object.create(Phaser.Sprite.prototype);
InventoryUI.prototype.constructor = InventoryUI;

InventoryUI.prototype.updateDisplay = function(inventory){
    let tempText = "";
    for(let i = 0; i < inventory.length; i++){
        this.itemsText[i].text = inventory[i];
        //if(inventory[i] > 0){
            //this.items.push([this.tileName[i] + ": x" + inventory[i]]);
            //tempText += this.tileName[i] + " x" + inventory[i] + "\n";
            //tempText += inventory[i] + this.stringMargin;
        //}
    }
    //this.itemsText.text = tempText;
};