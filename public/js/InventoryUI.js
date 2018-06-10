//Inventory UI constructor
function InventoryUI(game, x, y, key, frame){
    //Call to Phaser.Sprite(game, x, y, key, frame)
    Phaser.Sprite.call(this, game, x, y, key, frame);
    
    this.tileName = ["Grass", "Sand", "Stone", "Water", "Bridge", "Forest", "Snow", "Desert", "Ice"];
    
    //Text colors for the inventory count in each slot
    this.hexRed = 0xffa214;
    this.hexGray = 0xb4b4b4;
    this.hexWhite = 0xffffff;
    
    //Position-related variables for the UI
    this.stringMargin = 36;
    this.countOffsetX = 58;
    this.countOffsetY = 39;
    this.highlightOffsetX = 37;
    this.highlightOffsetY = 16;
    this.numbersOffsetX = 52;
    this.numbersOffsetY = 6;
    
    this.highlightUI = game.add.sprite(x + this.highlightOffsetX, y + this.highlightOffsetY, "highlightUI");
    
    this.itemsText = [];
    for(let i = 0; i < 9; i++){
        this.itemsText[i] = game.add.bitmapText(x + (i * this.stringMargin) + this.countOffsetX, y + this.countOffsetY, "m5x7", "0", 21);
    }
    
    //Hacky display update, players start with some bridge tiles
    this.itemsText[3].text = "20";
    
    //Set up the counters below each tile
    this.numbersText = [];
    for(let i = 0; i < 9; i++){
        this.numbersText[i] = game.add.bitmapText(x + (i * this.stringMargin) + this.numbersOffsetX, y + this.numbersOffsetY, "m5x7", (i + 1) + "", 21);
    }
    
    //Set up the count text colors
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

//Update the color of the count text
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

//Updates the inventory display after receiving new inventory data from the server
InventoryUI.prototype.updateDisplay = function(inventory){
    let tempText = "";
    for(let i = 0; i < inventory.length; i++){
        let tileIndex = -1;
        //Hacky solution since water is 3 but not a placable tile
        if(i <= 3){
            this.itemsText[i].text = inventory[i];
        }
        else{
            this.itemsText[i-1].text = inventory[i];
        }
    }
    this.updateCountColor();
};