/*
Create a Router class that would cover most of the basic needs:


-----------------------------------
Router.route(route, handler)
Router.route(name, route, handler)

Must register handler for given path.
Path may optionally contain parameters like "/item/:id", which must be passed to handler function
in order of appearance.

Registering a handler for path "/item/:id", then navigating to "/item/1", must call the handler function
with first argument set to "1".

Routes may optionally be named for convenience.


-----------------------------------
Router.notFound(handler)

Register a "Not found" handler, which will be called if navigating to path that doesnt match any defined route


-----------------------------------
Router.reverse(name)
Router.reverse(name, params)

Construct a path for given route name, optionally setting parameters, so
router.route("list", "/items", function...)
router.reverse("list") == "/items"

And

router.route("showItem", "/items/:id", function...)
router.reverse("showItem", { id: 1 }) == "/items/1"


-----------------------------------
Router.toPath(path)

Navigate to given path, calling all handlers


-----------------------------------
Router.toRoute(name)
Router.toRoute(name, params)

Navigate to given named route with optinal parameters


-----------------------------------
As always, look up the tests for concrete examples

-----------------------------------
To use such router in an SPA, you would either

1. Bind a global click-handler for <a> elements - will work with IE6+
2. Use a "hashchange" window event - will work with IE8+
*/

  // Edit code here
function Router() {
    this.routeMap = {};
    this.shortcuts = {};
    
}

Router.prototype.route = function(name, route, handler){
    if (arguments.length < 3) {
        handler = arguments[1];
        route = arguments[0];
    } else {
        this.shortcuts[name] = route;
    }
        var location = this.routeMap,
             path = route.slice(1).split('/');
       
    for (var i = 0; i < path.length; i++){
            //if an element does not exists - create new object 
            if (!(location[path[i]])){
                location[path[i]] = {"hash" : path[i]};
                if (path[i].indexOf(":") > -1){
                    location.hasSlug = true;
                    location.slug = path[i];
                }
            }  
            location = location[path[i]];
        }
    
    location.handler = handler;
};

Router.prototype.toPath = function(path, params){
    path = path.slice(1).split('/');
    var location = this.routeMap;
    for (var i = 0; i < path.length; i++){
        if (location[path[i]]){
            location = location[path[i]];
        } else if(location.hasSlug) {
            location = location[location.slug];
            params.id = path[i];
        } else {
            location = this.routeMap['not-found'];
            break;
        }     
    }
    if(location.handler){
        location.handler.call(this, params);
    } else {
        location = this.routeMap['not-found'];
        location.handler.call(this, params);
    }
};

Router.prototype.notFound = function(handler){
   if (handler){
       this.routeMap["not-found"] = { handler: handler};
   } 
    else this.routeMap["not-found"].handler();
};

Router.prototype.reverse = function(name, params){
    try{
        return this.shortcuts[name]
                .split('/')
                .map(function(item){
                        if(item.indexOf(':') > -1) return params.slug;
                        else return item;
                    }).join('/');
    } catch(e){
        console.log(e);
        this.notFound();
    }
   
    
};

Router.prototype.toRoute = function(name, params){
    this.toPath(this.reverse(name, params), params);
};

module.exports = Router;
