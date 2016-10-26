/**
 * Implements CONREC.
 *
 * @param {function} drawContour function for drawing contour.  Defaults to a
 *                               custom "contour builder", which populates the
 *                               contours property.
 */
export declare class Conrec {
    private contours;
    private h;
    private sh;
    private xh;
    private yh;
    constructor();
    /**
     * drawContour - interface for implementing the user supplied method to
     * render the countours.
     *
     * Draws a line between the start and end coordinates.
     *
     * @param startX    - start coordinate for X
     * @param startY    - start coordinate for Y
     * @param endX      - end coordinate for X
     * @param endY      - end coordinate for Y
     * @param contourLevel - Contour level for line.
     */
    private drawContour(startX, startY, endX, endY, contourLevel, k);
    contourList(): any[];
    /**
     * contour is a contouring subroutine for rectangularily spaced data
     *
     * It emits calls to a line drawing subroutine supplied by the user which
     * draws a contour map corresponding to real*4data on a randomly spaced
     * rectangular grid. The coordinates emitted are in the same units given in
     * the x() and y() arrays.
     *
     * Any number of contour levels may be specified but they must be in order of
     * increasing value.
     *
     * IMPORTANT! This version (2.2+) now assumes row-major, but linearized matrix layout,
     *            unlike in 2.1.0 of conrec.ts
     *
     * @param {number[]} data - data to contour: linearized row-major matrix of size
     *                          (y.length rows, x.length columns)
     * @param {number} x_lo,x_hi,y_lo,y_hi - index bounds of data matrix
     *
     *             The following two, one dimensional arrays (x and y) contain
     *             the horizontal and vertical coordinates of each sample points.
     * @param {number[]} x  - data matrix column coordinates
     * @param {number[]} y  - data matrix row coordinates
     * @param {number[]} z  - contour levels in increasing order.
     */
    contour(data: number[], x_lo: number, x_hi: number, y_lo: number, y_hi: number, x: number[], y: number[], z: number[]): void;
}
