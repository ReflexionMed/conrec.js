/**
 * Copyright (c) 2010, Jason Davies.
 *
 * All rights reserved.  This code is based on Bradley White's Java version,
 * which is in turn based on Nicholas Yue's C++ version, which in turn is based
 * on Paul D. Bourke's original Fortran version.  See below for the respective
 * copyright notices.
 *
 * See http://local.wasp.uwa.edu.au/~pbourke/papers/conrec/ for the original
 * paper by Paul D. Bourke.
 *
 * The vector conversion code is based on http://apptree.net/conrec.htm by
 * Graham Cox.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the <organization> nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Copyright (c) 1996-1997 Nicholas Yue
 *
 * This software is copyrighted by Nicholas Yue. This code is based on Paul D.
 * Bourke's CONREC.F routine.
 *
 * The authors hereby grant permission to use, copy, and distribute this
 * software and its documentation for any purpose, provided that existing
 * copyright notices are retained in all copies and that this notice is
 * included verbatim in any distributions. Additionally, the authors grant
 * permission to modify this software and its documentation for any purpose,
 * provided that such modifications are not distributed without the explicit
 * consent of the authors and that existing copyright notices are retained in
 * all copies. Some of the algorithms implemented by this software are
 * patented, observe all applicable patent law.
 *
 * IN NO EVENT SHALL THE AUTHORS OR DISTRIBUTORS BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING OUT
 * OF THE USE OF THIS SOFTWARE, ITS DOCUMENTATION, OR ANY DERIVATIVES THEREOF,
 * EVEN IF THE AUTHORS HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * THE AUTHORS AND DISTRIBUTORS SPECIFICALLY DISCLAIM ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.  THIS SOFTWARE IS
 * PROVIDED ON AN "AS IS" BASIS, AND THE AUTHORS AND DISTRIBUTORS HAVE NO
 * OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR
 * MODIFICATIONS.
 */
//
function pointsEqual(a, b) {
    const x = a.x - b.x, y = a.y - b.y;
    return x * x + y * y < Number.EPSILON;
}

type LinkedList = {
    p: any,
    prev: LinkedList,
    next: LinkedList,
    head?: LinkedList,
    tail?: LinkedList,
    closed?: boolean
};

function reverseList(list: LinkedList) {
    let pp = list.head;

    while (pp) {
        // swap prev/next pointers
        const temp1 = pp.next;
        pp.next = pp.prev;
        pp.prev = temp1;

        // continue through the list
        pp = temp1;
    }

    // swap head/tail pointers
    const temp2 = list.head;
    list.head = list.tail;
    list.tail = temp2;
}


class ContourBuilder {
    level: any;
    s: LinkedList;
    count: number;

    constructor(level) {
        this.level = level;
        this.s = null;
        this.count = 0;
    }

    remove_seq(list) {
        // if list is the first item, static ptr s is updated
        if (list.prev) {
            list.prev.next = list.next;
        } else {
            this.s = list.next;
        }

        if (list.next) {
            list.next.prev = list.prev;
        }
        --this.count;
    }

    addSegment(a, b) {
        let ss = this.s;
        let ma: LinkedList = null;
        let mb: LinkedList = null;
        let prependA = false;
        let prependB = false;

        while (ss) {
            if (ma == null) {
                // no match for a yet
                if (pointsEqual(a, ss.head.p)) {
                    ma = ss;
                    prependA = true;
                } else if (pointsEqual(a, ss.tail.p)) {
                    ma = ss;
                }
            }
            if (mb == null) {
                // no match for b yet
                if (pointsEqual(b, ss.head.p)) {
                    mb = ss;
                    prependB = true;
                } else if (pointsEqual(b, ss.tail.p)) {
                    mb = ss;
                }
            }
            // if we matched both no need to continue searching
            if (mb != null && ma != null) {
                break;
            } else {
                ss = ss.next;
            }
        }

        // c is the case selector based on which of ma and/or mb are set
        const c = ((ma != null) ? 1 : 0) | ((mb != null) ? 2 : 0);

        switch (c) {
            case 0: {  // both unmatched, add as new sequence
                const aa: any = { p: a, prev: null };
                const bb: any = { p: b, next: null };
                aa.next = bb;
                bb.prev = aa;

                // create sequence element and push onto head of main list. The order
                // of items in this list is unimportant
                ma = { p: null, head: aa, tail: bb, next: this.s, prev: null, closed: false };
                if (this.s) {
                    this.s.prev = ma;
                }
                this.s = ma;

                ++this.count;    // not essential - tracks number of unmerged sequences
                break;
            }
            case 1: {  // a matched, b did not - thus b extends sequence ma
                const pp: LinkedList = { p: b, prev: null, next: null };

                if (prependA) {
                    pp.next = ma.head;
                    pp.prev = null;
                    ma.head.prev = pp;
                    ma.head = pp;
                } else {
                    pp.next = null;
                    pp.prev = ma.tail;
                    ma.tail.next = pp;
                    ma.tail = pp;
                }
                break;
            }
            case 2: {  // b matched, a did not - thus a extends sequence mb
                const pp: LinkedList = { p: a, prev: null, next: null };

                if (prependB) {
                    pp.next = mb.head;
                    pp.prev = null;
                    mb.head.prev = pp;
                    mb.head = pp;
                } else {
                    pp.next = null;
                    pp.prev = mb.tail;
                    mb.tail.next = pp;
                    mb.tail = pp;
                }
                break;
            }
            case 3: {  // both matched, can merge sequences
                // if the sequences are the same, do nothing, as we are simply closing this path (could set a flag)

                if (ma === mb) {
                    const pp: LinkedList = { p: ma.tail.p, next: ma.head, prev: null };
                    ma.head.prev = pp;
                    ma.head = pp;
                    ma.closed = true;
                    break;
                }

                // there are 4 ways the sequence pair can be joined. The current setting of prependA and
                // prependB will tell us which type of join is needed. For head/head and tail/tail joins
                // one sequence needs to be reversed
                switch ((prependA ? 1 : 0) | (prependB ? 2 : 0)) {
                    case 0:   // tail-tail
                        // reverse ma and append to mb
                        reverseList(ma);
                    // fall through to head/tail case
                    case 1:   // head-tail
                        // ma is appended to mb and ma discarded
                        mb.tail.next = ma.head;
                        ma.head.prev = mb.tail;
                        mb.tail = ma.tail;

                        // discard ma sequence record
                        this.remove_seq(ma);
                        break;

                    case 3:   // head-head
                        // reverse ma and append mb to it
                        reverseList(ma);
                    // fall through to tail/head case
                    case 2:   // tail-head
                        // mb is appended to ma and mb is discarded
                        ma.tail.next = mb.head;
                        mb.head.prev = ma.tail;
                        ma.tail = mb.tail;

                        // discard mb sequence record
                        this.remove_seq(mb);
                        break;
                }
            }
        }
    }
}

/**
 * Implements CONREC.
 *
 * @param {function} drawContour function for drawing contour.  Defaults to a
 *                               custom "contour builder", which populates the
 *                               contours property.
 */
export class Conrec {
    private contours: any; // ContourBuilder[]
    private h: any[];
    private sh: any[];
    private xh: any[];
    private yh: any[];

    constructor() {
        this.contours = {};
        this.h = new Array(5);
        this.sh = new Array(5);
        this.xh = new Array(5);
        this.yh = new Array(5);
    }

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
    private drawContour(startX, startY, endX, endY, contourLevel, k) {
        let cb = this.contours[k];
        if (!cb) {
            cb = this.contours[k] = new ContourBuilder(contourLevel);
        }
        cb.addSegment({ x: startX, y: startY }, { x: endX, y: endY });
    }

    contourList() {
        const l = [];
        const keys = Object.keys(this.contours);
        for (const k of keys) {
            let s = this.contours[k].s;
            const level = this.contours[k].level;
            while (s) {
                let h = s.head;
                const l2: any = []; // XXX: setting properties on a list (l2.k = ...) is an ugly hack! because they are invisible...
                l2.level = level;
                l2.k = k;
                while (h && h.p) {
                    l2.push(h.p);
                    h = h.next;
                }
                l.push(l2);
                s = s.next;
            }
        }
        l.sort((a, b) => a.k - b.k);
        return l;
    }

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
    contour(data: number[],
            x_lo: number, x_hi: number, y_lo: number, y_hi: number,
            x: number[], y: number[], z: number[]) {
        const width = x.length;
        const h = this.h, sh = this.sh, xh = this.xh, yh = this.yh;
        this.contours = {};
        if (data.length != x.length * y.length) {
            throw new Error('data matrix should have x.length * y.length elements');
        }

        /** private */
        const xsect = function (p1, p2) {
            return (h[p2] * xh[p1] - h[p1] * xh[p2]) / (h[p2] - h[p1]);
        };

        const ysect = function (p1, p2) {
            return (h[p2] * yh[p1] - h[p1] * yh[p2]) / (h[p2] - h[p1]);
        };
        let m1;
        let m2;
        let m3;
        let case_value;
        let dmin;
        let dmax;
        let x1 = 0.0;
        let x2 = 0.0;
        let y1 = 0.0;
        let y2 = 0.0;

        // The indexing of im and jm should be noted as it has to start from zero
        // unlike the fortran counter part
        const im = [0, 1, 1, 0];
        const jm = [0, 0, 1, 1];

        // Note that castab is arranged differently from the FORTRAN code because
        // Fortran and C/C++ arrays are transposed of each other, in this case
        // it is more tricky as castab is in 3 dimensions
        const castab = [
            [
                [0, 0, 8], [0, 2, 5], [7, 6, 9]
            ],
            [
                [0, 3, 4], [1, 3, 1], [4, 3, 0]
            ],
            [
                [9, 6, 7], [5, 2, 0], [8, 0, 0]
            ]
        ];

        for (let j = (y_hi - 1); j >= y_lo; j--) {
            for (let i = x_lo; i <= x_hi - 1; i++) {
                let temp1, temp2;
                const ii = i + j * width;
                temp1 = Math.min(data[ii], data[ii + width]);
                temp2 = Math.min(data[ii + 1], data[ii + 1 + width]);
                dmin = Math.min(temp1, temp2);
                temp1 = Math.max(data[ii], data[ii + width]);
                temp2 = Math.max(data[ii + 1], data[ii + 1 + width]);
                dmax = Math.max(temp1, temp2);

                if (dmax >= z[0] && dmin <= z[z.length - 1]) {
                    for (let k = 0; k < z.length; k++) {
                        if (z[k] >= dmin && z[k] <= dmax) {
                            let m = 4;
                            for (m = 4; m >= 0; m--) {
                                if (m > 0) {
                                    // The indexing of im and jm should be noted as it has to
                                    // start from zero
                                    h[m] = data[ii + im[m - 1] + jm[m - 1] * width] - z[k];
                                    xh[m] = x[i + im[m - 1]];
                                    yh[m] = y[j + jm[m - 1]];
                                } else {
                                    h[0] = 0.25 * (h[1] + h[2] + h[3] + h[4]);
                                    xh[0] = 0.5 * (x[i] + x[i + 1]);
                                    yh[0] = 0.5 * (y[j] + y[j + 1]);
                                }

                                if (h[m] > Number.EPSILON) {
                                    sh[m] = 1;
                                } else if (h[m] < -Number.EPSILON) {
                                    sh[m] = -1;
                                } else {
                                    sh[m] = 0;
                                }
                            }

                            /**
                             * Note: at this stage the relative heights of the corners and the
                             * centre are in the h array, and the corresponding coordinates are
                             * in the xh and yh arrays. The centre of the box is indexed by 0
                             * and the 4 corners by 1 to 4 as shown below.
                             * Each triangle is then indexed by the parameter m, and the 3
                             * vertices of each triangle are indexed by parameters m1,m2,and
                             * m3.
                             * It is assumed that the centre of the box is always vertex 2
                             * though this isimportant only when all 3 vertices lie exactly on
                             * the same contour level, in which case only the side of the box
                             * is drawn.
                             *
                             *
                             *      vertex 4 +-------------------+ vertex 3
                             *               | \               / |
                             *               |   \    m-3    /   |
                             *               |     \       /     |
                             *               |       \   /       |
                             *               |  m=2    X   m=2   |       the centre is vertex 0
                             *               |       /   \       |
                             *               |     /       \     |
                             *               |   /    m=1    \   |
                             *               | /               \ |
                             *      vertex 1 +-------------------+ vertex 2
                             *
                             *
                             *
                             *               Scan each triangle in the box
                             */

                            for (m = 1; m <= 4; m++) {
                                m1 = m;
                                m2 = 0;
                                if (m != 4) {
                                    m3 = m + 1;
                                } else {
                                    m3 = 1;
                                }
                                case_value = castab[sh[m1] + 1][sh[m2] + 1][sh[m3] + 1];
                                if (case_value != 0) {
                                    switch (case_value) {
                                        case 1: // Line between vertices 1 and 2
                                            x1 = xh[m1];
                                            y1 = yh[m1];
                                            x2 = xh[m2];
                                            y2 = yh[m2];
                                            break;
                                        case 2: // Line between vertices 2 and 3
                                            x1 = xh[m2];
                                            y1 = yh[m2];
                                            x2 = xh[m3];
                                            y2 = yh[m3];
                                            break;
                                        case 3: // Line between vertices 3 and 1
                                            x1 = xh[m3];
                                            y1 = yh[m3];
                                            x2 = xh[m1];
                                            y2 = yh[m1];
                                            break;
                                        case 4: // Line between vertex 1 and side 2-3
                                            x1 = xh[m1];
                                            y1 = yh[m1];
                                            x2 = xsect(m2, m3);
                                            y2 = ysect(m2, m3);
                                            break;
                                        case 5: // Line between vertex 2 and side 3-1
                                            x1 = xh[m2];
                                            y1 = yh[m2];
                                            x2 = xsect(m3, m1);
                                            y2 = ysect(m3, m1);
                                            break;
                                        case 6: //  Line between vertex 3 and side 1-2
                                            x1 = xh[m3];
                                            y1 = yh[m3];
                                            x2 = xsect(m1, m2);
                                            y2 = ysect(m1, m2);
                                            break;
                                        case 7: // Line between sides 1-2 and 2-3
                                            x1 = xsect(m1, m2);
                                            y1 = ysect(m1, m2);
                                            x2 = xsect(m2, m3);
                                            y2 = ysect(m2, m3);
                                            break;
                                        case 8: // Line between sides 2-3 and 3-1
                                            x1 = xsect(m2, m3);
                                            y1 = ysect(m2, m3);
                                            x2 = xsect(m3, m1);
                                            y2 = ysect(m3, m1);
                                            break;
                                        case 9: // Line between sides 3-1 and 1-2
                                            x1 = xsect(m3, m1);
                                            y1 = ysect(m3, m1);
                                            x2 = xsect(m1, m2);
                                            y2 = ysect(m1, m2);
                                            break;
                                        default:
                                            break;
                                    }
                                    // Put your processing code here and comment out the printf
                                    // printf("%f %f %f %f %f\n",x1,y1,x2,y2,z[k]);
                                    this.drawContour(x1, y1, x2, y2, z[k], k);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

