import { sendSignedHttp } from "./httpSignature";

const keyId =
  "d9db7614221d9d397f98d44f90eb15db5a4e0d842ffadfd7f1651963ccb22437";


const SEAL_SM_URI = process.env.SEAL_SM_URI?process.env.SEAL_SM_URI:'vm.project-seal.eu'
const SEAL_SM_PORT= process.env.SEAL_SM_PORT?process.env.SEAL_SM_PORT:'9090'
const SEAL_EIDAS_URI=process.env.SEAL_EIDAS_URI?process.env.SEAL_EIDAS_URI:'vm.project-seal.eu'
const SEAL_EIDAS_PORT=process.env.SEAL_EIDAS_PORT?process.env.SEAL_EIDAS_PORT:'8091'
const SEAL_EDUGAIN_URI= process.env.SEAL_EDUGAIN_URI?process.env.SEAL_EDUGAIN_URI:'vm.project-seal.eu'
const SEAL_EDUGAIN_PORT=process.env.SEAL_EDUGAIN_PORT?process.env.SEAL_EDUGAIN_PORT:''


function startSession() {
  console.log("sealService:: startSession");
  // let keyId =
  //   "d9db7614221d9d397f98d44f90eb15db5a4e0d842ffadfd7f1651963ccb22437";
  return new Promise((resolve, reject) => {
    sendSignedHttp(
      SEAL_SM_URI,
      "/sm/startSession",
      "post",
      keyId,
      "application/x-www-form-urlencoded",
      null,
      true,
      SEAL_SM_PORT
    )
      .then(response => {
        resolve(response.sessionData.sessionId);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

function updateSessionData(sessionId, variableName, variableValue) {
  let updateObject = {
    sessionId: sessionId,
    variableName: variableName,
    dataObject: variableValue
  };
  return new Promise((resolve, reject) => {
    sendSignedHttp(
      SEAL_SM_URI,
      "/sm/updateSessionData",
      "post",
      keyId,
      "application/json;charset=UTF-8",
      updateObject,
      false,
      SEAL_SM_PORT
    )
      .then(response => {
        resolve(response.code);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

function validateToken(msToken) {
  return new Promise((resolve, reject) => {
    sendSignedHttp(
      SEAL_SM_URI,
      "/sm/validateToken?token=" + msToken,
      "get",
      keyId,
      "application/x-www-form-urlencoded",
      null,
      false,
      SEAL_SM_PORT
    )
      .then(response => {
        resolve(response.sessionData.sessionId);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

function getSessionData(sessionId, variableName) {
  return new Promise((resolve, reject) => {
    sendSignedHttp(
      SEAL_SM_URI,
      "/sm/getSessionData?sessionId=" + sessionId,
      "get",
      keyId,
      "application/x-www-form-urlencoded",
      null,
      false,
      SEAL_SM_PORT
    )
      .then(response => {
        resolve(response.sessionData.sessionVariables[variableName]);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

function generateToken(sessionId, sender, receiver) {
  return new Promise((resolve, reject) => {
    sendSignedHttp(
      SEAL_SM_URI,
      `/sm/generateToken?sender=${sender}&receiver=${receiver}&sessionId=${sessionId}`,
      "get",
      keyId,
      "application/x-www-form-urlencoded",
      null,
      false,
      SEAL_SM_PORT
    )
      .then(resp => {
        console.log(resp);
        resolve(resp);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

export {
  validateToken,
  updateSessionData,
  startSession,
  getSessionData,
  generateToken
};
