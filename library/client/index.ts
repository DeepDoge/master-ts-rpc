import type { z } from "zod"
import { rpcJson } from "../common/json"
import type { RpcApiHandler } from "../server/api"
import type { RpcFunctions } from "../types"

export type RpcClient<Functions extends RpcFunctions> = {
    [K in keyof Functions]: (args: z.infer<Functions[K]['zod']>) => ReturnType<Functions[K]['rpc']>
}

export function createRpcProxyClient<Functions extends RpcFunctions>(url: string, method: RequestInit['method']): RpcClient<Functions>
{
    const client = new Proxy({} as RpcClient<Functions>, {
        get: (_, key: string) => async (args: any) =>
        {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: rpcJson.stringify({ key, args })
            })
            if (!response.ok) throw new Error(await response.text())
            return rpcJson.parse(await response.text())
        }
    })
    return client
}

export function createRpcLocalClient<Functions extends RpcFunctions>(apiHandler: Promise<RpcApiHandler<Functions>>): RpcClient<Functions>
{
    return new Proxy({} as RpcClient<Functions>, {
        get: (_, key: string) => async (args: any) =>
        {
            const handler = await apiHandler
            return await handler({ key, args })
        }
    })
}