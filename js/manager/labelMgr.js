air.define("air.management.LabelManager", function() {
    
    "use strict";
    
    var Vector = air.require("air.gl.Vector");
    
    function LabelManager(eye, container) {
        this.container = container;
        this.eye = eye;
        this.labelCache = {};
    }

    LabelManager.prototype = {

        add : function(cityKey, label, position) {

            if (this.labelCache[cityKey]) {
                return;
            }

            var labelNode = document.createElement("div");
            labelNode.className = "city-label";
            labelNode.textContent = label;
            this.container.appendChild(labelNode);

            this.labelCache[cityKey] = {
                position : position,
                node : labelNode
            };
        },
        
        render : function(mvMatrix, pMatrix, canvas) {

            var eye = this.eye;
            var labelCache = this.labelCache;
            
            var displayList = [];
            
            for (var key in labelCache) {

                var label = labelCache[key];

                var cityLocation = label.position;
                var exactLocation = mvMatrix.transformPoint([ cityLocation[0], cityLocation[1], cityLocation[2], 1.0 ]);
                var cityVector = Vector.create(-exactLocation[0], -exactLocation[1], -exactLocation[2]);
                var cameraVector = Vector.create(eye[0], eye[1], eye[2]).subtract(cityVector);
                var node = label.node;
                
                var dotResult = cityVector.normalize().dot(cameraVector.normalize());
                
                if (dotResult <= 0) {
                    node.style.display = "none";
                    continue;
                }
                
                var point = pMatrix.transformPoint([ exactLocation[0],
                        exactLocation[1], exactLocation[2], 1.0 ]);
                var x = (point[0] / point[3]) * 0.5 + 0.5;
                var y = -(point[1] / point[3]) * 0.5 + 0.5;
                node.style.left = canvas.width * x + 'px';
                node.style.top = canvas.height * y + 'px';
                node.style.display = "inline-block";
                displayList.push({
                    node: node,
                    dot: dotResult
                });
            }
            
            displayList.sort(function(a, b) {
                return (a.dot > b.dot) ? 1 : -1;
            });
            
            displayList.forEach(function(item, i) {
                item.node.style.zIndex = i + 1;
            });
        }
    };
    
    return LabelManager;
});