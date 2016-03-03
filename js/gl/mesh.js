air.define("air.gl.Mesh", function() {
    
    function Mesh(gl) {
        this.gl = gl;
        this.vertexBuffers = {};
        this.indexBuffer = null;
    };
    
    Mesh.prototype = {
        
        addAttributeBuffer: function(attribute, array, pointNum) {
            var gl = this.gl;
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
            this.vertexBuffers[attribute] = {buffer: buffer, length: array.length, spacing: pointNum};
        },
        
        addIndexBuffer: function(array, drawMode) {
            var gl = this.gl;
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array), drawMode || gl.STATIC_DRAW);
            this.indexBuffers = {buffer: buffer, length: array.length};
        }
    };
    
    return Mesh;
});