var http = require('http'),
    https = require('https'),
    connect = require('connect'),
    httpProxy = require('http-proxy');


var selects = [];
var simpleselect = {};
//http://localhost:8000/b/ref=br_imp/276-1898230-3717528?_encoding=UTF8&node=4550130031&pf_rd_m=A3JWKAKR8XB7XF&pf_rd_s=desktop-sidekick-1&pf_rd_r=JWMM7M5712DN35H1TECN&pf_rd_t=36701&pf_rd_p=657152027&pf_rd_i=desktop

//<img id="logo" src="/images/logo.svg" alt="node.js">
//simpleselect.query = 'img';
simpleselect.query = '.s9Price';
//simpleselect.query = '.a-color-price';
simpleselect.func = function (node) {    
    //Create a read/write stream wit the outer option 
    //so we get the full tag and we can replace it
    var stm = node.createStream();

    //variable to hold all the info from the data events
    var tag = '';

    //collect all the data in the stream
    stm.on('data', function(data) {
       tag += data;
    });

    //When the read side of the stream has ended..
    stm.on('end', function() {

      //Print out the tag you can also parse it or regex if you want
      process.stdout.write('tag:   ' + tag + '\n');
      process.stdout.write('end:   ' + node.name + '\n');
	  var newTag = "invalid";
      try {
		  var price = tag.split("EUR&#160;")[1];
		  price = parseFloat(price.replace(',','.'));
		  var days = price / 0.25;
		  days = Math.round(days);
		  newTag = "FOOD FOR " + days + " DAYS IN THE THIRD WORLD";
	  } catch (ex) {
	  }
		  
      //Now on the write side of the stream write some data using .end()
      //N.B. if end isn't called it will just hang.  
      stm.end(newTag);
    });    
}

selects.push(simpleselect);

//
// Basic Connect App
//
var app = connect();

var proxy = httpProxy.createProxyServer({
   target: 'https://www.amazon.de',
   agent  : https.globalAgent, 
   headers:{ host: 'www.amazon.de' },
   autoRewrite: true
})


app.use(require('harmon')([], selects, true));

app.use(
  function (req, res) {
    proxy.web(req, res);
  }
);

http.createServer(app).listen(8000);