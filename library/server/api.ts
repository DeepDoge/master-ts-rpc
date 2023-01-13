import type { RpcFunctions } from "../types"

export type RpcApiHandler<Functions extends RpcFunctions> = ReturnType<typeof createRpcApiHandler<Functions>>
export function createRpcApiHandler<Functions extends RpcFunctions>(functions: Functions)
{
    const handler = async <K extends keyof Functions>(data: { key: K, args: any }) =>
    {
        const { zod, rpc } = functions[data.key] as Functions[K]
        const validated = zod.parse(data.args)
        return await rpc(validated) ?? null
    }

    return handler
}