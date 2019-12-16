const Mustache = require('mustache');
const fs = require('fs');

module.exports = function render(doingJson, criticalJson) {
  const todoTemplate = fs.readFileSync(__dirname + '/template/todo_template.mustache');
  const outputDoingHtml = Mustache.render(todoTemplate.toString(), doingJson, {
    recurse: todoTemplate.toString(),
  });
  const outputCriticalHtml = Mustache.render(todoTemplate.toString(), criticalJson, {
    recurse: todoTemplate.toString(),
  });
  const indexTemplate = fs.readFileSync(__dirname + '/template/index_template.mustache');
  const outputIndexHtml = Mustache.to_html(indexTemplate.toString(), {doing: {}, critical: {}}, {
    doing: outputDoingHtml,
    critical: outputCriticalHtml,
  });
  return outputIndexHtml;
};
