import Character from "../Character"
import Job from "./Job"
import http from "../http"

export default class Fight extends Job {
	constructor(character: Character, target: string = 'max') {
		super(character)
	}

	async run() {
		console.log(`${this.character.name}: Starting fight...`)
		const opponent = await this.findStrongestBeatableMonster()
	}

	async findStrongestBeatableMonster() {
		const monsters = await http.getAllMonsters({ max_level: this.character.data.level })
		if (!monsters) {
			console.error(`Failed to fetch monsters`)
			return null
		}
		// const beatableMonsters = monsters.filter(monster => {
		// 	if (this.monsterHasNoMondifiers(monster)) {
		// 		const monstersDamage = this.getMonstersDamage(monster)
		// 		const tankableHits = this.character.data.hp / monstersDamage
		// 	}
		// })

	}

}