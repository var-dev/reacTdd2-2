import { all } from "redux-saga/effects";
import appSaga from "../features/redux/appSaga";

export default function* rootSaga() {
  yield all([appSaga()]);
}
