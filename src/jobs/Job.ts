import Character from "../Character"
import u from "../utils"
export default class Job {
	success: boolean = false
	prerequisites: Job[] = []
	character: Character
	interuptRequested: boolean = false
	onInterupt: (() => Promise<void>) | null = null

	constructor(character: Character) {
		this.character = character
	}
	async start(): Promise<void> {
		this.character.idle = false
		if (this.character.data.cooldown_expiration) {
			await u.awaitUntil(new Date(this.character.data.cooldown_expiration))
		}
		this.character.log('Job started')
		await this.run()
		this.character.idle = true
	}
	async run(): Promise<void> {
		
	}
	async interupt(func: () => Promise<void>): Promise<void> {
		this.character.log('Job interupt requested')
		this.interuptRequested = true
		return new Promise((resolve) => {
			this.onInterupt = async () => {
				this.onInterupt = null
				this.character.log('Job interrupted')
				await func()
				this.interuptRequested = false
				resolve()
			}
		})
	}

	async resume(): Promise<void> {
		this.run()
	}
	
}