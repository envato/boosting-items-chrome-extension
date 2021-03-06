import { takeLatest, call, fork, put } from 'redux-saga/effects';
import { getFromStorageSync, extractDomainName } from "../helpers/helpers";
import {
  FETCH_PROMOTIONS_SUCCESS,
  FETCH_HIGHLIGHTS_SUCCESS
} from "../constants/restApi";

import { ON_FETCH_ERROR, FETCH_API_DATA } from "../constants/sagas";

const fetchApiDataRequest = async (endpoint) => {
  let url = await getFromStorageSync("baseUrlValue");

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    const sending = browser.runtime.sendMessage({ type: 'fetchApiData', baseUrl: url, endpoint, marketplace: extractDomainName(window.location.host) });
    sending.then(response => {
      if (response) {
        resolve(response)
      } else {
        reject(response)
      }
    })
  });
}

function *fetchApiDataSaga(action) {
  yield [
    fork(requestAndPut, [fetchApiDataRequest, "post_type_promotion"], actions.fetchApiDataPromotionsSuccess),
    fork(requestAndPut, [fetchApiDataRequest, "post_type_highlight"], actions.fetchApiDataHighlightsSuccess),
  ];
}

function *requestAndPut(request, actionCreator) {
  try {
    const result = yield call(...request);
    yield put(actionCreator(result));
  } catch (e) {
    yield put(actions.failure(e))
  }
}

export function *fetchApiDataSagaWatcher() {
  yield [
    takeLatest(FETCH_API_DATA, fetchApiDataSaga),
  ]
}

export const actions = {
  fetchApiData: () => ({ type: FETCH_API_DATA }),
  fetchApiDataPromotionsSuccess: (payload) => ({ type: FETCH_PROMOTIONS_SUCCESS, payload }),
  fetchApiDataHighlightsSuccess: (payload) => ({ type: FETCH_HIGHLIGHTS_SUCCESS, payload}),
  failure: (error) => ({ type: ON_FETCH_ERROR, error }),
}