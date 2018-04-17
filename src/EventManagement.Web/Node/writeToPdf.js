const pdf = require('html-pdf');

/**
 * 
 * @param {stream.Duplex} result
 * @param {string} html 
 * @param {*} options 
 */
module.exports = function (result, html, options) {
    pdf.create(html).toStream(function(err, stream){
        stream.pipe(result.stream);
    });
}; 
