// Helper function
$.postJSON = function(url, data, callback) {
    return jQuery.ajax({
        headers: { 
            'Content-Type': 'application/json' 
        },
        'type': 'POST',
        'url': url,
        'data': JSON.stringify(data)
    });
};