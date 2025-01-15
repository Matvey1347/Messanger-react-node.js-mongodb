import { User } from "./Auth"

export interface ChatContextParams {
  userChats: Chat[],
  userChatsError: string,
  isUserChatsLoading: boolean,
  isShowModalChatLoader: boolean,
  editingChat: EditingChat | {},
  users: User[],

  setUserChatsError: (error: string) => void,
  getUserChats: () => void,
  setEditingChat: (chat: EditingChat | {}) => void,
  deleteChat: () => void,
  createChat: (newChat: EditingChat) => void,
  updateChat: (chat: EditingChat) => void,
}

export interface Chat {
  _id: string,
  members: string[],
  name: string
}

export interface EditingChat {
  _id?: string,
  members: string[],
  name: string
}