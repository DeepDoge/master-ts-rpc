# MASTER RPC
Master RPC is a simple RPC library for TypeScript. It is designed to be used in a NodeJS environment.
It works with any framework or without framework, can be used with any verifier, Zod, SuperStruct custom ones etc, any.

# Install
```bash
npm i https://github.com/DeepDoge/master-rpc.git -D
```

# Usage
## Example Usage with SveltKit
We first need rpc functions to be defined. 

`createRpcFunction` takes two parameters, the parser and the rpc function itself.

*src/plugin/rpc/functions/greeting.ts*
```ts
import { createRpcFunction } from "master-rpc/library/server/create"

export const greetingRpcFunction = createRpcFunction(
    (args: [{ names: string[] }]) => {
        if (!(args?.[0]?.names instanceof Array)) throw new Error("Names must be an array")
        if (args.some(({ names }) => names.some(name => typeof name !== 'string'))) throw new Error("Names must be strings")
        if (args.some(({ names }) => names.length === 0)) throw new Error("Names cannot be empty")
        return args
    },
    async ({ names }) =>
    {
        return `Hello ${names.join(' and ')}`
    }
)
```
You can also use Zod or similar validators
```ts
import { createRpcFunction } from "master-rpc/library/server/create"
import { z } from "zod"

export const greetingRpcFunction = createRpcFunction(
    (args: unknown[]) => [
        z.object({
            names: z.string().array()
        }).parse(args[0])
    ],
    async ({ names }) =>
    {
        return `Hello ${names.join(' and ')}`
    }
)
```
As you can see at the top, parser gets the args as an array while the rpc function itself gets them as function parameters.
Parameters for the rpc functions gets it's type from the return type of the parser.

Then we need to put all of the rpc functions in a single object

*src/plugin/rpc/functions/index.ts*
```ts
import type { RpcFunctions } from "master-rpc/library/server/create"
import { greetingRpcFunction } from "./greeting"

export const rpcFunctions = {
    greeting: greetingRpcFunction,
} satisfies RpcFunctions
```

After having our functions ready, we need to create server and client

### Server API
*src/plugin/rpc/api.ts*
```ts
import { createRpcApiHandler } from "master-rpc/library/server/api"
import { rpcFunctions } from "./functions"

export const rpcApiHandler = createRpcApiHandler(rpcFunctions)
```

*src/routes/rpc/+server.ts*
```ts
import { rpcApiHandler } from "$/plugin/rpc/server"
import { z } from "zod"
import type { RequestHandler } from "./$types"
import { rpcJson } from "master-rpc/library/common/json"

export const POST: RequestHandler = async ({ request }) =>
{
    try
    {
        const data = rpcJson.parse(await request.text())
        const result = await rpcApiHandler(data)
        return new Response(rpcJson.stringify(result), { headers: { 'Content-Type': 'application/json' } })
    }
    catch (error)
    {
        if (error instanceof z.ZodError) return new Response(error.errors
            .map(errorItem => `${errorItem.path.join('.')} ${errorItem.message}`).join('\n'), { status: 400 }) 
        if (error instanceof Error) return new Response(error.message, { status: 500 })
        return new Response("Unknown error", { status: 500 })
    }
}
```
As you can see at the top, we use `master-rpc/library/common/json` to parse and stringfy the json data.
And use `rpcApiHandler` we just created to handle the requests.
You can throw any errors as you see fit.

### Client

*src/plugin/rpi/client.ts*
```ts
import { createRpcLocalClient, createRpcProxyClient } from 'master-rpc/library/client'
import type { rpcFunctions } from '$/plugins/rpc/functions'

export function createRpcClient()
{
    if (typeof window !== 'undefined') return createRpcProxyClient<typeof rpcFunctions>('/api/rpc', 'POST')
    const handlerPromise = import('./server').then(m => m.rpcApiHandler)
    return createRpcLocalClient<typeof rpcFunctions>(handlerPromise)
}

export const rpc = createRpcClient()
```
Finally here we create the `RpcClient` and for it to work for both SSR and CSR, if we are on the browser we use the `ProxyClient` and on the server we use the `LocalClient`. Also we pass the `typeof rpcFunctions` to both create functions, so they have the right type.

After these we can just use our rpc functions anywhere in the code like this:
```ts
rpc.greeating({ names: ["World", "Svelte"] }) // Promise<"Hello World and Svelte">
```
