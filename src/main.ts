import Character from './Character'
import Gather from './jobs/Gather'
import { SimpleJobSchema, TaskInterface } from './types'
import u from './utils'
import http from './http'


let tickInterval: NodeJS.Timeout | null = null
let jobList: SimpleJobSchema[] = []
const characters: { [key: string]: Character } = {
	'Mikkel': new Character('Mikkel'),
	'Miquel': new Character('Miquel')
}

let activeTask: TaskInterface | null = null
let charWithTask: Character | null = null

async function main() {
	await loadCharacters()
	console.log('All characters loaded.')
	if (activeTask) {
		console.log(`Active task: ${activeTask.code}`)
		jobList = await u.generateJobListFromTask('items', 'cooked_gudgeon', 197, 4)
	}
	tick()
	tickInterval = setInterval(tick, 5000)

}

async function loadCharacters() {
	for (const key in characters) {
		const char = characters[key]
		await char.load()
		if (char.data.task) {
			activeTask = await char.getActiveTask()
			charWithTask = char
			console.log(`Task ${activeTask?.code} loaded for character ${key}.`)
		}
		console.log(`Character ${key} loaded.`)
	}
}

async function tick() {
	// console.log('Ticking...')
	// const remainingBankSpace = await http.getRemainingBankSpace()
	for (const key in characters) {
		const char = characters[key]
		if (charWithTask && charWithTask.name == key) { continue }
		if (char.idle) {
			if (jobList.length > 0) {
				const job = jobList.shift()
				if (job) {
					char.assignJob(job).goToWork()
					console.log(`Assigned job ${job.type} to character ${key}.`)
					console.log(`Remaining jobs: ${jobList.length}`)
				}
			} else {
				console.log(`No jobs available for character ${key}.`)
			}
		}
	}
}


main().catch((err) => {
	console.error("Error in main function:", err);
})