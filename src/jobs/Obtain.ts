import http from '../http'
import { CharacterInterface, ItemInterface } from '../types'
import Job from './Job'
import Craft from './Craft'
import Gather from './Gather'

export default class Obtain extends Job {
	code: string
	quantity: number
	item: ItemInterface | null = null
	depositObtainedToBank: boolean = false
	constructor(character: CharacterInterface, code: string, quantity: number) {
		super(character)
		this.character = character
		this.code = code
		this.quantity = quantity
	}

	async run() {		
		console.log(`Obtaining ${this.quantity} of ${this.code}...`)
		this.item = await http.getItem(this.code)
		if (!this.item) {
			console.error(`Item ${this.code} not found.`)
			return
		}
		if (this.item.craft) {
			await new Craft(this.character, this.item.code, this.quantity).run()
		} else if (this.item.type == 'resource') {
			await new Gather(this.character, this.item.code, this.quantity).run()
		}
	}
}