#!/usr/bin/env node

var fs = require('fs');
var glob = require("glob");
var parse = require('../lib/ast');
var lexer = require('../lib/ast').lexer;
var render = require('../lib/render');
var argv = require('yargs')
    .usage('Usage: todo-plus-parser -i path -o out_file')
    .example('todo-plus-parser -i "./test/test_data" -o "./out.html"', 'parse input dir todo file to render out.html file')
    .describe('i', 'input dir')
    .describe('o', 'input dir')
    .describe('d', 'debug switch')
    .default({d: false})
    .demandOption(['i', 'o'])
    .epilog('bmpidev copyright 2019')
    .argv;

let debug = argv.d;
let base_dir = argv.i;
let out_file = argv.o;

var doing_json = {
    "todo": []
};
var critical_json = {
    "todo": []
};

try {
    let files = glob.sync(base_dir + "/**/*.todo");
    files.forEach(function (f) {
        var data = fs.readFileSync(f, 'utf8') + "\n";

        if (debug) {
            lexer.setInput(data);
            let arr = f.split('/');
            console.log("\n" + arr[arr.length - 1] + " lex token is:\n");
            let tokens = [];
            while (token = lexer.lex()) {
                if (token === 'NAME') {
                    token += ": " + lexer.yytext
                    console.log(token)
                } else {
                    console.log(token)
                }
                tokens.push(token);
            }
        }
        
        var out_json = parse(data, 0);
        if (out_json != null) {
            doing_json.todo = doing_json.todo.concat(out_json);
        }
        out_json = parse(data, 1);
        if (out_json != null) {
            critical_json.todo = critical_json.todo.concat(out_json);
        }
    });

    var output_index_html = render(doing_json, critical_json);
    if (out_file != "") {
        fs.writeFile(out_file, output_index_html, function(err, result) {
            if (err) throw err;
        });
    } else {
        console.log(output_index_html);
    }
} catch(e) {
    console.log('Error:', e.stack);
}