if (typeof window !== 'undefined') throw new Error('RPC should only be created on the server side.')

export type RpcInputParser<IN extends any[]> = (input: IN) => IN
export type RpcFunction = ReturnType<typeof createRpcFunction>
export type RpcFunctions<K extends string = string> = Record<K, RpcFunction>

export function createRpcFunction<
    P extends RpcInputParser<any>,
    F extends (...input: ReturnType<P>) => Promise<any>
>(parser: P, rpc: F)
{
    return { parser, rpc }
}