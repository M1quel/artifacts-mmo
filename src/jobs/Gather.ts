import Job from './Job'
import http from '../http'
import u from '../utils'
import Character from '../Character'
export default class Gather extends Job {

	code: string
	quantity: number
	constructor(character: Character, code: string, quantity: number) {
		super(character)
		this.code = code
		this.quantity = quantity
	}
	async run() {
		console.log(`Moving to ${this.code} for gathering...`)
		const mapLocation = await http.getMapLocation(this.character, this.code, 'resource')
		await this.character.move(mapLocation.x, mapLocation.y)

		for(let i = 0; i < this.quantity; i++) {
			console.log(`${this.character.name}: Gathering ${this.code} (${i + 1}/${this.quantity})`)
			await this.character.gather()
		}
	}
}