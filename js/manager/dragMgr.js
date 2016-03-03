air.define("air.management.DragManager", function() {
    
    "use strict";
    
    var doc = document;
    var mouseDown, lastMouseX, lastMouseY;
    
    function handleMouseDown(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        
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
            if (!mouseDown) {
                return;
            }
            var newX = event.clientX;
            var newY = event.clientY;

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
            domRef.onmousedown = handleMouseDown;
            doc.onmouseup = handleMouseUp;
            doc.onmousemove = handleMouseMoveWrapper(mouseMoveHandler);
        }
    };
});