import { Conrec } from './conrec';
import { data } from './data';

function range(a: number, b: number, inc?: number): number[] {
    const res = [];
    if (! inc)
        inc = 1;
    for (let val = a; val < b; val += inc)  {
        res.push(val);
    }
    return res;
}

function uniq(lst: number[]): number[] {
    return lst.sort((a, b) => a - b).filter((item, pos, arr) => !pos || item != arr[pos - 1]);
}

function transpose(array: number[][]) {
    return array[0].map((col, i) => array.map(row => row[i]));
}

describe('conrec', () => {
    let c: Conrec = null;
    let contours: any[] = [];

    it('can be created', () => {
        c = new Conrec();
    });
    it('can import test data', () => {
        expect(data).toBeDefined();
        expect(data instanceof Array).toBe(true);
    });
    it('can create contours for a simple array', () => {
        const zdata = [
          [0, 0, 0, 0, 0, 0],
          [0, 1, 1, 1, 1, 0],
          [0, 0, 0, 0, 1, 0],
          [0, 0, 0, 0, 0, 0]
        ];
        const zdata_flat = zdata.reduce((x, y) => x.concat(y));
        const xs = range(0, zdata[0].length);
        const ys = range(0, zdata.length);
        const zs = range(-1.5, 2.0, 1);
        c.contour(zdata_flat, 0, xs.length - 1, 0, ys.length - 1, xs, ys, zs);
        contours = c.contourList();
        // we should get a single contour with 25 points
        expect(contours).toHaveLength(1);
        expect(contours[0].level).toBe(0.5);
        expect(contours[0]).toHaveLength(25);
        // console.log(contours)
        // Export to Matlab
        // for (let c = 0; c < contours.length; ++c) {
        //     console.log('c' + c + ' = [' );
        //     for (let i = 0; i < contours[c].length; ++i) {
        //         console.log(contours[c][i].x + ' ' + contours[c][i].y);
        //     }
        //     console.log('];');
        // }
    });
    it('can create contours for a complex array', () => {
        const data_flat = data.reduce((x, y) => x.concat(y));
        const xs = range(0, data[0].length);
        const ys = range(0, data.length);
        const zs = range(-5, 3, .5);
        c.contour(data_flat, 0, xs.length - 1, 0, ys.length - 1, xs, ys, zs);
        contours = c.contourList();
        expect(data instanceof Array).toBe(true);
    });
    it('each contour should be a list of x/y pairs', () => {
        for (const cc of contours) {
            expect(cc).toHaveProperty('level');
            expect(data instanceof Array).toBe(true);
            for (let j = 0; j < cc.length; ++j) {
                expect(cc[j]).toHaveProperty('x');
                expect(cc[j]).toHaveProperty('y');
            }
        }
    });
    it('generates correct # of contours', () => {
        expect(contours).toHaveLength(155);
    });
    it('all levels should be present', () => {
        const levels = uniq(contours.map(x => x.level));
        expect(levels).toEqual([ -4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5 ]);
        // console.log(levels);
    });
});
