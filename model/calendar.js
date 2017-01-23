var TasksManager = require('./tasksManager');
var moment = require('moment');
var pug = require('pug');

moment.locale('ru');

function Calendar(tasksManager){
    this._tm = tasksManager || new TasksManager();
    this.days = [];
    this.currentMonth = moment();
}

Calendar.prototype.generateMonth = function(now){
    if (!now){
        now = moment().startOf('month');
    } else {
        now = moment(now).startOf('month');
    }
    this.days.length = 0;
    this.currentMonth = moment(now).startOf('month');
    var daysInMonth = now.daysInMonth();
    for (var i = 0; i < daysInMonth; i++){
        var tasks = this._tm.getTasksForDate(now);
        tasks = tasks || [];
        this.days.push(new Day(now, tasks));
        now.add(1,'d');
    }
    return this;
};

Calendar.prototype.getDayById = function(id){
    var result;
    this.days.some(function(day){
        if (day.date.format('x') == id) result = day;
    });
    return result;
};

Calendar.prototype.toString = function(){
  return 'calendar';  
};

/* Создаю день со списком задач 
Для этого внутри объекта День создам массив задач с теми свойствами, которые нужны для рендеринга
htmlClass нужен, чтобы показать в календаре начало, продолжение и окончание задачи.
viewPosition нужен, чтобы задачи не сдвигались в календаре по вертикали, при окончании предыдущей задачи.
*/
function Day(date, tasks){
    this.date = moment(date) || moment().startOf('day');
    this.tasks = [];

    for (var i = 0; i < tasks.length; i++){
        if (!tasks[i].viewPosition){
            tasks[i].viewPosition = this.findEmptyPosition();
        }
        var processedTask = {};
        processedTask.description = tasks[i].description;
        processedTask.id = tasks[i].id; 
        
        var htmlClass =  ['calendar__task'];
        if (tasks[i].startDate.isSame(date, 'day')){
            htmlClass.push('calendar__task_starting');
           
        }
        if (tasks[i].endDate.isSame(date, 'day')){
            htmlClass.push('calendar__task_ending');
        }
        processedTask.htmlClass = htmlClass.join(' ');

        this.tasks[tasks[i].viewPosition] = processedTask;
    }
    if (tasks.length > 0) this.normalizeTasks();

}

Day.prototype.normalizeTasks = function(){
    for( var i = 0; i < this.tasks.length; i++){
        var item = this.tasks[i];
        if (!item) {
            item = {};
            item.htmlClass = 'calendar__task calendar__task_empty';
            item.description = '&nbsp;';  
        } 
        this.tasks[i] = item;
    }
};

Day.prototype.findEmptyPosition = function(){
    for(var i = 0; i < this.tasks.length; i++){
        if (!this.tasks[i]) return i;
    }
    return this.tasks.length;
};

    
Day.prototype.render = function(fullDay){
    
      if(fullDay){
           return pug.renderFile('../assets/templates/fullDay.pug', this);
      } else {
           return pug.renderFile('../assets/templates/day.pug', this);
      }
    
     
};

module.exports = Calendar;