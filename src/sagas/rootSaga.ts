import { all } from "redux-saga/effects";
import appSaga from "../features/app/appSaga";

export default function* rootSaga() {
  yield all([appSaga()]);
}
