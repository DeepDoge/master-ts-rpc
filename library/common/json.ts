export const rpcStringify = {
	parse(json: string) {
		return JSON.parse(json, (_, value) => {
			if (typeof value === "string") {
				switch (value[0]) {
					case "d":
						return new Date(value)
					case "s":
						return value.substring(1)
					default:
						throw new Error(`Unknown type: ${value}`)
				}
			}
			return value
		})
	},
	stringify(value: any) {
		return JSON.stringify(value, (_, value) => {
			if (value instanceof Date) return `d${value.toISOString()}`
			if (typeof value === "string") return `s${value}`
			return value
		})
	},
}
