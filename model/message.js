var moment = require('moment');
/* Конструктор сообщений. Объект data содержит данные отправителя (from)
и получателя (to);*/
function Message(data){
    this.from = data.from;
    this.to = data.to;
    this.content = data.content;
    this.timestamp = moment();
}

Message.prototype.getFrom = function(){
    return this._from;
};

Message.prototype.getTo = function(){
    return this._to;
};

Message.prototype.getTimestamp = function(){
    return this._timestamp;
};

Message.prototype.getContent = function(){
    return this._content;
};

Message.prototype.to = function(user){
    return this.getTo().toLowerCase() == user;
};

Message.prototype.setNew = function(isNew){
    this._new = isNew;
};

Message.prototype.toLog = function(){
    return this.timestamp.format('l') + ' Задача №' + this.to + ' Пользователь ' + this.from + ' добавил комментарий: ' + this.content;
};

Message.prototype.render = function(wrapper){
    var msgView = wrapper.append('div'); 
    msgView.append('<p>').text(this.getFrom());
    msgView.append('<p>').text(this.getTo());
    msgView.append('<p>').text(this.getTimestamp());
    msgView.append('<p>').text(this.getContent());
};

module.exports = Message;