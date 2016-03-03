air.define("air.util.Bezier", function() {
    
    "use strict";
    
    var Vector = air.require("air.gl.Vector");
    
    /**
     * 2-dimension bezier curve
     */
    function bezierCurve2(p0, p1, p2) {

        // point result
        var p = [];

        for (var t = 0; t <= 1.01; t += 0.01) {
            p.push(Math.pow((1 - t), 2) * p0[0] + 2 * t * (1 - t) * p1[0]
                    + Math.pow(t, 2) * p2[0]);
            p.push(Math.pow((1 - t), 2) * p0[1] + 2 * t * (1 - t) * p1[1]
                    + Math.pow(t, 2) * p2[1]);
            p.push(Math.pow((1 - t), 2) * p0[2] + 2 * t * (1 - t) * p1[2]
                    + Math.pow(t, 2) * p2[2]);
        }
        return p;
    }

    function bezierCurve4(p0, p1, p2, p3, p4) {

        // point result
        var p = [];

        for (var t = 0; t <= 1.01; t += 0.01) {
            p.push(Math.pow((1 - t), 4) * p0[0] + 4 * t
                            * Math.pow((1 - t), 3) * p1[0] + 6 * t * t
                            * Math.pow((1 - t), 2) * p2[0] + 4 * Math.pow(t, 3)
                            * (1 - t) * p3[0] + Math.pow(t, 4) * p4[0]);
            p.push(Math.pow((1 - t), 4) * p0[1] + 4 * t
                            * Math.pow((1 - t), 3) * p1[1] + 6 * t * t
                            * Math.pow((1 - t), 2) * p2[1] + 4 * Math.pow(t, 3)
                            * (1 - t) * p3[1] + Math.pow(t, 4) * p4[1]);
            p.push(Math.pow((1 - t), 4) * p0[2] + 4 * t
                            * Math.pow((1 - t), 3) * p1[2] + 6 * t * t
                            * Math.pow((1 - t), 2) * p2[2] + 4 * Math.pow(t, 3)
                            * (1 - t) * p3[2] + Math.pow(t, 4) * p4[2]);
        }
        return p;
    }
    
    function createPointData(start, end, radius) {

        var midPoint = Vector.create((start[0] + end[0]) / 2,
                (start[1] + end[1]) / 2, (start[2] + end[2]) / 2);

        // the longer distance, higher line
        var distance = Math.sqrt(Math.pow((start[0] - end[0]), 2)
                + Math.pow((start[1] - end[1]), 2)
                + Math.pow((start[2] - end[2]), 2));

        var distancePercentage = distance / (radius * 2);

        if (distancePercentage <= 0.82) {
            // bezier point = (mid point coordinate / (len / radius))
            // definite proportion point
            var len = midPoint.length();
            // var percent = len / d;
            var percent = radius / len;
            // multi-number = mid point's surface coordinate * ((distance /
            // diameter) + 1)
            // if radius = 2, bezier point 's range is (2, 4]
            var bezierPoint = midPoint.multiply(percent).multiply(
                    distancePercentage * 1 + 1);

            return bezierCurve2(start, bezierPoint.toArray(), end);
        } else {

            var midArr = midPoint.toArray();

            var len2 = midPoint.length();
            var percent2 = radius / len2;
            var bezierPoint2 = midPoint.multiply(percent2).multiply(
                    distancePercentage * 1 + 1);

            midArr = bezierPoint2.toArray();

            var firstBezier = Vector.create((start[0] + midArr[0]) / 100,
                    (start[1] + midArr[1]) / 100, (start[2] + midArr[2]) / 100);
            var len1 = firstBezier.length();
            var percent1 = radius / len1;
            firstBezier = firstBezier.multiply(percent1).multiply(
                    distancePercentage * 1.13 + 1);

            var secondBezier = Vector.create((midArr[0] + end[0]) * 99 / 100,
                    (midArr[1] + end[1]) * 99 / 100,
                    (midArr[2] + end[2]) * 99 / 100);
            var len3 = secondBezier.length();
            var percent3 = radius / len3;
            secondBezier = secondBezier.multiply(percent3).multiply(
                    distancePercentage * 1.13 + 1);

            return bezierCurve4(start, firstBezier.toArray(), bezierPoint2
                    .multiply(0.5).toArray(), secondBezier.toArray(), end);
        }

    }
    
    return {
        createPointData: createPointData
    };
});