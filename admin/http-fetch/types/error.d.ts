import { HttpFetchConfig, HttpFetchResponseError } from "./types";
export declare function makeError(reject: (reason?: unknown) => void, error: HttpFetchResponseError, config: HttpFetchConfig, response?: Response): void;
