import React from "react";
import Link from "next/link";
import { connect } from "react-redux";
// get our fontawesome imports
import {
  faArrowCircleRight,
  faArrowCircleLeft
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  loginClicked,
  setUserAttributeSelection,
  setSessionData,
  setServerSessionId,
  setEndpoint,
  increaseCardIndex,
  decreaseCardIndex,
  setBaseUrl
} from "../store";
import Layout from "../components/Layout";
import { Button, Row, Col, Card } from "react-bootstrap";
const jwt = require("jsonwebtoken");
import { getPath } from "../helpers/pathHelper";
import isMobile from "../helpers/isMobile";

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.clickMe = this.clickMe.bind(this);
    this.increaseCardIndex = this.increaseCardIndex.bind(this);
    this.decreaseCardIndex = this.decreaseCardIndex.bind(this);

    this.isFetching = props.isFetching;
    this.sessionData = props.sessionData;
    // this.userEidas = props.userEidas;
    // this.userEduGain = props.userEduGain;
    this.userSelection = props.userSelection;
  }

  static async getInitialProps({ reduxStore, req }) {
    const serverIsFetching = reduxStore.getState().fetching;
    // console.log(`serverIsFetching ${serverIsFetching}`);
    let userSessionData;
    let serverSessionId;
    let endpoint;
    let baseUrl;

    if (typeof window === "undefined") {
      userSessionData = req.session.userData; // the user attributes
      serverSessionId = req.session.id; // the sessionId that exists on the backend server
      // this is stored on the redux store to use it on the client side components
      endpoint = req.session.endpoint;

      reduxStore.dispatch(setServerSessionId(serverSessionId));
      reduxStore.dispatch(setEndpoint(endpoint));
      baseUrl = req.session.baseUrl ? `/${req.session.baseUrl}/` : "";
      // console.log(`index.js setting baseurl to: ${baseUrl}`);
      reduxStore.dispatch(setBaseUrl(baseUrl));
    } else {
      if (reduxStore.getState().sessionData) {
        // console.log(`user data is defined already ${sessionData}`);
        userSessionData = reduxStore.getState().sessionData;
      } else {
        console.log(`no server session data found`);
      }
    }

    reduxStore.dispatch(setSessionData(userSessionData)); //add the userEidas data to the reduxstore to be able to get it from other componets as well
    reduxStore.dispatch(setUserAttributeSelection([]));
    //returned value here is getting mered with the mapstatetoprops
    // mapstatetoprops overrides these values if they match
    return {
      isFetching: serverIsFetching,
      sessionData: userSessionData,
      userSelection: userSessionData?userSessionData.userSelection:null,
      qrData: reduxStore.getState().qrData,
      baseurl: reduxStore.getState().baseUrl,
      serverSessionId: reduxStore.getState().serverSessionId,
      
    };
  }

  componentDidMount() {
    const { dispatch, sessionData } = this.props;
  }

  componentWillUnmount() {}

  clickMe() {
    this.dispatch(loginClicked());
  }

  increaseCardIndex() {
    this.props.incCardIndex();
  }
  decreaseCardIndex() {
    this.props.decCardIndex();
  }

  render() {
    let cards = [
      <Card style={{ minHeight: "47rem" }}>
        <Card.Header>Issue an isStudent Verifiable Credential</Card.Header>
        <Card.Img variant="top" src={getPath("student.png")} />
        <Card.Body>
          <Card.Title>
            Click Next to generate VC proving that your are a Student
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Available for all EU citizens
          </Card.Subtitle>
          <Card.Text>
            You will be issued a Verifiable Credential (VC) proving that you are
            a student. To do so you will need to authenticate over eIDAS and
            through an Academic Attribute Provider. <br />
            SEAL link those attributes together.
          </Card.Text>
          <Card.Link href="#">
            <Link as={getPath("issue-is-student")} href="issue-is-student">
              <Button variant="primary">Next</Button>
            </Link>
          </Card.Link>
        </Card.Body>
      </Card>,
      <Card style={{ minHeight: "47rem" }}>
        <Card.Header>Issue an eIDAS eID Verifiable Credential</Card.Header>
        <Card.Img  style={{ minHeight: "18rem" }}variant="top" src={getPath("eID.png")} />
        <Card.Body>
          <Card.Title>
            Click Next to generate an eIDAS eID Verifiable Credential
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Available for all EU citizens
          </Card.Subtitle>
          <Card.Text>
            You will be required to authenticate over eIDAS in order to import
            your Personal Identnification information. <br />
            SEAL will issue a Verifiable Credential based on your national eID.
          </Card.Text>
          <Card.Link href="#">
            <Link
              // as={getPath("issue-eidas")}
              href={`${this.props.baseUrl}vc/issue/eidas`}
            >
              <Button variant="primary">Next</Button>
            </Link>
          </Card.Link>
        </Card.Body>
      </Card>,

      <Card style={{ minHeight: "47rem" }}>
        <Card.Header>
          Issue GR Ministry of Education based Verifiable Credential
        </Card.Header>
        <Card.Img style={{ minHeight: "18rem" }} variant="top" src={getPath("minedu.jpg")} />
        <Card.Body>
          <Card.Title>
            Click Next to generate a Verifiable Credential GR MinEdu AcademicId.
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Available for Greek Students and Academic Staff only
          </Card.Subtitle>
          <Card.Text>
            You will be required to authenticate using your University's
            Infrastructure. <br />
            SEAL will issue a Verifiable Credential your Academic Attributes.
          </Card.Text>
          <Card.Link href="#">
            <Link href={`${this.props.baseUrl}issue-gr-academic-id`}>
              <Button variant="primary">Next</Button>
            </Link>
          </Card.Link>
        </Card.Body>
      </Card>,

      <Card style={{ minHeight: "47rem" }}>
        <Card.Header>Issue an eduGAIN Verifiable Credential</Card.Header>
        <Card.Img style={{ minHeight: "18rem" }} variant="top" src={getPath("edugain.png")} />
        <Card.Body>
          <Card.Title>
            Click Next to generate an eduGAIN eID Verifiable Credential
          </Card.Title>

          <Card.Subtitle className="mb-2 text-muted">
            Available for all Students with Universities part of the eduGAIN
            Federation
          </Card.Subtitle>
          <Card.Text>
            You will be required to authenticate using your University's
            Infrastructure. <br />
            SEAL will issue a Verifiable Credential your Academic Attributes.
          </Card.Text>
          <Card.Link href="#">Next</Card.Link>
        </Card.Body>
      </Card>,

      <Card style={{ minHeight: "47rem" }}>
        <Card.Header>Build Your Own Verifiable Credential</Card.Header>
        <Card.Img style={{ minHeight: "18rem" }} variant="top" src={getPath("puzzle.png")} />
        <Card.Body>
          <Card.Title>
            Click Next select which attributes to include in a Credential.
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Available for all EU citizens
          </Card.Subtitle>
          <Card.Text>
            Connect with any of the available data sources, and then select
            which attributes to include in a new Verifiable Credential.
          </Card.Text>
          <Card.Link>
            <Link as={getPath("attribute-selector")} href="attribute-selector">
              <Button variant="primary">Next</Button>
            </Link>
          </Card.Link>
        </Card.Body>
      </Card>
    ];

    let isRightEnabled = cards.length / 3 > this.props.cardIndex;

    let isLeftEnabled = this.props.cardIndex > 1;

    let mobileCards = (
      <Layout>
        <Row style={{ marginTop: "3rem" }}>
          <Col xs={1} style={{ marginTop: "auto", marginBottom: "auto" }}></Col>

          <Col xs={10} className={"container"}>
            <Row>
              {cards.map((card, indx) => {
                return (
                  <Col key={indx} sm={4} xs={12}>
                    {card}
                  </Col>
                );
              })}
            </Row>
          </Col>
          <Col xs={1} style={{ marginTop: "auto", marginBottom: "auto" }}></Col>
        </Row>
      </Layout>
    );

    let desktopCards = (
      <Layout>
        <Row style={{ marginTop: "3rem" }}>
          <Col xs={1} style={{ marginTop: "auto", marginBottom: "auto" }}>
            <Button
              onClick={this.decreaseCardIndex}
              variant="primary"
              disabled={!isLeftEnabled}
            >
              <FontAwesomeIcon icon={faArrowCircleLeft} />
            </Button>
          </Col>

          <Col xs={10} className={"container"}>
            <Row>
              {cards
                .filter((card, index) => {
                  return (
                    index / 3 >= this.props.cardIndex - 1 &&
                    index / 3 < this.props.cardIndex
                  );
                })
                .map((card, indx) => {
                  return (
                    <Col key={indx} sm={4} xs={12}>
                      {card}
                    </Col>
                  );
                })}
            </Row>
          </Col>

          <Col xs={1} style={{ marginTop: "auto", marginBottom: "auto" }}>
            <Button
              onClick={this.increaseCardIndex}
              variant="primary"
              disabled={!isRightEnabled}
            >
              <FontAwesomeIcon icon={faArrowCircleRight} />
            </Button>
          </Col>
        </Row>
      </Layout>
    );

    return isMobile() ? mobileCards : desktopCards;
  }
}

function mapStateToProps(state) {
  console.log("index.js mapping state to props");
  console.log(state);
  return {
    isFetching: state.fetching,
    qrData: state.qrData,
    // userEidas: state.userEidas, // the eIDAS attributes of the user
    // userEduGain: state.userEduGain, // the eduGain attributes of the user
    sessionData: state.sessionData,
    userSelection: state.userSelection, // the attributes selected by the user to be included in a VC,
    cardIndex: state.cardIndex,
    baseUrl: state.baseUrl
  };
}

const mapDispatchToProps = dispatch => {
  return {
    incCardIndex: () => {
      dispatch(increaseCardIndex());
    },
    decCardIndex: () => {
      dispatch(decreaseCardIndex());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
