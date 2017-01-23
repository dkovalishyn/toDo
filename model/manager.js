var Logger = require('./logger');

function Manager(){
    Logger.call(this);
    this._collection = [];
}
Manager.prototype = Object.create(Logger.prototype);
Manager.prototype.constructor = Manager;

Manager.prototype.add = function(item){
    item.id = this._collection.length;
    this._collection.push(item);
    this.log(item);
};

Manager.prototype.getCollection = function(){
    return this._collection;
};

Manager.prototype.toString = function(){
    return 'manager';
};


module.exports = Manager;