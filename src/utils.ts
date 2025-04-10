import { TaskType, SimpleJobSchema } from "./types"
import http from "./http"

async function generateJobListFromTask(type: TaskType, code: string, quantity: number, stackSize: number): Promise<SimpleJobSchema[]> {
	const jobList: SimpleJobSchema[] = []
	if (type === 'items') {
		const alreadyHave = await checkStock(code)
		console.log(`Quantity of ${code} still needed: ${quantity - alreadyHave}`)
		const numberOfStacks = (quantity-alreadyHave) / stackSize
		const iterations = Math.ceil(numberOfStacks)
		for (let i = 0; i <= iterations; i++) {
			jobList.push({
				type: 'item_task',
				code: code,
				quantity: stackSize
			})
		}
	}
	if (type === 'monsters') {
		
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

async function checkStock(code: string): Promise<number> {
	const item = await http.getBankItem(code)
	if (!item) {
		return 0
	}
	return item.quantity
}


export default {
	generateJobListFromTask,
	awaitUntil
}