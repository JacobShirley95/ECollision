
function PVector(x, y) {
    this.x = x;
    this.y = y;

    this.getMagnitude = function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    this.getMagnitudeNS = function () {
        return (this.x * this.x) + (this.y * this.y);
    }

    this.dotProduct = function (vec) {
        return (this.x * vec.x) + (this.y * vec.y);
    }

    this.normalise = function () {
        var mag = this.getMagnitude();
        if (mag > 0) {
            this.x /= mag;
            this.y /= mag;
        }
    }

    this.reflect = function (axis) {
        var newVec = new PVector(0, 0);
        var dp = this.dotProduct(axis);

        newVec.x = this.x - (2 * dp * axis.x);
        newVec.y = this.y - (2 * dp * axis.y);

        return newVec;
    }

    this.getNormal = function () {
        return new PVector(-this.y, this.x);
    }

    this.copy = function () {
        return new PVector(this.x, this.y);
    }

    this.invert = function () {
        this.x *= -1;
        this.y *= -1;
    }

    this.multiply = function (vector) {
        this.x *= vector.x;
        this.y *= vector.y;
    }

    this.scale = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    this.add = function (vec) {
        this.x += vec.x;
        this.y += vec.y;
    }

    this.rotate = function (ang) {
        var x2 = this.x;
        var y2 = this.y;

        this.x = x2 * Math.cos(ang) - y2 * Math.sin(ang);
        this.y = x2 * Math.sin(ang) + y2 * Math.cos(ang);
    }
}