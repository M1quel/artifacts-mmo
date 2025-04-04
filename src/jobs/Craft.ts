import Job from './Job'
import http from '../http'
import { CharacterInterface } from '../types'
import Obtain from './Obtain'
import Move from './Move'
import u from '../utils'

export default class Craft extends Job {
	code: string
	quantity: number


	constructor(character: CharacterInterface, code: string, quantity: number) {
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
		await new Move(this.character, craftLocation.x, craftLocation.y).run()

		console.log(`Crafting ${this.quantity} of ${this.code}...`)
		const craftResponse = await http.craft(this.character, this.code, this.quantity)
		this.character = craftResponse.character
		await u.awaitUntil(craftResponse.cooldown.expiration)
	}
}