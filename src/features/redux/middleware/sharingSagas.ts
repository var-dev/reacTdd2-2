import { takeLatest } from "redux-saga/effects";
import { call } from "redux-saga/effects";
import { 
  startedSharing, 
  stoppedSharing, 
  startedWatching,
  stoppedWatching,
} from "../environmentSlice.js";

const openWebSocket = () => {
  const { host } = window.location;
  const socket = new WebSocket(`ws://${host}/share`);
  return new Promise((resolve) => {
    socket.onopen = () => {
      resolve(socket);
    };
  });
};
function* startWatching() {
}
function* stopWatching() {
}
function* startSharing(): Generator {
  // const presenterSocket = (yield openWebSocket()) as WebSocket;
  const presenterSocket = yield call(openWebSocket)
  presenterSocket.send(JSON.stringify({type: "environment/startedSharing"}));
}

function* stopSharing() {
}
export function* sharingSaga() {
  yield takeLatest(startedWatching().type, startWatching);
  yield takeLatest(stoppedWatching().type, stopWatching);
  yield takeLatest(startedSharing({url: ""}).type, startSharing);
  yield takeLatest(stoppedSharing().type, stopSharing);
}
