var parser = require("./parser");
parser.lexer = require("./lexer");

module.exports = function (data, type) {
    parser.lexer.flag = type;
    return parser.parse(data);
};