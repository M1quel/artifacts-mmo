import { CharacterInterface } from '../types'
import Job from './Job'
import http from '../http'
import Move from './Move'
import u from '../utils'

export default class DepositToBank extends Job {

	code: string
	quantity: number

	constructor(character: CharacterInterface, code: string, quantity: number) {
		super(character)
		this.code = code
		this.quantity = quantity
	}

	async run() {
		console.log(`Depositing ${this.quantity} of ${this.code} to bank...`)
		const bankLocation = await http.getMapLocation(this.character, '', 'bank')
		await new Move(this.character, bankLocation.x, bankLocation.y).run()

		const response = await http.depositToBank(this.character, this.code, this.quantity)
		this.character = response.character
		await u.awaitUntil(response.cooldown.expiration)

	}
}