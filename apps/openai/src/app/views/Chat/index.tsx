import {
  Avatar,
  Divider,
  IconButton,
  InputBase,
  CircularProgress,
  Button,
  Typography,
  Drawer,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ViewHeadlineOutlinedIcon from '@mui/icons-material/ViewHeadlineOutlined';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { useEffect, useCallback, useState } from "react";
import { useQuery } from "react-query";
import { useAuth } from "../../provider/AuthProvider";
import { CreateCharacterModal } from "../../components/CreateCharacterModal";
import useAPI from "../../hooks/useAPI";
import { useFeedback } from "../../components/Feedback";
import { CharacterList } from "./components/CharacterList";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import LogoutSharpIcon from '@mui/icons-material/LogoutSharp';
import { RechargeModal } from "../../components/RechargeModal";
import { ChatContent } from "./components/ChatContent";
import { ChatList } from "./components/ChatList";
import localForage from "localforage";
import { getUrlParams } from "../../utils"
import './index.scss';

const drawerWidth = 320;

export function Chat() {
  const { characterApi, chatApi, userApi } = useAPI();
  const { token, showLogin, login, logout } = useAuth();
  const { showDialog, showToast } = useFeedback();
  const [characterId, setCharacterId] = useState<null | number>();
  const [curCharacter, setCurCharacter] = useState<any>();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [presetQuestions, setPresetQuestions] = useState<any[]>([]);
  const [chat, setChat] = useState<any>()
  const [showChatList, setShowChatList] = useState(false);

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

  // 判断是否是游客，新用户
  useEffect(() => {
    const urlQuery = getUrlParams(location.href)
    if (urlQuery.invite) {
      const _token = localStorage.getItem('__app_token')
      const _user: any = localStorage.getItem('__app_user')
      if (!_token || !JSON.parse(_user).username) {
        showLogin(true)
      }
    }
  }, [])
  
  useQuery(
    ["ipLogin"],
    () => userApi.ipLogin(),
    {
      enabled: !localStorage.getItem('__app_token'),
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        localForage.setItem('character-chat', null)
        login(data.access_token, data.user)
      },
    }
  );

  const { data: userInfo } = useQuery(
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
        localForage.getItem('character-chat').then((mapData: any) => {
          const characterChatMap = mapData || {}
          characterChatMap[`${characterId}`] = data.id
          localForage.setItem('character-chat', characterChatMap)
        })
        setPresetQuestions(data.character.presetQuestions || [])
      },
    }
  );
  const [showCreateCharacterModal, setShowCreateCharacterModal] = useState(false);

  const { data: characters, refetch: refetchCharacter } = useQuery(
    ["character", token],
    () => characterApi.getCharacters(),
    { 
      enabled: !!token,
      refetchOnWindowFocus: false
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
      },
    }
  );

  useEffect(() => {
    if (characters) {
      let _characterId: number;
      if (!characterId) {
        _characterId = characters[0].id;
        setCharacterId(characters[0].id);
        setCurCharacter(characters[0]);
      } else {
        _characterId = characterId;
      }
      localForage.getItem('character-chat').then((mapData: any) => {
        mapData && localForage.getItem(mapData[_characterId]).then((data: any) => {
          if (data) {
            const reverseData = [...data].reverse();
            setChats(reverseData);
          }
        });
      });
    }
  }, [characters, characterId]);

  const [chats, setChats] = useState<
    { role: "user" | "assistant" | "recharge" | "guest"; content: string; loading?: boolean }[]
  >([]);

  const currentCharacter = characters?.find(
    (character: any) => character.id === characterId
  );

  const handleChooseCharacter = (id: number) => () => {
    setMobileOpen(false);
    setCharacterId(id);
    setChats([]);
    setPresetQuestions([]);
  };

  const handleEditCharacter = (id: number) => () => {
    const idx = characters.findIndex((item: any) => item.id === id);
    idx !== -1 && setCurCharacter(characters[idx])
    setShowCreateCharacterModal(true);
  }

  const handleDeleteCharacter = (id: number) => () => {
    characterApi
      .deleteCharacter(`${id}`)
      .then(() => {
        showToast('删除成功');
        if (id === characterId) {
          setChats([])
          setCharacterId(null);
          setCurCharacter(null);
        }
        refetchCharacter();
      })
  }

  const handleSend = (question?: string) => {
    if (!text && !question) {
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
        content: question || text,
      },
      {
        role: "assistant",
        content: "",
        loading: true,
      }
    ]);
    chatApi
      .chat(chat.id, question || text, true)
      .then((response: any) => {
        const reader = response.body.getReader();
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
            if (response.status === 402) {
              setChats([
                ...chats,
                {
                  'role': 'recharge',
                  'content': 'Tokens不足，请充值',
                }
              ])
            } 
            if (response.status === 403) {
              setChats([
                ...chats,
                {
                  'role': 'guest',
                  'content': '您已达到10次使用限制',
                }
              ])
            }
            setSending(false);
            return;
          }
          // 处理接收到的文本数据
          const _value = value.replace(/data: "(.*)"/g, '$1').replace(/\n/g, '').replace(/\\n/g, '\n').replace(/\"/g, '"').replace(/\\/g, '')
          streamText += _value

          setChats([
            ...chats,
            {
              role: "user",
              content: question || text,
            },
            { role: "assistant", content: streamText }
          ]);
          setText("");
          // 递归读取下一个文本块
          return textStream.read().then(processText);
        });
      })
      .catch((e) => {
        setSending(false);
        console.info(e.response)
        if (e.response.status === 402) {
          setChats([
            ...chats,
            {
              'role': 'recharge',
              'content': 'Tokens不足，请充值',
            }
          ])
        } else {
          showToast(e.message);
        }
      });
  };

  const handleKeyDown = (e: any) => {
    if (e.keyCode === 13) {
      handleSend();
    }
  };

  const handleCharacterCreated = () => {
    setShowCreateCharacterModal(false);
    refetchCharacter();
  };

  const handleCreateCharacter = () => {
    if (!token || userInfo?.type === 'guest') {
      showLogin();
      return;
    }
    setCurCharacter(null)
    setShowCreateCharacterModal(true);
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

  const handleLogout = () => {
    if (!token) {
      showLogin();
      return;
    }
    showDialog("确定要退出登录吗?", "退出登录", "取消", "确定", (confirm) => {
      if (confirm == 1) {
        localForage.setItem('character-chat', null)
        logout();
        setChats([]);
        setCharacterId(null);
        setCurCharacter(null);
      }
    });
  };

  const DrawerContent = useCallback(() => (
    <Box width={drawerWidth} p={1.5} height="100%">
      <Stack direction={"column"} sx={{ height: "100%" }}>
        <Box mb={1} color="#303030">
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
          >
            {!token && (
              <Typography variant="h6" gutterBottom>
                AI个人助理
              </Typography>
            )}
            {token && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  AI个人助理
                </Typography>
                <Typography variant="caption">
                  {userInfo?.username ? `账号：${userInfo?.username}` : "未登录用户，只能使用10次"}
                </Typography>
                <Box>
                  {userInfo?.username && <Typography variant="caption">
                    积分：{Math.floor(userInfo?.balance ? userInfo?.balance * 100 : 0)}
                  </Typography>}
                  {userInfo?.username && <Typography variant="caption" sx={{ marginLeft: '10px', fontSize: '13px', fontWeight: '500', color: '#1976d2', cursor: 'pointer' }} onClick={()=> setRechargeModalOpen(true)}>
                    充值
                  </Typography>}
                </Box>
              </Box>
            )}
            {token && userInfo?.username && (
              <Button onClick={handleLogout} size="small" sx={{ alignSelf: "flex-end", marginBottom: '-4px', color: '#999' }}>
                <LogoutSharpIcon sx={{ fontSize: '13px', marginRight: '3px', marginTop: '-2px' }} />退出
              </Button>
            )}
          </Stack>
        </Box>
        <Divider variant="fullWidth" light sx={{ marginBottom: "10px" }} />
        <CharacterList
          isGuest={userInfo?.type === 'guest'}
          characterId={characterId}
          characters={characters}
          handleChooseCharacter={handleChooseCharacter}
          handleCreateCharacter={handleCreateCharacter}
          handleEditCharacter={handleEditCharacter}
          handleDeleteCharacter={handleDeleteCharacter}
        />
      </Stack>
    </Box>
  ), [token, userInfo, characterId, characters]);

  return (
    <>
      <Box height="100%">
        <Stack direction="row" height="100%" width="100%">
          <Box
            component="nav"
            sx={{
              width: { sm: drawerWidth },
              flexShrink: { sm: 0 },
            }}
          >
            <Drawer
              variant="temporary"
              sx={{
                display: { xs: "block", sm: "none" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                  backgroundColor: "#e7f8ff",
                },
              }}
              open={mobileOpen}
              onClose={() => setMobileOpen(!mobileOpen)}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              { DrawerContent() }
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: "none", sm: "block" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                  backgroundColor: "#e7f8ff",
                  boxShadow: 'inset -2px 0 2px 0 rgba(0,0,0,.05)',
                  borderRight: 'none'
                },
              }}
              open
            >
              { DrawerContent() }
            </Drawer>
          </Box>
          <Box
            height="100%"
            sx={{ width: { sm: `calc(100% - ${drawerWidth}px)`, xs: "100%" } }}
          >
            <Stack
              direction="column"
              height="100%"
              width="100%"
              justifyContent="space-between"
            >
              <Box p={2} color="#303030" width="100%" height="75px" borderBottom="1px solid rgba(0, 0, 0, .1)">
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box minWidth="44px">
                    <IconButton
                      sx={{ display: { sm: "none", xs: "inline-flex" } }}
                      onClick={() => setMobileOpen(!mobileOpen)}
                    >
                      {mobileOpen ? (
                        <MenuOpenIcon htmlColor="#303030" />
                      ) : (
                        <MenuIcon htmlColor="#303030" />
                      )}
                    </IconButton>
                  </Box>
                  <Box height="32px">
                    <Typography variant="h6">
                      {currentCharacter?.name || ""}
                    </Typography>
                  </Box>
                  <Box height="42px">
                    {token && userInfo?.username && (
                      <Tooltip title="分享得积分">
                        <IconButton sx={{ border: '1px solid #dedede' }} onClick={handleShare}>
                          <ShareOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {token && chat && (
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
              {!showChatList && <ChatContent chats={chats} onRecharge={() => setRechargeModalOpen(true)} />}

              {!showChatList && <Box mx={2} my={1.5} position="relative">
                {presetQuestions.length > 0 && !showChatList && <Box pt={1} borderTop="1px solid #dedede">
                  <Stack direction="row" sx={{overflowY: 'auto', flexFlow: 'wrap'}}>
                    {
                      presetQuestions.map((question, index) => (
                        <Button key={index} variant="outlined" size="small" sx={{whiteSpace: 'nowrap', marginRight: '10px', marginBottom: '8px'}} onClick={() => handleSend(question)}>{question}</Button>
                      ))
                    }
                  </Stack>
                </Box>}
                <Stack direction="row">
                  <InputBase
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{
                      border: '1px solid #dedede',
                      borderRadius: '10px',
                      color: "#303030",
                      width: '100%',
                      height: '100%',
                      boxShadow: '0 -2px 5px rgba(0,0,0,.03)',
                      padding: '10px 100px 10px 14px',
                      resize: 'none',
                      outline: 'none'
                    }}
                    rows={3}
                    maxRows={4}
                    multiline
                    fullWidth
                    disabled={sending}
                    placeholder="请输入内容，Enter发送"
                    onKeyDown={handleKeyDown}
                  />
                  <Box
                    position="absolute"
                    right="10px"
                    bottom="10px"
                  >
                    <Button
                      variant="contained"
                      onClick={() => handleSend()}
                      disabled={!text || sending}
                      startIcon={sending ? <CircularProgress size="16px" /> : <SendIcon />}
                    >发送</Button>
                  </Box>
                </Stack>
              </Box>}
            </Stack>
          </Box>
        </Stack>
        <CreateCharacterModal
          open={showCreateCharacterModal}
          character={curCharacter}
          onCreated={handleCharacterCreated}
          onClose={() => setShowCreateCharacterModal(false)}
        />
        <RechargeModal open={rechargeModalOpen} onClose={()=> setRechargeModalOpen(false)}/>
      </Box>
    </>
  );
}

export default Chat;
