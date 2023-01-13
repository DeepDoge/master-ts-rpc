import type { z } from "zod"

export interface RpcFunction<Z extends Zod.ZodObject<any> = Zod.ZodObject<any>, F extends (args: z.infer<Z>) => Promise<any> = (args: any) => Promise<any>>
{
    zod: Z
    rpc: F
}

export type RpcFunctions<K extends string = string> = Record<K, RpcFunction>