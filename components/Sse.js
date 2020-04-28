import React from "react";
import { connect } from "react-redux";
import { vcSentToUser, completeDIDAuth } from "../store";

class SSE extends React.Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.session = props.session;
  }

  componentDidMount() {
    this.eventSource = new EventSource(`/events`);
    //listening for "event" type events
    // as set by the server at ::  res.write(`event: event\n`);

    this.eventSource.addEventListener(
      "event",
      evt => {
        const data = JSON.parse(evt.data); //returns a string so needs further parsing into a JSON
        // Use data here
        let eventData = JSON.parse(data);
        console.log(eventData);

        if (eventData.sessionId && this.props.serverSessionId) {
          console.log(
            `SSE.js -- componentDidMount:: got ${eventData.sessionId} and the current session id is ${this.props.serverSessionId}`
          );
          if (eventData.sessionId === this.props.serverSessionId) {
            console.log(`SSE.js -- componentDidMount:: sessionsMatch!!`);
            console.log(
              `SSE.js -- componentDidMount:: uuid: ${eventData.uuid}`
            );
            this.props.didAuthOK(eventData.uuid, this.props.sealSession);
          }
        }

        // if there is no current session in the client
        // and the server sends a new session event
        if (!this.props.uuid) {
          console.log(" no active session found!");
        } else {
          console.log(`SSE.js:: found uuid ${this.props.uuid}`);
          console.log(`SSE.js:: sent status ${eventData.status}`);
          //check if event is about this client
          if (this.props.uuid === eventData.uuid) {
            switch (eventData.status) {
              case "sent":
                console.log("SSE.js:: VC sent to user");
                this.props.vcSent();
                return "";
              default:
                console.log("SSE.js:: default");
            }
          } else {
            console.log(
              `SSE.js:: the uuid is about ${eventData.uuid} but i have ${this.props.uuid}`
            );
          }
        }
      },
      false
    );
  }

  render() {
    return <div></div>;
  }

  //..render...
}

function mapStateToProps(state) {
  return {
    session: state.serverSession,
    status: state.sessionStatus
    // serverSessionId: state.serverSessionId,
    // endpoint: state.endpoint
  };
}

const mapDispatchToProps = dispatch => {
  return {
    vcSent: () => {
      dispatch(vcSentToUser());
    },
    didAuthOK: (uuid, sealSession) => {
      dispatch(completeDIDAuth(uuid, sealSession));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SSE);
