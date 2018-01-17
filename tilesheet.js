class Tilesheet {

    constructor(img)
    {
        this.img = img;
        this.img;                            //p5 image
        this.bytes = new Uint8Array(32);     //output file byte array
        this.size = 8;                       //8*8 or 16*16
        this.spritesheet;                    //resulting tilesheet.
        this.tilesheet = [];                 //array of all images;
        this.tiles = [];                     //array used to make spritesheet
        this._createTileArray();
        
        this.index = [];
        this.bytes = [];                            
    }

    draw(x,y){

        for(var i= 0; i< this.img.height/this.size; i++)
        {
          //for each row
          for(var j = 0; j< this.img.width/this.size; j++)
          {
            image(this.tilesheet[i*(this.img.height/this.size) + j], x+j*this.size, y+i*this.size);
          }
        }

    }

    drawGenMap(x,y)
    {
        for(var i= 0; i< this.img.height/this.size; i++)
        {
          //for each row

          for(var j = 0; j< this.img.width/this.size; j++)
          {
            var index = this.index[i*(this.img.height/this.size) + j];
            if(isNaN(index))
            {
                console.log(i*(this.img.height/this.size) + j);
            }
            else{
                image(this.tiles[this.index[i*(this.img.height/this.size) + j]], x+j*this.size, y+i*this.size);
            }
          }
        }
    }
    
    genTiles()
    {
        this.tiles = this._removeDuplicateTiles();
    }

    genTileset()
    {
        var gfx = createGraphics(128,128);
        if(this.tiles.length < 1)
        {
            this.genTiles();
        } 
        sheetend: 
        for(var i= 0; i< 16; i++)
        {
            //for each row
            for(var j = 0; j< 16; j++)
            {
                if(i*(16) + j >= this.tiles.length)
                {
                    break sheetend;
                }
                var tImg = this.tiles[i*(16) + j].get();
                gfx.image(tImg, j*this.size, i*this.size);
            }
        }
        this.spritesheet = new Spritesheet( gfx.get());
        this.spritesheet.genColours();
                   
        
    }

    genBytes(tiles, callback)
    {
        var that =this;
        
        this.index=[];
        this.bytes=[];
        tiles.forEach(function(i){
            i.loadPixels();
        });
        this.tilesheet.forEach(function(i){
            i.loadPixels();
        });
        for(var s in this.tilesheet)
        {
          var idx = tiles.findIndex(t=> this.compare(t.pixels,that.tilesheet[s].pixels));
          
          if(idx != -1)
          {
              this.index[s] = idx;
          }
          else {
            console.log("error at pos: "+ s );
             
          }
          
        }
        callback(Uint16Array.from(this.index));
    }

    _createTileArray()
    {
      var rows = this.img.height/this.size;
      var columns = this.img.width/this.size;
      
    
      for (var i = 0; i < rows ; i++)
      {
        //for each row
        var tl = 0; //topleft
        for(var j = 0; j < columns; j++)
        {
            //for each sprite in row.
            this.tilesheet.push(this.img.get(tl, i*this.size, this.size, this.size));
    
            tl+=8; //add 8 to get new top left.
        }
      }
    }

    _removeDuplicateTiles(){
        var arr = this.tilesheet
        let unique_array = [];
        arr.forEach(function(i){
            i.loadPixels();
        });
        for(let i = 0;i < arr.length; i++){
            if(unique_array.findIndex(t=> this.compare(t.pixels, arr[i].pixels)) == -1){
                unique_array.push(arr[i]);
            }
        }
        return unique_array;
    }

    compare(a, b){
        
        for(var i= 0 ; i < a.length; i++)
        {
            if(a[i] != b[i])
            {
                return false;
            }
            
        }
        return true;
    }
      

    static _convert(){
        var count = 0;
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
                        var set = index[linestart++] & 0x1 ? 1 : 0;
                        line_value = line_value | (set << (7 - l));
                    }
        
                    this.bytes[count++] = (line_value);
        
                    linestart = topleft + k * 128;
                    line_value = 0;
        
                    for (var l = 0; l < 8; l++)
                    {
                        // 0010
                        var set = index[linestart++] & 0x2 ? 1 : 0;
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
                        var set = index[linestart++] & 0x4 ? 1 : 0;
                        line_value = line_value | (set << (7 -l));
                    }
        
                    this.bytes[count++] = line_value;
        
                    linestart = topleft + k * 128;
                    line_value = 0;
        
                    for (var l = 0; l < 8; l++)
                    {
                        // 1000
                        var set = index[linestart++] & 0x8 ? 1 : 0;
                        line_value = line_value | (set << (7 -l));
                    }
        
                
                    this.bytes[count++] = line_value;
                } 
            }
        }
    }
}
