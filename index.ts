import { z } from "zod";

type Method = "GET" | "POST" | "PATCH";
type FetchArgs<TData> = {
  method: Method;
  path: string;
  headers: Headers;
  dataSchema: z.ZodSchema<TData>;
};

type BaseArgs<TData> = Omit<FetchArgs<TData>, "method">;
type QueryArgs<TData> = BaseArgs<TData> & { params: Params };
type MutationArgs<TData> = BaseArgs<TData> & { data: Data };

// TODO not sure what type this should be
type Params = Record<string, string>;
type Headers = Record<string, string>;
type Data = Record<any, any>;

// TODO how to handle config
let baseUrl: undefined | string = undefined;
type InitArgs = {
  baseUrl?: string | undefined;
};
function init(args: InitArgs) {
  baseUrl = args.baseUrl;
}

async function get<TData>(args: QueryArgs<TData>) {
  return _fetch({
    method: "GET",
    ...args,
  });
}

async function post<TData>(args: MutationArgs<TData>) {
  return _fetch({
    method: "POST",
    ...args,
  });
}

async function _fetch<TData>(args: FetchArgs<TData>) {
  const { path, dataSchema, ...options } = args;
  const response = await fetch(path, options);
  const data = await response.json();
  const result = dataSchema.safeParse(data);
  if (result.success == false) return result.error;
  return result.data;
}

export default {
  init,
  fetch: _fetch,
  get,
  post,
};
