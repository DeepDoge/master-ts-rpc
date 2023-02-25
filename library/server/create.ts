if (typeof window !== "undefined") throw new Error("RPC should only be created on the server side.")

export type RpcInputParser<Input extends any[], Output extends any[]> = {
	(args: Input): Output
}
export type RpcFunction<Parser extends RpcInputParser<any, any>, Return> = {
	(...args: ReturnType<Parser>): Return
}
export type Rpc<Parser extends RpcInputParser<any, any>, Func extends RpcFunction<Parser, any>> = {
	parser: Parser
	func: Func
}

export function createRpc<Parser extends RpcInputParser<any, any>, Return>(
	parser: Parser,
	func: RpcFunction<Parser, Return>
): Rpc<Parser, typeof func> {
	return { parser, func }
}
