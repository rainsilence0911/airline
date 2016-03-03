(function() {
    
    "use strict";
    
    var cache = {};
    
    window.air = {
        define: function(id, clazz) {
            cache[id] = clazz();
        },
        
        require: function(id) {
            return cache[id];
        }
    };
    
})();