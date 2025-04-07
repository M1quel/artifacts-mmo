import axios from 'axios'
import { CharacterInterface, BankItemTransactionSchema, TaskInterface, ItemInterface, SkillType, MapSchema, CharacterMovementDataSchema, SkillDataSchema, SimpleItemSchema, MonsterSchema } from './types'
import dotenv from 'dotenv'
import Character from './Character'
dotenv.config()

const token = process.env.TOKEN
const base = 'https://api.artifactsmmo.com'

const $http = axios.create({
	baseURL: base,
	responseType: 'json',
	headers: {
		'Authorization': `Bearer ${token}`,
		'Accept': 'application/json'
	}
})

async function get<T>(path: string, opts?: any): Promise<T> {
	const response = await $http.get(path, opts)

	return response.data
}

async function post<T>(path: string, data?: any) {
	const response = await $http.post<T>(path, data)
	return response.data
}



async function getCharacter(name: string) {
	const res = await get<{data: CharacterInterface}>(`/characters/${name}`)
	return res.data
}

async function move(character: Character, x: number, y: number ) {
	const response = await post<CharacterMovementDataSchema>(`/my/${character.name}/action/move`, {
		x: x,
		y: y
	})
	return response.data
}

async function gather(character: Character) {
	const response = await post<SkillDataSchema>(`/my/${character.name}/action/gathering`)
	return response.data
}

async function getTask(code: string) {
	const res = await get<{data: TaskInterface}>(`/tasks/list/${code}`)
	return res.data
}

async function getItem(code: string) {
	const res = await get<{data: ItemInterface}>(`/items/${code}`)
	return res.data
}

async function getMapLocation(character: Character, code: string, type: string) {
	const params: { [key: string]: any } = {}
	if (code) {
		params.content_code = code
	}
	if (type) {
		params.content_type = type
	}
	const res = await get<{data: MapSchema[]}>(`/maps`, {
		params
	})
	if (res.data.length === 0) {
		throw new Error(`Map location for ${code} not found`)
	}
	if (res.data.length > 1) {
		// Find closest location to character
		const closest = res.data.reduce((prev, curr) => {
			const prevDist = Math.sqrt(Math.pow(prev.x - character.data.x, 2) + Math.pow(prev.y - character.data.y, 2))
			const currDist = Math.sqrt(Math.pow(curr.x - character.data.x, 2) + Math.pow(curr.y - character.data.y, 2))
			return (prevDist < currDist) ? prev : curr
		})
		return closest
	}
	return res.data[0]
}

async function craft(character: Character, code: string, quantity: number) {
	const res = await post<SkillDataSchema>(`/my/${character.name}/action/crafting`, {
		code,
		quantity
	})
	if (!res) { throw new Error('Failed to craft') }
	return res.data
}

async function depositToBank(character: Character, code: string, quantity: number) {
	const res = await post<BankItemTransactionSchema>(`/my/${character.name}/action/bank/deposit`, {
		code,
		quantity
	})
	if (!res) { throw new Error('Failed to deposit to bank') }
	return res.data
}

async function withdrawFromBank(character: Character, code: string, quantity: number) {
	const res = await post<BankItemTransactionSchema>(`/my/${character.name}/action/bank/withdraw`, {
		code,
		quantity
	})
	if (!res) { throw new Error('Failed to withdraw from bank') }
	return res.data
}

async function getBankItem(code: string) {
	const res = await get<{data: SimpleItemSchema[]}>(`/my/bank/items`, {
		params: {
			item_code: code
		}
	})
	if (res?.data[0]) {
		return res.data[0]
	}
	return null
}

async function taskTrade(character: Character, code: string, quantity: number) {
	const res = await post<SkillDataSchema>(`/my/${character.name}/action/task/trade`, {
		code,
		quantity
	})
	if (!res) { throw new Error('Failed to trade task item') }
	return res.data
}

async function getAllMonsters(opts: {max_level?: number}) {
	const params: Record<string, any> = {}
	if (opts.max_level) {
		params.max_level = opts.max_level
	}
	const response = await get<{data: MonsterSchema[]}>(`/monsters`, {
		params
	})
	if (!response) {
		throw new Error('Failed to fetch monsters')
	}
	return response.data
}


export default {
	getCharacter,
	move,
	gather,
	getTask,
	getItem,
	getMapLocation,
	craft,
	depositToBank,
	getBankItem,
	withdrawFromBank,
	taskTrade,
	getAllMonsters
}