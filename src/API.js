export const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJlNWQzYTkwZS02NDUwLTQ4OTMtODc3My0wOWU2YzkxNGU0MzkiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTcyOTY1ODU1MCwiZXhwIjoxNzMwMjYzMzUwfQ.lRPbuZ_31FhCvUbUiF-SYGDIE0gV3rAq-Sv-EpB3Fv8";

// API call to create meeting
export const createMeeting = async ({ token }) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const { roomId } = await res.json();
  return roomId;
};
