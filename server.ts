import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";

import compression from "compression";
import fs from "fs";
import helmet from "helmet";
import https from "https";
import path from "path";
import { hostname } from "./config/hostname";
const favicon = require("serve-favicon");

import { chk_req } from "./MiddleWare/ipSecureFilter";

import Router from "./router/main";

const app = express();
app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(path.join(__dirname, "favicon", "favicon.ico")));

app.use(chk_req);
app.use(Router);

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === "production") {
  app.listen(80, hostname, () => {
    console.log("Express server has started on port 80");
  });
  const options = {
    ca: fs.readFileSync("ssl-key/paperflips_com.ca-bundle"),
    cert: fs.readFileSync("ssl-key/paperflips_com.crt"),
    key: fs.readFileSync("ssl-key/paperflips_com.key"),
  };

  https.createServer(options, app).listen(443, hostname, () => {
    console.log("Express server has started on port 443");
  });
} else if (process.env.NODE_ENV === "development") {
  app.listen(8000, () => {
    console.log("Express server has started on port 8000");
  });
}
