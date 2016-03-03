air.define("air.event.Dispatcher", function() {
    
    function Dispatcher() {
        this.handlers = {};
    }
    
    Dispatcher.prototype = {
        on: function(eventName, handler) {
            
            if (!this.handlers[eventName]) {
                this.handlers[eventName] = [];
            }
            
            this.handlers[eventName].push(handler);
        },
        fire: function(eventName, param) {
            
            var handlers = this.handlers[eventName];
            
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](param);
            }
        }
    };
    
    return Dispatcher;
});
