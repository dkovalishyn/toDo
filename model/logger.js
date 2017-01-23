function Logger(){
}

Logger.log = []; 

Logger.prototype.log = function(item){
   Logger.log.push(item.toLog());
};

Logger.prototype.load = function(item){
/*    var loaded = JSON.parse(localStorage.getItem(item || this.toString()));
    for(var key in loaded){
        this[key] = loaded[key];
    }*/
};

Logger.prototype.remove = function(){
//    localStorage.removeItem(this.toString());
};

module.exports = Logger;