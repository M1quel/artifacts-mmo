import http from "./http"
import Job from "./jobs/Job"
import Obtain from "./jobs/Obtain"
import ObtainAndDeposit from "./jobs/ObtainAndDeposit"
import { CharacterInterface, SimpleJobSchema, TaskInterface } from "./types"
import u from "./utils"
import ProgressTask from "./jobs/ProgressTask"
import Fight from "./jobs/Fight"

export default class Character {
	name: string
	data!: CharacterInterface
	activeJob: Job | null = null
	idle: boolean = true
	cooldownEnd: Date | null = null
	constructor(name: string) {
		this.name = name
	}

	async load() {
		console.log(`Loading character: ${this.name}`)
		const res = await http.getCharacter(this.name)
		if (res) {
			this.data = res
		} else {
			console.error(`Failed to load character data for ${this.name}.`)
		}
	}

	async getActiveTask(): Promise<TaskInterface | null> {
		if (!this.data.task) {
			return null
		}
		const task = await http.getTask(this.data.task)
		return task
	}
	assignJob(job: SimpleJobSchema) {
		switch(job.type) {
			case 'obtain_and_deposit':
				this.activeJob = new ObtainAndDeposit(this, job.code, job.quantity || 1)
				break
			case 'progress_task':
				console.log(`${this.name}: Progress task assigned`)
				this.activeJob = new ProgressTask(this)
				break
			case 'idle_task':
				console.log(`${this.name}: Idle task assigned`)
				if (job.code == 'fight') {
					this.activeJob = new Fight(this)
				}
		}
		return this
	}
	async goToWork() {
		this.idle = false
		if (this.activeJob) {
			await this.activeJob.run()
		}
		this.idle = true
	}
	async gather() {
		const response = await http.gather(this)
		if (response) {
			this.data = response.character
		} else {
			console.error(`Failed to gather for character ${this.name}.`)
		}
		await u.awaitUntil(response.cooldown.expiration)
	}
	async move(x: number, y: number) {
		console.log(`${this.name}: Moving to ${x}, ${y}`)
		if (this.data.x == x && this.data.y == y) { return }
		const response = await http.move(this, x, y)
		if (response) {
			this.data = response.character
		} else {
			console.error(`Failed to move character ${this.name}.`)
		}
		await u.awaitUntil(response.cooldown.expiration)
	}
	async craft(code: string, quantity: number) {
		const craftResponse = await http.craft(this, code, quantity)
		this.data = craftResponse.character
		await u.awaitUntil(craftResponse.cooldown.expiration)
	}
	async depositToBank(code: string, quantity: number) {
		const response = await http.depositToBank(this, code, quantity)
		if (response) {
			this.data = response.character
		} else {
			console.error(`Failed to deposit to bank for character ${this.name}.`)
		}
		await u.awaitUntil(response.cooldown.expiration)
	}
	async withdrawFromBank(code: string, quantity: number) {
		console.log(`${this.name}: Withdrawing ${quantity} of ${code} from bank`)
		const response = await http.withdrawFromBank(this, code, quantity)
		if (response) {
			this.data = response.character
		} else {
			console.error(`Failed to withdraw from bank for character ${this.name}.`)
		}
		await u.awaitUntil(response.cooldown.expiration)
	}
	async taskTrade(code: string, quantity: number) {
		const itemFromInventory = this.data.inventory.find(item => item.code === code)
		const remainingInTask = this.data.task_total - this.data.task_progress
		if (itemFromInventory && itemFromInventory.quantity > remainingInTask) {
			quantity = Math.min(itemFromInventory.quantity, remainingInTask)
		}
		console.log(`${this.name}: Trading ${quantity} of ${code} for task`)
		const response = await http.taskTrade(this, code, quantity)
		if (response) {
			this.data = response.character
		} else {
			console.error(`Failed to trade for task for character ${this.name}.`)
		}
		await u.awaitUntil(response.cooldown.expiration)
	}

	getRemainingInventorySpace() {
		const maxInventorySpace = this.data.inventory_max_items
		let usedInventorySpace = 0
		for (const item of this.data.inventory) {
			usedInventorySpace += item.quantity
		}
		return maxInventorySpace - usedInventorySpace
	}
}