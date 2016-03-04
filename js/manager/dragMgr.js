air.define("air.management.DragManager", function() {
    
    "use strict";
    
    var doc = document;
    var mouseDown, lastMouseX, lastMouseY;
    
    function handleMouseDown(event) {
        
        if (event.type === "touchstart" && event.touches.length !== 1) {
            return;
        }
        
        mouseDown = true;
        lastMouseX = event.clientX || event.touches[0].clientX;
        lastMouseY = event.clientY || event.touches[0].clientY;
        
        event.preventDefault();
    }

    function handleMouseUp(event) {
        
        if (!mouseDown) {
            return;
        }
        
        mouseDown = false;
        event.preventDefault();
    }

    function handleMouseMoveWrapper(mouseMoveHandler) {
        return function(event) {
            if (!mouseDown ||
                (event.type === "touchmove" && event.touches.length !== 1)) {
                return;
            }
            
            var newX = event.clientX || event.touches[0].clientX;
            var newY = event.clientY || event.touches[0].clientY;

            var deltaX = newX - lastMouseX
            var deltaY = newY - lastMouseY;

            mouseMoveHandler({deltaX: deltaX, deltaY: deltaY});

            lastMouseX = newX
            lastMouseY = newY;

            event.preventDefault();
        };
    }
    
    return {
        register: function(domRef, mouseMoveHandler) {
            domRef.addEventListener("mousedown", handleMouseDown, false);
            domRef.addEventListener("touchstart", handleMouseDown, false);
            
            doc.addEventListener("touchend", handleMouseUp, false);
            doc.addEventListener("mouseup", handleMouseUp, false);
            
            var mouseMoveProxy = handleMouseMoveWrapper(mouseMoveHandler);
            doc.addEventListener("touchmove", mouseMoveProxy, false);
            doc.addEventListener("mousemove", mouseMoveProxy, false);
        }
    };
});