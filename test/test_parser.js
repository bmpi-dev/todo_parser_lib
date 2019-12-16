const {describe, it} = require('mocha');
const assert = require('assert');
const parse = require('../lib/ast');
const fs = require('fs');
const _ = require('lodash');

describe('Parser todo file test:', function() {
  it('parse todo file to doing json should be as expect', function() {
    const input = fs.readFileSync(__dirname + '/test_data/test.todo', 'utf8') + '\n';
    const expectJsonStr = fs.readFileSync(__dirname + '/test_data/test.doing.json', 'utf8');
    const expectJson = JSON.parse(expectJsonStr);
    // 0 is doing type
    const outJson = parse(input, 0);
    assert(_.isEqual(outJson, expectJson));
  });

  it('parse todo file to critical json should be as expect', function() {
    const input = fs.readFileSync(__dirname + '/test_data/test1.todo', 'utf8') + '\n';
    const expectJsonStr = fs.readFileSync(__dirname + '/test_data/test1.critical.json', 'utf8');
    const expectJson = JSON.parse(expectJsonStr);
    // 1 is critical type
    const outJson = parse(input, 1);
    assert(_.isEqual(outJson, expectJson));
  });
});
