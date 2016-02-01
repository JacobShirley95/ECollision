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

    this.getNormal = function () {
        return new PVector(-this.y, this.x);
    }

    this.rotate = function (angle) {
        var x2 = this.x;
        var y2 = this.y;

        this.x = x2 * Math.cos(angle) - y2 * Math.sin(angle);
        this.y = x2 * Math.sin(angle) + y2 * Math.cos(angle);
    }
}