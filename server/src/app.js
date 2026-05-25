import express from "express";
import expressWs from "express-ws";

export const app = express();
export const expressWs2 = expressWs(app);

app.use(express.json());
app.use(express.static("dist"));

let nextSessionId = 0;

const sessions = {};

const sendJson = (subscriber, obj) =>
  subscriber.send(JSON.stringify(obj));

const OPEN = 1;

const clearSubscribers = (session) =>
  (session.subscribers = session.subscribers.filter(
    (subscriber) => subscriber.readyState === OPEN
  ));

const sendToSubscribers = (session, obj) => {
  clearSubscribers(session);
  session.subscribers.forEach((subscriber) =>
    sendJson(subscriber, obj)
  );
};

const findSessionId = (ws) => {
  return Object.keys(sessions).find(
    (id) =>
      sessions[id] && sessions[id].presenter === ws
  );
};

const stopSharingIfPresenter = (ws) => {
  const sessionId = findSessionId(ws);
  const session = sessions[sessionId];
  if (session) {
    session.subscribers.forEach((subscriber) =>
      subscriber.close()
    );
    sessions[sessionId] = undefined;
  }
};

app.ws("/share", function (ws) {
  ws.on("close", function () {
    stopSharingIfPresenter(ws);
  });
  ws.on("message", function (msg) {
    let session;
    const request = JSON.parse(msg);
    console.log('request: ', request)
    switch (request.type) {
      case "environment/requestStartSharing":
        sendJson(ws, {
          status: "environment/startedSharing",
          id: nextSessionId,
        });
        sessions[nextSessionId] = {
          presenter: ws,
          history: [],
          subscribers: [],
        };
        nextSessionId++;
        break;
      case "environment/tryStartWatching":
        session = sessions[request.id];
        if (session) {
          session.subscribers = [
            ...session.subscribers,
            ws,
          ];
          session.history.forEach((obj) =>
            sendJson(ws, obj)
          );
        }
        break;
      case "environment/shareNewAction":
        session = sessions[findSessionId(ws)];
        sendToSubscribers(
          session,
          request.payload
        );
        session.history = [
          ...session.history,
          request.payload,
        ];
    }
  });
});