window.onload = function() {
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");

    context.webkitImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
 
    var width = 128;
    var height = 128;
 
    var imagedata = context.createImageData(width, height);

    var tileMap = new Tilemap({width: width, height: height});
 
    function createImage(offset) {
        for (var x=0; x<width; x++) {
            for (var y=0; y<height; y++) {
                var pixelindex = (y * width + x) * 4;

                var tileType = tileMap.getTileAt(x, y);

                var col = {r: 0, g: 0, b: 0};

                if(tileType === 0){ //grass
                    col.r = 22;
                    col.g = 148;
                    col.b = 22;
                }
                else if(tileType === 1){ //sand
                    col.r = 232;
                    col.g = 215;
                    col.b = 88; 
                }
                else if(tileType === 2){ //stone
                    col.r = 155;
                    col.g = 155;
                    col.b = 155; 
                }
                else if(tileType === 3){ //water
                    col.r = 24;
                    col.g = 24;
                    col.b = 200; 
                }
                else if(tileType === 5){ //forest
                    col.r = 22;
                    col.g = 108;
                    col.b = 22; 
                }
                else if(tileType === 6){ //snow
                    col.r = 128;
                    col.g = 222;
                    col.b = 222; 
                }
                else if(tileType === 7){ //desert
                    col.r = 255;
                    col.g = 173;
                    col.b = 51; 
                }
 
                // Set the pixel data
                imagedata.data[pixelindex] = col.r;     // Red
                imagedata.data[pixelindex+1] = col.g; // Green
                imagedata.data[pixelindex+2] = col.b;  // Blue
                imagedata.data[pixelindex+3] = 255;   // Alpha
            }
        }
    }

    createImage(0);
    context.putImageData(imagedata, 0, 0);

    var imageObject=new Image();
    imageObject.onload=function(){

        context.clearRect(0,0,canvas.width,canvas.height);
        context.scale(3, 3);
        context.drawImage(imageObject,0,0);

    }
    imageObject.src=canvas.toDataURL();

    var gui = new dat.GUI();
    gui.add(tileMap, "frequency", 1, 16);
    gui.add(tileMap, "waterMax", 0, 2);
    gui.add(tileMap, "sandMax", 0, 2);
    gui.add(tileMap, "grassMax", 0, 2);
    gui.add(tileMap, "stoneMax", 0, 2);
    gui.add(tileMap, "beachRatio", 0, 1);
    gui.add(tileMap, "desertRatio", 0, 1);
    gui.add(tileMap, "forestRatio", 0, 1);
    gui.add(tileMap, "snowRatio", 0, 1);

    canvas.onclick = function(){
        tileMap.generateTerrain();
        imagedata = context.createImageData(width, height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        createImage(0);
        context.putImageData(imagedata, 0, 0);

        var imageObject=new Image();
        imageObject.onload=function(){

            context.clearRect(0,0,canvas.width,canvas.height);
            context.drawImage(imageObject,0,0);

        }
        imageObject.src=canvas.toDataURL();
    };
};
