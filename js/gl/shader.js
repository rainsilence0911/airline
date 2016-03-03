air.define("air.gl.Shader", function() {
    
    "use strict";
    
    var Matrix = air.require("air.gl.Matrix");
    var Vector = air.require("air.gl.Vector");
    var Mesh = air.require("air.gl.Mesh");
    
    /**
     * Creates a webgl context.
     * @param {!Canvas} canvas The canvas tag to get context
     *     from. If one is not passed in one will be created.
     * @return {!WebGLContext} The created context.
     */
    function create3DContext(canvas, opt_attribs) {

        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var context = null;
        for (var index = 0; index < names.length; ++index) {
            try {
                context = canvas.getContext(names[index], opt_attribs);
            } catch(e) {}

            if (context) {
                break;
            }
        }

        return context;
    };
    
    function regexMap(regex, text, callback) {
        var result;
        while ((result = regex.exec(text)) != null) {
            callback(result);
        }
    }
    
    function Shader(gl, vertexSource, fragmentSource) {
        
        this.resourceCount = 0;
        
        this.gl = gl;
        
        // Allow passing in the id of an HTML script tag with the source
        function followScriptTagById(id) {
            var element = document.getElementById(id);
            return element ? element.text : id;
        }

        vertexSource = followScriptTagById(vertexSource);
        fragmentSource = followScriptTagById(fragmentSource);

        // Compile and link errors are thrown as strings.
        function compileSource(type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw 'compile error: ' + gl.getShaderInfoLog(shader);
            }
            return shader;
        }
        this.program = gl.createProgram();
        gl.attachShader(this.program, 
                        compileSource(gl.VERTEX_SHADER,
                        vertexSource));
        gl.attachShader(this.program, 
                        compileSource(gl.FRAGMENT_SHADER,
                        fragmentSource));
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw 'link error: ' + gl.getProgramInfoLog(this.program);
        }
        this.attributes = {};
        this.uniformLocations = {};

        // Sampler uniforms need to be uploaded using `gl.uniform1i()` instead of `gl.uniform1f()`.
        // To do this automatically, we detect and remember all uniform samplers in the source code.
        var isSampler = {};
        regexMap(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, vertexSource + fragmentSource, function(groups) {
            isSampler[groups[2]] = 1;
        });
        this.isSampler = isSampler;
    };
    
    Shader.create = function(canvas, vertexSource, fragmentSource, options, opt_onError) {
        
        if (opt_onError && canvas.addEventListener) {
            canvas.addEventListener("webglcontextcreationerror", function(event) {
                opt_onError(event.statusMessage);
            }, false);
        }
        
        var gl = create3DContext(canvas, options);
        
        if (gl == null) {
            return null;
        }
        
        var shader = new Shader(gl, vertexSource, fragmentSource);
        
        shader.canvas = canvas;
        
        return shader;
    };
    
    
    function isArray(obj) {
        var str = Object.prototype.toString.call(obj);
        return str == '[object Array]' || str == '[object Float32Array]';
    }

    function isNumber(obj) {
        var str = Object.prototype.toString.call(obj);
        return str == '[object Number]' || str == '[object Boolean]';
    }
    

    Shader.prototype = {
        
        viewport: function(x, y, width, height) {
            if (arguments.length != 4) {
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            } else {
                this.gl.viewport(x, y, width, height);
            }
        },
        
        clearColor: function(r, g, b, a) {
            this.gl.clearColor(r, g, b, a);
        },
        
        clearDepth: function(depth) {
            this.gl.clearDepth(depth);
        },
        
        /**
         * Clear screen.
         * 
         * @param mode gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
         */
        clear: function(mode) {
            this.gl.clear(mode);
        },
        
        /**
         * Per-Fragment Operations(Depth Test)
         * 
         * @param mode
         */
        depthTest: function(mode) {
            
            var gl = this.gl;
            
            if (gl.isEnabled(gl.BLEND)) {
                gl.disable(gl.BLEND);
            }
            
            gl.enable(gl.DEPTH_TEST);
            if (mode) {
                gl.depthFunc(mode);
            }
        },
        
        /**
         * Per-Fragment Operations(Blend)
         * 
         * @param sfactor default is gl.SRC_ALPHA
         * @param dfactor default is gl.ONE
         */
        blend: function(sfactor, dfactor) {
            var gl = this.gl;
            
            if (gl.isEnabled(gl.DEPTH_TEST)) {
                gl.disable(gl.DEPTH_TEST);
            }
            
            gl.blendFunc(sfactor || gl.SRC_ALPHA, dfactor || gl.ONE);
            gl.enable(gl.BLEND);
        },
        
        createMesh: function() {
            return new Mesh(this.gl);
        },
        
        createFrameBufferTexture: function(width, height) {
            var gl = this.gl;
            var rttFramebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);

            var rttTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, rttTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            var renderbuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            
            return {buffer: rttFramebuffer, 
                    texture: {id: 0, texture: rttTexture, type: gl.TEXTURE_2D}, 
                    width: width, 
                    height: height};
        },
        
        // ### .uniforms(uniforms)
        // 
        // Set a uniform for each property of `uniforms`. The correct `gl.uniform*()` method is
        // inferred from the value types and from the stored uniform sampler flags.
        uniforms : function(uniforms) {
            
            var gl = this.gl;
            
            gl.useProgram(this.program);

            for (var name in uniforms) {
                var location = this.uniformLocations[name]
                        || gl.getUniformLocation(this.program, name);
                if (!location)
                    continue;
                this.uniformLocations[name] = location;
                var value = uniforms[name];
                if (value instanceof Vector) {
                    value = [ value.x, value.y, value.z ];
                } else if (value instanceof Matrix) {
                    value = value.m;
                }
                
                if (isArray(value)) {
                    switch (value.length) {
                    case 1:
                        gl.uniform1fv(location, new Float32Array(value));
                        break;
                    case 2:
                        gl.uniform2fv(location, new Float32Array(value));
                        break;
                    case 3:
                        gl.uniform3fv(location, new Float32Array(value));
                        break;
                    case 4:
                        gl.uniform4fv(location, new Float32Array(value));
                        break;
                    // Matrices are automatically transposed, since WebGL uses column-major
                    // indices instead of row-major indices.
                    case 9:
                        gl.uniformMatrix3fv(location, false, new Float32Array(value));
                        break;
                    case 16:
                        gl.uniformMatrix4fv(location, false, new Float32Array(value));
                        break;
                    default:
                        throw 'don\'t know how to load uniform "' + name
                                + '" of length ' + value.length;
                    }
                } else if (isNumber(value)) {
                    
                    gl.uniform1f(location, value);
//                    (this.isSampler[name] ? gl.uniform1i : gl.uniform1f).call(
//                            gl, location, value);
                } else {
                    
                    if (this.isSampler[name]) {
                        gl.activeTexture(gl.TEXTURE0 + value.id);
                        gl.bindTexture(value.type, value.texture);
                        gl.uniform1i(location, value.id);
                        continue;
                    }
                    
                    throw 'attempted to set uniform "' + name
                            + '" to invalid value ' + value;
                }
            }

            return this;
        },// ### .draw(mesh[, mode])
        // 
        // Sets all uniform matrix attributes, binds all relevant buffers, and draws the
        // mesh geometry as indexed triangles or indexed lines. Set `mode` to `gl.LINES`
        // (and either add indices to `lines` or call `computeWireframe()`) to draw the
        // mesh in wireframe.
        draw : function(mesh, mode) {
            this.drawBuffers(mesh.vertexBuffers,
                            mesh.indexBuffers,
                            arguments.length < 2 ? this.gl.TRIANGLES : mode);
        },

        // ### .drawBuffers(vertexBuffers, indexBuffer, mode)
        // 
        // Sets all uniform matrix attributes, binds all relevant buffers, and draws the
        // indexed mesh geometry. The `vertexBuffers` argument is a map from attribute
        // names to `Buffer` objects of type `gl.ARRAY_BUFFER`, `indexBuffer` is a `Buffer`
        // object of type `gl.ELEMENT_ARRAY_BUFFER`, and `mode` is a WebGL primitive mode
        // like `gl.TRIANGLES` or `gl.LINES`. This method automatically creates and caches
        // vertex attribute pointers for attributes as needed.
        drawBuffers : function(vertexBuffers, indexBuffer, mode) {
            
            var gl = this.gl;
            
            gl.useProgram(this.program);
            
            // Create and enable attribute pointers as necessary.
            var length = 0;
            for (var attribute in vertexBuffers) {
                var buffer = vertexBuffers[attribute];
                var location = this.attributes[attribute]
                        || gl.getAttribLocation(this.program, attribute);
                if (location == -1 || !buffer.buffer)
                    continue;
                this.attributes[attribute] = location;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(location, buffer.spacing,
                        gl.FLOAT, false, 0, 0);
                length = buffer.length / buffer.spacing;
            }

            // Disable unused attribute pointers.
            for (var attribute in this.attributes) {
                if (!(attribute in vertexBuffers)) {
                    gl.disableVertexAttribArray(this.attributes[attribute]);
                }
            }

            // Draw the geometry.
            if (length && (indexBuffer == null || indexBuffer.buffer)) {
                if (indexBuffer) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
                    gl.drawElements(mode, indexBuffer.length,
                            gl.UNSIGNED_SHORT, 0);
                } else {
                    gl.drawArrays(mode, 0, length);
                }
            }

            return this;
        },
        
        drawFrameBuffer: function(frameBuffer, renderFunc) {
            
            var gl = this.gl;
            
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.buffer);
            
            renderFunc.call(this, frameBuffer);
            
            gl.bindTexture(gl.TEXTURE_2D, frameBuffer.texture.texture);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    };
    
    return Shader;
});