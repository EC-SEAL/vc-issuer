import {
  validateToken,
  updateSessionData,
  startSession,
  generateToken,
  getSessionData
} from "../back-services/sealServices";

import { makeUserDetails } from "../helpers/DataStoreHelper";
import { publish } from "../back-services/server-sent-events";
import { generateCredentialModel } from "../model/credentialModel";
import { mySigner } from "../back-services/hsmSigner";

const { Credentials } = require("uport-credentials");
// const decodeJWT = require("did-jwt").decodeJWT;
// const message = require("uport-transports").message.util;
// const transports = require("uport-transports").transport;
const pushTransport = require("uport-transports").transport.push;


const credentials = new Credentials({
  appName: "MyIssuer",
  did: "did:ethr:0xd502a2c71e8c90e82500a70683f75de38d57dd9f",
  signer: mySigner
});




function validate(req, res) {
  const msToken = req.query.msToken;
  res.send(validateToken(msToken));
}

async function update(req, res) {
  const sessionId = req.body.sessionId;
  const variableName = req.body.variableName;
  const variableValue = req.body.variableValue;
  res.send(updateSessionData(sessionId, variableName, variableValue));
}

async function makeSession(req, res) {
  console.log("sealApiControllers makeSession");
  let response = await startSession();
  res.send(response);
}

async function makeToken(req, res) {
  console.log("sealApiControllers makeToken");
  //sessionId, sender, receiver
  let response = await generateToken(
    req.query.sessionId,
    req.query.sender,
    req.query.receiver
  );
  res.send(response);
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
async function sealIssueVC(req, res) {
  const requestedData = req.body.data;
  const vcType = req.body.vcType;

  const sealSession = req.body.sealSession;

  let dataStore = JSON.parse(await getSessionData(sealSession, "dataStore"));
  let didResp = JSON.parse(await getSessionData(sealSession, "DID"));

  //TODO
  // GET data from SM, parse them in the form of userSessionData, and proceed with the issuance

  // const sessionId = req.session.id;
  // const uuid = req.query.uuid; //get the sesionId that is picked up from the response uri

  let fetchedData = makeUserDetails(dataStore);
  let vcData = generateCredentialModel(requestedData, fetchedData, vcType);
  console.log(`sealApiControllers.js -- sealIssueVC:: vcData::`);
  console.log(vcData);
  // get the user DID authentication details
  // console.log(`did-${uuid}`);
  // const didResp = claimsCache.get(`did-${uuid}`);
  // Create and push the generated credential to the users wallet
  credentials
    .createVerification({
      sub: didResp.did,
      exp: Math.floor(new Date().getTime() / 1000) + 30 * 24 * 60 * 60,
      claim: vcData,
      vc: ["/ipfs/QmNbicKYQKCsc7GMXSSJMpvJSYgeQ9K2tH15EnbxTydxfQ"]
    })
    .then(attestation => {
      let push = pushTransport.send(didResp.pushToken, didResp.boxPub);
      console.log(
        `sealApiControllers.js -- sealIssueVC:: pushingn to wallet::`
      );
      console.log(attestation);
      return push(attestation);
    })
    .then(pushed => {
      console.log(
        `sealApiControllers.js -- sealIssueVC:: user should receive claim in any moment`
      );
      publish(JSON.stringify({ uuid: sealSession, status: "sent" }));
      res.send(200);
    });
}

export { makeSession, update, validate, makeToken, sealIssueVC };
