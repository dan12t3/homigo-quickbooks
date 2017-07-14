const express = require('express');
const http = require('http');
const console = require('console');
const crypto = require('crypto');
const querystring = require('querystring');
//const bodyParser = require('body-parser');

let app = express();

const grantURL = 'http://localhost:5000.com/oauth-redirect';
const consumerKey = 'qyprdpCFmIezychyaIgYRuY6osoApE';

// listening on a PORT
/*app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(bodyParser.json());
*/
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
  response.end();
});

app.get('/',(request,response) => {
  getRequestToken();
  response.end("ok");
});


// test case
/*app.get('/oauth/v1/get_request_token',(request,response) =>{
  console.log(request.query);
  response.send('ok');
});*/

function getRequestToken(){
  //sending to
  //what im sending
  const data = querystring.stringify({
    'oauth_callback': grantURL,
    'oauth_consumer_key': consumerKey,
    'oauth_nonce': crypto.randomBytes(16).toString('hex'),
    'oauth_signature': 'eqjbD6s%2FZiZy8FiNU9uoaspF6Q4%3D&',
    'oauth_signature_method': 'HMAC-SHA1&',
    'oauth_timestamp': +new Date(), //doesnt work
    'oauth_version': '1.0'
  });

  const options = {
    host: 'oauth.intuit.com',
    path: '/oauth/v1/get_request_token?' + data,
    method: 'GET',
    port: 80,
  }

  let req = http.request(options, (response) => {
    console.log("Response Code:",response.statusCode);

  }).on('error',(err)=>{
    console.log("Error:",err);
  });
  req.setTimeout(3000,() => {
    console.log("timed out");
  });
  req.end();
}
