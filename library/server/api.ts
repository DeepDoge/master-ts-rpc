import type { Rpc } from "./create"

export type Rpcs = Record<string, Rpc<any, any>>
export type RpcHandler<Functions extends Rpcs> = ReturnType<typeof createRpcHandler<Functions>>
export function createRpcHandler<Functions extends Rpcs>(functions: Functions) {
	const handler = async <K extends keyof Functions>(data: { key: K; args: Parameters<Functions[K]["parser"]> }) => {
		const { parser, rpc } = functions[data.key] as Functions[K]
		const validated = parser(data.args)
		return (await rpc(...validated)) ?? null
	}

	return handler
}
