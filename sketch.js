

var x = 0;
var colours = [];
var bytes = new Uint8Array(32);

var P_OFFSET = [20,50];
var P_SIZE = 20;

var palInput;
var palette = false;


function setup() {
  var can = createCanvas(500, 500);
  
  palInput = createFileInput(handleFile);
  palInput.parent('#palette');

  
  noLoop();
  

}

function draw() {
  
  background(230);

  if(palette)
  {
    parsePalette(P_OFFSET[0],P_OFFSET[1]);
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
    img = loadImage(file.data, function (){

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

function parsePalette(x,y)
{
  if(colours.length < 1){
  img.loadPixels();
  
  for (var i = 0; i < 4*(img.width*img.height); i+=4) {
    var r = img.pixels[i];
    var g = img.pixels[i+1];
    var b = img.pixels[i+2];
    colours.push(color(r,g,b));
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