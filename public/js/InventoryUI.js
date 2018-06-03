//Inventory UI constructor
function InventoryUI(game, x, y, key, frame){
    //Call to Phaser.Sprite(game, x, y, key, frame)
    Phaser.Sprite.call(this, game, x, y, key, frame);
    
    //this.textStyle = {font: "16px Arial", fill: "#FFF"};
    this.tileName = ["Grass", "Sand", "Stone", "Water", "Bridge", "Forest", "Snow", "Desert", "Ice"];
    
    //Specific index of each tile in the inventory
    this.GRASS_TILE = 0;
    this.SAND_TILE = 1;
    this.STONE_TILE = 2;
    this.BRIDGE_TILE = 3;
    
    this.hexRed = 0xffa214;
    this.hexGray = 0xb4b4b4;
    this.hexWhite = 0xffffff;
    
    this.stringMargin = 36;
    this.countOffsetX = 58;
    this.countOffsetY = 39;
    this.highlightOffsetX = 37;
    this.highlightOffsetY = 16;
    this.numbersOffsetX = 52;
    this.numbersOffsetY = 6;
    
    this.highlightUI = game.add.sprite(x + this.highlightOffsetX, y + this.highlightOffsetY, "highlightUI");
    
    //this.itemsText = game.add.text(x + 4, y + 4, "", this.textStyle);
    //this.itemsText = game.add.bitmapText(x + 50, y + 14, "m5x7", "", 32);
    this.itemsText = [];
    for(let i = 0; i < 9; i++){
        this.itemsText[i] = game.add.bitmapText(x + (i * this.stringMargin) + this.countOffsetX, y + this.countOffsetY, "m5x7", "0", 21);
    }
    
    this.numbersText = [];
    for(let i = 0; i < 9; i++){
        this.numbersText[i] = game.add.bitmapText(x + (i * this.stringMargin) + this.numbersOffsetX, y + this.numbersOffsetY, "m5x7", (i + 1) + "", 21);
    }
    
    for(let index = 0; index < this.numbersText.length; index++){
        let i = index;
        if(i > 3){
            i = index - 1;
        }
        if(this.itemsText[i].text == "64"){
            this.itemsText[i].tint = this.hexRed; //red
        }
        else if(this.itemsText[i].text == "0"){
            this.itemsText[i].tint = this.hexGray; //gray
        }
        else{
            this.itemsText[i].tint = this.hexWhite; //white
        }
    }
}

InventoryUI.prototype = Object.create(Phaser.Sprite.prototype);
InventoryUI.prototype.constructor = InventoryUI;

InventoryUI.prototype.updateHighlight = function(index){
    this.highlightUI.x = this.x + (index * this.stringMargin) + this.highlightOffsetX;
};

InventoryUI.prototype.updateCountColor = function(){
    for(let index = 0; index < this.numbersText.length; index++){
        let i = index;
        if(i > 3){
            i = index - 1;
        }
        if(this.itemsText[i].text == "64"){
            this.itemsText[i].tint = this.hexRed; //red
        }
        else if(this.itemsText[i].text == "0"){
            this.itemsText[i].tint = this.hexGray; //gray
        }
        else{
            this.itemsText[i].tint = this.hexWhite; //white
        }
    }
};

InventoryUI.prototype.updateDisplay = function(inventory){
    let tempText = "";
    for(let i = 0; i < inventory.length; i++){
        let tileIndex = -1;
        //Hacky solution
        if(i <= 3){
            this.itemsText[i].text = inventory[i];
        }
        else{
            this.itemsText[i-1].text = inventory[i];
        }
        //if(inventory[i] > 0){
            //this.items.push([this.tileName[i] + ": x" + inventory[i]]);
            //tempText += this.tileName[i] + " x" + inventory[i] + "\n";
            //tempText += inventory[i] + this.stringMargin;
        //}
    }
    this.updateCountColor();
    //this.itemsText.text = tempText;
};