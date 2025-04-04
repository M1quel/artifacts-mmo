import { TaskType, SimpleJobSchema } from "./types"
import http from "./http"

async function generateJobListFromTask(type: TaskType, code: string, quantity: number, stackSize: number): Promise<SimpleJobSchema[]> {
	const jobList: SimpleJobSchema[] = []
	if (type === 'items') {
		const itemToObtain = await http.getItem(code)
		const iterations = Math.ceil(quantity / stackSize)
		for (let i = 0; i < iterations; i++) {
			jobList.push({
				type: 'obtain_and_deposit',
				code: code,
				quantity: stackSize
			})
		}
	}
	return jobList
}

async function awaitUntil(dateString: Date): Promise<void> {
	const date = new Date(dateString)
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (new Date() >= date) {
				clearInterval(interval)
				resolve()
			}
		}, 1000)
	})
}


export default {
	generateJobListFromTask,
	awaitUntil
}