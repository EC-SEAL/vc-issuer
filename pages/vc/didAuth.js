import React from "react";
import axios from "axios";
import {
  setDidCallback,
  makeOnlyConnectionRequest,
  setEndpoint,
  setBaseUrl,
  setSealSession,
  setServerSessionId,
} from "../../store";
import Layout from "../../components/Layout";
import { connect } from "react-redux";
import { Button, Row, Col, Card, Container } from "react-bootstrap";
import MyStepper from "../../components/Stepper";
import HomeButton from "../../components/HomeButton";
import IssueVCButton from "../../components/IssueVCButton";
import PairOrCard from "../../components/PairOrCard";

class DisplayDidAuth extends React.Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.isFetching = props.isFetching;
    this.sessionData = props.sessionData;
  }

  static async getInitialProps({ reduxStore, req }) {
    let sealSession;
    let callback;
    if (typeof window === "undefined") {
      reduxStore.dispatch(setEndpoint(req.session.enpoint));
      let baseUrl = req.session.baseUrl ? `/${req.session.baseUrl}/` : "";
      reduxStore.dispatch(setBaseUrl(baseUrl));
      reduxStore.dispatch(setServerSessionId(req.session.id));
      sealSession = req.session.sealSession;
      callback = req.session.callback;
    } else {
      sealSession = reduxStore.getState().sealSession;
      callback = reduxStore.getState().callback;
    }
    reduxStore.dispatch(setSealSession(sealSession));
    reduxStore.dispatch(setDidCallback(callback));


    return {
      qrData: reduxStore.getState().qrData,
      sealSession: reduxStore.getState().sealSession,
      callback: reduxStore.getState().callback
    };
  }

  componentDidMount() {
    // generated the connectionRequest
    this.props.makeConnectionRequest(
      this.props.sealSession,
      this.props.baseUrl
    );
  }

  componentDidUpdate() {
    if (this.props.DID) {
      //if DID auth is completed
      // redirect to the callbackAddress
      window.location.href = this.props.callback;
    }
  }

  render() {
   

    
    let stepperSteps = [
      { title: "Pair your wallet" },
    ];

    let result = (
      <PairOrCard
        qrData={this.props.qrData}
        DID={this.props.DID}
        baseUrl={this.props.baseUrl}
        uuid={this.props.sealSession}
        card={<dib>DID authentication completed successfully</dib>}
        vcSent={this.props.vcSent}
        sealSession={this.props.sealSession}
        serverSessionId={this.props.serverSessionId}
      />
    );

    return (
      <Layout>
        <Row>
          <Col>
            <MyStepper steps={stepperSteps} activeNum={1} />
          </Col>
        </Row>
        {result}

        <Row>
          <HomeButton baseUrl={this.props.baseUrl} />
        </Row>
      </Layout>
    );
  }
}
function mapStateToProps(state) {
  return {
    isFetching: state.fetching,
    qrData: state.qrData,
    baseUrl: state.baseUrl,
    DID: state.DID,
    sealSession: state.sealSession,
    callback: state.didAuthCallback,
    serverSessionId: state.serverSessionId,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    setSteps: steps => {
      dispatch(setStepperSteps(steps));
    },
    makeConnectionRequest: (sealSession, baseUrl) => {
      dispatch(makeOnlyConnectionRequest(sealSession, baseUrl));
    },
    didAuthOK: uuid => {
      dispatch(completeDIDAuth(uuid));
    },
    setCallback: callback => {
      dispatch(setDidCallback(callback));
    },
    setSealSession: session =>{
        dispatch(setSealSession(session))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DisplayDidAuth);
