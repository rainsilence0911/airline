air.define("air.management.BehaviorManager", function() {
    "use strict";
    
    var doc = document;
    
    var BehaviorManager = {
        handlerMap : {},
        register : function(elementId, config) {

            if (this.handlerMap[elementId] == null) {
                this.handlerMap[elementId] = {};
            }
            
            var handlerMapper = this.handlerMap[elementId];
            var eventType = config.eventType;
            if (handlerMapper[eventType] != null) {
                handlerMapper[eventType].push(config);
                return;
            }

            handlerMapper[eventType] = [ config ];

            var handler = (function(handlerMap) {
                return function(e) {

                    var event = e || window.event;
                    var target = e.target || e.srcElement;

                    var targetClass = target.className;

                    var handlers = handlerMap[e.type];

                    for (var i = 0; i < handlers.length; i++) {
                        if (targetClass.indexOf(handlers[i].target) === -1) {
                            continue;
                        }
                        handlers[i].callback(target);
                    }
                };
            })(handlerMapper);

            doc.getElementById(elementId).addEventListener(config.eventType, handler, false);
        }
    };
    
    return BehaviorManager;
});