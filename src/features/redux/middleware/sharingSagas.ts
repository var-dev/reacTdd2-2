import type { PayloadAction } from "@reduxjs/toolkit";
import { takeLatest, call, put, take } from "redux-saga/effects";
import { eventChannel, END } from "redux-saga";
import { 
  requestStartSharing,
  requestStopSharing,
  shareNewAction,
  startedSharing,
  stoppedSharing, 
  tryStartWatching,
  startedWatching,
  tryStopWatching,
  stoppedWatching,
} from "../environmentSlice.js";
import { reset } from "../scriptSlice.js";

let presenterSocket:WebSocket;

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
function* shareNewActionHandler(
  action: PayloadAction<Record<string, unknown>>,
) {
  if (presenterSocket && presenterSocket.readyState === WebSocket.OPEN){
    yield call(
      [presenterSocket, presenterSocket.send],
      JSON.stringify(shareNewAction(action.payload)),
    );
  } 
}
const webSocketListener = (socket: WebSocket) =>
  eventChannel((emitter) => {
    socket.onmessage = emitter;
    socket.onclose = () => emitter(END);
    return () => {
      socket.close();
    };
  });
function* watchUntilStopRequest(chan: ReturnType<typeof webSocketListener>): Generator {
  try {
    while (true) {
      const ev = yield take(chan);
      yield put(JSON.parse(ev.data));
    }
  } finally {
    chan.close();
    yield put(stoppedWatching())
  }
};
function* startWatching(): Generator {
  const sessionId = new URLSearchParams(
    window.location.search.substring(1),
  ).get("watching");
  if (sessionId) {
    const watcherSocket = (yield call(openWebSocket))as WebSocket;
    yield put(reset());
    watcherSocket.send(
      JSON.stringify({
        type: tryStartWatching.type,
        id: sessionId,
      }),
    );
    yield put(startedWatching())
    const channel = yield call(webSocketListener, watcherSocket);
    yield call(watchUntilStopRequest, channel);
  }
}
function* stopWatching() {
}
function* startSharing(): Generator {
  presenterSocket = yield call(openWebSocket)
  presenterSocket.send(JSON.stringify(requestStartSharing()));
  const message = yield call(receiveMessage, presenterSocket)
  const presenterSessionId = JSON.parse(message).id;
  const url = buildUrl(presenterSessionId);
  yield put(startedSharing({ url }));
}

function* stopSharing() {
  if (Object.hasOwn(presenterSocket, 'close')) {
    presenterSocket.close();
    yield put(stoppedSharing());
  }
}
export function* sharingSaga() {
  yield takeLatest(tryStartWatching.type, startWatching);
  yield takeLatest(tryStopWatching.type, stopWatching);
  yield takeLatest(requestStartSharing.type, startSharing);
  yield takeLatest(requestStopSharing.type, stopSharing);
  yield takeLatest(shareNewAction.type, shareNewActionHandler);
}
