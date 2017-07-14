const express = require('express');
const http = require('http');
const console = require('console');
const crypto = require('crypto');
const querystring = require('querystring');
const oauthSignature = require('oauth-signature');

//const bodyParser = require('body-parser');

let app = express();

const grantURL = 'https://kwikview-backend.herokuapp.com/oauth-redirect';
const consumerKey = 'qyprdpCFmIezychyaIgYRuY6osoApE';
const consumerSecret = 'gqtzYIHUtJEpodZGe1oqsvvoyVdEENds089e7x4e';


app.listen( process.env.PORT || 5000, (err) => {
  if(err){
    console.log(err);
  }else{
    console.log("listening on: ",process.env.PORT || '5000');
  }
});

//functions
app.get('/oauth-redirect',(request, response) => {
  console.log(request.query);
  response.end('redirected');
});

app.get('/request-token',(request,response) => {
  getRequestToken(response);

});

function getRequestToken(response){

  const url = 'https://oauth.intuit.com/oauth/v1/get_request_token';

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
  //response.send('ok');
  response.redirect(url + '?' + encodedPara + '&' + encodedSignature);

  /*var options = {
    host: 'oauth.intuit.com',
    port: 443,
    path: '/oauth/v1/get_request_token?' + encodedPara + '&' + encodedSignature,
    headers: {
      'User-Agent' : 'javascript'
    }
  }
  http.get(options,(res) => {
    console.log(res.statusCode);
  })
  .on('error',(err) => {
    console.log(err);
  }).on('data',(chunk)=>{
    console.log(chunk);
  });

  response.send('ok');
*/
}
