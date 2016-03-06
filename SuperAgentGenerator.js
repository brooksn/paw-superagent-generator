var Handlebars = require('./handlebars-v4.0.5.js');

// Extensions are implemented as JavaScript classes
var Generator = function() {

  // implement the generate(context) method to generate code
  this.generate = function(context) {
    var methodFn = 'get';
    
    var request = context.getCurrentRequest();

    var m = request.method;
    methodFn = m.toLowerCase();
    if (methodFn == 'delete') methodFn = 'del';
    
    var headers = {};
    for (var name in request.headers) {
      headers[name] = request.headers[name];
    }
    
    if (!headers['Content-Type']) {
      if (typeof request.jsonBody === 'object') headers['Content-Type'] = 'application/json';
      if (typeof request.urlEncodedBody === 'object') headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    
    var spliturl = request.url.split('?');
    var queries = [];
    var url = request.url;

    if (spliturl.length >= 2) {
      var url = spliturl.shift();
      var paramstring = spliturl.join('?');
      var params = paramstring.split('&');
      params.forEach(function(val, ind, arr){
        var partialqst = val.split('=');
        if (partialqst.length == 2) {
          var partialqobj = {};
          partialqobj[decodeURIComponent(partialqst[0])] = decodeURIComponent(partialqst[1]);
          queries.push(JSON.stringify(partialqobj));
        }
      });
    }
    var hbs = readFile('./template.hbs');
    var handlevars = {
      methodFn: methodFn,
      request: {
        multipartBody: request.multipartBody,
        jsonBody: request.jsonBody,
        body: request.body,
        redirects: request.redirects,
        url: request.url
      },
      url: url,
      name: request.name || url,
      queries: queries,
      headers: headers
    };
    
    var template = Handlebars.compile(hbs);
    return template(handlevars);
  }
}

Generator.identifier = "is.brooks.SuperAgentGenerator";
Generator.title = "SuperAgent Generator";
Generator.fileExtension = "js";
Generator.languageHighlighter = "javascript";

registerCodeGenerator(Generator);
