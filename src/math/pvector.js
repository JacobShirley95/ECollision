/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PVector;
export default (PVector = class PVector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getMagnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    getMagnitudeNS() {
        return (this.x * this.x) + (this.y * this.y);
    }

    dotProduct(vec) {
        return (this.x * vec.x) + (this.y * vec.y);
    }

    getNormal() {
        return new PVector(-this.y, this.x);
    }

    rotate(angle) {
        const x2 = this.x;
        const y2 = this.y;

        this.x = (x2 * Math.cos(angle)) - (y2 * Math.sin(angle));
        return this.y = (x2 * Math.sin(angle)) + (y2 * Math.cos(angle));
    }
});