import Job from './Job'
import http from '../http'
import { CharacterInterface } from '../types'
import u from '../utils'

export default class Move extends Job {
	x: number
	y: number

	constructor(character: CharacterInterface, x: number, y: number) {
		super(character)
		this.character = character
		this.x = x
		this.y = y
	}

	async run() {
		console.log(`Moving ${this.character.name} to location { x: ${this.x}, y: ${this.y} }...`)
		const response = await http.move({
			x: this.x,
			y: this.y,
			character: this.character
		})
		this.character = response.character
		await u.awaitUntil(response.cooldown.expiration)
	}
}