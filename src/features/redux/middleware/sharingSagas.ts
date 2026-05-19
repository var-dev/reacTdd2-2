import { takeLatest, call, put } from "redux-saga/effects";
import { 
  requestStartSharing,
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
const receiveMessage = (socket: WebSocket) => {
  return new Promise((resolve) => {
    socket.onmessage = (ev) => {
      resolve(ev.data);
    };
  });
};
const buildUrl = (id: number) => {
  const { protocol, host, pathname } = window.location;
  return `${protocol}//${host}${pathname}?watching=${id}`;
};
function* startWatching() {
}
function* stopWatching() {
}
function* startSharing(): Generator {
  const presenterSocket = yield call(openWebSocket)
  presenterSocket.send(JSON.stringify(requestStartSharing()));
  const message = yield call(receiveMessage, presenterSocket)
  const presenterSessionId = JSON.parse(message).id;
  const url = buildUrl(presenterSessionId);
  yield put(startedSharing({ url }));
}

function* stopSharing() {
}
export function* sharingSaga() {
  yield takeLatest(startedWatching().type, startWatching);
  yield takeLatest(stoppedWatching().type, stopWatching);
  yield takeLatest(requestStartSharing().type, startSharing);
  yield takeLatest(stoppedSharing().type, stopSharing);
}
