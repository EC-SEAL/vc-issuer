const { Credentials } = require("uport-credentials");
const decodeJWT = require("did-jwt").decodeJWT;
const message = require("uport-transports").message.util;
const transports = require("uport-transports").transport;
const pushTransport = require("uport-transports").transport.push;
import { mySigner } from "../back-services/hsmSigner";
import { publish } from "../back-services/server-sent-events";
import { generateCredentialModel } from "../model/credentialModel";
import UserCache from "../model/userCache";
const uuidv1 = require("uuid/v1");
import DIDResponse from "../model/DIDResponse";
import { getCache } from "../helpers/CacheHelper";
import {
  updateSessionData,
  getSessionData,
} from "../back-services/sealServices";

const claimsCache = getCache();

const credentials = new Credentials({
  appName: "MyIssuer",
  did: "did:ethr:0xd502a2c71e8c90e82500a70683f75de38d57dd9f",
  signer: mySigner,
});

function root(req, res) {
  credentials
    .createDisclosureRequest({
      notifications: true,
      callbackUrl: req.endpoint + "/callback",
      // vc: [
      //   "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NzE4MTQ5MTIsInN1YiI6ImRpZDpldGhyOjB4ZDUwMmEyYzcxZThjOTBlODI1MDBhNzA2ODNmNzVkZTM4ZDU3ZGQ5ZiIsImNsYWltIjp7Im5hbWUiOiJUaGUgVW5pdmVyc2l0eSBvZiB0aGUgQWVnZWFuIiwicHJvZmlsZUltYWdlIjp7Ii8iOiIvaXBmcy9RbVljcHZSaGg2V1N1VjVIaHFLS2hzZHdxSFg4UTQxRTZ0ellnUThxbWlNNzROIn0sImJhbm5lckltYWdlIjp7Ii8iOiIvaXBmcy9RbVh1SDRFZnJMUXQyZmFmZUdzMUd5SGpxNzFDZEtwOUUzZXNpcTV2WVFETFVNIn0sInVybCI6ImFlZ2Vhbi5nci9jaXR5In0sImlzcyI6ImRpZDpldGhyOjB4ZDUwMmEyYzcxZThjOTBlODI1MDBhNzA2ODNmNzVkZTM4ZDU3ZGQ5ZiJ9.LmSTmjPPqBut2_wcqwrYIFrW9oBTULk1V_sXBsrFaW0rUNe-3Zh4SiBXYRawx_VjvCC9Yn1K3yzqfRpm-uV9zgE"
      // ],
      act: "none", // specifically, this needs to point to a JWT stored on ipfs that contains the service data
      // signed with the same key used in the DID
    })
    .then((requestToken) => {
      console.log("**************Request******************");
      console.log(decodeJWT(requestToken)); //log request token to console
      const uri = message.paramsToQueryString(
        message.messageToURI(requestToken),
        { callback_type: "post" }
      );
      console.log(uri);
      const qr = transports.ui.getImageDataURI(uri);
      res.send(`<div><img src="${qr}"/></div>`);
    });
}

// makes a QR code containing a uport Connection  request
// and cachces which attirbutes are to be added to the VC after the user
// accepts the conneciton request
// if this is in a mobile enviroment an custom url containing the request
// will be sent. This url will be sent to the OS using by the receiver of it
function issueVC(req, res) {
  console.log(`controller.js - issueVC:: `);
  // console.log(req.body);
  let requestedData = req.body.data;
  let vcType = req.body.vcType;
  let isMobile = req.body.isMobile ? true : false;
  // let sessionId = req.session.id;
  let fetchedData = req.session.userData;
  let matchingUserAttributes = generateCredentialModel(
    requestedData,
    fetchedData,
    vcType
  );
  // console.log(
  //   `controllers.js- issueVC::   the actual values that will be added to the vc are`
  // );
  // console.log(matchingUserAttributes);

  // create the connection request. This will be used
  // to push the VC to the user, once this Connection Request has been accepted
  let uuid = uuidv1();

  claimsCache.set(uuid, matchingUserAttributes, 10000);

  let callback = req.baseUrl
    ? `${req.endpoint}/${req.baseUrl}/requestIssueResponse?uuid=${uuid}`
    : req.endpoint + "/requestIssueResponse?uuid=" + uuid;

  credentials
    .createDisclosureRequest({
      notifications: true,
      callbackUrl: callback,
      vc: [
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1NTU4NDk2MTAsInN1YiI6ImRpZDpldGhyOjB4ZDUwMmEyYzcxZThjOTBlODI1MDBhNzA2ODNmNzVkZTM4ZDU3ZGQ5ZiIsImNsYWltIjp7Im5hbWUiOiJUaGUgVW5pdmVyc2l0eSBvZiB0aGUgQWVnZWFuIiwicHJvZmlsZUltYWdlIjp7Ii8iOiIvaXBmcy9RbVBiMWFMaUFFN0VQNGNiNXFBQjJBU1l3WHRBQkRhQnFNZWNYWVNUdDVMdTNaIn0sImJhbm5lckltYWdlIjp7Ii8iOiIvaXBmcy9RbVh1SDRFZnJMUXQyZmFmZUdzMUd5SGpxNzFDZEtwOUUzZXNpcTV2WVFETFVNIn0sInVybCI6ImFlZ2Vhbi5nci9jaXR5In0sImlzcyI6ImRpZDpldGhyOjB4ZDUwMmEyYzcxZThjOTBlODI1MDBhNzA2ODNmNzVkZTM4ZDU3ZGQ5ZiJ9.wKKOMRPFla6aGeoWDOGRBluNCsr1TNE6RHz4DLxASv2Brs24JGrzwZ1Qqc6rOPSGXbS2nQe6ydqFAmK71LCnRg",
      ],
      act: "none",
    })
    .then((requestToken) => {
      console.log(
        "controllers.js: ************ Generating Request******************"
      );
      const uri = message.paramsToQueryString(
        message.messageToURI(requestToken),
        { callback_type: "post" }
      );

      if (isMobile) {
        // const urlTransport = transport.url.send()
        // res.send((urlTransport(uri)));
        res.send({ qr: uri, uuid: uuid });
      } else {
        const qr = transports.ui.getImageDataURI(uri);
        res.send({ qr: qr, uuid: uuid });
      }
    });
}

// accepts the response form a connection request form the uportwallet
// based on a session uuid retrieves the user attributes
// and then generates a VC and sends it to the device of the user
function credentialsIssuanceConnectionResponse(req, res) {
  const jwt = req.body.access_token;
  const uuid = req.query.uuid;
  const matchingUserAttributes = claimsCache.get(uuid);
  console.log("controllers.js:: **************RESPONSE******************");
  credentials
    .authenticateDisclosureResponse(jwt)
    .then((creds) => {
      console.log(
        "controllers.js credentialsIssuanceConnectionResp:: cached user attributes"
      );
      console.log(matchingUserAttributes);

      // Create and push the generated credential to the users wallet
      credentials
        .createVerification({
          sub: creds.did,
          exp: Math.floor(new Date().getTime() / 1000) + 30 * 24 * 60 * 60,
          claim: matchingUserAttributes,
          vc: ["/ipfs/QmNbicKYQKCsc7GMXSSJMpvJSYgeQ9K2tH15EnbxTydxfQ"],
        })
        .then((attestation) => {
          let push = pushTransport.send(creds.pushToken, creds.boxPub);
          console.log(attestation);
          return push(attestation);
        })
        .then((pushed) => {
          console.log(`user should receive claim in any moment`);
          publish(JSON.stringify({ uuid: uuid, status: "sent" }));
          res.send(200);
        });
    })
    .catch((err) => {
      console.log(err);
      publish(JSON.stringify({ uuid: uuid, status: "rejected" }));
    });
}

// makes a QR code containing a uport Connection  request
// and cachces which attirbutes are to be added to the VC after the user
// accepts the conneciton request
function makeConnectionRequest(req, res) {
  // create the connection request. This will be used
  // to push the VC to the user, once this Connection Request has been accepted
  let uuid = uuidv1();
  credentials
    .createDisclosureRequest({
      notifications: true,
      callbackUrl: req.endpoint + "/cacheUserConnectionRequest?uuid=" + uuid,
      vc: [
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1NTU4NDk2MTAsInN1YiI6ImRpZDpldGhyOjB4ZDUwMmEyYzcxZThjOTBlODI1MDBhNzA2ODNmNzVkZTM4ZDU3ZGQ5ZiIsImNsYWltIjp7Im5hbWUiOiJUaGUgVW5pdmVyc2l0eSBvZiB0aGUgQWVnZWFuIiwicHJvZmlsZUltYWdlIjp7Ii8iOiIvaXBmcy9RbVBiMWFMaUFFN0VQNGNiNXFBQjJBU1l3WHRBQkRhQnFNZWNYWVNUdDVMdTNaIn0sImJhbm5lckltYWdlIjp7Ii8iOiIvaXBmcy9RbVh1SDRFZnJMUXQyZmFmZUdzMUd5SGpxNzFDZEtwOUUzZXNpcTV2WVFETFVNIn0sInVybCI6ImFlZ2Vhbi5nci9jaXR5In0sImlzcyI6ImRpZDpldGhyOjB4ZDUwMmEyYzcxZThjOTBlODI1MDBhNzA2ODNmNzVkZTM4ZDU3ZGQ5ZiJ9.wKKOMRPFla6aGeoWDOGRBluNCsr1TNE6RHz4DLxASv2Brs24JGrzwZ1Qqc6rOPSGXbS2nQe6ydqFAmK71LCnRg",
      ],
      act: "none",
    })
    .then((requestToken) => {
      console.log(
        "controllers.js: makeConnectionRequest ************ Generating Request******************"
      );
      const uri = message.paramsToQueryString(
        message.messageToURI(requestToken),
        { callback_type: "post" }
      );
      const qr = transports.ui.getImageDataURI(uri);
      res.send({ qr: qr, uuid: uuid });
    });
}

// caches the users conneciton request to the current session
// this way the user can authenticate at a later stage (at e.g. eIDAS) and
// then get issued the VC. i.e. this way the user session becomes binded with their DID
// and there cannot be any session highjacking
function cacheUserConnectionRequest(req, res) {
  const jwt = req.body.access_token;
  const uuid = req.query.uuid;
  credentials
    .authenticateDisclosureResponse(jwt)
    .then((creds) => {
      console.log(
        "controllers.js cacheUserConnectionRequest:: cached user did response for the current session"
      );
      let userDetails = new UserCache(uuid, null, creds);
      claimsCache.set(uuid, userDetails, 1200000); // cached for 20 minutes
      publish(JSON.stringify({ uuid: uuid, status: "connected" }));
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      publish(JSON.stringify({ uuid: uuid, status: "error" }));
      res.sendStatus(500);
    });
}

/*
      #############################
      ######## SECURE FLOW ########
      ###########################//#endregion
*/

/* generates a uPort connection Request and pushes it to the mobile (either as QR or custom url),
   the receiving endpoint -- onlyConnectionResponse -- will cache the DID auth response
   -- additionally it generates a UUID used to match (secretly the client session)
   -- caches the combination uuid -- sessionId (key:: uuid)
*/

async function onlyConnectionRequest(req, res) {
  console.log(`controller.js - onlyConnectionRequest:: `);
  let sealSession = req.body.sealSession;
  let vcType = req.body.vcType;
  console.log(`sealSession is ${sealSession}`)
  console.log(`vcType is ${vcType}`);
  // console.log(`controller.js:: onlyConnectionRequset:: seal session ${sealSession}`)
  let isMobile = req.body.isMobile ? true : false;
  let callback = req.baseUrl
    ? `${req.endpoint}/${req.baseUrl}/onlyConnectionResponse?sealSession=${sealSession}`
    : req.endpoint + "/onlyConnectionResponse?sealSession=" + sealSession;
  let redirectUri = req.baseUrl
  ? `${req.endpoint}/${req.baseUrl}/vc/issue/${vcType}?sealSession=${sealSession}`
  : req.endpoint + `/vc/issue/${vcType}?sealSession=` + sealSession;
  
    // // store connection between sessionId - uuid
  // claimsCache.set(uuid, req.session.id, 1200000); // cached for 20 minutes

  console.log(`redirectUri :: ${redirectUri}`)


  // store in the sessionManager the (sealSession,issuerSession)
  let sessionUpdated = await updateSessionData(
    sealSession,
    "issuerSession",
    req.session.id
  );
  // console.log("server-onlyConnectionRequest:: ");
  // console.log(sessionUpdated);

  credentials
    .createDisclosureRequest({
      notifications: true,
      callbackUrl: callback,
      vc: [
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1NTU4NDk2MTAsInN1YiI6ImRpZDpldGhyOjB4ZDUwMmEyYzcxZThjOTBlODI1MDBhNzA2ODNmNzVkZTM4ZDU3ZGQ5ZiIsImNsYWltIjp7Im5hbWUiOiJUaGUgVW5pdmVyc2l0eSBvZiB0aGUgQWVnZWFuIiwicHJvZmlsZUltYWdlIjp7Ii8iOiIvaXBmcy9RbVBiMWFMaUFFN0VQNGNiNXFBQjJBU1l3WHRBQkRhQnFNZWNYWVNUdDVMdTNaIn0sImJhbm5lckltYWdlIjp7Ii8iOiIvaXBmcy9RbVh1SDRFZnJMUXQyZmFmZUdzMUd5SGpxNzFDZEtwOUUzZXNpcTV2WVFETFVNIn0sInVybCI6ImFlZ2Vhbi5nci9jaXR5In0sImlzcyI6ImRpZDpldGhyOjB4ZDUwMmEyYzcxZThjOTBlODI1MDBhNzA2ODNmNzVkZTM4ZDU3ZGQ5ZiJ9.wKKOMRPFla6aGeoWDOGRBluNCsr1TNE6RHz4DLxASv2Brs24JGrzwZ1Qqc6rOPSGXbS2nQe6ydqFAmK71LCnRg",
      ],
      act: "none",
    })
    .then((requestToken) => {
      // console.log("requestToken:");
      // console.log(requestToken);
      if (isMobile) {
        console.log(
          "contorllers.js :: onlyConnectionRequet -- connection request sent in mobile mode"
        );
        //?callback_type=redirect&redirect_url=${redirectUri}
        res.send({ qr: `${requestToken}`, uuid: sealSession });
      } else {
        console.log(
          "contorllers.js :: onlyConnectionRequet -- connection request sent in QR mode"
        );
        const uri = message.paramsToQueryString(
          message.messageToURI(requestToken),
          { callback_type: "post" }
        );
        const qr = transports.ui.getImageDataURI(uri);
        res.send({ qr: qr, uuid: sealSession });
      }
    });
}
/*
    Receives a uPort connection response and caches the DID authe details for future use
    Caches it, in the seal session manager with key (var) DID:
    - suject DID
    - pushToken
    - boxPub
    Requires: sealSession in req.body
    Sends: SSE with sealSession and status connected
    Updates: updates the session with the variable session.did = true
*/
async function onlyConnectionResponse(req, res) {
  const jwt = req.body.access_token;
  const sealSessionId = req.query.sealSession; //get the sesionId that is picked up from the response uri
  // retrieve the server sessionId from the SesssionManager
  let serverSession = await getSessionData(sealSessionId, "issuerSession");
  console.log(
    `controller.js-->onlyConnection response:: the server session is: ${serverSession}`
  );
  credentials
    .authenticateDisclosureResponse(jwt)
    .then(async (creds) => {
      let didResp = new DIDResponse(creds.did, creds.pushToken, creds.boxPub);
      //cache response
      // update the SessionManager with variable DID
      let sessionUpdated = await updateSessionData(
        sealSessionId,
        "DID",
        JSON.stringify(didResp)
      );
      console.log(`controllers.js onlyConnectionResponse:: ${sessionUpdated}`);
      req.session.did = true;
      publish(
        JSON.stringify({
          uuid: sealSessionId,
          sessionId: serverSession,
          status: "connected",
        })
      );
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      publish(JSON.stringify({ sessionId: serverSession, status: "rejected" }));
      res.send(500);
    });
}

/*
 Accepts:
   - post param: data containing the user VC requested data
  Gets from session:
   - the received user attributes
  Gets from the cache, using the session (uuid) of the client:
   - the DID auth response
  and pushes to the wallet of the user the VC based on the retrieved attributes  
*/
function onlyIssueVC(req, res) {
  const requestedData = req.body.data;
  const vcType = req.body.vcType;
  // const sessionId = req.session.id;
  const uuid = req.query.uuid; //get the sesionId that is picked up from the response uri
  let fetchedData = req.session.userData;
  let vcData = generateCredentialModel(requestedData, fetchedData, vcType);
  console.log(`controllers.js -- onlyIssueVC:: vcData::`);
  console.log(vcData);
  // get the user DID authentication details
  console.log(`did-${uuid}`);
  const didResp = claimsCache.get(`did-${uuid}`);
  // Create and push the generated credential to the users wallet
  credentials
    .createVerification({
      sub: didResp.did,
      exp: Math.floor(new Date().getTime() / 1000) + 30 * 24 * 60 * 60,
      claim: vcData,
      vc: ["/ipfs/QmNbicKYQKCsc7GMXSSJMpvJSYgeQ9K2tH15EnbxTydxfQ"],
    })
    .then((attestation) => {
      let push = pushTransport.send(didResp.pushToken, didResp.boxPub);
      console.log(`controllers.js -- onlyIssueVC:: pushingn to wallet::`);
      console.log(attestation);
      return push(attestation);
    })
    .then((pushed) => {
      console.log(
        `controllers.js -- onlyIssueVC:: user should receive claim in any moment`
      );
      publish(JSON.stringify({ uuid: uuid, status: "sent" }));
      res.send(200);
    });
}

export {
  root,
  credentialsIssuanceConnectionResponse,
  issueVC,
  cacheUserConnectionRequest,
  makeConnectionRequest,
  onlyConnectionRequest,
  onlyConnectionResponse,
  onlyIssueVC,
};
