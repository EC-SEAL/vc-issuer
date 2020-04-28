import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";
import axios from "axios";
import UserSelection from "./model/userSelection";

const initialState = {
  count: 0,
  qrData: null,
  fetching: false,
  requestSignature: null,
  sessionData: null,
  serverSessionId: null,
  uuid: null,
  vcSent: false,
  userSelection: [], // the attributes selected by the user to be included in a VC,
  endpoint: null, // the backend server url root.
  cardIndex: 1,
  stepperSteps: [],
  baseUrl: "",
  DID: false, //boolean, denoting that DID connection response has been received for this session
  sealSession: "",
  didAuthCallback: "", // callback address set by the caller to redirect to after DID auth,
  eidasUri: "",
  eidasPort: "",
  eidasRedirectUri: ""
};

export const actionTypes = {
  GET_QR_AUTH_RESPONSE: "GET_QR_AUTH_RESPONSE",
  MAKE_QR_AUTH_REQUEST: "MAKE_QR_AUTH_REQUEST",

  MAKE_VC_QR_REQUEST: "MAKE_VC_QR_REQUEST", //make a request to generate a VC based on the selected attributes
  GET_VC_QR_RESPONSE: "GET_VC_QR_REQUEST",

  SET_ATTRIBUTES_SELECTION: "SET_ATTRIBUTES_SELECTION", //adds an array as the user  selected attirubtes
  ADD_SET_TO_ATTRIBUTES_SELECTION: "ADD_SET_TO_ATTRIBUTES_SELECTION", //adds the payload to the userSelection
  ADD_ATTRIBUTES_TO_SELECTION: "ADD_ATTRIBUTES_TO_SELECTION", //adds the payload to the userSelection
  // the selection takes place using identifiers from the session
  // that are meaningful to the backend
  REMOVE_ATTRIBUTE_FROM_SELECTION: "REMOVE_ATTRIBUTE_FROM_SELECTION",

  SET_SERVER_SESSION_DATA: "SET_SERVER_SESSION_DATA",
  SET_SERVER_SESSION_ID: "SET_SERVER_SESSION_ID",
  VC_SENT_TO_USER: "VC_SENT_TO_USER",
  SET_ENDPOINT: "SET_END_POINT",

  //
  INCREASE_CARD_INDEX: "INCREASE_CARD_INDEX",
  DECREASE_CARD_INDEX: "DECREASE_CARD_INDEX",
  //
  SET_STEPPER_STEPS: "SET_STEPPER_STEPS",
  //
  SET_BASE_URL: "SET_BASE_URL",

  //
  SET_DID_TRUE: "SES_DID_TRUE",

  SET_SEAL_SESSION: "SET_SEAL_SESSION",

  SET_CALLBACK: "SET_CALLBACK",
  SET_EIDAS_URI_PORT: "SET_EIDAS_URI_PORT",
  SET_EIDAS_REDIRECT_URI: "SET_EIDAS_REDIRECT_URI"
};

// REDUCERS
const reducer = (state = initialState, action) => {
  switch (action.type) {

    case actionTypes.SET_EIDAS_REDIRECT_URI:
      return {
        ...state,
        eidasRedirectUri: action.data
      };

    case actionTypes.SET_EIDAS_URI_PORT:
      return {
        ...state,
        eidasUri: action.data.uri,
        eidasPort: action.data.port,
      };

    case actionTypes.SET_CALLBACK:
      return {
        ...state,
        didAuthCallback: action.data,
      };

    case actionTypes.SET_SEAL_SESSION:
      return {
        ...state,
        sealSession: action.data,
      };

    case actionTypes.SET_DID_TRUE:
      return {
        ...state,
        DID: true,
        uuid: action.data,
      };

    case actionTypes.SET_BASE_URL:
      return {
        ...state,
        baseUrl: action.data,
      };

    case actionTypes.SET_STEPPER_STEPS:
      return {
        ...state,
        stepperSteps: action.data,
      };

    case actionTypes.INCREASE_CARD_INDEX:
      return {
        ...state,
        cardIndex: state.cardIndex + 1,
      };

    case actionTypes.DECREASE_CARD_INDEX:
      return {
        ...state,
        cardIndex: state.cardIndex - 1,
      };

    case actionTypes.SET_ENDPOINT:
      return {
        ...state,
        endpoint: action.data,
      };
    case actionTypes.VC_SENT_TO_USER:
      return {
        ...state,
        vcSent: true,
      };
    case actionTypes.SET_SERVER_SESSION_DATA:
      return {
        ...state,
        sessionData: action.data,
        // userEduGain: action.data.eduGAIN,
        // userEidas: action.data.eidas,
      };
    case actionTypes.GET_QR_AUTH_RESPONSE:
      // console.log(action.data);
      return {
        ...state,
        fetching: false,
        qrData: action.data.qr,
        uuid: action.data.uuid,
        requestSignature: action.data.signature,
      };

    case actionTypes.SET_ATTRIBUTES_SELECTION:
      return {
        ...state,
        userSelection: action.data,
      };

    case actionTypes.MAKE_QR_AUTH_REQUEST:
      return {
        ...state,
        fetching: true,
        vcSent: false,
      };

    case actionTypes.ADD_ATTRIBUTES_TO_SELECTION: {
      return {
        ...state,
        userSelection: [...state.userSelection, action.data],
      };
    }

    case actionTypes.ADD_SET_TO_ATTRIBUTES_SELECTION: {
      return {
        ...state,
        userSelection: [...state.userSelection, ...action.data],
      };
    }

    case actionTypes.SET_SERVER_SESSION_ID: {
      return {
        ...state,
        serverSessionId: action.data,
      };
    }

    case actionTypes.REMOVE_ATTRIBUTE_FROM_SELECTION:
      let newSelection = [
        ...state.userSelection.filter((el, ind) => {
          return ind !== action.index;
        }),
      ];
      return {
        ...state,
        userSelection: newSelection,
      };

    default:
      return state;
  }
};

// ACTIONS

export function loginClicked() {
  return (dispatch) => {
    dispatch({ type: actionTypes.MAKE_QR_AUTH_REQUEST });
    axios.get("connectionRequest").then((data) => {
      console.log("got the data form the server");
      console.log(data.data);
      return dispatch({
        type: actionTypes.GET_QR_AUTH_RESPONSE,
        data: data.data,
      });
    });
  };
  // return dispatch => axios.get('https://38da089e.ngrok.io/connectionRequest')
  //     .then(({ data }) => data)
  //     .then(items => dispatch({ type: actionTypes.MAKE_QR_AUTH_REQUEST, items }))
  //     .then( () =>{
  //       console.log("got there")
  //         return dispatch({ type: actionTypes.GET_QR_AUTH_RESPONSE, data:'these are my awesome data' })
  //     });
}

// export function setDIDTrue() {
//   return dispatch => {
//     dispatch({
//       type: actionTypes.SET_DID_TRUE
//     });
//   };
// }

export function setStepperSteps(steps) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_STEPPER_STEPS,
      data: steps,
    });
  };
}

export function setBaseUrl(baseUrl) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_BASE_URL,
      data: baseUrl,
    });
  };
}

export function startSession(sessionId, sessionStatus) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.START_SESSION,
      data: { sessionId: sessionId, status: sessionStatus },
    });
  };
}

export function setServerSessionId(sessionId) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_SERVER_SESSION_ID,
      data: sessionId,
    });
  };
}

export function setSessionData(sessionData) {
  return (dispatch) => {
    console.log(`setSessionData called with ${sessionData}`);
    dispatch({
      type: actionTypes.SET_SERVER_SESSION_DATA,
      data: sessionData,
    });
  };
}

export function setUserAttributeSelection(selectedAttributes) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_ATTRIBUTES_SELECTION,
      data: selectedAttributes,
    });
  };
}

export function updateSession(sessionStatus) {
  return (dispatch) => {
    let toDispatch = {
      type: actionTypes.UPDATE_SESSION,
      data: { status: sessionStatus },
    };
    dispatch(toDispatch);
  };
}

export function setEndpoint(endpoint) {
  return (dispatch) => {
    let toDispatch = {
      type: actionTypes.SET_ENDPOINT,
      data: endpoint,
    };
    dispatch(toDispatch);
  };
}

export function addToSelection(index, source) {
  // console.log(`store.js:: will add to seleciton ${index} , ${source}`);
  const data = new UserSelection(index, source);
  return (dispatch) => {
    dispatch({
      type: actionTypes.ADD_ATTRIBUTES_TO_SELECTION,
      data: data,
    });
  };
}

export function addSetToSelection(setArray) {
  const data = [];
  setArray.forEach((attrObj) => {
    Object.keys(attrObj).map((key) => {
      // console.log(`will fetch key ${key} from` )
      data.push(new UserSelection(key, attrObj.source));
      return new UserSelection(key, attrObj[key]);
    });
  });
  return (dispatch) => {
    dispatch({
      type: actionTypes.ADD_SET_TO_ATTRIBUTES_SELECTION,
      data: data,
    });
  };
}

export function removeFromSelection(index) {
  // console.log(`store.js will remove from  seleciton ${index}`);
  return (dispatch) => {
    let toDispatch = {
      type: actionTypes.REMOVE_ATTRIBUTE_FROM_SELECTION,
      index: index,
    };

    dispatch(toDispatch);
  };
}

export function vcSentToUser() {
  return (dispatch) => {
    let toDispatch = {
      type: actionTypes.VC_SENT_TO_USER,
    };
    dispatch(toDispatch);
  };
}

export function increaseCardIndex() {
  // console.log(`store.js will remove from  seleciton ${index}`);
  return (dispatch) => {
    let toDispatch = {
      type: actionTypes.INCREASE_CARD_INDEX,
    };
    dispatch(toDispatch);
  };
}

export function decreaseCardIndex() {
  // console.log(`store.js will remove from  seleciton ${index}`);
  return (dispatch) => {
    let toDispatch = {
      type: actionTypes.DECREASE_CARD_INDEX,
    };
    dispatch(toDispatch);
  };
}

export function requestVCgeneration(
  url,
  selectedAttributes,
  vcType,
  isMobile = false
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.MAKE_QR_AUTH_REQUEST });

    let bodyFormData = new FormData();
    bodyFormData.set("data", selectedAttributes);

    console.log(
      "store.js - requestVCgeneration:: will make VC generation request"
    );
    console.log(`store.js - requestVCgeneration:: for the url ${url}`);
    // console.log(`store.js - requestVCgeneration:: with data`)
    // console.log(selectedAttributes);
    // console.log(isMobile);
    axios
      .post(url, {
        data: selectedAttributes,
        vcType: vcType,
        isMobile: isMobile,
      })
      .then((data) => {
        console.log(
          "store.js- requestVCgeneration:: got the data form the server"
        );
        console.log(data.data);

        console.log("store.js- requestVCgeneration:: got vcType");
        console.log(vcType);

        return dispatch({
          type: actionTypes.GET_QR_AUTH_RESPONSE,
          data: data.data,
          vcType: vcType,
        });
      });
  };
}

export function makeConnectionRequest() {
  return (dispatch) => {
    dispatch({ type: actionTypes.MAKE_QR_AUTH_REQUEST });
    axios.post("/makeConnectionRequest", {}).then((data) => {
      console.log(
        "store.js:: makeConnectionRequest got the data form the server"
      );
      return dispatch({
        type: actionTypes.GET_QR_AUTH_RESPONSE,
        data: data.data,
      });
    });
  };
}

export function completeDIDAuth(uuid) {
  return (dispatch) => {
    dispatch({ type: actionTypes.SET_DID_TRUE, data: uuid });
  };
}

export function makeAndPushVC(
  url,
  selectedAttributes,
  vcType,
  sealSession,
  isMobile = false
) {
  return (dispatch) => {
    let bodyFormData = new FormData();
    bodyFormData.set("data", selectedAttributes);
    console.log("store.js - makeAndPushVC:: will make VC generation request");

    console.log(`store.js :: makeandpushVC:: ${url}, and ${vcType}`);
    axios
      .post(url, {
        data: selectedAttributes,
        sealSession: sealSession,
        vcType: vcType,
        isMobile: isMobile,
      })
      .then((data) => {
        console.log("store.js- makeAndPushVC:: got the data form the server");
        dispatch({ type: actionTypes.VC_SENT_TO_USER });
      })
      .catch((err) => {
        console.log(err);
      });
    //TODO add here an action denoting that the VC was sent
  };
}

export function setSealSession(sessionId) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_SEAL_SESSION,
      data: sessionId,
    });
  };
}

export function makeSealSession(baseUrl) {
  console.log("store:: makeSealSession");
  return (dispatch) => {
    axios.post(`${baseUrl}seal/start-session`, {}).then((resp) => {
      console.log("store.js:: makeSealSession");
      // console.log(resp.data);
      return dispatch({
        type: actionTypes.SET_SEAL_SESSION,
        data: resp.data,
      });
    });
  };
}

export function makeOnlyConnectionRequest(sealSession, baseUrl, isMobile) {
  let postData = {
    sealSession: sealSession,
  };

  if (isMobile) {
    postData.isMobile = isMobile;
  }
  return (dispatch) => {
    dispatch({ type: actionTypes.MAKE_QR_AUTH_REQUEST });
    axios.post(`${baseUrl}onlyConnectionRequest`, postData).then((data) => {
      console.log(
        "store.js -- onlyConnectionRequest:: got the data form the server"
      );
      return dispatch({
        type: actionTypes.GET_QR_AUTH_RESPONSE,
        data: data.data,
      });
    });
  };
}

export function makeSealSessionWithDIDConnecetionRequest(baseUrl, isMobile) {
  console.log(
    "store:: makeSealSessionWithDIDConnecetionRequest -- onlyConnectionRequest"
  );
  return (dispatch) => {
    let sessionId = "";
    axios
      .post(`${baseUrl}seal/start-session`, {})
      .then((resp) => {
        console.log(
          "store.js:: makeSealSessionWithDIDConnecetionRequest -- start-session"
        );
        sessionId = resp.data;
        return dispatch({
          type: actionTypes.SET_SEAL_SESSION,
          data: resp.data,
        });
      })
      .then((obj) => {
        axios
          .post(`${baseUrl}onlyConnectionRequest`, {
            sealSession: sessionId,
            baseUrl: baseUrl,
            isMobile: isMobile
          })
          .then((data) => {
            return dispatch({
              type: actionTypes.GET_QR_AUTH_RESPONSE,
              data: data.data,
            });
          });
      });
  };
}

export function setDidCallback(callback) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_CALLBACK,
      data: callback,
    });
  };
}

export function setEidasUriPort(uri, port) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_EIDAS_URI_PORT,
      data: { uri: uri, port: port },
    });
  };
}

export function setEidasRedirectUri(uri) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_EIDAS_REDIRECT_URI,
      data:uri,
    });
  };
}


export const initializeStore = (preloadedState = initialState) => {
  return createStore(
    reducer,
    preloadedState,
    composeWithDevTools(applyMiddleware(thunkMiddleware))
  );
};
