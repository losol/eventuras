var pdf = require('html-pdf');

module.exports = function (callback, filepath, html, options) {
    pdf.create(html, options).toFile(filepath, function(err, res) {
        if (err) callback(false);
        callback(null, true);
    });
}; 
