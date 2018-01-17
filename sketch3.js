var can;
var palettes = [];
var spritesheets = [];
var tilesheets = [];

var activePalette;
var activeSheet;
var activeTiles;



function setup() {
    can = createCanvas(select("#drawing").width, select("#drawing").width);
    can.parent("#drawing");
  
    noLoop();
  }

function draw() {
    background(230);
    
    if(palettes.length > 0)
    {
        palettes[activePalette].draw(20,20);
    }
    if(spritesheets.length > 0)
    {
        spritesheets[activeSheet].draw(20,60);
    }

    if(tilesheets.length > 0)
    {
        tilesheets[activeTiles].draw(20+256,60);
    }

    
}


function handlePalette(el) { 
    
    Utils.getFile(el,function(file){
          var img = loadImage(file.data, function (){
                var idx = palettes.push(new Palette(img)) -1;
                palettes[idx].genColours();
                activePalette = idx;
                updatePaletteDom();
                
                redraw();
          });  
        }); 
}

function handleSpritesheet(el) { 
    
    Utils.getFile(el,function(file){
          var img = loadImage(file.data, function (){
                var idx = spritesheets.push(new Spritesheet(img)) -1;
                spritesheets[idx].genColours();
                activeSheet = idx;
                updateSheetDom();
                
                redraw();
          });  
        }); 
}


function handleTilesheet(el){
    Utils.getFile(el,function(file){
        var img = loadImage(file.data, function (){
              var idx = tilesheets.push(new Tilesheet(img)) -1;
              activeTiles = idx;
              updateTileDom();
              redraw();
        });  
      }); 
}

//#region selection & button presses
function onDelete(e)
{
    var evt = e ? e : event;
    var sel = evt.target ? evt.target : evt.srcElement;
    if(evt.keyCode && evt.keyCode == 46 || evt.which == 46) {
        var val = sel.value;
        if(sel.id=="paletteList")
        {
            removePalette(val);
            updatePaletteDom();
            redraw();
        }
        else if(sel.id=="spriteList")
        {
            removeSheet(val);
            updateSheetDom();
            redraw();
        }
        else if(sel.id=="tileList")
        {
            removeTiles(val);
            updateTileDom();
            redraw();
        }
            
    }
    
}

function selectPalette(el){
    activePalette = el.value;
    redraw();
}

function selectSpritesheet(el){
    activeSheet = el.value;
    redraw();
}

function selectTilesheet(el){
    activeTiles = el.value;
    redraw();
}

function t2s(){ //generate spritesheet from tilesheet
    
    tilesheets[activeTiles].genTileset();
    activeSheet = spritesheets.push(tilesheets[activeTiles].spritesheet) -1;
    updateSheetDom();
    redraw();
}

function s2p(){ //generate palette from spritesheet
    spritesheets[activeSheet].genColours();
    activePalette = palettes.push(spritesheets[activeSheet].makePalette()) -1;

    updatePaletteDom();
    redraw();
}

function t2m(){ //THIS IS SUPER FLAWED AS SHOULD BE 00 between each byte
    var t = spritesheets[activeSheet].getTiles();
    t.forEach(function (el) {
        el.loadPixels();
    });
    tilesheets[activeTiles].genBytes(t, function(bytes){
        Utils.download(bytes,"tilemap"+activeTiles+".bin", "text/plain");
    });
}
//#endregion

//#region downloading files 
function downloadPalette(){
    var x = activePalette;
    //check palette is ready for download
    if(palettes[x] && palettes[x].colours.length > 0)
    {
        if(palettes[x].bytes.length > 0)
        {
            //ready
            Utils.download(palettes[x].bytes,"palette"+x+".bin", "text/plain");
        }
        else
        {
            palettes[x].genBytes(function(data){
                Utils.download(data,"palette"+x+".bin", "text/plain");
            });
        }
    }
    else
    {
        alert("Something went wrong! This palette doesn't exist or has no colours.");
    }

}

function downloadSheet()
{
    var x = activeSheet;
    //check spritesheet is ready for download
    if(spritesheets[x] && spritesheets[x].colours.length > 0 && palettes.length > 0)
    {
        if(spritesheets[x].index.length > 0 && !confirm("Generate new data from current Palette?"))
        {
            //ready
            Utils.download(spritesheets[x].bytes,"spritesheet"+x+".bin", "text/plain");
        }
        else
        {
            //generate new data from current palette.
            spritesheets[x].genBytes(palettes[activePalette].colours, function(data){
                Utils.download(data,"spritesheet"+x+".bin", "text/plain");
            });
        }
    }
    else
    {
        alert("Something went wrong! Is there a palette present?");
    }
}

//#endregion

//#region DOM 
function updatePaletteDom()
{
    var x = document.getElementById("paletteList");
    x.innerHTML="";
    for(var idx in palettes)
    {
        var option = document.createElement("option");
        option.text = "Palette " + idx;
        option.value = idx;
        x.add(option);
    }
    x.value=activePalette;
}

function updateSheetDom()
{
    var x = document.getElementById("spriteList");
    x.innerHTML="";
    for(var idx in spritesheets)
    {
        var option = document.createElement("option");
        option.text = "Sheet " + idx;
        option.value = idx;
        x.add(option);
    }
    x.value = activeSheet;
}

function updateTileDom()
{
    var x = document.getElementById("tileList");
    x.innerHTML="";
    for(var idx in tilesheets)
    {
        var option = document.createElement("option");
        option.text = "Tilesheet " + idx;
        option.value = idx;
        x.add(option);
    }
    x.value=activeTiles;
}

function explain(el)
{
    Array.from(el.parentElement.children).find(a=> a.className=="explainer").innerText = el.value;
}

function unexplain(el)
{
    Array.from(document.getElementsByClassName("explainer")).forEach(e => e.innerText ="");
}
//#endregion

//#region delete files
function removePalette(val)
{
    var pal = palettes.splice(val, 1);
    if(activePalette == val)
    {
        activePalette = 0;
    }
}

function removeSheet(val)
{
    var sheet = spritesheets.splice(val, 1);
    if(activeSheet == val)
    {
        activeSheet = 0;
    }
}

function removeTiles(val)
{
    var tile = tilesheets.splice(val, 1);
    if(activeTiles == val)
    {
        activeTiles = 0;
    }
}

//#endregion

