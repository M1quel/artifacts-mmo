import Character from "../Character"
import { CharacterInterface } from "../types"

export default class Job {
	success: boolean = false
	prerequisites: Job[] = []
	character: Character

	constructor(character: Character) {
		this.character = character
	}

	async run(): Promise<void> {
		
	}

	
}