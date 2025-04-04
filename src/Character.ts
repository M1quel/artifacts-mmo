import http from "./http"
import Job from "./jobs/Job"
import Obtain from "./jobs/Obtain"
import ObtainAndDeposit from "./jobs/ObtainAndDeposit"
import { CharacterInterface, SimpleJobSchema, TaskInterface } from "./types"

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
				this.activeJob = new ObtainAndDeposit(this.data, job.code, job.quantity || 1)
				break
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
}