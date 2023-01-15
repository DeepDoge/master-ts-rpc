import type { RpcFunctions } from "./create"

export type RpcApiHandler<Functions extends RpcFunctions> = ReturnType<typeof createRpcApiHandler<Functions>>
export function createRpcApiHandler<Functions extends RpcFunctions>(functions: Functions)
{
    const handler = async <K extends keyof Functions>(data: { key: K, args: Parameters<Functions[K]['parser']> }) =>
    {
        const { parser, rpc } = functions[data.key] as Functions[K]
        const validated = parser(data.args)
        return await rpc(...validated) ?? null
    }

    return handler
}