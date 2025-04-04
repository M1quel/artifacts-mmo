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
	x: number
	y: number
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
	type: 'obtain_and_deposit' | 'craft'
	code: string
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