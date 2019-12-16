var Lexer = require("lex");

var row = 1;
var col = 1;
var indent = [0];
var lexer = module.exports = new Lexer(function (char) {
    throw new Error("Unexpected character at row " + row + ", col " + col + ": " + char);
});

var flag = 0; // 0 - doing, 1 - critical
exports.flag = flag;

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
    var project_re = /^.*:$/g;
    if (lexeme.length == 0) {
        // return "EMPTY"
    } else if (lexeme.trim().startsWith("> ")) {
        // return "COMMENT"
    } else if (lexeme.trim().includes("@done") || lexeme.trim().includes("@cancelled")) {
        // return "DONE"
    } else if (project_re.test(lexeme.trim())) {
        this.yytext = lexeme;
        return "NAME";
    } else {
        // doing todo item
        if (flag == 0 && lexeme.trim().includes("@started")) {
            this.yytext = lexeme;
            return "NAME";
        }
        // critical item but is not doing
        if (flag == 1 && lexeme.trim().includes("@critical") && !lexeme.trim().includes("started")) {
            this.yytext = lexeme;
            return "NAME";
        }
    }
})

lexer.addRule(/$/gm, function () {
    col++;
    return "EOF";
});