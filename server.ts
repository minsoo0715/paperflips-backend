let express = require('express');
let bodyParser = require('body-parser');
let request_other = require('request');
let cookieParser = require('cookie-parser');
let http = require('http');
import {Request, Response, NextFunction, Router} from 'express'

let app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req:Request,res:Response,next:NextFunction) {
    request_other.get({
        url: 'http://ip-api.com/json'
      }, function(error:any, response:any, body:any) {
        let data:any = JSON.parse(body);
        if(data.countryCode == "CN") { //중국 ip 차단
            res.status(404).end()
            return;
        }else {
            next();
        }
      }
      )
})


let router:Router = require('./router/main')(app);

app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


let server = app.listen(80 ,'141.164.50.191' ,function(){
    console.log("Express server has started on port 80");
})

/*
const https = require('https');
const fs = require('fs');
const options = {
  ca: fs.readFileSync('인증서경로/ca-chain-bundle.pem'),
  key: fs.readFileSync('인증서경로/domain_xxxxx.key.pem'),
  cert: fs.readFileSync('인증서경로/domain_xxxxx.crt.pem')
};
https.createServer(option, app).listen(3000 || process.env.PORT, function() {
        console.log("Express server has started on port 3000");
});
*/

app.use(express.static('public'));


