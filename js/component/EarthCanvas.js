air.define("air.component.EarthCanvas", function() {
    
    "use strict";
    
    var Shader = air.require("air.gl.Shader");
    var Vector = air.require("air.gl.Vector");
    var Matrix = air.require("air.gl.Matrix");
    var TextureLoader = air.require("air.gl.Texture");
    
    var Timer = air.require("air.util.Timer");
    var Events = air.require("air.event.Events");
    var dragManager = air.require("air.management.DragManager");
    var LabelManager = air.require("air.management.LabelManager");
    var Bezier = air.require("air.util.Bezier");
    
    var eye = [ 0, 0, 6 ], radius = 2;
    
    function EarthCanvas(dispatcher) {
        
        dispatcher.on(Events.ITEM_ADD, this.itemAddHandler.bind(this));
        dispatcher.on(Events.ITEM_REMOVE, this.itemRemoveHandler.bind(this));
        dispatcher.on(Events.ITEM_SELECT, this.itemSelectHandler.bind(this));
        
        this.earthMesh = null;
        this.lineMeshes = [];
        this.uniforms = {
            uAmbientColor: [0.2, 0.2, 0.2],
            uLightingDirection: Vector.create(-1.0, -1.0, -1.0).normalize(false).multiply(-1),
            uDirectionalColor: [0.8, 0.8, 0.8]
        };
        this.moonRotationMatrix = new Matrix();
        
        this.allPoints = {};
        this.timer = new Timer();
    }
    
    EarthCanvas.prototype = {
        
        shader: null,
        
        lineShader: null,
        
        labelManager: null,
        
        render: function() {
            var canvas = document.getElementById("canvas");
           
            this.initShaders(canvas);
            
            this.initBuffers();

            this.initManager();
            
            this.initDisplay();
        },
        
        initShaders: function(canvas) {
            
            var shader = Shader.create(canvas, "shader-vs", "shader-fs");
            if (shader == null) {
                throw "Engine can't initialize shader";
            }
            this.shader = shader;
            
            this.lineShader = Shader.create(canvas, "line-vs", "line-fs");
            if (this.lineShader == null) {
                throw "Engine can't initialize shader";
            }
            
            this.earthMesh = shader.createMesh();
        },
        
        initBuffers: function() {
            var latitudeBands = 180;
            var longitudeBands = 360;

            var vertexPositionData = [];
            var normalData = [];
            var textureCoordData = [];
            for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                var theta = latNumber * Math.PI / latitudeBands;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);

                for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                    var phi = longNumber * 2 * Math.PI / longitudeBands;
                    var sinPhi = Math.sin(phi);
                    var cosPhi = Math.cos(phi);

                    var x = cosPhi * sinTheta;
                    var y = cosTheta;
                    var z = sinPhi * sinTheta;
                    var u = 1 - (longNumber / longitudeBands);
                    var v = 1 - (latNumber / latitudeBands);

                    normalData.push(x);
                    normalData.push(y);
                    normalData.push(z);
                    textureCoordData.push(u);
                    textureCoordData.push(v);
                    var xValue = radius * x;
                    var yValue = radius * y;
                    var zValue = radius * z;
                    vertexPositionData.push(xValue);
                    vertexPositionData.push(yValue);
                    vertexPositionData.push(zValue);
                    this.allPoints[longNumber + ":" + (90 - latNumber)] = [ xValue, yValue, zValue ];
                }
            }

            var indexData = [];
            for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
                for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                    var first = (latNumber * (longitudeBands + 1)) + longNumber;
                    var second = first + longitudeBands + 1;
                    indexData.push(first);
                    indexData.push(second);
                    indexData.push(first + 1);

                    indexData.push(second);
                    indexData.push(second + 1);
                    indexData.push(first + 1);
                }
            }

            var mesh = this.earthMesh;
            
            mesh.addAttributeBuffer("aVertexPosition", vertexPositionData, 3);

            mesh.addAttributeBuffer("aTextureCoord", textureCoordData, 2);

            mesh.addAttributeBuffer("aVertexNormal", normalData, 3);

            mesh.addIndexBuffer(indexData);
        },
        
        initManager: function() {
            
            this.labelManager = new LabelManager(eye, document.getElementById("container"));
            
            dragManager.register(canvas, this.mouseMoveHandler.bind(this));
        },
        
        initDisplay: function() {
            
            var shader = this.shader;
            
            shader.clearColor(0.0, 0.0, 0.0, 1.0);
            shader.depthTest();

            var uniforms = this.uniforms;
            uniforms.uPMatrix = Matrix.perspective(45, shader.canvas.width / shader.canvas.height, 0.1, 100.0);
            
            this.timer.addTask(this.onFrameEnter.bind(this));
            
            TextureLoader.mitMap(shader.gl, "image/earth.jpg", function(texture) {
                uniforms.uSampler = texture;
                this.timer.start();
            }.bind(this));
        },
        
        onFrameEnter: function() {

            var shader = this.shader;
            var gl = this.shader.gl;

            shader.viewport();
            shader.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            var uniforms = this.uniforms;
            uniforms.uUseLighting = document.getElementById("lighting").checked;

            // prepare view matrix
            var mvMatrix = Matrix.lookAt(eye[0], eye[1], eye[2], 0, 0, 0, 0, 1, 0);
            
            // prepare view-model matrix
            mvMatrix = Matrix.multiply(mvMatrix, this.moonRotationMatrix);
            uniforms.uMVMatrix = mvMatrix;
            
            // prepare normal line matrix
            uniforms.uNMatrix = mvMatrix.inverseTranspose();

            // render earth
            shader.uniforms(uniforms).draw(this.earthMesh, gl.TRIANGLES);

            // render line
            var lineShader = this.lineShader;
            var lineMeshes = this.lineMeshes;
            
            for (var index = 0; index < lineMeshes.length; index++) {
                uniforms.uSelect = lineMeshes[index].isSelect || false;
                lineShader.uniforms(uniforms).draw(lineMeshes[index].value, gl.LINE_STRIP);
            }

            // render data label
            this.labelManager.render(mvMatrix, uniforms.uPMatrix, shader.canvas);
        },
        
        itemAddHandler: function(e) {

            var startKey = e.startKey, endKey = e.endKey;
            
            if (this.indexOfLineMeshes(e.key) != -1) {
                alert("The coordinate is duplicated.");
                return;
            }
            
            var allPoints = this.allPoints;
            
            var pointPath = Bezier.createPointData(allPoints[startKey], allPoints[endKey], radius);

            var lineMesh = this.lineShader.createMesh();

            lineMesh.addAttributeBuffer("aVertexPosition", pointPath, 3);

            this.lineMeshes.push({
                key : e.key,
                value : lineMesh,
                isSelect : e.isSelect || false
            });
            
            if (e.isCreateCityLabel) {
                this.labelManager.add(startKey, e.startCity, allPoints[startKey]);
                this.labelManager.add(endKey, e.endCity, allPoints[endKey]);
            }
        },
        
        itemRemoveHandler: function(e) {
            var index = this.indexOfLineMeshes(e.key);
            if (index == -1) {
                return;
            }
            this.lineMeshes.splice(index, 1);
        },
        
        itemSelectHandler: function(e) {
            var index = this.indexOfLineMeshes(e.key);
            if (index == -1) {
                return;
            }

            var lineMeshes = this.lineMeshes;
            
            for (var i = 0; i < lineMeshes.length; i++) {
                lineMeshes[i].isSelect = false;
            }

            lineMeshes[index].isSelect = true;
        },
        
        indexOfLineMeshes: function(key) {
            var lineMeshes = this.lineMeshes;
            for (var index = 0; index < lineMeshes.length; index++) {
                if (lineMeshes[index].key == key) {
                    return index;
                }
            }
            return -1;
        },
        
        mouseMoveHandler: function(e) {

            var newRotationMatrix = new Matrix();
            newRotationMatrix.rotate(e.deltaX / 10, 0, 1, 0);
            newRotationMatrix.rotate(e.deltaY / 10, 1, 0, 0);

            this.moonRotationMatrix = Matrix.multiply(newRotationMatrix, this.moonRotationMatrix);
        }
    };
    
    return EarthCanvas;
});