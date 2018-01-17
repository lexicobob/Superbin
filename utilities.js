// Compare two items
class Utils{

    static compare(item1,item2)
    {
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
    }

    static isEqual(value, other) {
      
        return JSON.stringify(value) == JSON.stringify(other);
      /*    // ...
        // Get the value type
      var type = Object.prototype.toString.call(value);
      var valueLen = value.length;
          // Compare properties
          if (type === '[object Array]') {
              for (var i = 0; i < valueLen; i++) {
                  if (this.compare(value[i], other[i]) === false) return false;
              }
          } else {
              for (var key in value) {
                  if (value.hasOwnProperty(key)) {
                      if (this.compare(value[key], other[key]) === false) return false;
                  }
              }
          }
      
          // If nothing failed, return true
          return true;
          */
      
      }

    
    static intToHex(num)
    {
        return hex(parseInt(num),4).replace(".", "0");
    }
      
    static download(b, name, type) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        var file = new Blob([b], {type: type});
        var url =  URL.createObjectURL(file);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    static getFile(el, callback){
        //get file
    var f = el.files[0];
    var reader = new FileReader();
    function makeLoader(theFile) {
      // Making a p5.File object
      var file = new p5.File(theFile);
      return function(e) {
        file.data = e.target.result;
        
        callback(file);
        } 
      };
    reader.onload = makeLoader(f);
    reader.readAsDataURL(f);
    }
}