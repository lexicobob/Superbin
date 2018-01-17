class Spritesheet {

    constructor(img)
    {
        this.img = img;
        this.colours = [];                   //p5 colour array
        this.bytes = [];     //output file byte array
        this.index = [];
        this.size = 8; //8*8 or 16*16
        this.fileSize = 0;
    }

    genColours(){
        this.img.loadPixels();
        this.colours = []; //reset array
        for (var i = 0; i < 4*(this.img.width*this.img.height); i+=4) {
          var r = this.img.pixels[i];
          var g = this.img.pixels[i+1];
          var b = this.img.pixels[i+2];
          var a = this.img.pixels[i+3];
          this.colours.push(color(r,g,b,a));
        }
    }

    genBytes(pal, callback){
        var that =this;
        this.index=[];
        this.bytes=[];
        for(var s in this.colours)
        {
          var idx = pal.findIndex(function(el)
          {
              return el.levels[0] == that.colours[s].levels[0] &&
              el.levels[1] == that.colours[s].levels[1] &&
              el.levels[2] == that.colours[s].levels[2] &&
              el.levels[3] == that.colours[s].levels[3];
          }); 
          
          if(idx != -1)
          {
              this.index[s] = idx;
          }
         
          
        }
        this.convert();
        callback(this.bytes);
    }
    
    draw(x,y){
        var i = this.img.get();
        i.resize(i.width*2, i.height*2);
        image(i,x,y);
    }

    makePalette()
    {
        var colours = this.getUniqueColours();
        //colours.unshift(color(0,0,0,0));
        var gfx = createGraphics(16,1);
        
        gfx.loadPixels();
        for(var i = 0; i < colours.length; i++)
        {
            gfx.set(i,0,colours[i]);
        }

        while(colours.length < 16)
        {
            colours.push(color(0,0,0));
        }

        var pal = new Palette(gfx.get());
        pal.colours = colours;
        return pal;
    }
    
    getUniqueColours(){
        var arr = this.colours;
        let unique_array = [];
        
        for(let i = 0;i < arr.length; i++){
            if(unique_array.findIndex(p=> Utils.isEqual(p.levels, arr[i].levels)) == -1){
                unique_array.push(arr[i]);
            }
        }
        return unique_array;
    }

    convert(){
        var count = 0;
        this.bytes = new Uint8Array(this.index.length/2);
        for (var j = 0; j < 16; j++) //16 sprite rows
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
                        var set = this.index[linestart++] & 0x1 ? 1 : 0;
                        line_value = line_value | (set << (7 - l));
                    }
        
                    this.bytes[count++] = (line_value);
        
                    linestart = topleft + k * 128;
                    line_value = 0;
        
                    for (var l = 0; l < 8; l++)
                    {
                        // 0010
                        var set = this.index[linestart++] & 0x2 ? 1 : 0;
                        line_value = line_value | (set << (7 - l));
                    }
        
                    this.bytes[count++] = line_value;
                }
        
        
                for (var k = 0; k < 8; k++)
                {
                    var linestart = topleft + k * 128;
                    var line_value = 0;
        
                    for (var l = 0; l < 8; l++)
                    {
                        // 0100
                        var set = this.index[linestart++] & 0x4 ? 1 : 0;
                        line_value = line_value | (set << (7 -l));
                    }
        
                    this.bytes[count++] = line_value;
        
                    linestart = topleft + k * 128;
                    line_value = 0;
        
                    for (var l = 0; l < 8; l++)
                    {
                        // 1000
                        var set = this.index[linestart++] & 0x8 ? 1 : 0;
                        line_value = line_value | (set << (7 -l));
                    }
        
                
                    this.bytes[count++] = line_value;
                } 
            }
        }
        this.fileSize = count;
    }

    getTiles()
    {
        var tiles = [];
        var rows = this.img.height/this.size;
        var columns = this.img.width/this.size;
        for (var i = 0; i < rows ; i++)
        {
            //for each row
            var tl = 0; //topleft
            for(var j = 0; j < columns; j++)
            {
                //for each sprite in row.
                tiles.push(this.img.get(tl, i*this.size, this.size, this.size));
        
                tl+=8; //add 8 to get new top left.
            }
        }
        return tiles;
    }
}
