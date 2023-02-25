if (typeof window !== "undefined") throw new Error("RPC should only be created on the server side.")

export type RpcInputParser<Args extends unknown[]> = {
	(input: unknown[]): Args
}
export type RpcFunction<Args extends unknown[], Return> = {
	(...args: Args): Return
}
export type Rpc<Args extends unknown[], Func extends RpcFunction<Args, any>> = {
	parser: RpcInputParser<Args>
	func: Func
}

export function createRpc<T extends Rpc<any, any>>(rpc: T): T {
	return rpc
}
