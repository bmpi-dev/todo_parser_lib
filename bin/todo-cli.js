#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const parse = require('../lib/ast');
const lexer = require('../lib/ast').lexer;
const render = require('../lib/render');
const argv = require('yargs')
    .usage('Usage: todo-plus-parser -i path -o out_file')
    .example('todo-plus-parser -i "./test/test_data" -o "./out.html"',
        'parse input dir todo file to render out.html file')
    .describe('i', 'input dir')
    .describe('o', 'input dir')
    .describe('d', 'debug switch')
    .default({d: false})
    .demandOption(['i', 'o'])
    .epilog('bmpidev copyright 2019')
    .argv;

const debug = argv.d;
const baseDir = argv.i;
const outFile = argv.o;

const doingJson = {
  'todo': [],
};
const criticalJson = {
  'todo': [],
};

try {
  const files = glob.sync(baseDir + '/**/*.todo');
  files.forEach(function(f) {
    const data = fs.readFileSync(f, 'utf8') + '\n';

    if (debug) {
      lexer.setInput(data);
      const arr = f.split('/');
      console.log('\n' + arr[arr.length - 1] + ' lex token is:\n');
      const tokens = [];
      let token;
      while (token = lexer.lex()) {
        if (token === 'NAME') {
          token += ': ' + lexer.yytext;
          console.log(token);
        } else {
          console.log(token);
        }
        tokens.push(token);
      }
    }

    let outJson = parse(data, 0);
    if (outJson != null && outJson != {} && outJson != '') {
      doingJson.todo = doingJson.todo.concat(outJson);
    }
    outJson = parse(data, 1);
    if (outJson != null && outJson != {} && outJson != '') {
      criticalJson.todo = criticalJson.todo.concat(outJson);
    }
  });

  const outputIndexHtml = render(doingJson, criticalJson);
  if (outFile != '') {
    fs.writeFile(outFile, outputIndexHtml, function(err, result) {
      if (err) throw err;
    });
  } else {
    console.log(outputIndexHtml);
  }
} catch (e) {
  console.log('Error:', e.stack);
}
