import React from "react";
import {
  setSessionData,
  addToSelection,
  addSetToSelection,
  setStepperSteps,
  setEndpoint,
  setBaseUrl
} from "../store";
import Layout from "../components/Layout";
import { connect } from "react-redux";
import Link from "next/link";
import { Button, Row, Col, Card, Container } from "react-bootstrap";
import MyStepper from "../components/Stepper";
const uuidv1 = require("uuid/v1");

class IssueEidas extends React.Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.isFetching = props.isFetching;
    this.sessionData = props.sessionData;
  }

  static async getInitialProps({ reduxStore, req }) {
    let userSessionData;
    if (typeof window === "undefined") {
      userSessionData = req.session.userData;
      reduxStore.dispatch(setEndpoint(req.session.enpoint));
      let baseUrl = req.session.baseUrl ? `/${req.session.baseUrl}/` : "";
      reduxStore.dispatch(setBaseUrl(baseUrl));
    } else {
      if (reduxStore.getState().sessionData) {
        userSessionData = reduxStore.getState().sessionData;
      } else {
        console.log(`no server session data found`);
      }
    }
    if (userSessionData) {
      reduxStore.dispatch(setSessionData(userSessionData));
    }
    //returned value here is getting mered with the mapstatetoprops
    // mapstatetoprops overrides these values if they match
    return {
      sessionData: userSessionData,
      qrData: reduxStore.getState().qrData
    };
  }

  componentDidMount() {
    this.props.setSteps([
      { title: 'Authenticate over "eIDAS-eID"' },
      { title: 'Authenticate over "Academic Id"' },
      { title: "Request Issuance" },
      { title: "Accept Verifiable Credential" }
    ]);

    if (
      this.props.sessionData &&
      this.props.sessionData.eidas &&
      this.props.sessionData.academicId
    ) {
      let toSelect = [
        this.props.sessionData.eidas,
        this.props.sessionData.academicId
      ];
      this.props.setSetsToSelection(toSelect);
    }
  }

  render() {
    const hasEidasRequiredAttr =
      this.props.sessionData !== null &&
      this.props.sessionData !== undefined &&
      this.props.sessionData.eidas !== undefined;
    let eIDASLoginButton = !hasEidasRequiredAttr ? (
      <a
        className="btn btn-primary"
        href="/test/is-student-eidas-authenticate"
        role="button"
      >
        eIDAS
      </a>
    ) : (
      <Button variant="primary" disabled style={{ backgroundColor: "#00c642" }}>
        eIDAS
      </Button>
    );

    const hasAcademicIdRequiredAttr =
      this.props.sessionData !== null &&
      this.props.sessionData !== undefined &&
      this.props.sessionData.academicId !== undefined;

    let token = uuidv1();
    let eduGAINButton =
      !hasAcademicIdRequiredAttr && hasEidasRequiredAttr ? (
        <a
          className="btn btn-primary"
          href={`/academic-id-check/query?sessionId=${token}`}
          role="button"
        >
          AcademicId
        </a>
      ) : hasAcademicIdRequiredAttr ? (
        <Button
          variant="primary"
          disabled
          style={{ backgroundColor: "#00c642" }}
        >
          eduGAIN
        </Button>
      ) : (
        <Button variant="primary" disabled>
          eduGAIN
        </Button>
      );

    let vcIssuanceLink = "/issue/SEAL-STUDENT";
    let vcIssuanceHref = "/issue/[vcType]";

    let credentialCard = (
      <Card className="text-center" style={{ marginTop: "2rem" }}>
        <Card.Header>
          Issue a Verifiable Credential proving your are a University Student
        </Card.Header>
        <Card.Body>
          <Card.Title>
            {hasEidasRequiredAttr && hasAcademicIdRequiredAttr
              ? "Credentials Issuance is ready!"
              : "Please authenticate to the required data sources"}
          </Card.Title>
          <Card.Text>
            Once you have authenticated through the required data sources, click
            the "Issue" button to generate and receive your VC .
          </Card.Text>
          <Container>
            <Row>
              <Col>{eIDASLoginButton}</Col>
              <Col>{eduGAINButton}</Col>
              <Col>
              <Link as={vcIssuanceLink} href={vcIssuanceHref}>
                  <Button
                    variant="primary"
                    disabled={
                      !hasEidasRequiredAttr || !hasAcademicIdRequiredAttr
                    }
                  >
                    Issue Verifiable Claim
                  </Button>
                </Link>
              </Col>
            </Row>
          </Container>
        </Card.Body>
        {/* <Card.Footer className="text-muted">2 days ago</Card.Footer> */}
      </Card>
    );
    let stepNumber = 0;
    if (hasEidasRequiredAttr) {
      if (!hasAcademicIdRequiredAttr) {
        stepNumber = 1;
      } else {
        stepNumber = 2;
      }
    }

    //icon:'/eduGAIN-icon.png'
    let stepperSteps = [
      { title: 'Authenticate over "eIDAS-eID"' },
      { title: 'Authenticate over "eduGAIN"' },
      { title: "Request Issuance" },
      { title: "Accept Verifiable Credential" }
    ];
    return (
      <Layout>
        <Row>
          <Col>
            <MyStepper
              steps={stepperSteps}
              activeNum={stepNumber}
              completeTitleColor={"#00c642"}
              // completeColor={"#00c642"}
            />
          </Col>
        </Row>
        {credentialCard}

        <Row>
          <div className="col" style={{ marginTop: "1.5rem" }}>
            <Link href={this.props.baseUrl ? `${this.props.baseUrl}` : "/"}>
              <Button variant="primary" className="float-right">
                Home
              </Button>
            </Link>
          </div>
        </Row>
      </Layout>
    );
  }
}
function mapStateToProps(state) {
  return {
    isFetching: state.fetching,
    qrData: state.qrData,
    sessionData: state.sessionData,
    userSelection: state.userSelection, // the attributes selected by the user to be included in a VC
    baseUrl: state.baseUrl
  };
}

const mapDispatchToProps = dispatch => {
  return {
    setSetsToSelection: set => {
      dispatch(addSetToSelection(set));
    },
    setSteps: steps => {
      dispatch(setStepperSteps(steps));
    },
    setEndPoint: endpont => {
      dispatch(setEndpoint(endpoint));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueEidas);
