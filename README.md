# MASTER-TS RPC

This is a simple RPC library for TypeScript.<br/>
It works with any framework or without framework, can be used with any verifier, Zod, SuperStruct, [MasterValidator](https://github.com/DeepDoge/master-validator), custom ones etc, any.

**This project is still in development and breaking changes might occur.**<br/>

# Install

```bash
npm i https://github.com/DeepDoge/master-ts-rpc.git -D
```

# Why master-rpc?

I have been building RPCs way before tRPC became popular.<br/>
While I believe tRPC is the right direction, because I believe RPC is the right direction, I still think tRPC is way too complex and over-engineered.<br/>
Because you probably just wanna run functions from the server, on client, like they are on the client.<br/>
tRPC has stuff like `query`, `mutate`, but all you actually need is, `await rpc.myFunction(foo, bar)`.<br/>
So I just made my own simple RPC module for it.<br/>
Querying and etc, should not be part of the RPC library, it should be build around the RPC library and should be separate.<br/>
And RPC requests should be simple enough that they can be called manually from clients using different languages without the need for this library.<br/>
You don't have to make simple things complex.

## Pros
- ~~While providing a stringifier and parser method built-in, it also let's you use any other stringifier and parser. You don't have to use JSON.~~ (Will be added)
- It let's you create multiple RpcHandlers and Clients so you don't have to put everything in one place.
- You can call your rpc functions from anywhere, server-side, client-side etc. 
- Rpc functions are just like any other function you don't have to think about you are using a rpc function, as long as stringifier and parser can handle all of the parameters of the function.
- It simple, and small.
- Let's you configure and setup it any way you want. For example in this README.md file I don't show it but for example for a project I'm working on I use this and I just group some stuff based on context a single file including the rpc functions. For this use async imports and SSR check for vite to treeshake the rpc functions from client-side. Which works great. 
- It's just a library that helps you build a rpc system around your project FAST and EASY. It just gives you some pieces, that you can place and configure any way you want.

## Cons
- I have been sitting here and thinking, can't find anything bad, maybe add some later.

# Usage

## Example Usage with SvelteKit

We first need rpc functions to be defined.

`createRpc` takes two parameters, the parser and the rpc function itself.

_src/plugin/rpc/functions/greeting.ts_

```ts
import { createRpc } from "master-rpc/library/server/create"

export const greetingRpcFunction = createRpc((args: [{ names: string[] }]) => {
	if (!(args?.[0]?.names instanceof Array)) throw new Error("Names must be an array")
	if (args.some(({ names }) => names.some((name) => typeof name !== "string"))) throw new Error("Names must be strings")
	if (args.some(({ names }) => names.length === 0)) throw new Error("Names cannot be empty")
	return args
}).function(async ({ names }) => {
	return `Hello ${names.join(" and ")}`
})
```

You can also use Zod or similar validators

```ts
import { createRpc } from "master-rpc/library/server/create"
import { z } from "zod"

export const greetingRpcFunction = createRpc((args: unknown[]) => [
	z
		.object({
			names: z.string().array(),
		})
		.parse(args[0]),
]).function(async ({ names }) => `Hello ${names.join(" and ")}`)
```

As you can see at the top, parser gets the args as an array while the rpc function itself gets them as function parameters.
Parameters for the rpc functions gets it's type from the return type of the parser.

Then we need to put all of the rpc functions in a single object

_src/plugin/rpc/functions/index.ts_

```ts
import type { Rpcs } from "master-rpc/library/server/api"
import { greetingRpcFunction } from "./greeting"

export const rpcs = {
	greeting: greetingRpcFunction,
} satisfies Rpcs
```

After having our functions ready, we need to create server and client

### Server API

_src/plugin/rpc/api.ts_

```ts
import { createRpcHandler } from "master-rpc/library/server/api"
import { rpcs } from "./functions"

export const rpcHandler = createRpcHandler(rpcs)
```

_src/routes/rpc/+server.ts_

```ts
import { rpcHandler } from "$/plugin/rpc/server"
import { z } from "zod"
import type { RequestHandler } from "./$types"
import { rpcStringify } from "master-rpc/library/common/stringify"

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = rpcJson.parse(await request.text())
		const result = await rpcHandler(data)
		return new Response(rpcJson.stringify(result), { headers: { "Content-Type": "application/json" } })
	} catch (error) {
		if (error instanceof z.ZodError)
			return new Response(error.errors.map((errorItem) => `${errorItem.path.join(".")} ${errorItem.message}`).join("\n"), { status: 400 })
		if (error instanceof Error) return new Response(error.message, { status: 500 })
		return new Response("Unknown error", { status: 500 })
	}
}
```

As you can see at the top, we use `master-rpc/library/common/json` to parse and stringfy the json data.
And use `rpcHandler` we just created to handle the requests.
You can throw any errors as you see fit.

### Client

_src/plugin/rpi/client.ts_

```ts
import { createRpcLocalClient, createRpcProxyClient } from "master-rpc/library/client"
import type { rpcs } from "$/plugins/rpc/functions"

export function createRpcClient() {
	if (typeof window !== "undefined") return createRpcProxyClient<typeof rpcs>("/rpc", "POST")
	const handlerPromise = import("./server").then((m) => m.rpcHandler)
	return createRpcLocalClient<typeof rpcs>(handlerPromise)
}

export const rpc = createRpcClient()
```

Finally here we create the `RpcClient` and for it to work for both SSR and CSR, if we are on the browser we use the `ProxyClient` and on the server we use the `LocalClient`. Also we pass the `typeof Rpcs` to both create functions, so they have the right type.

After these we can just use our rpc functions anywhere in the code like this:

```ts
rpc.greeating({ names: ["World", "Svelte"] }) // Promise<"Hello World and Svelte">
```

You can create multiple rpc clients with rpc handlers with different routes.
