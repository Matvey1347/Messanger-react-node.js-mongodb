import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { baseUrl, deleteRequest, getRequest, postRequest, putRequest } from "../utils/services";
import { User } from "../interfaces/Auth";
import { Chat, ChatContextParams, EditingChat, Message } from "../interfaces/Chat";

const defEditingChatValue = { name: "", members: [] };
const defChatValue = { _id: "", members: [], name: "" };

export const ChatContext = createContext<ChatContextParams>({
  userChats: [],
  userChatsError: "",
  users: [],
  isUserChatsLoading: false,
  isShowModalChatLoader: false,
  editingChat: defEditingChatValue,
  currentChat: defChatValue,

  messages: [],
  messagesError: "",
  isMessagesLoading: false,

  setCurrentChat: () => { },
  setUserChatsError: () => { },
  setEditingChat: () => { },
  deleteChat: () => { },
  createChat: () => { },
  updateChat: () => { },
});

export const ChatContextProvider = ({ children, user }: { children: ReactNode, user: User | null }) => {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [userChatsError, setUserChatsError] = useState<string>("");
  const [isUserChatsLoading, setIsUserChatsLoading] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>([]);

  const [currentChat, setCurrentChat] = useState<Chat>(defChatValue);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesError, setMessagesError] = useState<string>("");
  const [isMessagesLoading, setMessagesLoading] = useState<boolean>(false);

  const [editingChat, setEditingChat] = useState<EditingChat | {}>(defEditingChatValue);
  const [isShowModalChatLoader, setIsShowModalChatLoader] = useState(false);

  useEffect(() => {
    getUserChats();
    getUsers();
  }, [user]);

  useEffect(() => {
    getMesages();
  }, [currentChat]);

  const getMesages = async () => {
    const curChatId = currentChat._id;
    if (curChatId) {
      setMessagesLoading(true);
  
      const res = await getRequest(`${baseUrl}/messages/${curChatId}`);
      setMessagesLoading(false);
      if (res.error) return setMessagesError(res.message);
      setMessages(res.data);
    }
  }

  const getUserChats = async () => {
    setIsUserChatsLoading(true);

    const userId = user?._id;
    if (userId) {
      const res = await getRequest(`${baseUrl}/chats/${userId}`);
      setIsUserChatsLoading(false);
      if (res.error) return setUserChatsError(res.message);
      setUserChats(res.data);
      setCurrentChat(res.data[0]);
    }
  }

  const getUsers = async () => {
    const userId = user?._id;
    if (userId) {
      const res = await getRequest(`${baseUrl}/users/`);
      if (res.error) return setUserChatsError(res.message);
      setUsers(res.data);
    }
  }

  const deleteChat = async () => {
    setIsShowModalChatLoader(true);
    const chat = editingChat as EditingChat;
    const chatId = chat?._id;

    if (chatId) {
      const res = await deleteRequest(`${baseUrl}/chats/${chatId}`);
      setIsShowModalChatLoader(false);
      if (res.error) return setUserChatsError(res.message);
      await getUserChats();
    } else {
      setIsShowModalChatLoader(false);
      return setUserChatsError("Cannot found chat Id ((");
    }
  };

  const createChat = async (newChat: EditingChat) => {
    setIsShowModalChatLoader(true);

    const res = await postRequest(`${baseUrl}/chats`, JSON.stringify(newChat));
    setIsShowModalChatLoader(false);
    if (res.error) return setUserChatsError(res.message);
    await getUserChats();
  };

  const updateChat = async (updatedValue: EditingChat) => {
    setIsShowModalChatLoader(true);

    const chat = editingChat as EditingChat;
    if (chat._id) {
      const res = await putRequest(`${baseUrl}/chats/${chat._id}`, JSON.stringify(updatedValue));
      setIsShowModalChatLoader(false);
      if (res.error) return setUserChatsError(res.message);
      await getUserChats();
    } else {
      setIsShowModalChatLoader(false);
      return setUserChatsError("Cannot found chat Id ((");
    }
  }

  const handleSetCurrentChat = useCallback((chat: Chat) => {
    setCurrentChat(chat);
  }, []);
  const handleSetUserChatsError = useCallback((error: string) => {
    setUserChatsError(error);
  }, []);
  const handleSetEditingChat = useCallback((chat: EditingChat | {}) => {
    setEditingChat(chat);
  }, []);

  return <ChatContext.Provider value={{
    userChats,
    userChatsError,
    isUserChatsLoading,
    isShowModalChatLoader,
    editingChat,
    users,
    currentChat,

    messages,
    messagesError,
    isMessagesLoading,

    setCurrentChat: handleSetCurrentChat,
    setUserChatsError: handleSetUserChatsError,
    setEditingChat: handleSetEditingChat,
    deleteChat,
    createChat,
    updateChat
  }}>
    {children}
  </ChatContext.Provider>
}