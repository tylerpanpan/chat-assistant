import { useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  IconButton,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import { useQuery } from "react-query";
import { useAuth } from "../../provider/AuthProvider";
import useAPI from "../../hooks/useAPI";
import { useFeedback } from "../../components/Feedback";
import { RechargeModal } from "../../components/RechargeModal";
import { ChatContent } from "./components/ChatContent";
import { ChatList } from "./components/ChatList";
import ChatInsert from "./components/ChatInsert";
import localForage from "localforage";
import { useAudio } from "../../provider/AudioProvider";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ViewHeadlineOutlinedIcon from '@mui/icons-material/ViewHeadlineOutlined';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { getUrlParams } from "../../utils";
import './index.scss';

export function Chat() {
  const { chatApi, userApi, recommendApi, shareAPI } = useAPI();
  const { token, showLogin } = useAuth();
  const { showDialog, showToast } = useFeedback();
  const { stop } = useAudio()
  const sendRef = useRef()
  const [characterId, setCharacterId] = useState<null | number>();
  const [curCharacter, setCurCharacter] = useState<any>();
  const [sending, setSending] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [presetQuestions, setPresetQuestions] = useState<any[]>([]);
  const [chat, setChat] = useState<any>();
  const [chats, setChats] = useState<{ role: "user" | "assistant" | "recharge" | "guest" | "gpt4limit"; content: string; loading?: boolean }[]>([]);
  const [showChatList, setShowChatList] = useState(false);
  const [isMultiple, setIsMultiple] = useState<boolean>(false);
  const [selectedIndexs, setSelectedIndexs] = useState<any[]>([]);

  // 更多操作
  const [allChats, setAllChats] = useState<any[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMore = Boolean(anchorEl);
  const handleClickMore = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const urlQuery = getUrlParams(location.href)
    if (urlQuery.cid) {
      setCharacterId(urlQuery.cid)
    }
    return () => {
      stop()
    }
  }, [])

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

  const { data: userInfo, refetch: refetchUserInfo } = useQuery(
    ["userinfo", token],
    () => userApi.userinfo(),
    {
      enabled: !!token,
      refetchOnWindowFocus: false
    }
  );

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

  const { refetch: refetchChat } = useQuery(
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

  const handleShare = () => {
    copyToClipboard('https://grzl.ai/')
  }

  const handleClearMessage = () => {
    handleCloseMore()
    if (!token) {
      showLogin();
      return;
    }
    if (!chat) return;
    showDialog("确定要清除会话吗?", "清除会话", "取消", "确定", (confirm) => {
      if (confirm == 1) {
        stop()
        chatApi
          .clearMessage(chat.id)
          .then((res) => {
            refetchChat();
          })
          .catch((err) => {});
      }
    });
  };

  const handleCreateChat = () => {
    handleCloseMore()
    if (!token) {
      showLogin();
      return;
    }
    if (!characterId) return;
    chatApi
      .createChat(characterId)
      .then((res) => {
        showToast('新会话创建成功');
        stop()
        setChats([])
        setChat(res)
        localForage.getItem('character-chat').then((mapData: any) => {
          const characterChatMap = mapData || {}
          characterChatMap[`${characterId}`] = res.id
          localForage.setItem('character-chat', characterChatMap)
        })
      })
      .catch((err) => {});
  }

  const handleAllChat = () => {
    handleCloseMore()
    if (!token) {
      showLogin();
      return;
    }
    if (!characterId) return;
    chatApi
      .getCharacterChat(characterId)
      .then((res) => {
        stop()
        if (res.length > 0) {
          setAllChats(res)
          setShowChatList(true);
        } else {
          setChats([])
          setShowChatList(false);
          handleCreateChat()
        }
      })
      .catch((err) => {});
  }

  const handleDeleteChat = (id: number) => {
    showDialog("确定要删除此会话吗?", "删除会话", "取消", "确定", (confirm) => {
      if (confirm == 1) {
        chatApi
          .delChat(id)
          .then((res) => {
            showToast('删除成功');
            handleAllChat();
            localForage.getItem('character-chat').then((mapData: any) => {
              const characterChatMap = mapData || {}
              characterChatMap[`${characterId}`] = chat?.id === id ? null : chat?.id
              localForage.setItem('character-chat', characterChatMap)
            })
          })
          .catch((err) => {});
      }
    });
  }

  const handleChooseChat = (chatData: any) => {
    setShowChatList(false);
    if (chat?.id !== chatData.id) {
      setChats([])
      setChat(chatData)
      localForage.getItem(`${chatData.id}`).then((data: any) => {
        if (data) {
          const reverseData = [...data].reverse();
          setChats(reverseData);
        }
      })
    }
    localForage.getItem('character-chat').then((mapData: any) => {
      const characterChatMap = mapData || {}
      characterChatMap[`${characterId}`] = chatData.id
      localForage.setItem('character-chat', characterChatMap)
    })
  }

  function copyToClipboard(text: string) {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text + `?invite=${userInfo?.id}`;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    showToast("分享链接已拷贝到剪贴板");
  }

  // 分享到社区
  const shareContent = () => {
    if (selectedIndexs.length) {
      shareAPI
        .createShare({
          chatId: chat?.id,
          messageIndexs: selectedIndexs.sort((a, b) => a - b)
        })
        .then(() => {
          setIsMultiple(false);
          showToast("已分享到社区");
        })
        .catch((err) => {});
    }
  }

  return (
    <>
      <Box height="100%">
        <Box
          width="100%"
          height="100%"
        >
          <Stack
            direction="column"
            height="100%"
            width="100%"
            justifyContent="space-between"
          >
            <Box color="#303030" width="100%" p={1} borderBottom="1px solid rgba(0, 0, 0, .1)">
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                {userInfo?.username && <Box flexShrink={0} marginRight="5px" sx={{ marginLeft: { xs: 0, sm: "10px" } }}>
                  <Typography variant="caption" display="block">积分：{Math.floor(userInfo?.balance ? userInfo?.balance * 100 : 0)}</Typography>
                  <Typography variant="caption" display="block" sx={{ fontSize: '13px', fontWeight: '500', color: '#1976d2', cursor: 'pointer' }} onClick={()=> setRechargeModalOpen(true)}>
                    充值
                  </Typography>
                </Box>}
                <Box flex={1}>
                  <Stack sx={{minHeight: '60px'}} direction="column" justifyContent="center" alignItems="center">
                    <Typography fontWeight="500">
                      {curCharacter?.name || ""}
                    </Typography>
                    {curCharacter?.description && <Typography sx={{lineHeight: 1.2,marginTop: '5px'}} variant="caption">{curCharacter?.description}</Typography>}
                  </Stack>
                </Box>
                <Box height="42px" flexShrink={0}>
                  {token && userInfo?.username && (
                    <Button onClick={handleShare}>
                      推荐得积分
                    </Button>
                  )}
                  {token && chat && userInfo?.username && (
                    <Tooltip title="更多操作">
                      <IconButton sx={{ border: '1px solid #dedede', marginLeft: '10px' }} onClick={handleClickMore}>
                        <MoreHorizOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={openMore}
                    onClose={handleCloseMore}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    {!showChatList && <MenuItem onClick={handleClearMessage}>
                      <ListItemIcon>
                        <DeleteOutlineIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>清空会话</ListItemText>
                    </MenuItem>}
                    {!showChatList && <MenuItem onClick={handleCreateChat}>
                      <ListItemIcon>
                        <SaveAsOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>保存并新建会话</ListItemText>
                    </MenuItem>}
                    <MenuItem onClick={handleAllChat}>
                      <ListItemIcon>
                        <ViewHeadlineOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>查看所有会话</ListItemText>
                    </MenuItem>
                  </Menu>
                </Box>
              </Stack>
            </Box>
            {/* 所有会话消息 */}
            {showChatList && <ChatList allChats={allChats} onChoose={handleChooseChat} onDelete={handleDeleteChat} />}
            {/* 当前会话内容 */}
            {!showChatList && <ChatContent character={curCharacter} chats={chats} userInfo={userInfo} isMultiple={isMultiple} onMultiChange={(boo) => setIsMultiple(boo)} onSelectedIndexs={(arr) => setSelectedIndexs(arr)} onRecharge={() => setRechargeModalOpen(true)} onShare={handleShare} />}
            {/* 推荐语及输入框 */}
            {!showChatList && <ChatInsert ref={sendRef} presetQuestions={presetQuestions} sending={sending} curCharacter={curCharacter} isMultiple={isMultiple} onMultiChange={(boo) => setIsMultiple(boo)} handleSend={handleSend} shareContent={shareContent} />}
          </Stack>
        </Box>
        <RechargeModal open={rechargeModalOpen} onClose={()=> setRechargeModalOpen(false)}/>
      </Box>
    </>
  );
}

export default Chat;
