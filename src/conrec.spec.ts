/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/should/should.d.ts" />

import { Conrec } from './conrec';
import { should } from 'should';
() => should; // this line makes sure that 'should' actually loads
import { data } from './data';

function range(a: number, b: number, inc?: number): number[] {
    let res = [];
    if (! inc) 
        inc = 1;
    for (let val = a; val < b; val += inc)  {
        res.push(val);
    } 
    return res;
}

function uniq(lst: number[]): number[] {
    return lst.sort((a,b)=>a-b).filter((item, pos, arr) => !pos || item != arr[pos - 1]);
}

describe('conrec', () => {
    let c: Conrec = null;
    let contours: any[] = [];

    it('can be created', () => {
        c = new Conrec();
    });
    it('can import test data', () => {
        data.should.be.an.Array();
    });
    it('can create contours', () => {
        let xs = range(0, data.length);
        let ys = range(0, data[0].length);
        let zs = range(-5, 3, .5);
        c.contour(data, 0, xs.length - 1, 0, ys.length - 1, xs, ys, zs.length, zs);
        contours = c.contourList();
        contours.should.be.an.Array();
    });
    it('each contour should be a list of x/y pairs', () => {
        for (let i in contours) {
            let cc = contours[i];
            cc.should.have.property('level');
            cc.should.be.an.Array(); 
            for (let j=0; j < cc.length; ++j) {
                cc[j].should.be.an.Object().and.have.properties('x', 'y');
            }
        }    
    });
    it('generates correct # of contours', () => {
        contours.should.have.length(155);
    });
    it('all levels should be present', () => {    
        let levels = uniq(contours.map(x => x.level));
        levels.should.deepEqual([ -4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5 ]);
        console.log(levels);
    });
});
