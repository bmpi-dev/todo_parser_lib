var Mustache = require("mustache");
var fs = require('fs');

module.exports = function render(doing_json, critical_json) {
    let todo_template = fs.readFileSync(__dirname + '/template/todo_template.mustache');
    var output_doing_html = Mustache.render(todo_template.toString(), doing_json, {
        recurse: todo_template.toString()
    });
    var output_critical_html = Mustache.render(todo_template.toString(), critical_json, {
        recurse: todo_template.toString()
    });
    let index_template = fs.readFileSync(__dirname + '/template/index_template.mustache');
    var output_index_html = Mustache.to_html(index_template.toString(), {doing: {}, critical: {}}, {
        doing: output_doing_html,
        critical: output_critical_html
    });
    return output_index_html;
}