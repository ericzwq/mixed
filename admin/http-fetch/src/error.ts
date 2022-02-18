import {HttpFetchConfig, HttpFetchResponseError} from "./types";

export function makeError(reject: (reason?: unknown) => void, error: HttpFetchResponseError, config: HttpFetchConfig, response?: Response) {
  error.config = config
  error.response = response
  if (response) {
    response.clone().text().then(data => {
      try {
        data = JSON.parse(data)
      } catch (e) {
      }
      error.data = data
      reject(error)
    })
  } else reject(error)
}
