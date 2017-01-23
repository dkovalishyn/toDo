var moment = require('moment');
var MessageManager = require('./messagesManager');
var Message = require('./message');
/* Объект Задача будет содержать следующие поля:
    id - уникальный номер задачи
    author - инициатор задачи
    executives - участвующие в проекте
    startDate - дата начала задачи
    endDate - дата окончания задачи
    timestamp - дата создания задачи
    lastChange - время последнего изменения задач
    description - описание задачи
    progress - на сколько процентов задача выполнена
    status - текущее состояние задачи
    color  - цвет для отображения задачи в календаре
    comments - комментарии к задаче
*/
function Task(data){
    var author, executives, startDate, endDate, color, description, id, status, mm;
    if (data){
        author = data.author;
        executives = data.executives;
        startDate = data.startDate;
        endDate = data.endDate;
        color = data.color;
        description = data.description;
        id = data.id;
        status = data.status;
        mm = data.mm;
    }
    this.id = id || 0;
    this.author = author || '';
    this.executives = executives || [];
    this.startDate = moment(startDate) || moment();
    this.endDate = moment(endDate) || moment();
    this.timestamp = moment();
    this.lastChange = moment();
    this.description = description || 'Описание задачи';
    this.progress = 0;
    this.status = status || 'active';
    this.color = color || 'red'; 
    this.mm = new MessageManager();
    if(mm){
        var messsages = mm._collection;
        for(var i = 0; i < messsages.length; i++){
            var message = new Message(messsages[i]);
            this.mm.add(message);
        }
    }
}

Task.prototype.isEqual = function(task){
    if (typeof task !== 'object'){
        return false;
    }
    return (this.toString() === task.toString());
};

Task.prototype.render = function(){
      var template = require('templates/task.jade');
      return template(this);
};

Task.prototype.addMessage = function(message){
    this.mm.addMessage(message);
    this.lastChange = moment();
};

Task.prototype.setProgress = function(progress){
    this.progress = progress;
    if (progress == '100'){
        this.status = "done";
    }
    this.lastChange = moment();
};

Task.prototype.setStatus = function(status){
    if (this.status != 'done'){
        this.status = status;
    }
    if (this.status == 'done'){
        this.setProgress(100);
    }
    this.lastChange = moment();
};

// Изменить статус и прогресс задачи
// data = {status: .... ; progress: ...}
Task.prototype.changeStatus = function(data){
    if(!data) return;
    if (this.status != 'done'){
        this.status = data.status;
    }
    this.setProgress(data.progress);
    this.lastChange = moment();
};


Task.prototype.toLog = function(){
    return this.timestamp.format('l') + ' Пользователь ' + this.author + ' создал новую задачу: ' + this.description;
};

Task.prototype.toString = function(){
    return this.id + " : " + this.description;
};

module.exports = Task;
