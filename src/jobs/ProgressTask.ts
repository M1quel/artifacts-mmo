import Character from "../Character"
import Job from "./Job"
import http from "../http"
const batchSize = 4
export default class ProgressTask extends Job {

	constructor(character: Character) {
		super(character)
	}

	async run() {
		if (!this.character.data.task) {
			console.log(`No task assigned to ${this.character.name}`)
			return
		}
		const taskCode = this.character.data.task
		const taskType = this.character.data.task_type
		const storedItem = await http.getBankItem(taskCode)
		let storedQuantity = 0
		if (storedItem) {
			storedQuantity += storedItem.quantity
		}
		const itemFromInventory = this.character.data.inventory.find((o) => o.code == taskCode)
		if (itemFromInventory) {
			storedQuantity += itemFromInventory.quantity
		}
		const taskRemaining = this.character.data.task_total - this.character.data.task_progress
		
		if (storedQuantity >= taskRemaining || storedQuantity >= batchSize-1) {
			if (storedItem) {
				const bankLocation = await http.getMapLocation(this.character, '', 'bank')
				await this.character.move(bankLocation.x, bankLocation.y)
				await this.character.withdrawFromBank(taskCode, storedQuantity)
			}

			const taskLocation = await http.getMapLocation(this.character, taskType, 'tasks_master')
			await this.character.move(taskLocation.x, taskLocation.y)
			const item = this.character.data.inventory.find((o) => o.code == taskCode)
			if (!item) {
				console.error(`Item ${taskCode} not found in inventory.`)
				return
			}
			await this.character.taskTrade(taskCode, item.quantity)
		}

	}
}