(function() {

    "use strict";
    
    var EventDispatcher = air.require("air.event.Dispatcher");
    
    var ControlPanel = air.require("air.component.ControlPanel");
    var EarthCanvas = air.require("air.component.EarthCanvas");
    
    var components = [EarthCanvas, ControlPanel];
    
    window.onload = function() {
        var dispatcher = new EventDispatcher();
        components.forEach(function(Component) {
            new Component(dispatcher).render();
        });
    };
})();