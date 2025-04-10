import http from "./http"
import Job from "./jobs/Job"
import { CharacterInterface, DamageCalculationSchema, MonsterSchema, SimpleJobSchema, TaskInterface, BeatableMonsterInterface, ObjectiveSchema, ItemInterface, SimpleItemSchema, TaskType } from "./types"
import u from "./utils"
import MonsterTask from "./jobs/MonsterTask"

export default class Character {
	name: string
	data!: CharacterInterface
	activeJob: Job | null = null
	idle: boolean = true
	cooldownEnd: Date | null = null
	tickInterval: NodeJS.Timeout | null = null
	objective: ObjectiveSchema | null = null
	constructor(name: string, objective?: ObjectiveSchema) {
		this.name = name
		if (objective) {
			this.objective = objective
		}
		this.load()
	}

	async setTick() {
		this.tick()
		this.tickInterval = setInterval(this.tick.bind(this), 4000)
	}
	
	async tick() {
		if (!this.idle && this.activeJob) {
			const remainingInventorySpace = this.getRemainingInventorySpace()
			if (remainingInventorySpace > 10) {
				this.log('Plenty of inventory space.')
			} else {
				if (!this.activeJob.interuptRequested) {
					this.activeJob.interupt(this.sellTrash.bind(this))
				}
			}
			return
		}
		if (this.data.task) {
			this.startJobFromTask()
			return
		}
		if (this.objective) {
			this.startJobFromObjective()
			return
		}
	}

	async stopTick() {
		if (this.tickInterval) {
			clearInterval(this.tickInterval)
			this.tickInterval = null
		}
	}
	
	async load() {
		console.log(`Loading character: ${this.name}`)
		const res = await http.getCharacter(this.name)
		if (res) {
			this.data = res
		} else {
			console.error(`Failed to load character data for ${this.name}.`)
		}
		this.setTick()
	}

	async getActiveTask(): Promise<TaskInterface | null> {
		if (!this.data.task) {
			return null
		}
		const task = await http.getTask(this.data.task)
		return task
	}
	assignJob(job: SimpleJobSchema) {
		switch(job.type) {
			case 'monster_task':
				this.activeJob = new MonsterTask(this, job.code!, job.quantity || 1)
				break
		}
		return this
	}
	async goToWork() {
		this.idle = false
		if (this.activeJob) {
			await this.activeJob.start()
		}
		this.idle = true
	}
	async gather() {
		const response = await http.gather(this)
		if (response) {
			this.data = response.character
		} else {
			console.error(`Failed to gather for character ${this.name}.`)
		}
		await u.awaitUntil(response.cooldown.expiration)
	}
	async move(x: number, y: number) {
		console.log(`${this.name}: Moving to ${x}, ${y}`)
		if (this.data.x == x && this.data.y == y) { return }
		const response = await http.move(this, x, y)
		if (response) {
			this.data = response.character
		} else {
			console.error(`Failed to move character ${this.name}.`)
		}
		await u.awaitUntil(response.cooldown.expiration)
	}
	async craft(code: string, quantity: number) {
		const craftResponse = await http.craft(this, code, quantity)
		this.data = craftResponse.character
		await u.awaitUntil(craftResponse.cooldown.expiration)
	}
	async depositToBank(code: string, quantity: number) {
		const response = await http.depositToBank(this, code, quantity)
		if (response) {
			this.data = response.character
		} else {
			console.error(`Failed to deposit to bank for character ${this.name}.`)
		}
		await u.awaitUntil(response.cooldown.expiration)
	}
	async withdrawFromBank(code: string, quantity: number) {
		console.log(`${this.name}: Withdrawing ${quantity} of ${code} from bank`)
		const response = await http.withdrawFromBank(this, code, quantity)
		if (response) {
			this.data = response.character
		} else {
			console.error(`Failed to withdraw from bank for character ${this.name}.`)
		}
		await u.awaitUntil(response.cooldown.expiration)
	}
	async taskTrade(code: string, quantity: number) {
		const itemFromInventory = this.data.inventory.find(item => item.code === code)
		const remainingInTask = this.data.task_total - this.data.task_progress
		if (itemFromInventory && itemFromInventory.quantity > remainingInTask) {
			quantity = Math.min(itemFromInventory.quantity, remainingInTask)
		}
		console.log(`${this.name}: Trading ${quantity} of ${code} for task`)
		const response = await http.taskTrade(this, code, quantity)
		if (response) {
			this.data = response.character
		} else {
			console.error(`Failed to trade for task for character ${this.name}.`)
		}
		await u.awaitUntil(response.cooldown.expiration)
	}

	getRemainingInventorySpace() {
		const maxInventorySpace = this.data.inventory_max_items
		let usedInventorySpace = 0
		for (const item of this.data.inventory) {
			usedInventorySpace += item.quantity
		}
		return maxInventorySpace - usedInventorySpace
	}

	async getBeatableMonsters(): Promise<BeatableMonsterInterface[]> {
		const monsters = await http.getAllMonsters({ max_level: this.data.level })
		const beatableMonsters: BeatableMonsterInterface[] = []
		for (const monster of monsters) {
			const isBeatable = this.isMonsterBeatable(monster)
			switch (isBeatable) {
				case 'no':
					continue;
				case 'rest':
					beatableMonsters.push({
						...monster,
						needs_rest: true
					})
					break;
				case 'yes':
					beatableMonsters.push({
						...monster,
						needs_rest: false
					})
					break;
			}

		}
		return beatableMonsters
	}

	isMonsterBeatable(monster: MonsterSchema): 'yes' | 'no' | 'rest' {
		const attackDamage = this.getDamagePrTurn(this.data, monster)
		const monsterDamage = this.getDamagePrTurn(monster, this.data)
		const turnsToKill = Math.ceil(monster.hp / attackDamage)
		const turnsToDie = Math.ceil(this.data.hp / monsterDamage)
		if (turnsToKill < turnsToDie) {
			return 'yes'
		}

		const turnsToDieWithRest = Math.ceil((this.data.max_hp / monsterDamage))
		if (turnsToKill < turnsToDieWithRest) {
			return 'rest'
		}
		return 'no'
	}


	getDamagePrTurn(from: DamageCalculationSchema, to: DamageCalculationSchema) {
		let attack = 0
		if (from.attack_fire) {
			attack = from.attack_fire
			if (to.res_fire) {
				attack = Math.floor(attack * (to.res_fire / 100))
			}
		} else if (from.attack_earth) {
			attack = from.attack_earth
			if (to.res_earth) {
				attack = Math.floor(attack * (to.res_earth / 100))
			}
		} else if (from.attack_water) {
			attack = from.attack_water
			if (to.res_water) {
				attack = Math.floor(attack * (to.res_water / 100))
			}
		} else if (from.attack_air) {
			attack = from.attack_air
			if (to.res_air) {
				attack = Math.floor(attack * (to.res_air / 100))
			}
		}
		if (from.dmg) {
			attack = attack * (1 + (from.dmg / 100))
		}
		return attack
	}
	log(message: string) {
		console.log(`${this.name}: ${message}`)
	}
	async startJobFromObjective() {
		switch (this.objective?.type) {
			case 'monster_tasks':
				if (!this.data.task) {
					await this.obtainNewTask('monster')
				}
				this.assignJob({
					type: 'monster_task',
					code: this.data.task,
					quantity: this.data.task_total - this.data.task_progress
				})
		}
		this.goToWork()
	}
	async startJobFromTask() {
		switch(this.data.task_type) {
			case 'monsters':
				this.assignJob({
					type: 'monster_task',
					code: this.data.task,
					quantity: this.data.task_total - this.data.task_progress
				})
				break
			case 'items':
				break;
		}
		this.goToWork()
	}

	async obtainNewTask(type: 'monster' | 'item') {
		this.log(`Obtaining new ${type} task`)

		const mapLocation = await http.getMapLocation(this, 'monster', 'tasks_master')
		if (!mapLocation) { throw new Error('No map location found') }
		await this.move(mapLocation.x, mapLocation.y)

		const taskResponse = await http.newTask(this)
		this.data = taskResponse.character
		await u.awaitUntil(taskResponse.cooldown.expiration)
	}

	async fight(code?: string) {
		let opponent: MonsterSchema | null = null
		if (code) {
			opponent = await http.getMonster(code)
		} else {
			opponent = await this.findStrongestBeatableMonster()
		}
		if (!opponent) { throw new Error('No opponent found') }

		const mapLocation = await http.getMapLocation(this, opponent.code, 'monster')
		if (!mapLocation) { throw new Error('No map location found') }

		await this.move(mapLocation.x, mapLocation.y)

		const isMonsterBeatable = await this.isMonsterBeatable(opponent)
		switch(isMonsterBeatable) {
			case 'no':
				this.log('Monster is too strong...')
				return
			case 'rest':
				await this.rest()
				break
		}
		this.log(`Fighting ${opponent.name} (${opponent.level})`)
		const fightResponse = await http.fight(this)
		this.data = fightResponse.character
		await u.awaitUntil(fightResponse.cooldown.expiration)
	}

	async rest() {
		this.log('Resting...')
		const restResponse = await http.rest(this)
		this.data = restResponse.character
		await u.awaitUntil(restResponse.cooldown.expiration)
	}
	async findStrongestBeatableMonster() {
		const beatableMonsters = await this.getBeatableMonsters()
		let monster = beatableMonsters?.[0]
		if (!monster) {
			this.log('No beatable monsters found.')
			return null;
		}
		
		console.log(`Beatable monster: ${monster.name} (${monster.level}) needs rest: ${monster.needs_rest}`)
		return monster
	}

	async sellTrash() {
		this.log('Selling trash...')
		const trash = await this.getTrashItemsFromInventory()
		if (trash.length === 0) {
			this.log('No trash to sell.')
			return
		}
		const mapLocation = await http.getMapLocation(this, '', 'grand_exchange')
		if (!mapLocation) { throw new Error('No map location found') }
		await this.move(mapLocation.x, mapLocation.y)
		for (const trashItem of trash) {
			const price = await http.getItemPrice(trashItem.code)
			
			this.log(`Selling ${trashItem.quantity} of ${trashItem.code} for ${price} gold a piece`)
			const listingResponse = await http.listItemOnGE(this, trashItem.code, trashItem.quantity, price)
			this.data = listingResponse.character
			await u.awaitUntil(listingResponse.cooldown.expiration)
		}
	}

	async getTrashItemsFromInventory() {
		const task = await this.getActiveTask()
		const neededItems: SimpleItemSchema[] = []
		const trashItems: SimpleItemSchema[] = []
		if (task?.type === 'items') {
			const item = await http.getItem(task.code)
			const quantityNeeded = this.data.task_total - this.data.task_progress
			neededItems.push({
				code: item.code,
				quantity: quantityNeeded
			})
			if (item.craft) {
				for (const ingredient of item.craft.items) {
					neededItems.push({
						code: ingredient.code,
						quantity: ingredient.quantity * quantityNeeded
					})
				}
			}
		}
		for (const inventorySlot of this.data.inventory) {
			const isNeededItem = neededItems.find(item => item.code === inventorySlot.code)
			if (isNeededItem) continue
			const item = await http.getItem(inventorySlot.code)
			if (item.type !== 'resource') continue
			trashItems.push({
				code: inventorySlot.code,
				quantity: inventorySlot.quantity
			})
		}

		return trashItems
	}
}