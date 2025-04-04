import { CharacterInterface } from "../types"

export default class Job {
	success: boolean = false
	prerequisites: Job[] = []
	character: CharacterInterface

	constructor(character: CharacterInterface) {
		this.character = character
	}

	async run(): Promise<void> {
		
	}

	
}