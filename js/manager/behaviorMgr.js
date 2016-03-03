air.define("air.management.BehaviorManager", function() {
    "use strict";
    
    var BehaviorManager = {
        handlerMap : {},
        register : function(elementId, config) {

            if (this.handlerMap[elementId] != null) {
                this.handlerMap[elementId].push(config);
                return;
            }

            this.handlerMap[elementId] = [ config ];

            var targetThis = this;

            var handler = (function(id) {
                return function(e) {

                    var event = e || window.event;
                    var target = e.target || e.srcElement;

                    var targetClass = target.className;

                    var handlers = targetThis.handlerMap[id];

                    for (var i = 0; i < handlers.length; i++) {
                        if (targetClass.indexOf(handlers[i].target) == -1) {
                            continue;
                        }
                        handlers[i].callback(target);
                    }

                };
            })(elementId);

            document.getElementById(elementId).addEventListener(config.eventType, handler, false);
        }
    };
    
    return BehaviorManager;
});