import Job from './Job'
import http from '../http'
import { CharacterInterface } from '../types'
import Move from './Move'
import u from '../utils'
export default class Gather extends Job {

	code: string
	quantity: number
	constructor(character: CharacterInterface, code: string, quantity: number) {
		super(character)
		this.code = code
		this.quantity = quantity
	}
	async run() {
		const mapLocation = await http.getMapLocation(this.character, this.code, 'resource')
		await new Move(this.character, mapLocation.x, mapLocation.y).run()
		for(let i = 0; i < this.quantity; i++) {
			console.log(`Gathering ${this.code} (${i + 1}/${this.quantity})`)
			const gatherResponse = await http.gather(this.character)
			this.character = gatherResponse.character
			await u.awaitUntil(gatherResponse.cooldown.expiration)
		}
	}
}