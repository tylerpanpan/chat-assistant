import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import * as qs from 'qs'

export interface PageResult<T> {
  data: T[],
  page_count: number
  total: number
}

class BaseAPI {

  protected instance: AxiosInstance
  protected host: string
  protected token?: string
  protected logoutFun?: () => void

  constructor(axiosInstance: AxiosInstance, host?: string, token?: string, logout?: () => void) {
    this.instance = axiosInstance
    this.host = host || ''
    this.token = token
    this.logoutFun = logout
  }

  async get<T>(uri: string, params?: Record<string, any>, config?: AxiosRequestConfig) {
    const token = this.token || localStorage.getItem('__app_token')

    const headers = this.token ? { Authorization: `Bearer ${token}` } : { Token: '' }
    return this.instance.get<T>(`${this.host}${uri}`, {
      params: params,
      ...config,
      headers: {
        ...headers
      }
    }).then(res => {
      return res.data
    })
  }

  async post<T>(uri: string, data: Record<string, any>, params?: Record<string, any>, json?: boolean, config?: AxiosRequestConfig) {
    const token = this.token || localStorage.getItem('__app_token')

    const headers = token ? { Authorization: `Bearer ${token}` } : { Token: '' }
    return this.instance.post<T>(`${this.host}${uri}`, json ? data : qs.stringify(data), {
      params,
      ...config,
      headers: {
        ...headers,
      },
    }).then(res => {
      return res.data
    })
  }

  async delete<T>(uri: string, data: Record<string, any>, params?: Record<string, any>, config?: AxiosRequestConfig) {
    const token = this.token || localStorage.getItem('__app_token')

    const headers = token ? { Authorization: `Bearer ${token}` } : { Token: '' }
    return this.instance.delete<T>(`${this.host}${uri}`, {
      params,
      ...config,
      headers: {
        ...headers
      },
    }).then(res => res.data)
  }
}

export class API extends BaseAPI {
  userApi: UserAPI;
  characterApi: CharacterAPI;
  chatApi: ChatAPI;
  constructor(token?: string, host?: string, logout?: () => void) {
    super(axios, host)
    this.userApi = new UserAPI(axios, host, token, logout)
    this.characterApi = new CharacterAPI(axios, host, token, logout)
    this.chatApi = new ChatAPI(axios, host, token, logout)
  }
}

export class UserAPI extends BaseAPI {

  login(username: string, password: string) {
    return this.post<{ access_token: string, user: any }>('/api/login', { username, password })
  }

}

export class CharacterAPI extends BaseAPI {

  getCharacters() {
    return this.get<any>('/api/character')
  }

  createCharacter(data: any) {
    return this.post<any>('/api/character', data)
  }

  deleteCharacter(id: string) {
    return this.delete<any>(`/api/character/${id}`, {})
  }

}

export class ChatAPI extends BaseAPI {

  getChats(id: number) {
    return this.get<any>(`/api/chat/${id}`)
  }

  lastChat(characterId: any) {
    return this.get<any>('/api/chat/last', { characterId })
  }

  chat(id: string, text: any) {
    return this.post<any>(`/api/chat/${id}`, { text })
  }

  clearMessage(id: string){
    return this.post<any>(`/api/chat/${id}/clear_message`, {})
  }
}

