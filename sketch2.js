
var x = 0;
var colours = [];
var bytes = new Uint8Array(32);

var spriteColours = [];
var spriteIndex = [];
var spriteBytes = new Uint8Array();

var P_OFFSET = [20,50];
var P_SIZE = 20;
var S_OFFSETY = P_OFFSET[1]+2*P_SIZE;

var palInput;
var palette = false;

var paletteImg;
var spriteImg;
var spriteDImg; //double size display image;
var sprites = false;

var outTxt ="";
var count = 0;


function setup() {
  var can = createCanvas(500, 500);
  
  palInput = createFileInput(handleFile);
  palInput.parent('#palette');
  spriteInput = createFileInput(handleSprites);
  spriteInput.parent('#spritesheet');

  
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

function handleFile(file) { 
  //print(file); 
  if (file.type === 'image') 
  { 
    paletteImg = loadImage(file.data, function (){
      
      palette = true;
      button = createButton('download');
      button.position(10, 80);
      button.mousePressed(function(){
        download(bytes, "test.bin", "text/plain");
      });
      redraw();
    });  
  } 
}

function handleSprites(file) { 
    //print(file); 
    if (file.type === 'image') 
    { 
        spriteImg = loadImage(file.data, function (){
        spriteDImg = spriteImg.get();
        spriteDImg.resize(spriteDImg.width*2, spriteDImg.height*2);
        sprites = true;
        parseSheet();
        redraw();
      });  
    } 
    
    
  }

function parsePalette(x,y)
{
  if(colours.length < 1){
      var img = paletteImg;
  img.loadPixels();
  
  for (var i = 0; i < 4*(img.width*img.height); i+=4) {
    var r = img.pixels[i];
    var g = img.pixels[i+1];
    var b = img.pixels[i+2];
    var a = img.pixels[i+3];
    colours.push(color(r,g,b,a));
  }
  }
  for(i in  colours)
  {
    fill(colours[i]);
    rect(i*20+x,y,P_SIZE,P_SIZE);

    r=colours[i].levels[0]/8;
    g=colours[i].levels[1]/8;
    b=colours[i].levels[2]/8;
    var colour = parseInt(b) * 1024 + parseInt(g) * 32 + parseInt(r);
    colour = intToHex(colour);
    console.log(colour);
    
    bytes[i*2]= String.fromCharCode(unhex(colour.substring(2,4))).charCodeAt(0);
    bytes[i*2+1]=String.fromCharCode(unhex(colour.substring(0,2))).charCodeAt(0);
  }
 // 
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
    var idx = colours.findIndex(function(el)
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

function beginConversion(){
outTxt += "const unsigned char sprite_data[] = { \n";
var first = true;

for (var j = 0; j < 4; j++) //4 sprites
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

            linestart = topleft + k * 128;
            line_value = 0;

            for (var l = 0; l < 8; l++)
            {
                // 0010
                var set = spriteIndex[linestart++] & 0x2 ? 1 : 0;
                line_value = line_value | (set << (7 - l));
            }

            outTxt += ", " + line_value;
        }

        outTxt += "\n";
        count++;

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

            linestart = topleft + k * 128;
            line_value = 0;

            for (var l = 0; l < 8; l++)
            {
                // 1000
                var set = spriteIndex[linestart++] & 0x8 ? 1 : 0;
                line_value = line_value | (set << (7 -l));
            }

            outTxt +=", " + line_value;
        }

        outTxt +="\n";
        count++;
    }
}

outTxt += "};";
outTxt = "#define sprite_data_size " + count*16 + "\n" + outTxt;

button = createButton('download');
button.position(10, 140);
button.mousePressed(function(){
  download(outTxt, "test.c", "text/plain");
});
}