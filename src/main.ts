import Character from './Character'
import { SimpleJobSchema, TaskInterface } from './types'
import cors from 'cors'
import express, { Express } from 'express'
const api: Express = express();

const batchSize = 10
let tickInterval: NodeJS.Timeout | null = null
let jobList: SimpleJobSchema[] = []
let taskHolder: Character | null = null
const characters: { [key: string]: Character } = {
	'Mikkel': new Character('Mikkel', { type: 'monster_tasks' }),
	// 'Miquel': new Character('Miquel'),
	// 'Big_shaq': new Character('Big_shaq'),
	// 'hmm': new Character('hmm'),
	// '123ertghjmk': new Character('123ertghjmk')
}

let activeTask: TaskInterface | null = null

async function main() {
	
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
}


main().catch((err) => {
	console.error("Error in main function:", err);
})