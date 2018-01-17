
class Palette {

             
    constructor(img)
    {
        this.img = img;
        this.colours = [];                   //p5 colour array
        this.bytes = [];     //output file byte array
        this.P_SIZE = 20;                    //pixel size on canvas
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

    genBytes(callback){
        this.bytes = new Uint8Array(this.colours.length * 2);
        for(var i in this.colours)
        {
            var r=this.colours[i].levels[0]/8;
            var g=this.colours[i].levels[1]/8;
            var b=this.colours[i].levels[2]/8;
            var colour = parseInt(b) * 1024 + parseInt(g) * 32 + parseInt(r);
            colour = Utils.intToHex(colour);
            
            this.bytes[i*2]= String.fromCharCode(unhex(colour.substring(2,4))).charCodeAt(0);
            this.bytes[i*2+1]=String.fromCharCode(unhex(colour.substring(0,2))).charCodeAt(0);
        }
        callback(this.bytes);
    }

    draw(x,y){
        for(var i in this.colours)
        {
          fill(this.colours[i]);
          rect(i*20+x,y,this.P_SIZE,this.P_SIZE); 
        }
    }
}