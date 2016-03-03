(function() {
	
	/**
	 * The definition of texture handler.
	 */
	var TextureType = {
		NEAREST: createNearestTexture,
		LINEAR: createLinearTexture,
		MITMAP: createMipmapTexture
	};
	
	var idGenerator = 0;
	
	/**
	 * Factory method.
	 * 
	 * @param gl WebGL instance
	 * @param path Image path.
	 * @param handler Texture Type
	 * @param callback In order to return texture.
	 */
	function load(gl, path, handler, callback) {
		
		var image = new Image();
		
		image.src = path;
		
		if (image.complete) {
			var texture = handler(gl, image);
            callback(texture);
            return;
		}
		
		image.onload = function () {
            var texture = handler(gl, image);
            callback(texture);
        };
	}
	
	/**
	 * The handler to create nearest texture.
	 * 
	 * @param gl
	 * @param image
	 */
	function createNearestTexture(gl, image) {
		var texture = gl.createTexture();
		
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        return {id: idGenerator++, texture: texture, type: gl.TEXTURE_2D};
    }
	
	/**
	 * The handler to create linear texture.
	 * 
	 * @param gl
	 * @param image
	 */
	function createLinearTexture(gl, image) {
		var texture = gl.createTexture();
		
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
		return {id: idGenerator++, texture: texture, type: gl.TEXTURE_2D};
	}
	
	/**
	 * The handler to create linear mitmap texture.
	 * 
	 * @param gl
	 * @param image
	 */
	function createMipmapTexture(gl, image) {
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		
        gl.generateMipmap(gl.TEXTURE_2D);
        
		gl.bindTexture(gl.TEXTURE_2D, null);
		return {id: idGenerator++, texture: texture, type: gl.TEXTURE_2D};
	}

	/**
	 * The factory method to execute nearest handler.
	 */
	function loadAsNearest(gl, path, callback) {
		load(gl, path, TextureType.NEAREST, callback);
	}
	
	/**
	 * The factory method to execute linear handler.
	 */
	function loadAsLinear(gl, path, callback) {
		load(gl, path, TextureType.LINEAR, callback);
	}
	
	/**
	 * The factory method to execute linear mitmap handler.
	 */
	function loadAsMitMap(gl, path, callback) {
		load(gl, path, TextureType.MITMAP, callback);
	}
	
	/**
	 * 
	 * @param pathArrs [0]:The image path for POSITIVE_X
	 * 				   [1]:The image path for NEGATIVE_X
	 * 				   [2]:The image path for POSITIVE_Y
	 * 				   [3]:The image path for NEGATIVE_Y
	 * 				   [4]:The image path for POSITIVE_Z
	 * 				   [5]:The image path for NEGATIVE_Z
	 */
	function loadCubeMap(gl, pathArrs, callback) {
		
		if (pathArrs == null || pathArrs.length != 6) {
			throw "The parameters is wrong.";
		}
		
		var loadedCount = 6;
		
		var texture = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    
	    // FIXME: TEXTURE_WRAP_R doesn't exist in OpenGL ES?!
	    //  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		
	    var faces = [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
	                 gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
	                 gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
	                 gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
	                 gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
	                 gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
	    
		for (var index = 0; index < pathArrs.length; index++) {
			
			var image = new Image();
			
			image.onload = function(texture, image, face) {
				return function() {
					loadedCount--;
					
					gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
					
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	                gl.texImage2D(
	                   face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
					
					if (loadedCount == 0) {
						callback({id: 0, texture: texture, type: gl.TEXTURE_CUBE_MAP});
					}
				};
			}(texture, image, faces[index]);
			image.src = pathArrs[index];
		}
	}
	
	/**
	 * External interface.
	 */
	TextureLoader = {
		nearest: loadAsNearest,
		linear: loadAsLinear,
		mitMap: loadAsMitMap,
		cubeMap: loadCubeMap
	};
})();