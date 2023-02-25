import { rpcStringify } from "../common/stringify"
import type { RpcHandler, Rpcs } from "../server/api"

export type RpcClient<Functions extends Rpcs> = {
	[K in keyof Functions]: (...args: Parameters<Functions[K]["func"]>) => ReturnType<Functions[K]["func"]>
}

export function createRpcProxyClient<Functions extends Rpcs>(url: string, method: RequestInit["method"]): RpcClient<Functions> {
	const client = new Proxy({} as RpcClient<Functions>, {
		get:
			(_, key: string) =>
			async (...args: any) => {
				const response = await fetch(url, {
					method,
					headers: { "Content-Type": "application/json" },
					body: rpcStringify.stringify({ key, args }),
				})
				if (!response.ok) throw new Error(await response.text())
				return rpcStringify.parse(await response.text())
			},
	})
	return client
}

export function createRpcLocalClient<Functions extends Rpcs>(apiHandler: Promise<RpcHandler<Functions>>): RpcClient<Functions> {
	return new Proxy({} as RpcClient<Functions>, {
		get:
			(_, key: string) =>
			async (...args: any) => {
				const handler = await apiHandler
				return await handler(key, args)
			},
	})
}
