import Character from './Character'
import { SimpleJobSchema, TaskInterface } from './types'
import u from './utils'
import http from './http'
const batchSize = 10

let tickInterval: NodeJS.Timeout | null = null
let jobList: SimpleJobSchema[] = []
let taskHolder: Character | null = null
const characters: { [key: string]: Character } = {
	'Mikkel': new Character('Mikkel'),
	'Miquel': new Character('Miquel'),
	'Big_shaq': new Character('Big_shaq'),
	'hmm': new Character('hmm'),
	'123ertghjmk': new Character('123ertghjmk')
}

let activeTask: TaskInterface | null = null

async function main() {
	await loadCharacters()
	console.log('All characters loaded.')
	if (activeTask) {
		console.log(`Active task: ${activeTask.code}`)
		jobList = await u.generateJobListFromTask('items', activeTask.code, taskHolder?.data.task_total! - taskHolder?.data.task_progress!, 4)
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
			taskHolder = char
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
		if (taskHolder && taskHolder.name == key) { continue }
		if (char.idle) {
			if (jobList.length > 0) {
				const job = jobList.shift()
				if (job) {
					console.log(`Assigned job ${job.type} to character ${key}.`)
					console.log(`Remaining jobs: ${jobList.length}`)
					char.assignJob(job).goToWork()
				}
			} else {
				console.log(`No jobs available for character ${key}.`)
			}
		}
	}
	
	if (taskHolder?.idle) {
		const bankItem = await http.getBankItem(taskHolder.data.task)
		const remainingInventorySpace = taskHolder.getRemainingInventorySpace()
		const remainingOfTask = taskHolder.data.task_total - taskHolder.data.task_progress

		if (bankItem && (bankItem.quantity >= (remainingInventorySpace * 0.75) || bankItem.quantity >= remainingOfTask)) {
			taskHolder.assignJob({
				type: 'progress_task',
				code: taskHolder.data.task
			}).goToWork()
			return
		}
		taskHolder.assignJob({
			type: 'idle_task',
			code: 'fight'
		}).goToWork()
		return
	}
}


main().catch((err) => {
	console.error("Error in main function:", err);
})