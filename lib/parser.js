
var Parser = require("jison").Parser;

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

module.exports = new Parser(grammar);