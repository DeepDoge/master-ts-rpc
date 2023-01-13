import type { z } from "zod"
import type { RpcFunction } from "../types"

if (typeof window !== 'undefined') throw new Error('RPC should only be created on the server side.')

export function createRpcFunction<Z extends Zod.ZodObject<any>, F extends (args: z.infer<Z>) => Promise<any>>(zod: Z, rpc: F)
{
    return { zod, rpc } as RpcFunction<Z, F>
}