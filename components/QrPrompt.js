import { Table, Container, Row, Col, Button } from "react-bootstrap";
import { getPath } from "../helpers/pathHelper";

const QrPrompt = props => {
  let index = 0;
  const permissions = props.permissions.map(permission => {
    index++;
    return (
      <tr key={index}>
        <td>{index}</td>
        <td>{permission}</td>
      </tr>
    );
  });

  return (
    <Container style={{ marginTop: "3rem" }}>
      <Row className="box-fill-v">
        <Col>
          <Container>
            <Row>
              <Col>
                <p id="uPortMessage">
                  Scan the QR code with your uPort Wallet to access the service
                </p>
                <style jsx>
                  {`
                    #uPortMessage {
                      margin-top: 2em;
                    }
                  `}
                </style>
              </Col>
            </Row>
            <Row>
              <Col>
                <img className="img-fluid" src={props.qrData} />
              </Col>
            </Row>
            <Row>
              Do not have the uPort app yet? Download it form your prefered app
              store
            </Row>
            <Row>
              <Col>
                <a
                  href="https://apps.apple.com/us/app/uport-id/id1123434510"
                  target="_blank"
                  className="w-inline-block"
                >
                  <img className="img-fluid" src={`${props.baseUrl}app-store.png`} />
                </a>
              </Col>
              <Col>
                <a
                  href="https://play.google.com/store/apps/details?id=com.uportMobile&hl=en"
                  target="_blank"
                  className="w-inline-block"
                >
                  <img className="img-fluid" src={`${props.baseUrl}play-store.png`} />
                </a>
              </Col>
            </Row>
          </Container>
        </Col>
        <Col className="border-left border-primary">
          <Container>
            <Row>
              <p id="uPortMessage">{props.message}</p>
              <style jsx>
                {`
                  #uPortMessage {
                    margin-top: 2em;
                  }
                `}
              </style>
            </Row>
            <Row>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Requested Permission</th>
                  </tr>
                </thead>
                <tbody>{permissions}</tbody>
              </Table>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default QrPrompt;
