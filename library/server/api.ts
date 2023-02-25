import type { Rpc } from "./create"

export type Rpcs = Record<string, Rpc<any, any>>
export type RpcHandler<T extends Rpcs> = {
	<K extends keyof T>(key: K, args: Parameters<T[K]["func"]>): Promise<Awaited<ReturnType<T[K]["func"]>>>
}
export function createRpcHandler<T extends Rpcs>(functions: T) {
	const handler: RpcHandler<T> = async (key, args) => {
		const { parser, func } = functions[key]!
		const validated = parser(args)
		return ((await func(...validated)) ?? null) as never
	}

	return handler
}
