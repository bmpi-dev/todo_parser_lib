var Parser = require("jison").Parser;
var Lexer = require("lex");
var fs = require('fs');

var grammar = {
    "bnf": {
        "todo-plus": [
            ["todo-list EOF", "return $1;"]
        ],
        "todo-list": [
            ["todo",           "$$ = [$1];"],
            ["todo-list todo", "$$ = $1.concat($2);"]
        ],
        "todo": [
            ["item", "$$ = {name: $1};"],
            // ["NEWLINE", "$$ = []"],
            ["item INDENT todo-list DEDENT", "$$ = {name: $1, subs: $3};"],
            ["item INDENT DEDENT", "$$ = {name: $1, subs: []};"]
        ],
        "item": [
            ["NAME", "$$ = yytext;"]
        ]
    }
};

var parser = new Parser(grammar);
var row = 1;
var col = 1;
var indent = [0];
var lexer = parser.lexer = new Lexer(function (char) {
    throw new Error("Unexpected character at row " + row + ", col " + col + ": " + char);
});

lexer.addRule(/^[\t ]*/gm, function (lexeme) {
    var indentation = lexeme.length;

    col += indentation;

    if (indentation > indent[0]) {
        indent.unshift(indentation);
        return "INDENT";
    }

    var tokens = [];

    while (indentation < indent[0]) {
        tokens.push("DEDENT");
        indent.shift();
    }

    if (tokens.length) return tokens;
});

lexer.addRule(/\n+/gm, function (lexeme) {
    // col = 1;
    // row += lexeme.length;
    // return "NEWLINE";
});

lexer.addRule(/.*/gm, function (lexeme) {
    col += lexeme.length;
    if (lexeme.length == 0) {
    } else if (lexeme.trim().startsWith("> ")) {
    } else if (lexeme.trim().includes("@done")) {
    } else {
        this.yytext = lexeme;
        return "NAME";
    }
})

lexer.addRule(/$/gm, function () {
    col++;
    return "EOF";
});

try {
    let file_path = './test_data/';
    let file_name = 'test1.todo'
    var data = fs.readFileSync(file_path + file_name, 'utf8');
    lexer.setInput(data);
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

    var lex_file = fs.createWriteStream(file_path + file_name.split('.')[0] + '.lex');
    lex_file.on('error', function(err) { /* error handling */ });
    tokens.forEach(function(v) { lex_file.write(v + '\n'); });
    lex_file.end();

    console.log(JSON.stringify(parser.parse(data), null, 2));
} catch(e) {
    console.log('Error:', e.stack);
}