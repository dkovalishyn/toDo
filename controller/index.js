var App = require('./app');
var model = require('../model');
var moment = require('moment');
var pug = require('pug');
var app = new App();

app.users = {};

app.tokens = {};

app.route('home','/',function(params){
    this.render('./templates/home.pug', params);
});

app.route('','/login',function(params){
    this.render('./templates/modal/login.pug', params);
});

app.route('','/contacts',function(params){
    this.render('./templates/contacts.pug', params);
});

app.route('','/register',function(params){
   this.render('./templates/modal/register.pug', params);     
});

app.route('','/main',function(params){
    params.collegues = model.getUsers();
    params.total =  params.user.tasks._collection.length;
    params.active = params.user.filterTasks({'status':'active'});
    params.delayed = params.user.filterTasks({'status':'delayed'});
    params.done = params.user.filterTasks({'status':'done'});
    this.render('./templates/main/main.pug', params);
});

app.route('','/main/activity',function(params){
    params.log = model.getLogger().log.sort().reverse();
    this.render('./templates/main/activity.pug', params);
});

app.route('','/main/calendar/:id',function(params){
    params.calendar = model.getCalendar(params.id, params.date);
    params.users = model.getUsers();
    this.render('./templates/main/calendar.pug', params);
});

app.route('','/main/tasks-list',function(params){
    params.tasks = params.user.tasks._collection;
    this.render('./templates/main/tasksList.pug', params);
});

app.route('','/api/sortTasksList/:id',function(params){
    var tasks = params.user.tasks._collection;
    
    switch(params.id){
        case 'sortStartDate': 
            tasks.sort( function(a, b){
                return moment(a.startDate).isAfter(b.startDate, 'day');
            });
            break;
        case 'sortEndDate':
            tasks.sort( function(a, b){
                return moment(a.endDate).isAfter(b.endDate, 'day');
            });
            break;
        case 'sortStatus':
            tasks.sort(function(a, b){
                return a.status>b.status;
            });
            break;
        case 'sortDescription':
            tasks.sort(function(a, b){
                return a.description>b.description;
            });
            break;
        case 'sortProgress':
            tasks.sort(function(a, b){
                return a.progress>b.progress;
            });
            break;
            
    }
    
    params.tasks = tasks;
    
    this.render('./templates/ajax/tasksList.pug', params);
    
});

app.route('','/main/set-task',function(params){
    this.render('./templates/main/setTask.pug', params);
});

app.route('','/main/user/:id',function(params){
    params.slug = model.getUserByLogin(params.id);
    params.slug.birthday = moment(params.slug.birthday).format('l');
    params.slug.birthday = moment(params.slug.birthday).format('l');
    this.render('./templates/main/user.pug', params);
});

app.route('','/main/profile',function(params){
    this.render('./templates/main/profile.pug', params);
});

app.route('','/main/roles',function(params){
    params.users = model.getUsers();
    this.render('./templates/main/roles.pug', params);
});

app.route('','/api/getCalendar/:id',function(params){
    params.calendar = model.getCalendar(params.id, params.date);
    params.users = model.getUsers();
    this.render('./templates/ajax/month.pug', params);
});

app.route('','/api/getTask/:id',function(params){
    var user = model.getUserByLogin(params.login);
    params.task = user.tasks.getTaskById(params.id);
    this.render('./templates/ajax/task.pug', params);
});

app.route('','/api/getDay/:id',function(params){
    var date = moment(+params.id);
    var date = moment(+params.id);
    params.date = date;
    params.tasks = params.user.tasks.getTasksForDate(date);
    this.render('./templates/ajax/fullDay.pug', params);
});

app.route('','/api/sendMessage/:id',function(params){
    var task = params.user.tasks.getTaskById(params.id);
    if(task){
        params.task = params.user.tasks.getTaskById(params.id);
        var message = {
            content: decodeURIComponent(params.body.text),
            from: params.user.login,
            to: task.id
        };
        task.addMessage(message);
        model.save();
    } else {
    params.res.statusCode = '404';
    params.res.end('Task' + params.id + 'not found');
    }
    this.render('./templates/ajax/task.pug', params);
});

app.route('','/api/changeTask/:id',function(params){
    var task = params.user.tasks.getTaskById(params.id);
    if(task){
        task.changeStatus(params.body);
        model.save();
    } else {
        params.res.statusCode = '404';
        params.res.end('Task' + params.id + 'not found');
    }
    params.user = params.user;
    params.task = params.user.tasks.getTaskById(params.id);
    this.render('./templates/ajax/task.pug', params);
});

app.route('','/api/verify',function(params){
    this.verifyUser(params);
});

app.route('','/api/register',function(params){
   this.registerUser(params);
});

app.route('','/api/changeRoles',function(params){
    // params.body = { login : role }
    for(var key in params.body){
        model.getUserByLogin(key).setRole(params.body[key]);
    }
    model.save();
    params.res.end("Success");
});

app.route('','/api/changeProfile',function(params){
    for(var key in params.body){
        console.log(key + ' : ' + params.body[key]);
        params.user[key] = params.body[key];
    }
    model.save();
    params.res.end("Success");
});

app.route('','/api/setTask',function(params){
    //Кому назначить задачу
    var user = model.getUserByLogin(params.body.user);
    if(!user){
        params.res.statusCode = '400';
        params.res.end('error: no such user');
        return;
    }
    
    //Кто назначает. (Текущий пользователь)
    params.body.author = params.user.login;
    //Описание задачи
    params.body.description = decodeURIComponent(params.body.description); 
    //Добавить задачу
    user.tasks.add(params.body);
    
    //Найти email пользователя, которому назначена задача
    var email = model.getUserByLogin(params.body.login).email;
    params.email = email;
    app.addNotification(params);
    //debug
    for(var key in params.body){
        console.log(key + ' : ' + params.body[key]);
    }
    
    model.save();
    params.res.end("Success");
});

app.route('register','/api/endSession',function(params){
   this.endSession(params);
});


app.route('401','/forbidden',function(params){
     params.res.end(pug.renderFile('./templates/401.pug', {}));
});

app.notFound(function(params){
    params.res.end(pug.renderFile('./templates/404.pug', {}));
});

module.exports = app;
