const express = require("express");
const next = require("next");
const ngrok = require("ngrok");

const port = parseInt(process.env.PORT, 10) || 5000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const bodyParser = require("body-parser");
const session = require("express-session");
const MemcachedStore = require("connect-memcached")(session);
const axios = require("axios");

import { subscribe } from "./back-services/server-sent-events";
const makeConnectionRequest = require("./back-controllers/controllers")
  .makeConnectionRequest;
const cacheUserConnectionRequest = require("./back-controllers/controllers")
  .cacheUserConnectionRequest;
const credentialsIssuanceConnectionResponse = require("./back-controllers/controllers")
  .credentialsIssuanceConnectionResponse;
const issueVc = require("./back-controllers/controllers").issueVC;

const onlyConnectionRequest = require("./back-controllers/controllers")
  .onlyConnectionRequest;
const onlyConnectionResponse = require("./back-controllers/controllers")
  .onlyConnectionResponse;
const onlyIssueVC = require("./back-controllers/controllers").onlyIssueVC;

import { getCache } from "./helpers/CacheHelper";
const claimsCache = getCache();

import {
  makeSession,
  update,
  makeToken,
  validate,
  sealIssueVC
} from "./back-controllers/sealApiControllers";

import { validateToken, getSessionData } from "./back-services/sealServices";

import { makeUserDetails } from "./helpers/DataStoreHelper";

let endpoint = "";

const memoryStore = new session.MemoryStore();
//export NODE_ENV=production
const isProduction = process.env.NODE_ENV === "production";
const SESSION_CONF = {
  secret: "this is my super super secret, secret!! shhhh",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: memoryStore,
  maxExpiration: 90000
};

if (isProduction) {
  console.log(`will set sessionstore to memcache ${process.env.MEMCACHED_URL}`);
  SESSION_CONF.store = new MemcachedStore({
    hosts: [process.env.MEMCACHED_URL],
    secret: "123, easy as ABC. ABC, easy as 123", // Optionally use transparent encryption for memcache session data
    ttl: 90000,
    maxExpiration: 90000
  });
}

// keycloack confniguration

const KeycloakMultiRealm = require("./back-services/KeycloakMultiRealm");
const SEAL_EIDAS_URI=process.env.SEAL_EIDAS_URI?process.env.SEAL_EIDAS_URI:'vm.project-seal.eu'
const SEAL_EIDAS_PORT=process.env.SEAL_EIDAS_PORT?process.env.SEAL_EIDAS_PORT:'8091'
const SEAL_EDUGAIN_URI= process.env.SEAL_EDUGAIN_URI?process.env.SEAL_EDUGAIN_URI:'vm.project-seal.eu'
const SEAL_EDUGAIN_PORT=process.env.SEAL_EDUGAIN_PORT?process.env.SEAL_EDUGAIN_PORT:''
 
const eidasRealmConfig = {
  realm: "eidas",
  "auth-server-url": "https://esmo-gateway.eu/auth",
  "ssl-required": "none",
  resource: "testClient",
  credentials: {
    secret: "317f5c96-dbf9-45f0-9c46-f8d7e7934b8c"
  },
  "confidential-port": 0
};

const keycloak = new KeycloakMultiRealm({ store: memoryStore }, [
  // esmoRealmConfig,
  eidasRealmConfig
]);

//end of keycloak config

app.prepare().then(() => {
  const server = express();
  server.set("trust proxy", 1); // trust first proxy
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json({ type: "*/*" }));

  // set session managment
  if (process.env.HTTPS_COOKIES === true) {
    SESSION_CONF.cookie.secure = true; // serve secure cookies, i.e. only over https, only for production
  }
  server.use(session(SESSION_CONF));
  server.use(keycloak.middleware());

  //start server sent events for the server
  server.get("/events", subscribe);

  
  server.get(["/home", "/"], (req, res) => {
    // console.log(`server.js-home::found existing session ${req.session.id}`);
    const mockData = {};
    if (!req.session.userData) req.session.userData = mockData;
    req.session.endpoint = endpoint;
    req.session.baseUrl = process.env.BASE_PATH;
    return app.render(req, res, "/", req.query);
  });

   
  /*
    ######################################
    #### SECURE CONTROLLERS ############//
  */

  server.post("/issueVCSecure", (req, res) => {
    req.endpoint = endpoint;
    console.log("server.js -- issueVCSecure::  issueVCSecure");
    return onlyIssueVC(req, res);
  });

  
  // ###############################################
  server.post(
    [
      "/onlyConnectionRequest",
      "/vc/issue/onlyConnectionRequest",
      "/vc/onlyConnectionRequest"
    ],
    (req, res) => {
      req.endpoint = endpoint;
      req.baseUrl = process.env.BASE_PATH;
      console.log(
        "server.js -- onlyConnectionRequest::  onlyConnectionRequest"
      );
      return onlyConnectionRequest(req, res);
    }
  );

  server.post(
    [
      "/onlyConnectionResponse",
      "/vc/issue/onlyConnectionResponse",
      "/vc/onlyConnectionResponse"
    ],
    (req, res) => {
      req.endpoint = endpoint;
      console.log(
        "server.js -- onlyConnectionResponse::  onlyConnectionResponse"
      );
      return onlyConnectionResponse(req, res);
    }
  );

  // ############################################### //#endregion

  /*
    ######################################
    #### SEAL Specific Controllers ############
    ########################################
  */
  server.post(
    ["/seal/start-session", "/vc/issue/seal/start-session"],
    async (req, res) => {
      console.log("server:: /seal/start-session");
      let result = await makeSession(req, res);
      return result;
    }
  );

  server.post(
    ["/seal/update-session", "/vc/issue/seal/update-session"],
    async (req, res) => {
      console.log("server:: /seal/update-session");
      let result = await update(req, res);
      return result;
    }
  );

  server.get(
    ["/seal/make-eidas-token", "/vc/issue/seal/make-eidas-token","/vc/make-eidas-token"],
    async (req, res) => {
      console.log("server:: /vc/make-eidas-token");
      req.query.sender = process.env.SENDER_ID?process.env.SENDER_ID: "eIDAS-IdP";
      req.query.receiver = process.env.RECEIVER_ID?process.env.SENDER_ID:"eIDAS-IdP";
      // sessionId is provided by the caller
      let result = await makeToken(req, res);
      return result;
    }
  );

  server.post("/seal/issueVC", (req, res) => {
    req.endpoint = endpoint;
    console.log("server.js -- /seal/issueVC::  /seal/issueVC");
    return sealIssueVC(req, res);
  });

  // ### SEAL View Controllers (after calling other SEAL MSes)

  server.post(["/vc/eidas/response"], async (req, res) => {
    console.log("server:: /vc/eidas/response");
    const msToken = req.body.token;
    console.log(`server:: /vc/eidas/response, the token is ${msToken}`);
    // sessionId is provided by the caller
    let sessionId = await validateToken(msToken);
    let dataStore = JSON.parse(await getSessionData(sessionId, "dataStore"));
    // let DID = await getSessionData(sessionId,"DID")
    // console.log(dataStore);

    req.session.DID = true;
    req.session.userData = makeUserDetails(dataStore);
    req.session.sealSession = sessionId;

    req.session.endpoint = endpoint;
    req.session.baseUrl = process.env.BASE_PATH;
    return app.render(req, res, "/vc/issue/eidas", req.query);
  });

  server.get(["/vc/issue/eidas"], async (req, res) => {
    if (req.query.msToken) {
      // console.log("server.js:: /vc/issue/eidas -- got here on an existing seal session")
      // 1 retrieve SEAL sessionId
      // 1.1 check if the user has performed DID auth at a previous step.
      // 2  retrieve datastore object
      //    add results in the userData
      // 3 pass the seal session to the front end
      let sessionId = await validateToken(req.query.msToken);
      let ds = await getSessionData(sessionId, "dataStore");
      // console.log(ds)

      let did = await getSessionData(sessionId, "DID");
      if (did) {
        req.session.DID = true;
      }

      if (ds) {
        let dataStore = JSON.parse(ds);
        req.session.userData = makeUserDetails(dataStore);
      }

      req.session.sealSession = sessionId;
      
    }

    req.session.endpoint = endpoint;
    req.session.baseUrl = process.env.BASE_PATH;
    req.eidasUri = SEAL_EIDAS_URI
    req.eidasPort = SEAL_EIDAS_PORT
    let redirect = process.env.BASE_PATH?`${endpoint}/${process.env.BASE_PATH}/vc/eidas/response`:`${endpoint}/vc/eidas/response`
    req.eidasRedirectUri =  redirect
    console.log(req.eidasRedirectUri)
    return app.render(req, res, "/vc/issue/eidas", req.query);
  });

  server.get(["/vc/didAuth"], async (req, res) => {
    let msToken = req.query.msToken;
    // 1. get SEAL sessionId
    // 2. display view with only didAuth request
    // 2.1 inside this view perform didAuth and update seal session
    // 2.2 inside this view at the end of didAuth redirect to clientCallbackAddr
    let sessionId = await validateToken(msToken);
    let clientCallbackAddr = await await getSessionData(
      sessionId,
      "ClientCallbackAddr"
    );
    req.session.sealSession = sessionId;
    req.session.callback = clientCallbackAddr;
    req.session.endpoint = endpoint;
    req.session.baseUrl = process.env.BASE_PATH;

    req.session.endpoint = endpoint;
    req.session.baseUrl = process.env.BASE_PATH;
    return app.render(req, res, "/vc/didAuth", req.query);
  });

  // ################################################################33
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;

    if (isProduction) {
      console.log(
        `running in production is ${isProduction} and port is ${port}`
      );
      endpoint = process.env.ENDPOINT;
    } else {
      ngrok.connect(port).then(ngrokUrl => {
        endpoint = ngrokUrl;
        console.log(`running, open at ${endpoint}`);
      });
    }
  });
});
