require('dotenv').config({
    path: 'sendgrid.env'
});

var http = require('http'), 
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    app = require('./controller'),
    schedule = require('node-schedule'),
    model = require('./model'),
    ROOT = __dirname;

init();

http.createServer(function(req, res) {
   var cookies = parseCookies(req),
       urlParsed = url.parse(req.url, true),
       login = getLogin(req);
  
    if(!(/^\/public/gi.test(urlParsed.pathname))){
        console.log(urlParsed.pathname);
    }
    
    //Запрос на статику - отправить.
    if(/^\/public/gi.test(urlParsed.pathname)||urlParsed.pathname == '/favicon.ico'){
        sendFile(urlParsed.pathname, res);
        return;
    } 
    
    //Доступ в main разрешен только зарегестрированным пользователям
    if(/^\/main/gi.test(urlParsed.pathname)) {
        
      if (!(cookies.secret&&getLogin(req))){
            res.statusCode = '401';
            app.toRoute('401', {res: res});
            return;
        }
    }  

    var params = {
            login: login,
            user: model.getUserByLogin(login),
            cookies: cookies,
            query: urlParsed.query,
            date: urlParsed.query.date,
            res: res,
    };
    
    //Если запрос содержит данные, нужно их считать
    var body = [];
    req.on('data', function(chunk) {
          body.push(chunk);
    }).on('end', function() {
         body = parseData(Buffer.concat(body).toString('utf-8'), '&');
         params.body = body;
        //Выполняем маршрутизацию со всеми необходимыми данными
         app.toPath(urlParsed.pathname, params);
    });
    

}).listen(3000);


function parseCookies (req) {
    var rc = req.headers.cookie;
    return parseData(rc, ';');
}

function parseData(data, divider){
    var list = {};
    divider = divider || ';';
    
    data && data.split(divider).forEach(function(cookie){
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURIComponent(parts.join('='));
    });

    return list;
}

function getLogin(req){
    var cookies = parseCookies(req),
        secret = cookies.secret;
    if(!app.tokens[secret]) return false;
    return app.tokens[secret].login;
};



function init() {
    readFile('./users.json', function(err, content){
        if (err) console.error(err);
        app.users = JSON.parse(content);
    });    
    console.log('Reading data');
    readFile('./usersManager.json', function(err, content){
        if (err) console.error(err);
        model.loadData(content);
        app.initiateNotifications();
        var notification =  schedule.scheduleJob('10 * * * * *', app.checkForNotifications);
    });
    
}





//Функция-обертка для чтения файла
function readFile(filePath, callback) {
    fs.readFile(filePath, 'utf-8', function (err, content) {
        if (err) return callback(err);
        callback(null, content);
    });
    
}

function sendFile(filePath, res){
     try{
        filePath = decodeURIComponent(filePath);
    } catch(e) {
        res.statusCode = '400';
        res.end('Bad request');
        return;
    }
    
    if(~filePath.indexOf('\0')){
        res.statusCode = '400';
        res.end('Bad request');
        return;
    }
    
    filePath = path.normalize(path.join(ROOT, filePath));
    
    if(filePath.indexOf(ROOT) !== 0){
        res.statusCode = '404';
        res.end('File not found!');
        return;
    }
    
    
    fs.stat(filePath, function(err, stats){
            if(err||!stats.isFile()) {
                res.statusCode = '404';
                res.end('File not found!');
                console.log('File not found!');
                return;
            }
            fs.readFile(filePath, function(err, data){
                if(err) throw err;
                var mime = require('mime').lookup(filePath);
                res.setHeader("Content-Type", mime + "; charset=utf-8");
                res.end(data);
        });
    
    });

}


//Сохранить данные клиента в файл
function save(req, res){
    model.saveData(req, res);   
}
