
air.define("air.gl.Vector", function() {
    
    function Vector(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    Vector.prototype = {
        
        length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },
        
        normalize: function() {
            var r = this.length();
            return Vector.create(this.x / r, this.y / r, this.z / r);
        },
        
        add: function(v) {
            if (v instanceof Vector) {
                return Vector.create(this.x + v.x, this.y + v.y, this.z + v.z);
            }
            return Vector.create(this.x + v, this.y + v, this.z + v);
        },
        
        subtract: function(v) {
            if (v instanceof Vector) {
                return Vector.create(this.x - v.x, this.y - v.y, this.z - v.z);
            }
            return Vector.create(this.x - v, this.y - v, this.z - v);
        },
        
        multiply: function(v) {
            if (v instanceof Vector) {
                return Vector.create(this.x * v.x, this.y * v.y, this.z * v.z);
            }
            return Vector.create(this.x * v, this.y * v, this.z * v);
        },
        
        divide: function(v) {
            if (v instanceof Vector) {
                return Vector.create(this.x / v.x, this.y / v.y, this.z / v.z);
            }
            return Vector.create(this.x / v, this.y / v, this.z / v);
        },
        
        dot: function(v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        },
        
        cross: function(v) {
            return Vector.create(
                    this.y * v.z - this.z * v.y,
                    this.z * v.x - this.x * v.z,
                    this.x * v.y - this.y * v.x
            );
        },
        
        toAngles: function() {
            return {
                theta: Math.atan2(this.z, this.x),
                phi: Math.asin(this.y / this.length())
            };
        },
        
        toArray: function() {
            return [this.x, this.y, this.z];
        },
        
        toString: function() {
            return "x:" + this.x + "\ny:" + this.y + "\nz:" + this.z;
        }
    };

    Vector.create = function(x, y, z) {
        return new Vector(x, y, z);
    };

    Vector.lerp = function(a, b, fraction) {
        return b.subtract(a).multiply(fraction).add(a);
    };

    return Vector;
});
