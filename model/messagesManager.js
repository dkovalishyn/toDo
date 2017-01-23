var Manager = require('./manager');
var Message = require('./message');
var moment = require('moment');


/* Менеджер для хранения сообщений.*/
function MessageManager(){
    Manager.call(this);
}

MessageManager.prototype = Object.create(Manager.prototype);
MessageManager.prototype.constructor = MessageManager;

MessageManager.prototype.addMessage = function(msg){
    if(typeof msg == "object"){
        Manager.prototype.add.call(this, new Message(msg));
    } else {
        Manager.prototype.add.call(this, new Message({content : msg}));
    }
};

MessageManager.prototype.getLastMessages = function(){
   return this._collection;
};


module.exports = MessageManager;