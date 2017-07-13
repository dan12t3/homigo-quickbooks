const express = require('express');
const http = require('http');

let app = express();





//functions

function getRequestToken(){
  var options = {

  }

  http.get(options, (response) => {

  });

}

// make a call to get request token - http.get
    //parameters
    //oauth_callback
    //oauth_nonce
    //timestamp



// handling

// listening on a PORT
app.listen( process.env.PORT || 5000, (err) => {
  if(err){
    console.log(err);
  }else{
    console.log("listening on: ",process.env.PORT || '5000');
  }
});
