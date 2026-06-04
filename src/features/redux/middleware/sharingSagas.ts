import type { Middleware, PayloadAction, UnknownAction, } from "@reduxjs/toolkit";
import { takeLatest, call, put, take, takeEvery } from "redux-saga/effects";
import type { EventChannel } from "redux-saga";
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
  wsSendRequested,
  wsSendSucceeded,
  wsSendFailed,
} from "../environmentSlice.js";
import { reset, submitEditLine } from "../scriptSlice.js";

let presenterSocket: WebSocket | undefined;

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
const webSocketListener = (socket: WebSocket): EventChannel<{ data: string }> =>
  eventChannel((emitter) => {
    socket.onmessage = emitter;
    socket.onclose = () => emitter(END);
    return () => {
      socket.close();
    };
  });
function* watchUntilStopRequest(
  chan: ReturnType<typeof webSocketListener>,
): Generator {
  try {
    while (true) {
      const ev = yield take(chan);
      yield put(JSON.parse(ev.data));
    }
  } finally {
    chan.close();
    yield put(stoppedWatching());
  }
}
function* startWatching(): Generator {
  const sessionId = new URLSearchParams(
    window.location.search.substring(1),
  ).get("watching");
  if (sessionId) {
    const watcherSocket = (yield call(openWebSocket)) as WebSocket;
    yield put(reset());
    watcherSocket.send(
      JSON.stringify({
        type: tryStartWatching.type,
        id: sessionId,
      }),
    );
    yield put(startedWatching());
    const channel = (yield call(
      webSocketListener,
      watcherSocket,
    )) as EventChannel<{ data: string }>;
    yield call(watchUntilStopRequest, channel);
  }
}
function* stopWatching() {}
function* startSharing(): Generator {
  presenterSocket = yield call(openWebSocket);
  if (presenterSocket?.readyState !== WebSocket.OPEN) return
  presenterSocket.send(JSON.stringify(requestStartSharing()));
  const message = yield call(receiveMessage, presenterSocket);
  const presenterSessionId = JSON.parse(message).id;
  const url = buildUrl(presenterSessionId);
  yield put(startedSharing({ url }));
}

function* stopSharing() {
  if (presenterSocket) {
    presenterSocket.close();
    presenterSocket = undefined;
    yield put(stoppedSharing());
  }
}
function* shareNewActionHandler(
  action: PayloadAction<UnknownAction>,
) {
  const payload = { wsMessage: JSON.stringify(shareNewAction(action.payload)) };
  yield put(wsSendRequested(payload));
  yield call(sendWsMessage, payload);
}
function* sendWsMessage(payload: { wsMessage: string }): Generator {
  let serializableError: SerializableError
  if (!presenterSocket || presenterSocket?.readyState !== WebSocket.OPEN) {
    yield put(wsSendFailed({...payload, error: {message: "no socket"}}))
    return
  }
  try {
    yield call([presenterSocket, presenterSocket.send], payload.wsMessage)
  } catch (error) {
    serializableError = error instanceof Error
      ? {name: error.name, message: error.message, stack: error.stack }
      : {message: String(error)}
    yield put(wsSendFailed({...payload, error: serializableError}))
    return
  }
  yield put(wsSendSucceeded(payload))
}
export function* sharingSaga() {
  yield takeLatest(tryStartWatching.type, startWatching);
  yield takeLatest(tryStopWatching.type, stopWatching);
  yield takeLatest(requestStartSharing.type, startSharing);
  yield takeLatest(requestStopSharing.type, stopSharing);
  yield takeEvery(shareNewAction.type, shareNewActionHandler);
}

export const duplicateForSharing: Middleware = (store) => (next) => (action) => {
  if (submitEditLine.match(action)) {
    store.dispatch(
      shareNewAction(action)
    );
  }
  return next(action);
};
