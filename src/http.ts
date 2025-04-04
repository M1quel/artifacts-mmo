import axios from 'axios'
import { CharacterInterface, BankItemTransactionSchema, TaskInterface, ItemInterface, SkillType, MapSchema, CharacterMovementDataSchema, SkillDataSchema } from './types'
import dotenv from 'dotenv'
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

async function move(config: { x: number, y: number, character: CharacterInterface }) {
	const response = await post<CharacterMovementDataSchema>(`/my/${config.character.name}/action/move`, {
		x: config.x,
		y: config.y
	})
	return response.data
}

async function gather(character: CharacterInterface) {
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

async function getMapLocation(character: CharacterInterface, code: string, type: string) {
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
			const prevDist = Math.sqrt(Math.pow(prev.x - character.x, 2) + Math.pow(prev.y - character.y, 2))
			const currDist = Math.sqrt(Math.pow(curr.x - character.x, 2) + Math.pow(curr.y - character.y, 2))
			return (prevDist < currDist) ? prev : curr
		})
		return closest
	}
	return res.data[0]
}

async function craft(character: CharacterInterface, code: string, quantity: number) {
	const res = await post<SkillDataSchema>(`/my/${character.name}/action/crafting`, {
		code,
		quantity
	})
	if (!res) { throw new Error('Failed to craft') }
	return res.data
}

async function depositToBank(character: CharacterInterface, code: string, quantity: number) {
	const res = await post<BankItemTransactionSchema>(`/my/${character.name}/action/bank/deposit`, {
		code,
		quantity
	})
	if (!res) { throw new Error('Failed to deposit to bank') }
	return res.data
}


export default {
	getCharacter,
	move,
	gather,
	getTask,
	getItem,
	getMapLocation,
	craft,
	depositToBank
}