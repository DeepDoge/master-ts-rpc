import type { RpcFunction, RpcInputParser } from "../types"

if (typeof window !== 'undefined') throw new Error('RPC should only be created on the server side.')

export function createRpcFunction<
    IN extends any[] = any[],
    OUT = any,
    P extends RpcInputParser<IN> = RpcInputParser<IN>,
    F extends (...input: IN) => Promise<OUT> = (...input: IN) => Promise<OUT>
>(parser: P, rpc: F): RpcFunction<IN, OUT, P, F>
{
    return { parser, rpc } as RpcFunction<IN, OUT, P, F>
}