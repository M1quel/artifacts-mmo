export declare module 'cors/lib/index'
export interface CharacterInterface {
	name: string
	account: string
	skin: Skin
	level: number
	xp: number
	max_xp: number
	gold: number
	mining_level: number
	mining_xp: number
	mining_max_xp: number
	task: string
	task_type: TaskType
	task_progress: number
	task_total: number
	x: number
	y: number
	inventory: InventorySlot[]
	inventory_max_items: number
	hp: number
	max_hp: number
	attack_fire: number
	attack_earth: number
	attack_water: number
	attack_air: number
	res_fire: number
	res_earth: number
	res_water: number
	res_air: number
	dmg_fire: number
	dmg_earth: number
	dmg_water: number
	dmg_air: number
	dmg: number
	critical_strike: number,
	cooldown_expiration: string
}
export interface TaskInterface {
	code: string
	level: number
	type: TaskType
	min_quantity: number
	max_quantity: number
	skill: unknown
	rewards: Reward
}

export interface ItemInterface {
	name: string
	code: string
	level: number
	type: string
	subtype: string
	description: string
	effects: SimpleEffectSchema[]
	craft: CraftSchema | null
	tradeable: boolean
}

export interface SimpleJobSchema {
	type: 'monster_task' | 'item_task'
	code?: string
	quantity?: number
}

export interface MapSchema {
	name: string
	skin: string
	x: number
	y: number
	content: MapContentSchema
}

interface MapContentSchema {
	type: 'monster' | 'resource' | 'workshop' | 'bank' | 'grand_exchange' | 'tasks_master' | 'npc'
	code: string
}

interface CraftSchema {
	skill: SkillType
	level: number
	quantity: number
	items: SimpleItemSchema[]
}

interface SimpleEffectSchema {
	code: string
	value: number
}
interface SimpleItemSchema {
	code: string
	quantity: number
}

type Skin = 'men1' | 'men2' | 'men3' | 'women1' | 'women2' | 'women3'
export type TaskType = 'monsters' | 'items'
type SkillType = 'weaponcrafting' | 'gearcrafting' | 'jewelrycrafting' | 'cooking' | 'woodcutting' | 'mining' | 'alchemy'
interface Reward {
	items: {
		code: string
		quantity: number
	}[]
	gold: number
}

export interface CharacterMovementDataSchema {
	data: {
		cooldown: CooldownSchema
		destination: MapSchema
		character: CharacterInterface
	}
}

export interface CooldownSchema {
	total_seconds: number
	remaining_seconds: number
	started_at: Date
	expiration: Date
	reason: string
}

export interface SkillDataSchema {
	data: {
		cooldown: CooldownSchema
		details: SkillInfoSchema
		character: CharacterInterface
	}
}

export interface SkillInfoSchema {
	xp: number
	items: DropSchema[]
}

export interface DropSchema {
	code: string
	quantity: number
}

export interface BankItemTransactionSchema {
	data: {
		cooldown: CooldownSchema
		item: ItemInterface
		bank: SimpleItemSchema[]
		character: CharacterInterface
	}
}
export interface MonsterSchema {
	name: string
	code: string
	level: number
	hp: number
	attack_fire: number
	attack_earth: number
	attack_water: number
	attack_air: number
	res_fire: number
	res_earth: number
	res_water: number
	res_air: number
	critical_strike: number
	effects: SimpleEffectSchema[]
	min_gold: number
	max_gold: number
	drops: DropRateSchema[]
}

export interface DropRateSchema {
	code: string
	rate: number
	min_quantity: number
	max_quantity: number
}

export interface DamageCalculationSchema {
	attack_fire: number
	attack_earth: number
	attack_water: number
	attack_air: number
	res_fire: number
	res_earth: number
	res_water: number
	res_air: number
	critical_strike: number
	dmg?: number
	dmg_fire?: number
	dmg_earth?: number
	dmg_water?: number
	dmg_air?: number
}

export interface BeatableMonsterInterface extends MonsterSchema {
	needs_rest: boolean
}

export interface ObjectiveSchema {
	type: ObjectiveType
}

export type ObjectiveType = 'monster_tasks' | 'item_tasks'


export interface CharacterFightDataSchema {
	data: {
		cooldown: CooldownSchema
		fight: FightSchema
		character: CharacterInterface
	}
}

export interface FightSchema {
	xp: number
	gold: number
	drops: DropSchema[]
	turns: number
	monster_blocked_hits: BlockedHitsSchema
	player_blocked_hits: BlockedHitsSchema
	logs: string[]
	result: 'win' | 'loss'
}

export interface BlockedHitsSchema {
	fire: number
	earth: number
	water: number
	air: number
	total: number
}

export interface TaskDataSchema {
	cooldown: CooldownSchema
	task: TaskInterface
	character: CharacterInterface
}

export interface InventorySlot {
	slot: number
	code: string
	quantity: number
}

export interface GEOrderHistorySchema {
	order_id: string
	seller: string
	buyer: string
	code: string
	quantity: number
	price: number
	sold_at: string
}

export interface PaginatedList<T> {
	data: T[]
	total: number
	page: number
	size: number
	pages: number
}

export interface GEOrderTransactionSchema {
	cooldown: CooldownSchema
	order: GEOrderCreatedSchema
	character: CharacterInterface
}

export interface GEOrderCreatedSchema {
	id: string
	created_at: string
	code: string
	quantity: number
	price: number
	total_price: number
	tax: number
}