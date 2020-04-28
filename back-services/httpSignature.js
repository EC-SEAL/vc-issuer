const moment = require("moment-timezone");
const crypto = require("crypto");
const NodeRSA = require("node-rsa");
const https = require("https");
const http = require("http");
import { v4 as uuidv4 } from "uuid";

const key = new NodeRSA(
  "-----BEGIN PRIVATE KEY-----\n" +
    "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCS9l/gubt2qnXu\n" +
    "2T8gIj5wKKUjfIt9CtofLinEVgM2fb2X14edhEWc32MEoq87NLF/bNCSKA1weEiL\n" +
    "3qzsbj/E8vetVph6mn/F8Iqfm+Rl6qDU8U4TQeoMoKchsvE12cdgMsgJCt3U9FN0\n" +
    "UefBGkui4XoHc8JmlAvlfFfdYXODYpnZTU0h1UsmNZvcBjVIniQhgA4jCfoBlA+6\n" +
    "biLkbgz1BCPcoaXXrjTTtNTHbuvHMFUgumb6SfFiNSKKmpn/mSIN1PFgE9HSoNUi\n" +
    "FKXeGT1GFIj3mzu6euWXytvcTzDU5Gt9NA2DVSWkaDDDeNmLcYtJwsQreCHCDkfm\n" +
    "Av/ZJKITAgMBAAECggEAIs4InO8/z3XFYmC/C3wwr11g5subOWz1hYboS2BXeHNF\n" +
    "EI3xx0NJPULGb5WbzHjJRLVfnA2ySR2jiMSezYu6vIkSUVH94KNweU9jdTN1XxG3\n" +
    "L1dKt1LX/E+b5WY8rBU8m7LLHyEcsk9+6EBxk5EHsraVsOggdSzAuIO/R2XJ9qZn\n" +
    "eiqHIXvW433ECF330lv8hwiNkt7OwkXTM2OyIrctSJOvI89vRmBl4yCsBCj7bvdD\n" +
    "3DcJO98rxWhCkA/1Wq4ddjoXFIDsn9u+7FEaBW+gJjftScMvJJ0p+af0JeJxXY+7\n" +
    "HtSyhk1coC3JrgW/K8eoHTHsJAtsTfKEndPF1KOhIQKBgQD6+8izetq/jvoPE9h9\n" +
    "vz++OwDEjaAwFbnOS9SC/71viwUdKkhNbeGVZBmieEMZ9S/QNrEl7AL+5Y8vh2VM\n" +
    "4F0nMn3j5YLZWksjJ40mnvDWQ6WGi551Yarf+SjOhllBlgohEVWudmkaj9fN8gQ9\n" +
    "lC3VySci/t8vBYsGLSSSofaDkQKBgQCV5leROUdu4tiHc8emegQlXCEp9UTQ2Oyw\n" +
    "FdUPPG6CAWSmJoFXZM6dO855K1jBYHr0le+hwqV+1ubWF/cc4jdPUNlhpzs72cpX\n" +
    "xeno7hSIwiO9bvcJWRaBtJInwvEdPyGqICHXbA9fyJIBNgtG2WngmmMZkBhbXehF\n" +
    "l61MGxExYwKBgQC/Ji3YC9Q4GnN2Mj4qnxK0FgniqJ58oL9PT899KbskDbQKX16L\n" +
    "ogkxlvgzFfa8+VC9+jl20UYCzeD8aNkM8L/hj4HzpKPAWBVro77L0DdKaGDTlNhN\n" +
    "O+JBDGk4yXeHDPeP8bzYz5QCx9SrJAx4vbce4EFvVL+z9zvHq2/0QWgXEQKBgH6i\n" +
    "2Duhzk1Ja3ATSgnEbxg42vOdd4OQn3SrHRIAFcPS9XrAcOiqCzseOXJ4QkUsAvP6\n" +
    "bzWTQUkEuIMKQAOwwNVLEjrDkvEfLygz1UapS8O1b4gr5JuLHc56BDd/Iz94BDK7\n" +
    "bpuVeO+MfHx1cdVq+116UFpaN5mInh+c4hS3kTDNAoGAdcSSgl+OsvRb20hJmclp\n" +
    "y1GtoweapHR2Vrl06TSa40cxu9rNotw5alscQunTDXTES3D8FjvsIMcrIPZNSGXC\n" +
    "AKxLWx1/hMToZrYddnAahqyKF21X8nUveCFodw2wTCMf6JZSUkb3y9mtbh8jugab\n" +
    "ZnuEpIOCFPVp3UVypIviJ9w=\n" +
    "-----END PRIVATE KEY-----\n"
);

/**
 *
 * @param {*} hostName the host name, e.g. vm.project-seal.eu
 * @param {*} uri  the uri of the endpoint e.g. /sm/updateSessionData
 * @param {*} verb  the HTTP verb, e.g. post
 * @param {*} keyId the keyId used to retrieve the public key of the private key used
 * @param {*} contentType the http message content type, e.g. application/x-www-form-urlencoded
 * @param {*} queryParametersObject the body of the message or the query parameters
 * @param {*} urlEncoded denotes if the parameterObject needs to be url encoded, or added on the post body
 */
function sendSignedHttp(
  hostName,
  uri,
  verb,
  keyId,
  contentType,
  queryParametersObject = null,
  urlEncoded = null,
  port,
  secure=false
) {
  let requestId = uuidv4();
  // let verb = "post"
  let query = queryParametersObject
    ? `?${makeUrlEncodedParamString(queryParametersObject)}`
    : "";

  console.log(`query string ${query}`);

  // let uri = "/sm/startSession";
  let url =
    contentType === "application/x-www-form-urlencoded"
      ? `${verb} ${uri}${query}`
      : `${verb} ${uri}`;
  console.log(`url: ${url}`);
  let messageDigest = getMessageDigest(
    urlEncoded ? true : false,
    queryParametersObject
  );
  let requestHeaders = {
    "(request-target)": url,
    host: hostName,
    "original-date": getDate(),
    digest: `SHA-256=${messageDigest}`,
    "x-request-id": requestId
  };

  const headers = Object.keys(requestHeaders).join(" ");
  const message = Object.entries(requestHeaders)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  let singatureRSA = key.sign(message, "base64");
  // let keyId =
  //   "d9db7614221d9d397f98d44f90eb15db5a4e0d842ffadfd7f1651963ccb22437";
  let algorithm = "rsa-sha256";
  let result = `keyId="${keyId}",algorithm="${algorithm}",headers="${headers}",signature="${singatureRSA}"`;

  // let requestURI = verb === "get" ? url : uri;

  // console.log(`the request uri is ${requestURI}`)
  const options = {
    hostname: hostName,
    // port: 8090,
    path: uri, //"/sm/startSession",
    method: verb.toUpperCase(), //"POST",
    headers: {
      date: getDate(),
      digest: `SHA-256=${messageDigest}`,
      authorization: result,
      host: hostName, //"vm.project-seal.eu",
      "original-date": getDate(),
      "x-request-id": requestId,
      "Content-Type": contentType
    }
  };

  if(port){
    options.port = port
  }

  // console.log(options)

  if (verb === "post" && queryParametersObject) {
    options.headers["Content-Type"] = "application/json";
    options.headers["Content-Length"] = JSON.stringify(
      queryParametersObject
    ).length;
  }

  return new Promise((resolve, reject) => {

    const channel = secure?https:http;

    const req = channel.request(options, res => {
      // console.log(`statusCode: ${res.statusCode}`);
      let body = [];
      res.on("data", d => {
        body.push(d);
      });
      res.on("end", function() {
        try {
          body = Buffer.concat(body).toString();
        } catch (e) {
          reject(e);
        }
        console.log(body);
        resolve(JSON.parse(body));
      });
    });
    req.on("error", error => {
      // console.error(error);
      reject(error);
    });
    if (verb === "post" && queryParametersObject) {
      req.write(JSON.stringify(queryParametersObject));
    }
    req.end();
  });
}

function getDate() {
  return moment.tz("GMT").format("ddd, D MMM YYYY HH:mm:ss zz");
}

// the digest is calculated as the base64 encoding of the sha256 of the parametersr as defined by following rules:
// if there are no requests then postParams should be the empty string ""
// if there are parameters to the call and the message type is x-www-form-urlencoded
// then the digest should be calculated on the string  paramName1=xx&paramName2=yyy where each parameter value is URLEncoded
// finally if it is a body post then the digest should be calculated base on the strigified object
function getMessageDigest(isUrlEncoded, postParams = "") {
  let postParamString = "";
  if (postParams === "" || !postParams) {
    postParamString = "";
  } else {
    // console.log("postPAram found!!");
    if (isUrlEncoded) {
      // console.log("is urlencoded")
      postParamString = makeUrlEncodedParamString(postParams);
    } else {
      // console.log("is not urlencoded")
      postParamString = makePostBodyParamString(postParams);
    }
  }
  return crypto
    .createHash("sha256")
    .update(postParamString)
    .digest("base64");
}

/*
@params json containing the post parameters
*/
function makeUrlEncodedParamString(params) {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURI(value)}`)
    .join("&");
}

/*
@params json containing the post parameters
*/
function makePostBodyParamString(params) {
  // console.log(`will make PostBodu param string ${JSON.stringify(params)}` )
  return JSON.stringify(params);
}

export { sendSignedHttp };
