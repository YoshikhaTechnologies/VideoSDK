import "./App.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { authToken, createMeeting } from "./API";
import ReactPlayer from "react-player";

function JoinScreen({ getMeetingAndToken }) {
  const [meetingId, setMeetingId] = useState(null);
  const onClick = async () => {
    await getMeetingAndToken(meetingId);
  };
  return (
      <div className="join-screen">
        <input
            className="meeting-input"
            type="text"
            placeholder="Game name"
            onChange={(e) => {
              setMeetingId(e.target.value);
            }}
        />
        <div className="buttons">
          <button className="btn join-btn" onClick={onClick}>Join</button>
          <span>or</span>
          <button className="btn create-btn" onClick={onClick}>Start Game</button>
        </div>
      </div>
  );
}

function ParticipantView(props) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
      useParticipant(props.participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
            .play()
            .catch((error) =>
                console.error("videoElem.current.play() failed", error)
            );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
      <div className="participant-view">
        <p>
          <strong>Participant:</strong> {displayName} | <strong>Webcam:</strong> {webcamOn ? "ON" : "OFF"} | <strong>Mic:</strong> {micOn ? "ON" : "OFF"}
        </p>
        <audio ref={micRef} autoPlay muted={isLocal} />
        {webcamOn && (
            <ReactPlayer
                playsinline
                pip={false}
                light={false}
                controls={false}
                muted={true}
                playing={true}
                url={videoStream}
                height={"200px"}
                width={"300px"}
                className="participant-video"
                onError={(err) => {
                  console.log(err, "participant video error");
                }}
            />
        )}
      </div>
  );
}

function Controls() {
  const { leave, toggleMic, toggleWebcam } = useMeeting();
  return (
      <div className="controls">
        <button className="btn leave-btn" onClick={() => leave()}>Leave</button>
        <button className="btn control-btn" onClick={() => toggleMic()}>Toggle Mic</button>
        <button className="btn control-btn" onClick={() => toggleWebcam()}>Toggle Webcam</button>
      </div>
  );
}

function MeetingView(props) {
  const [joined, setJoined] = useState(null);
  const { join } = useMeeting();
  const { participants } = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    onMeetingLeft: () => {
      props.onMeetingLeave();
    },
  });
  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
      <div className="meeting-view">
        <h3>Meeting Id: {props.meetingId}</h3>
        {joined && joined === "JOINED" ? (
            <div>
              <Controls />
              <div className="participants">
                {[...participants.keys()].map((participantId) => (
                    <ParticipantView
                        participantId={participantId}
                        key={participantId}
                    />
                ))}
              </div>
            </div>
        ) : joined && joined === "JOINING" ? (
            <p>Joining the meeting...</p>
        ) : (
            <button className="btn join-btn" onClick={joinMeeting}>Join</button>
        )}
      </div>
  );
}

function App() {
  const [meetingId, setMeetingId] = useState(null);

  const getMeetingAndToken = async (id) => {
    const meetingId =
        id == null ? await createMeeting({ token: authToken }) : id;
    setMeetingId(meetingId);
  };

  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  return authToken && meetingId ? (
      <MeetingProvider
          config={{
            meetingId,
            micEnabled: true,
            webcamEnabled: true,
            name: "Spiderman",
          }}
          token={authToken}
      >
        <MeetingConsumer>
          {() => (
              <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} />
          )}
        </MeetingConsumer>
      </MeetingProvider>
  ) : (
      <JoinScreen getMeetingAndToken={getMeetingAndToken} />
  );
}

export default App;
