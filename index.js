const express = require('express');
const console = require('console');
const crypto = require('crypto');
const querystring = require('querystring');
const config = require('./config');
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const oauth = require('oauth-signature');


let app = express();
const server = 'http://localhost';
const port = process.env.PORT || 5000;
const baseURL = 'https://sandbox-quickbooks.api.intuit.com';


app.use(cookieParser());
app.use(session({ resave: false, saveUninitialized: false, secret: 'homigo' }));


app.listen( port, (err) => {
  if(err){
    console.log(err);
  }else{
    console.log("listening on: ",port);
  }
});



//functions
app.get('/oauth-redirect',(req, res) => {

  console.log(req.query);
  var sessionData = req.session;
  sessionData.AccessToken = '';
  sessionData.AccessTokenSecret = '';
  sessionData.Port = config.Port;
  sessionData.RealmID = req.query.realmId;
  var getAccessToken = {
      url: config.ACCESS_TOKEN_URL    ,
      oauth: {
          consumer_key: config.consumerKey,
          consumer_secret: config.consumerSecret,
          token: req.query.oauth_token,
          token_secret: req.session.oauth_token_secret,
          verifier: req.query.oauth_verifier,
          realmId: req.query.realmId
      }
  }
  request.post(getAccessToken, function (e, r, data) {
      var accessTokenLocal = querystring.parse(data);
      sessionData.AccessToken = accessTokenLocal.oauth_token;
      sessionData.AccessTokenSecret = accessTokenLocal.oauth_token_secret;
      console.log(accessTokenLocal);
      res.send('ok');
  })
});



app.get('/connect',(req,res) => {

  var sessionData = req.session;
  sessionData.oauth_token_secret = '';

  var getrequestToken = {
        url: config.REQUEST_TOKEN_URL,
        oauth: {
            callback: server + ':' + port + '/oauth-redirect/',
            consumer_key: config.consumerKey,
            consumer_secret: config.consumerSecret
        }
    }
    request.post(getrequestToken, function (e, r, data) {
        var requestToken = querystring.parse(data);
        sessionData.oauth_token_secret = requestToken.oauth_token_secret;
        console.log(requestToken);
        res.redirect(config.AuthorizeUrl + requestToken.oauth_token);
    })



})

app.get('/',(request,response) => {
  var options = {
    grantUrl: server + ':' + port + '/connect',
    datasources: 'quickbooks',
    oauth_token_secret: ''
  }

  response.redirect('https://appcenter.intuit.com/Connect/SessionStart?' + querystring.stringify(options));
});

app.get('/fetch', (req,res) => {
  runInvoiceQuery(req);
  res.send('fetched');
})

function runInvoiceQuery(){

  var realm = '193514560115814';
  var stmt = '';
  var tokenSec = 'DxqYimpOhoQ02o9OVtW26elTq1TlbA8kSPnsfE45';

  let para = {
    oauth_consumer_key : config.consumerKey,
    oauth_token : 'qyprd6QLfHssHusTxiJcLXbzSkoXieDpBchS8iApS8PF357w',
    oauth_signature_method : 'HMAC_SHA1',
    oauth_timestamp : + new Date(),
    oauth_nonce : crypto.randomBytes(16).toString('hex'),
    oauth_version : '1.0',
    query : 'SELECT * FROM Invoice WHERE TotalAmt > \'1000.0\'',

  }

  const urlBase = baseURL + '/v3/company/' + realm + '/query';

  const sig = oauth.generate('GET', urlBase, para, config.consumerSecret, tokenSec );

  para.oauth_signature = sig;

  console.log(urlBase + '?' + querystring.stringify(para));

  var options = {
    method: 'GET',
    url: urlBase,
    qs: para,
    headers: {
      'cache-control': 'no-cache'
    }
  }





  request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
}

/*app.get('/request-token',(request,response) => {
  getRequestToken(response);

});

function getRequestToken(response){

  const url = 'http://oauth.intuit.com/oauth/v1/get_request_token';

  const para = {
    oauth_callback: grantURL,
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: +new Date(), //doesnt work
    oauth_version: '1.0'
  }

  const encodedSignature = 'oauth_signature='+oauthSignature.generate('GET', url, para, consumerSecret);

  const encodedPara = querystring.stringify(para);

  response.send('ok');
  //response.send('ok');
  //response.redirect(url + '?' + encodedPara + '&' + encodedSignature);
  /*var options = {
    host: '173.240.170.92',
    port: '443',
    path: '/oauth/v1/get_request_token',
    headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          //'Content-Length': Buffer.byteLength(data)
      },
    method: 'POST'


  }

  http.request(options,(res) => {
    console.log(res.statusCode);
  }).on('error',(e) => {
    console.log(e);
  }).on('data',(d) => {
    console.log(d);
  });



  response.send('ok');

}*/
