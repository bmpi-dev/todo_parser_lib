const parser = require('./parser');
parser.lexer = require('./lexer');

module.exports = function(data, type) {
  parser.lexer.changeFlag(type);
  return parser.parse(data);
};

module.exports.lexer = parser.lexer;
