import Obtain from "./Obtain"
import DepositToBank from "./DepositToBank"

export default class ObtainAndDeposit extends Obtain {

	async run() {
		await super.run()

		await new DepositToBank(this.character, this.code, this.quantity).run()

	}
}