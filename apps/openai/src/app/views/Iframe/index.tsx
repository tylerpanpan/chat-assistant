import { useEffect, useRef, useState } from "react";
import { Box, Stack } from "@mui/material";
import { useQuery } from "react-query";
import { useAuth } from "../../provider/AuthProvider";
import useAPI from "../../hooks/useAPI";
import { useFeedback } from "../../components/Feedback";
import { useAudio } from "../../provider/AudioProvider";
import { ChatContent } from "../Chat/components/ChatContent"
import ChatInsert from "../Chat/components/ChatInsert";
import localForage from "localforage";
import '../Chat/index.scss';

function Iframe() {
  const { chatApi, userApi, recommendApi } = useAPI();
  const { token, showLogin } = useAuth();
  const { showToast } = useFeedback();
  const [characterId, setCharacterId] = useState<null | number>(21);
  const sendRef = useRef();
  const { stop } = useAudio()
  const [curCharacter, setCurCharacter] = useState<any>();
  const [sending, setSending] = useState(false);
  const [presetQuestions, setPresetQuestions] = useState<any[]>([]);
  const [chat, setChat] = useState<any>();
  const [chats, setChats] = useState<{ role: "user" | "assistant" | "recharge" | "guest" | "gpt4limit"; content: string; loading?: boolean }[]>([]);

  const { data: userInfo, refetch: refetchUserInfo } = useQuery(
    ["userinfo", token],
    () => userApi.userinfo(),
    {
      enabled: !!token,
      refetchOnWindowFocus: false
    }
  );

  useEffect(() => {
    // 停止语音
    stop()
    if (characterId) {
      if (curCharacter?.recommendEnable) {
        recommendQuestion(characterId)
      }
      localForage.getItem('character-chat').then((mapData: any) => {
        mapData && localForage.getItem(mapData[characterId]).then((data: any) => {
          if (data) {
            const reverseData = [...data].reverse();
            setChats(reverseData);
          }
        });
      });
    }
  }, [characterId, curCharacter]);

  useQuery(
    ["chat/last", token, characterId],
    () => chatApi.lastChat(characterId),
    {
      enabled: !!token && !!characterId,
      refetchOnWindowFocus: false,
      onSuccess(data) {
        setChat(data)
        setCurCharacter(data.character)
        localForage.getItem('character-chat').then((mapData: any) => {
          const characterChatMap = mapData || {}
          characterChatMap[`${characterId}`] = data.id
          localForage.setItem('character-chat', characterChatMap)
        })
        setPresetQuestions(data.character.presetQuestions || [])
      },
    }
  );

  useQuery(
    ["chats", chat],
    () => chatApi.getChats(chat?.id),
    {
      enabled: !!chat,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        localForage.setItem(`${chat?.id}`, data)
        const reverseData = [...data].reverse()
        setChats(reverseData)
        localForage.getItem('once-text').then((data: any) => {
          if (data) {
            handleSend(data)
            localForage.removeItem('once-text')
          }
        })
      },
    }
  );

  // 获取推荐语
  const recommendQuestion = (_characterId: number, text?: string)=> {
    recommendApi.recommendQuestions(_characterId, text).then(res=> {
      if(typeof res === 'object') {
        setPresetQuestions(res)
      }
    })
  }

  const handleSend = (text?: string) => {
    if (!text) {
      return;
    }
    if (!token) {
      showLogin();
      return;
    }
    if (!chat) {
      return;
    }
    setSending(true);
    setChats([
      ...chats,
      {
        role: "user",
        content: text,
      },
      {
        role: "assistant",
        content: "",
        loading: true,
      }
    ]);

    if(curCharacter && curCharacter?.recommendEnable && (text || "").length >= 6) {
      recommendQuestion(curCharacter.id, text)
    }

    chatApi
      .chat(chat.id, text, true)
      .then((response: any) => {
        const reader = response.body.getReader();
        if (response.status === 402) {
          setChats([
            ...chats,
            {
              'role': 'recharge',
              'content': 'Tokens不足，请充值',
            }
          ])
          setSending(false);
          return;
        } else if (response.status === 403) {
          setChats([
            ...chats,
            {
              'role': 'guest',
              'content': '您已达到10次使用限制',
            }
          ])
          setSending(false);
          return;
        } else if (response.status === 419) {
          setChats([
            ...chats,
            {
              'role': 'gpt4limit',
              'content': '您的GPT-4使用次数已耗尽，请邀请好友注册或充值获得更多次数',
            }
          ])
          setSending(false);
          return;
        } else if (response.status >= 300 ) {
          setChats([
            ...chats
          ])
          setSending(false);
          showToast('现在业务繁忙，请稍后再试')
          return;
        }

        const stream = new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then((result: any) => {
                if (result.done) {
                  controller.close();
                  return;
                }
                controller.enqueue(result.value);
                push();
              });
            };
            push();
          }
        });
        // const decoder = new TextDecoder();
        let streamText = ''
        const textStream = stream.pipeThrough(new TextDecoderStream()).getReader();
        //@ts-ignore
        textStream.read().then(function processText({ done, value }) {
          if (done) {
            console.log('Stream complete', streamText);

            setSending(false);
            refetchUserInfo();
            return;
          }
          // 处理接收到的文本数据
          const _value = value.replace(/data: "(.*)"\n\n/g, '$1')
          console.info(_value, typeof _value)
          try {
            streamText += JSON.parse(`"${_value}"`)
          }catch(e) {
            streamText += _value
          }

          setChats([
            ...chats,
            {
              role: "user",
              content: text,
            },
            { role: "assistant", content: streamText }
          ]);
          // @ts-ignore
          sendRef.current && sendRef.current.clearText()
          // 递归读取下一个文本块
          return textStream.read().then(processText);
        });
      })
      .catch((e) => {
        setSending(false);
        if (e.response.status === 402) {
          setChats([
            ...chats,
            {
              'role': 'recharge',
              'content': 'Tokens不足，请充值',
            }
          ])
        } if (e.response.status === 402) {
          setChats([
            ...chats,
            {
              'role': 'recharge',
              'content': 'Tokens不足，请充值',
            }
          ])
        } else if (e.response.status === 403) {
          setChats([
            ...chats,
            {
              'role': 'guest',
              'content': '您已达到10次使用限制',
            }
          ])
        } else if (e.response.status === 419) {
          setChats([
            ...chats,
            {
              'role': 'gpt4limit',
              'content': '您的GPT-4使用次数已耗尽，请邀请好友注册或充值获得更多次数',
            }
          ])
        } else if (e.response.status >= 300 ) {
          setChats([
            ...chats
          ])
          showToast('现在业务繁忙，请稍后再试')
        }
      });
  };

  return (
    <Box
      className="iframe-container"
      width="100%"
      height="100%"
    >
      <Stack
        direction="column"
        height="100%"
        width="100%"
        justifyContent="space-between"
      >
        <ChatContent character={curCharacter} chats={chats} userInfo={userInfo} onRecharge={() => null} />
        <ChatInsert ref={sendRef} presetQuestions={presetQuestions} sending={sending} curCharacter={curCharacter} handleSend={handleSend} />
      </Stack>
    </Box>
  )
}

export default Iframe
