var Router = require('./router');
var model  = require('../model');
var fs = require('fs');
var moment = require('moment');
var pug = require('pug');
var nodemailer = require('nodemailer');
require('dotenv').config({
    path: 'transport.env'
});
function App(){
    this.users = {};
    this.tokens = {};
    this.notifications = {};
    this.transporter = nodemailer.createTransport(process.env.transportKey);
    Router.call(this);
}

App.prototype = Object.create(Router.prototype);
App.prototype.constructor = App;


// token записывается в куки и отправляется клиенту. С помощью него происходит верификация для доступа к информации.
App.prototype.makeToken = function(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

App.prototype.parseCookies = function(req) {
    var list = {},
        rc = req.headers.cookie;

    rc && rc.split(';').forEach(function(cookie){
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
};

// Возвращает 'wrong login', 'wrong password' или token 
App.prototype.verifyUser = function(params){
        var login = params.query.login,
            password = params.query.pass,
            token;
    
        for (var key in this.users){
            console.log('47. Controller/app.js Users ' + key + ':' + this.users[key]); 
        }
    
        if(!(login in this.users)){
            params.res.statusCode = '401'; 
            params.res.end('error: wrong login');
            return;
        }
    
        if(this.users[login] !== password){
            params.res.statusCode = '401';
            params.res.end('error: wrong password');
            return;
        } 
    
        // Если все проверки успешны - создать секрет, передать пользователю в куки.  
        console.log("Success. Making a token");
        token = this.makeToken();
        this.tokens[token] = { expires : (new Date()).getMilliseconds() + 1*60*60*1000,
                         login: login};

        params.res.end(token);
};

App.prototype.registerUser = function(params){
    var login = params.query.login,
        password = params.query.pass,
        email = params.query.email;
    
    if(login in this.users){
        params.res.end('error: login is not available');
        return;
    }
    this.users[login] = password;
    model.addUser({login: login, email: email});
    model.save();
    
    fs.writeFile("./users.json", JSON.stringify(this.users), 'utf-8', function (err) {
        if (err) return console.log(err);
        console.log("The file was saved!");
    });
    
    params.res.end();
    
};

App.prototype.endSession = function (params){
    var cookies = params.cookies;
    if(cookies.secret){
        delete this.tokens[cookies.secret];
    }
    params.res.writeHead(200, {
                'Set-Cookie': 'secret=deleted; expires=Thu, Jan 01 1970 00:00:00 UTC;',
                'Content-Type': 'text/plain'
    }); 
    params.res.writeHead(302, {
            'Location' : '/', 
    }); 
    
    this.toRoute('home', {res: params.res});
};

// Создать список задач, которые требуют уведомления
App.prototype.initiateNotifications = function(){
    console.log('Seeking tasks for notifications...');
    
    var users = model.getUsers(),
        tasks = [];
    users.forEach(function(user, index){
        tasks[index] = user.tasks._collection;
    });

    for(var i = 0; i < tasks.length; i++){
        for(var j = 0; j < tasks[i].length; j++){
            if(moment(tasks[i][j].endDate).isAfter()){
                var key = moment(tasks[i][j].endDate).subtract(1,'d').format('x');
                this.notifications[key] = {
                    task: tasks[i][j],
                    email: users[i].email };
            }
        }
    }

    this.checkForNotifications();
};

App.prototype.addNotification = function(params){
      var task = params.body;
      var key = moment(task.endDate).subtract(1,'d').format('x');
      var email = params.email;
      console.log(task);
      console.log("Task added to notifications");
      this.notifications[key] = {task: task, email: email};
};

// Проверить, нужно ли уведомление
App.prototype.checkForNotifications = function(){
    console.log('Revising tasks for notifications');
    if(!this.notifications) return;
    var dates = Object.keys(this.notifications),
        now = (new Date()).getTime();
    
    dates = dates.filter(function(date){
        return date - now < 86400000;
    });
    
    for (var i = 0; i < dates.length; i++){
        this.sendNotification(this.notifications[dates[i]]);
        console.log('Notification has been sent! ' +  this.notifications[dates[i]].email);
        delete this.notifications[dates[i]];
    }
};

// Отправить уведомление через SendGrid
App.prototype.sendNotification = function(notification){
    
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"toDO - ontime" <noreply@todo.ontime>', // sender address
        to: notification.email, // list of receivers
        subject: 'Приближается время окончания задачи!', // Subject line
        text: 'Остался один день до завершения задачи: ' + notification.task.description, // plaintext body
        html: '<h1>Не забудь закрыть задачу!</h1><p>Остался один день до завершения задачи: </p><p>'+ 
        notification.task.description + '</p>'// html body
    };

    this.transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
    
};

App.prototype.render = function(path, params){
        try{
            params.res.end(pug.renderFile(path, params));
        } catch(e){
            console.log('Error in parsing file ' + path + ' Message: ' + e.message);
            console.log('Error in parsing file ' + e);
            params.res.end('Error in parsing file ' + path + ' Message: ' + e.name);
        }
};

module.exports = App;

