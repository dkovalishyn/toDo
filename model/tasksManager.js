var Manager = require('./manager');
var Task = require('./task');
var moment = require('moment');


/*Объект для хранения и обработки информации о задачах*/
function TasksManager(){
    Manager.call(this);
}

TasksManager.prototype = Object.create(Manager.prototype);
TasksManager.prototype.constructor = TasksManager;

/* Добавить задачу ответственному. Для этого проверим, есть ли такой пользователь в базе задач*/
TasksManager.prototype.add = function(task){
    if (!(task instanceof Task)) {
        task = new Task(task);
    }
    Manager.prototype.add.call(this, task);
};

/* Отобрать задачи текущего пользователя за последний месяц, либо по фильтру.
filter: 
    user - пользователь
    start - начальная дата 
    end - конечная дата
*/

TasksManager.prototype.getTasksForDate = function(date){
    var tasks = this.getCollection().filter(function(task){
        return (date.isSameOrAfter(task.startDate)&&date.isSameOrBefore(task.endDate));
    });
    return tasks.sort(this.compareTasks);
    
};

TasksManager.prototype.getTaskById = function(id){
    var result = false;
    this.getCollection().some(function(task){ 
        if(task.id == id) result = task;
    });
    return result;
    
};

TasksManager.prototype.compareTasks = function(a, b){
        if (a.startDate.isAfter(b.startDate)){
            return 1;
        }
        else if (a.startDate.isBefore(b.startDate)){
            return -1;
        }
        else {
            return 0;
        }         
};

TasksManager.prototype.toString = function(){
    return "tasksManager";
};


module.exports = TasksManager;