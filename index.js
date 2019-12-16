var Parser = require("jison").Parser;
var Lexer = require("lex");
var fs = require('fs');
var glob = require("glob");

var grammar = {
    "bnf": {
        "todo-plus": [
            ["todo-list EOF", "return $1;"]
        ],
        "todo-list": [
            ["todo",           "$$ = $1 == null ? null : [$1];"],
            ["todo-list todo", "if ($1 == null) { $$ = $2; } else { if ($2 == null) { $$ == $1; } else { $$ = $1.concat($2); } };"]
        ],
        "todo": [
            ["item", "$$ = {name: $1, todo: []};"],
            // ["NEWLINE", "$$ = []"],
            ["item INDENT todo-list DEDENT", "$$ = $3 == null ? $3 : {name: $1, todo: $3};"],
            ["item INDENT DEDENT", "$$ = null;"]
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

var flag = 0; // 0 - doing, 1 - critical

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

let base_dir = "./test_data";
let debug = false;

try {
    var doing_json = {
        "todo": []
    };
    var critical_json = {
        "todo": []
    };
    glob(base_dir + "/**/*.todo", {}, function (er, files) {
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
            
            flag = 0;
            var out_json = parser.parse(data);
            if (out_json != null) {
                doing_json.todo = doing_json.todo.concat(out_json);
            }
            flag = 1;
            out_json = parser.parse(data);
            if (out_json != null) {
                critical_json.todo = critical_json.todo.concat(out_json);
            }  
        });
        let file_doing_json = JSON.stringify(doing_json, null, 2);
        let file_critical_json = JSON.stringify(critical_json, null, 2);
        fs.writeFile(base_dir + '/doing.json', file_doing_json);
        fs.writeFile(base_dir + '/critical.json', file_critical_json);
    })
} catch(e) {
    console.log('Error:', e.stack);
}