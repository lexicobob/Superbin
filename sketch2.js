
//PALETTE VARS
var paletteColours = [];
var paletteBytes = new Uint8Array(32);
var paletteImg;
var palInput; //palette upload input
var palette = false;
var pDownload; //palette download button
//SPRITE VARS
var spriteColours = [];
var spriteIndex = [];
var spriteBytes = new Uint8Array((128*128*4)/8);
var spriteImg;
var spriteDImg; //double size display image;
var spriteInput; //sprite upload 
var sDownload;  //sprite download button
var sprites = false;
var outTxt =""; //c version of the output.
var count = 0; //size of spritesheet.
//TILE VARS
var tile = false; //is tile sheet there
var tileInput; //tile upload
var tileImg; //p5image
var tiles = []; //all the tiles as 8*8 p5images
var tilesSingle = []; //non duplicated tiles.
var tilesheetImg; //p5img;
var tileIndex = []; //tilesheet pixel index array.
var tileBytes = new Uint8Array(128*128/2);
var tileColours = [];

//DRAWING VARS
var P_OFFSET = [20,20]; //palette offset from top left
var P_SIZE = 20; //palette square size
var S_OFFSETY = P_OFFSET[1]+2*P_SIZE; //spritesheet offset from top left. 
var spriteSize = 8;

function setup() {
  var can = createCanvas(select("#drawing").width, select("#drawing").width);
  can.parent("#drawing");
  palInput = createFileInput(handleFile);
  palInput.parent('#palette');
  spriteInput = createFileInput(handleSprites);
  spriteInput.parent('#spritesheet');

  tileInput = createFileInput(handleTile);
  tileInput.parent('#tilemap');

  downloadPalette();
  downloadSprites();
  noLoop();
}

function draw() {
  
  background(230);

  if(palette)
  {
    parsePalette(P_OFFSET[0],P_OFFSET[1]);
  }
  if(sprites)
  {
    image(spriteDImg , P_OFFSET[0], S_OFFSETY);
 
  }
  if(tile)
  {
    image(tileDImg , P_OFFSET[0]+256, S_OFFSETY);
    //drawTiles();
    drawTilesheet();
  }

}

//#region UTILITIES
function removeDuplicates(arr){
  let unique_array = [];
  arr.forEach(function(i){
    i.loadPixels();
  });
  for(let i = 0;i < arr.length; i++){
      if(unique_array.findIndex(t=> isEqual(t.pixels, arr[i].pixels)) == -1){
          unique_array.push(arr[i]);
      }
  }
  return unique_array;
}

function intToHex(num)
{
  return hex(parseInt(num),4).replace(".", "0");
}

function download(b, name, type) {
  var a = document.createElement("a");
  document.body.appendChild(a);
  var file = new Blob([b], {type: type});
  var url =  URL.createObjectURL(file);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
}

function addButton(text, el, id, handler)
{
  var button = createButton(text);
  button.parent(el);
  button.id(id);
  button.mousePressed(handler);
  return button;
}
//#endregion

//#region EVENTS
function mousePressed() {
  if(mouseX > P_OFFSET[0] && 
    mouseX < P_OFFSET[0]+P_SIZE*16 &&
    mouseY > P_OFFSET[1] &&
    mouseY < P_OFFSET[1] + P_SIZE)
    {
      //palette
      redraw();
      var selected =  parseInt((mouseX - P_OFFSET[0])/20);
      console.log(selected + " in range");
    }
}
//#endregion

//#region PALETTE
function handleFile(file) { 
  //print(file); 
  if (file.type === 'image') 
  { 
    paletteImg = loadImage(file.data, function (){
      
      palette = true;
      
      redraw();
    });  
  } 
}

function parsePalette(x,y)
{
  if(paletteColours.length < 1){
      var img = paletteImg;
  img.loadPixels();
  
  for (var i = 0; i < 4*(img.width*img.height); i+=4) {
    var r = img.pixels[i];
    var g = img.pixels[i+1];
    var b = img.pixels[i+2];
    var a = img.pixels[i+3];
    paletteColours.push(color(r,g,b,a));
  }
  }
  for(i in  paletteColours)
  {
    fill(paletteColours[i]);
    rect(i*20+x,y,P_SIZE,P_SIZE);

    r=paletteColours[i].levels[0]/8;
    g=paletteColours[i].levels[1]/8;
    b=paletteColours[i].levels[2]/8;
    var colour = parseInt(b) * 1024 + parseInt(g) * 32 + parseInt(r);
    colour = intToHex(colour);
    console.log(colour);
    
    paletteBytes[i*2]= String.fromCharCode(unhex(colour.substring(2,4))).charCodeAt(0);
    paletteBytes[i*2+1]=String.fromCharCode(unhex(colour.substring(0,2))).charCodeAt(0);
  }
  document.getElementById("palbut").removeAttribute("disabled");
 // 
}

function downloadPalette(){
  var button = addButton("Download palette.bin","#palette","palbut", function(){
    download(paletteBytes, "palette.bin", "text/plain");
  });
  document.getElementById("palbut").setAttribute("disabled",true);
}
//#endregion

//#region SPRITES

function handleSprites(file) { 
    //print(file); 
    if (file.type === 'image') 
    { 
        spriteImg = loadImage(file.data, function (){
        spriteDImg = spriteImg.get();
        spriteDImg.resize(spriteDImg.width*2, spriteDImg.height*2);
        spriteColours = []; //reset spriteColours;
        sprites = true;
        parseSheet();
        redraw();
      });  
    } 
    
    
  }

function parseSheet()
{
  if(!sprites || !palette)
  {
      console.log("sprites, or palette missing");
  }
    
  if(spriteColours.length < 1){
    var img = spriteImg;
  img.loadPixels();
  
  for (var i = 0; i < 4*(img.width*img.height); i+=4) {
    var r = img.pixels[i];
    var g = img.pixels[i+1];
    var b = img.pixels[i+2];
    var a = img.pixels[i+3];
    spriteColours.push(color(r,g,b,a));
  }
 
  for(var s in spriteColours)
  {
    var idx = paletteColours.findIndex(function(el)
    {
        return el.levels[0] == spriteColours[s].levels[0] &&
        el.levels[1] == spriteColours[s].levels[1] &&
        el.levels[2] == spriteColours[s].levels[2] &&
        el.levels[3] == spriteColours[s].levels[3];
    }); 
    
    if(idx != -1)
    {
        spriteIndex[s] = idx;
    }

    
  }
    beginConversion();
  }
 
}

function downloadSprites(){
  var button = addButton('Download sprites.bin',"#spritesheet","spritebut", function(){
    download(spriteBytes, "sprites.bin", "text/plain");
  });
  document.getElementById("spritebut").setAttribute("disabled",true);
}

function beginConversion(){
  count = 0;
  outTxt = "";
  outTxt += "const unsigned char sprite_data[] = { \n";
  var first = true;

  for (var j = 0; j < 16; j++) //4 sprites
  {
      for (var i = 0; i < 16; i++) //16p wide
      {
          var topleft = i * 8 + j * 8 * 128;

          for (var k = 0; k < 8; k++)
          {
              var linestart = topleft + k * 128;
              var line_value = 0;

              for (var l = 0; l < 8; l++)
              {
                  // 0001
                  var set = spriteIndex[linestart++] & 0x1 ? 1 : 0;
                  line_value = line_value | (set << (7 - l));
              }

              if (!first)
              {
                  outTxt += ", " + line_value;
              }
              else
              {
                  first = false;
                  outTxt += "  " + line_value;
              }
              spriteBytes[count++] = (line_value);

              linestart = topleft + k * 128;
              line_value = 0;

              for (var l = 0; l < 8; l++)
              {
                  // 0010
                  var set = spriteIndex[linestart++] & 0x2 ? 1 : 0;
                  line_value = line_value | (set << (7 - l));
              }

              outTxt += ", " + line_value;
              spriteBytes[count++] = line_value;
          }

          outTxt += "\n";

          for (var k = 0; k < 8; k++)
          {
              var linestart = topleft + k * 128;
              var line_value = 0;

              for (var l = 0; l < 8; l++)
              {
                  // 0100
                  var set = spriteIndex[linestart++] & 0x4 ? 1 : 0;
                  line_value = line_value | (set << (7 -l));
              }

              outTxt += ", " + line_value;
              spriteBytes[count++] = line_value;

              linestart = topleft + k * 128;
              line_value = 0;

              for (var l = 0; l < 8; l++)
              {
                  // 1000
                  var set = spriteIndex[linestart++] & 0x8 ? 1 : 0;
                  line_value = line_value | (set << (7 -l));
              }

              outTxt +=", " + line_value;
              spriteBytes[count++] = line_value;
          }

          outTxt +="\n";
          
      }
  }

  outTxt += "};";
  outTxt = "#define sprite_data_size " + count + "\n" + outTxt;
  document.getElementById("spritebut").removeAttribute("disabled");

}

//#endregion

//#region TILES

function handleTile(file)
{
  //do something with the file. 
  if (file.type === 'image') 
  { 
      tileImg = loadImage(file.data, function (){
      tileDImg = tileImg.get();
      //tileDImg.resize(tileDImg.width*2, tileDImg.height*2);
      tile = true;
      //do something with the sheet.
      createTileArray();
      //drawTiles();
      redraw();
    });  
  } 
}

function createTileArray()
{
  var rows = tileImg.height/spriteSize;
  var columns = tileImg.width/spriteSize;
  

  for (var i = 0; i < rows ; i++)
  {
    //for each row
    var tl = 0; //topleft
    for(var j = 0; j < columns; j++)
    {
        //for each sprite in row.
        tiles.push(tileImg.get(tl, i*spriteSize, spriteSize, spriteSize));

        tl+=8; //add 8 to get new top left.
    }
  }
}

function drawTiles(x,y)
{

    for(var i= 0; i< tileImg.height/spriteSize; i++)
    {
      //for each row
      for(var j = 0; j< tileImg.width/spriteSize; j++)
      {
        var doubleImg = tiles[i*tileImg.width/spriteSize + j].get();
        //doubleImg.resize(spriteSize*2, spriteSize*2);
        image(doubleImg, P_OFFSET[0]+j*spriteSize, S_OFFSETY+i*spriteSize);
      }
    }
}

function drawTilesheet(x,y)
{
  if(!tilesheetImg)
  {
    sortTiles();
    sheetend: 
    for(var i= 0; i< 16; i++)
    {
      //for each row
      for(var j = 0; j< 16; j++)
      {
        if(i*(tileImg.width/spriteSize) + j >= tilesSingle.length)
        {
          break sheetend;
        }
        var doubleImg = tilesSingle[i*(tileImg.width/spriteSize) + j].get();
        //doubleImg.resize(spriteSize*2, spriteSize*2);
        image(doubleImg, P_OFFSET[0]+j*spriteSize, S_OFFSETY+i*spriteSize);
      }
    }
    tilesheetImg = get(P_OFFSET[0], S_OFFSETY, 128,128);
  }
  else{
    image(tilesheetImg, P_OFFSET[0], S_OFFSETY);
  }
    
}

function parseTiles(){

  if(tileColours.length < 1){
    var img = tilesheetImg;
  img.loadPixels();
  
  for (var i = 0; i < 4*(img.width*img.height); i+=4) {
    var r = img.pixels[i];
    var g = img.pixels[i+1];
    var b = img.pixels[i+2];
    var a = img.pixels[i+3];
    tileColours.push(color(r,g,b,a));
  }
 
  for(var s in tileColours)
  {
    var idx = paletteColours.findIndex(function(el)
    {
        return el.levels[0] == tileColours[s].levels[0] &&
        el.levels[1] == tileColours[s].levels[1] &&
        el.levels[2] == tileColours[s].levels[2] &&
        el.levels[3] == tileColours[s].levels[3];
    }); 
    
    if(idx != -1)
    {
        tileIndex[s] = idx;
    }

    
  }
  tileConversion();
  console.log("done");
}

  //now i have the indexes, time to convert to bin.

}

function sortTiles(){ //remove duplicates
  tilesSingle = removeDuplicates(tiles);
}


// Compare two items
var compare = function (item1, item2) {
  
      // Get the object type
      var itemType = Object.prototype.toString.call(item1);
  
      // If an object or array, compare recursively
      if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
          if (!isEqual(item1, item2)) return false;
      }
  
      // Otherwise, do a simple comparison
      else {
  
          // If the two items are not the same type, return false
          if (itemType !== Object.prototype.toString.call(item2)) return false;
  
          // If it's a function, convert to a string and compare
          // Otherwise, just compare
          if (itemType === '[object Function]') {
              if (item1.toString() !== item2.toString()) return false;
          } else {
              if (item1 !== item2) return false;
          }
  
      }
  };

  var isEqual = function (value, other) {
    
        // ...
      // Get the value type
    var type = Object.prototype.toString.call(value);
        // Compare properties
        if (type === '[object Array]') {
            for (var i = 0; i < valueLen; i++) {
                if (compare(value[i], other[i]) === false) return false;
            }
        } else {
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    if (compare(value[key], other[key]) === false) return false;
                }
            }
        }
    
        // If nothing failed, return true
        return true;
    
    };

  function tileConversion(){
      var tileCount = 0;
      tileBytes = [];

      for (var j = 0; j < 16; j++) //4 sprites
      {
          for (var i = 0; i < 16; i++) //16p wide
          {
              var topleft = i * 8 + j * 8 * 128;
    
              for (var k = 0; k < 8; k++)
              {
                  var linestart = topleft + k * 128;
                  var line_value = 0;
    
                  for (var l = 0; l < 8; l++)
                  {
                      // 0001
                      var set = tileIndex[linestart++] & 0x1 ? 1 : 0;
                      line_value = line_value | (set << (7 - l));
                  }
    
                  
                  tileBytes[tileCount++] = (line_value);
    
                  linestart = topleft + k * 128;
                  line_value = 0;
    
                  for (var l = 0; l < 8; l++)
                  {
                      // 0010
                      var set = tileIndex[linestart++] & 0x2 ? 1 : 0;
                      line_value = line_value | (set << (7 - l));
                  }
    
                  
                  tileBytes[tileCount++] = line_value;
              }

              for (var k = 0; k < 8; k++)
              {
                  var linestart = topleft + k * 128;
                  var line_value = 0;
    
                  for (var l = 0; l < 8; l++)
                  {
                      // 0100
                      var set = tileIndex[linestart++] & 0x4 ? 1 : 0;
                      line_value = line_value | (set << (7 -l));
                  }
    
                  
                  tileBytes[count++] = line_value;
    
                  linestart = topleft + k * 128;
                  line_value = 0;
    
                  for (var l = 0; l < 8; l++)
                  {
                      // 1000
                      var set = tileIndex[linestart++] & 0x8 ? 1 : 0;
                      line_value = line_value | (set << (7 -l));
                  }
    
                 
                  tileBytes[tileCount++] = line_value;
              }
    
             
          }
      }
    
    }

  //#endregion