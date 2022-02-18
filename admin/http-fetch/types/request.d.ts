import { HttpFetchConfig } from "./types";
export default function request<T>(config: HttpFetchConfig): Promise<T>;
