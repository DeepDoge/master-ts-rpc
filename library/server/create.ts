if (typeof window !== 'undefined') throw new Error('RPC should only be created on the server side.')

export type RpcInputParser<Args extends any[]> = (args: Args) => Args
export type RpcFunction = ReturnType<typeof createRpcFunction>
export type RpcFunctions = Record<string, RpcFunction>

export function createRpcFunction<
    P extends RpcInputParser<any>,
    F extends (...args: ReturnType<P>) => Promise<any>
>(parser: P, rpc: F)
{
    return { parser, rpc }
}