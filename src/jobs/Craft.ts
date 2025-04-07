import Job from './Job'
import http from '../http'
import Obtain from './Obtain'
import u from '../utils'
import Character from '../Character'

export default class Craft extends Job {
	code: string
	quantity: number


	constructor(character: Character, code: string, quantity: number) {
		super(character)
		this.character = character
		this.code = code
		this.quantity = quantity
	}

	async run() {
		const item = await http.getItem(this.code)
		if (!item || !item.craft) {
			console.error(`Item ${this.code} not found.`)
			return
		}
		const craft = item.craft
		for(const ingredient of craft.items) {
			await new Obtain(this.character, ingredient.code, ingredient.quantity * this.quantity).run()
		}
		const craftLocation = await http.getMapLocation(this.character, craft.skill, 'workshop')
		await this.character.move(craftLocation.x, craftLocation.y)

		console.log(`Crafting ${this.quantity} of ${this.code}...`)
		await this.character.craft(this.code, this.quantity)
	}
}