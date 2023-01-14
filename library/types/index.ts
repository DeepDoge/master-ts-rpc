export type RpcInputParser<IN extends any[]> = (input: IN) => IN

export interface RpcFunction<
    IN extends any[] = any,
    OUT = any,
    P extends RpcInputParser<IN> = RpcInputParser<IN>,
    F extends (...input: IN) => Promise<OUT> = (...input: IN) => Promise<OUT>
>
{
    parser: P
    rpc: F
}

export type RpcFunctions<K extends string = string> = Record<K, RpcFunction>