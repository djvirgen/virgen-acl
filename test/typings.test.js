/// <reference path="../typings.d.ts" />
 
const ts =   require("typescript")
const tt =   require("typescript-definition-tester")
const fs =   require("fs")
const chai =   require("chai")
 
describe('Typescript Typings', () => {
    it('should run all examples with out type errors', (done) => {
        tt.compileDirectory(
            __dirname + '/examples',
            (fileName) => fileName.indexOf('.ts') > -1,
            () => done()
            );
    });
});