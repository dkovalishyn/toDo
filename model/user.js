var moment = require('moment');
var TasksManager = require('./tasksManager');
/* Объект для хранения информации о пользователях.
Содержит поля:
name - имя пользователя
secondName
lastName
photo - путь к фотографии пользователя
login
birthday
role - права пользователя
*/
function User(user){
    var Task = require('./task');
    var name, secondName, lastName, photo, login, birthday, tasks, role, email;
    if (user){
        name = user.name;
        secondName = user.secondName;
        lastName = user.lastName;
        photo = user.photo; 
        login = user.login.toLowerCase();
        birthday = user.birthday;
        tasks = user.tasks;
        role = user.role;
        email = user.email;
    }
    this.name = name || 'anonym';
    this.secondName = secondName || '';
    this.lastName = lastName || '';
    this.photo = photo || 'no-avatar.png';
    this.login = login || Math.random()*Number.MAX_VALUE;
    this.birthday = birthday || moment();
    this.role = role || 'user';
    this.timestamp = moment();
    this.tasks = new TasksManager();
    this.email = email || "todo.ontime@gmail.com";
    if(tasks){
        for(var i = 0; i < tasks._collection.length; i++){
            var task = new Task(tasks._collection[i]);
            this.tasks.add(task);
        }
    }
}

User.prototype.getFullName = function(){
    return this.name + ' ' + this.secondName + ' ' + this.lastName;
};

User.prototype.getTasks = function(){
    return this.tasks;
};

// filter = { field: value }
User.prototype.filterTasks = function(filter){
    if (typeof filter != 'object') return false;
    
    return this.tasks.getCollection().filter(function(task){
        var result = true;
        for(var field in filter){
           result = result&&(task[field] === filter[field]);
        }
        return result;
    });
}; 

User.prototype.addTask = function(task){
    this.tasks.add(task);
};

User.prototype.setRole = function(role){
    this.role = role;
};

User.prototype.toLog = function(){
    return this.timestamp.format('l') + " Новый пользователь: " + this.getFullName();
};

User.prototype.toString = function(){
    return this.getFullName();
};

module.exports = User;
