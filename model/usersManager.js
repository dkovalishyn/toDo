/*Объект для хранения и управления записями о пользователях*/
var Manager = require('./manager'); 
var User = require('./user');

function UsersManager(data){
    Manager.call(this);
    if(data._collection){
        for(var i = 0; i < data._collection.length; i++){
            var user = new User(data._collection[i]);
            Manager.prototype.add.call(this, user);
        }
    }
}

UsersManager.prototype = Object.create(Manager.prototype);
UsersManager.prototype.constructor = UsersManager;

UsersManager.prototype.add = function(user){
    if (!(user instanceof User)) {
        user = new User(user);     
    }
    Manager.prototype.add.call(this, user);
};

UsersManager.prototype.getUserByLogin = function(login){
    var result = false;
    if (!login) return false;
    this.getCollection().some(function(user){
        if(user.login.toLowerCase() === login.toLowerCase()){
            result = user;
        }
    });
    return result;
};

UsersManager.prototype.getUserTasks = function(id){
    return this.getUserById(id).getTasks();
};

UsersManager.prototype.toString = function(){
    return 'usersManager';
};

module.exports = UsersManager;