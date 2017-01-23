var moment = require('moment');
var fs = require('fs');
var UsersManager = require('./usersManager');
var Calendar = require('./calendar');
var Logger = require('./logger');


var model = {
    um : {},
    
    getTaskById: function(id){
        return this.user.tasks.getTaskById(id);
    },
    
    addUser: function(user){
        this.um.add(user);
    },
    
    getUsers: function(){
        return this.um.getCollection();
    },

    getUserByLogin: function(login){
        return this.um.getUserByLogin(login);
    },
    loadData: function(data){
        this.um = new UsersManager(JSON.parse(data));
    },
    save: function (){
        console.log('Saving data');
        var path = './usersManager.json';
        fs.writeFile(path, JSON.stringify(this.um), 'utf-8', function(err){
                if(err){
                    return console.log('Data has not been saved!' + err);
                } 
                console.log('File has been updated');
            });
    },
    setRole: function(login, role){
        this.um.getUserByLogin(login).role = role;
    },
    getLogger: function(){
        return Logger;
    },
    
    getCalendar: function(login, date){
            var calendar = new Calendar(this.um.getUserByLogin(login).tasks);
            calendar.generateMonth(date);
            return calendar;
    }
};


module.exports = model;
   

