/**
 * 向量类
 */
function Vector(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

Vector.prototype = {
	
	/**
	 * 求向量长度
	 */
	length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	},
	
	/**
	 * 转换成单位向量
	 */
	normalize: function() {
		var r = this.length();
		return Vector.create(this.x / r, this.y / r, this.z / r);
	},
	
	/**
	 * 向量加法
	 */
	add: function(v) {
		if (v instanceof Vector) {
			return Vector.create(this.x + v.x, this.y + v.y, this.z + v.z);
		}
		return Vector.create(this.x + v, this.y + v, this.z + v);
	},
	
	/**
	 * 向量减法
	 */
	subtract: function(v) {
		if (v instanceof Vector) {
			return Vector.create(this.x - v.x, this.y - v.y, this.z - v.z);
		}
		return Vector.create(this.x - v, this.y - v, this.z - v);
	},
	
	/**
	 * 向量乘法
	 * 
	 * @param: Number/Vector
	 */
	multiply: function(v) {
		if (v instanceof Vector) {
			return Vector.create(this.x * v.x, this.y * v.y, this.z * v.z);
		}
		return Vector.create(this.x * v, this.y * v, this.z * v);
	},
	
	/**
	 * 向量除法
	 * 
	 * @param: Number/Vector
	 */
	divide: function(v) {
		if (v instanceof Vector) {
			return Vector.create(this.x / v.x, this.y / v.y, this.z / v.z);
		}
		return Vector.create(this.x / v, this.y / v, this.z / v);
	},
	
	/**
	 * 向量点乘
	 * 
	 * @param Vector
	 */
	dot: function(v) {
	    return this.x * v.x + this.y * v.y + this.z * v.z;
	},
	
	/**
	 * 向量叉乘
	 * 
	 * @param Vector
	 */
	cross: function(v) {
	    return Vector.create(
	    		this.y * v.z - this.z * v.y,
	    		this.z * v.x - this.x * v.z,
	    		this.x * v.y - this.y * v.x
	    );
	},
	
	/**
	 * 得到圆周角和仰角
	 */
	toAngles: function() {
		// Math.atan2(z, x) = Math.atan(z / x)
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

/**
 * 通过fraction取得a,b中的平均向量
 * 
 * @param fraction [0-1]
 */
Vector.lerp = function(a, b, fraction) {
    return b.subtract(a).multiply(fraction).add(a);
};
