if (typeof window !== "undefined") throw new Error("RPC should only be created on the server side.")

export type RpcInputParser<Args extends readonly unknown[]> = {
	(input: unknown[]): Args
}
export type RpcFunction<Args extends readonly unknown[], Return> = {
	(...args: Args): Return
}
export type Rpc<Args extends readonly any[], Return> = {
	parser: RpcInputParser<Args>
	func: RpcFunction<Args, Return>
}

export function createRpc<Args extends readonly unknown[]>(parser: RpcInputParser<Args>) {
	return {
		function<Return>(func: RpcFunction<Args, Return>): Rpc<Args, Return> {
			return {
				parser,
				func,
			}
		},
	}
}
