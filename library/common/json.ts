export const rpcJson = {
	parse(json: string) {
		return JSON.parse(json, (_, value) => {
			if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)) return new Date(value)
			return value
		})
	},
	stringify(value: any) {
		return JSON.stringify(value, (_, value) => {
			if (value instanceof Date) return value.toISOString()
			return value
		})
	},
}
