import { GeoPoint } from './AerowayUtils.js'

export default class LineHelper {

    /// <summary>
    /// Find the point of intersection between the lines p1 --> p2 and p3 --> p4
    /// http://csharphelper.com/blog/2014/08/determine-where-two-lines-intersect-in-c/
    /// </summary>
    /// <param name="p1">Start of first segment.</param>
    /// <param name="p2">End of first segment.</param>
    /// <param name="p3">Start of second segment.</param>
    /// <param name="p4">End of second segment.</param>
    /// <param name="intersection">The point of intersection.</param>
    /// <returns>The point of intersection or undefined</returns>
    static FindIntersection(
        p1, p2, p3, p4) {
        // Get the segments' parameters.
        var dx12 = p2.X - p1.X;
        var dy12 = p2.Y - p1.Y;
        var dx34 = p4.X - p3.X;
        var dy34 = p4.Y - p3.Y;
        var intersection;

        // Solve for t1 and t2
        var denominator = (dy12 * dx34 - dx12 * dy34);

        var t1 =
            ((p1.X - p3.X) * dy34 + (p3.Y - p1.Y) * dx34)
            / denominator;
        if (Infinity == t1) {
            // The lines are parallel (or close enough to it).
            intersection = new GeoPoint(double.NaN, double.NaN);
            return false;
        }

        var t2 =
            ((p3.X - p1.X) * dy12 + (p1.Y - p3.Y) * dx12)
            / -denominator;

        // Find the point of intersection.
        intersection = new GeoPoint(p1.X + dx12 * t1, p1.Y + dy12 * t1);

        // The segments intersect if t1 and t2 are between 0 and 1.
        if ((t1 >= 0) && (t1 <= 1) &&
            (t2 >= 0) && (t2 <= 1))
        {
            return intersection;
        }

        return undefined;
    }
}

