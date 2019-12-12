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
    var data = fs.readFileSync('./test_data/test.todo', 'utf8');
    // lexer.setInput(data);
    // lexer.lex();
    console.log(JSON.stringify(parser.parse(data), null, 2));
} catch(e) {
    console.log('Error:', e.stack);
}