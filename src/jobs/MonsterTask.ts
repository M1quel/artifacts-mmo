import Character from '../Character'
import Job from './Job'

export default class MonsterTask extends Job {
	code: string
	quantity: number
	constructor(character: Character, code: string, quantity: number) {
		super(character)
		this.code = code
		this.quantity = quantity
	}

	async run() {
		this.character.log(`Starting monster task, remaining quantity: ${this.quantity}`)
		let i = 0
		while (i < this.quantity) {
			if (this.interuptRequested) {
				this.character.log('Monster task interrupted')
				await this.onInterupt?.()
			}
			await this.character.fight(this.code)
			i++
		}
	}
}