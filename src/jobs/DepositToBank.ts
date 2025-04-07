import Job from './Job'
import http from '../http'
import Character from '../Character'

export default class DepositToBank extends Job {

	code: string
	quantity: number

	constructor(character: Character, code: string, quantity: number) {
		super(character)
		this.code = code
		this.quantity = quantity
	}

	async run() {
		console.log(`Depositing ${this.quantity} of ${this.code} to bank...`)
		const bankLocation = await http.getMapLocation(this.character, '', 'bank')
		await this.character.move(bankLocation.x, bankLocation.y)

		await this.character.depositToBank(this.code, this.quantity)

	}
}