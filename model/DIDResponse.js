//creds.pushToken, creds.boxPub

export default class DIDResponse {
    constructor(did,pushToken,boxPub) {
      this.did = did; // subjects DID
      this.pushToken = pushToken // uPort push token
      this.boxPub = boxPub //uPort encryption stuff
    }
  }