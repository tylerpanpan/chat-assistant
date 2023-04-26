import {
  Avatar,
  Divider,
  IconButton,
  InputBase,
  CircularProgress,
  Button,
  Typography,
  Skeleton,
  Drawer,
  AppBar,
  Toolbar,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { Box, Stack, useTheme } from "@mui/system";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useEffect, useCallback, useMemo, useRef, useState } from "react";
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
import { useVirtualizer } from '@tanstack/react-virtual'
import MarkdownIt from "markdown-it";
import mdKatex from "@traptitech/markdown-it-katex";
import mila from "markdown-it-link-attributes";
import hljs from "highlight.js";
import "katex/dist/katex.css";
import "highlight.js/styles/atom-one-dark.css";
import './index.scss';

const drawerWidth = 320;

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

const mdi = new MarkdownIt({
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })

export function Chat() {
  const { characterApi, chatApi, userApi, orderApi } = useAPI();
  const [characterId, setCharacterId] = useState<null | number>();
  const [curCharacter, setCurCharacter] = useState<any>();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { token, showLogin, login, logout } = useAuth();
  const { showDialog, showToast } = useFeedback();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [presetQuestions, setPresetQuestions] = useState<any[]>([]);
  
  useQuery(
    ["ipLogin"],
    () => userApi.ipLogin(),
    {
      enabled: !localStorage.getItem('__app_token'),
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
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

  const { data: chat } = useQuery(
    ["chat/last", token, characterId],
    () => chatApi.lastChat(characterId),
    { 
      enabled: !!token && !!characterId,
      refetchOnWindowFocus: false,
      onSuccess(data) {
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

  const { data, refetch: refetchChat } = useQuery(
    ["chats", chat],
    () => chatApi.getChats(chat?.id),
    {
      enabled: !!chat,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        const reverseData = [...data].reverse()
        setChats(reverseData)
      },
    }
  );

  useEffect(() => {
    if (characters && !characterId) {
      setCharacterId(characters[0].id);
      setCurCharacter(characters[0])
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
    if (e.key === "Enter") {
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

  const handleClearMessage = () => {
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

  function copyToClipboard(text: string) {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text + `\nAI个人助理：https://grzl.ai`;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    showToast("已拷贝到剪贴板");
  }

  const copyText = (data: any) => {
    if (data.role === "assistant") {
      data.content && copyToClipboard(data.content);
    }
  };


  const handleLogout = () => {
    if (!token) {
      showLogin();
      return;
    }
    showDialog("确定要退出登录吗?", "退出登录", "取消", "确定", (confirm) => {
      if (confirm == 1) {
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

  // 虚拟滚动相关
  const count = chats.length
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => chatEndRef.current,
    estimateSize: () => 100,
    overscan: 10
  })
  const items = virtualizer.getVirtualItems()

  useEffect(() => {
    if (chatEndRef.current && chats.length) {
      // virtualizer.scrollToIndex(chats.length - 1)
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight + 300;
    }
  }, [chats, chatEndRef]);

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
                  <Box width="44px" height="42px">
                    {token && chat && (
                      <Tooltip title="清空信息">
                        <IconButton sx={{ border: '1px solid #dedede' }} onClick={handleClearMessage}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Stack>
              </Box>
              <Box ref={chatEndRef} p={2} height="100%" overflow={"scroll"}>
                <Box height={virtualizer.getTotalSize()}>
                  <Stack direction="column" sx={{transform: `translateY(${items[0] ? items[0].start : 0}px)`}}>
                    {items.map((virtualRow) => {
                      if(chats[virtualRow.index].role === 'recharge'){
                        return (
                          <Box ref={virtualizer.measureElement} key={virtualRow.key} color="#303030" display="flex" justifyContent="center" alignItems="center" p={2}>
                            余额不足，请前往<Typography variant="button" onClick={()=> setRechargeModalOpen(true)} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>充值</Typography>
                          </Box>
                        )
                      }
                      if(chats[virtualRow.index].role === 'guest'){
                        return (
                          <Box ref={virtualizer.measureElement} key={virtualRow.key} color="#303030" display="flex" justifyContent="center" alignItems="center" p={2}>
                            您已达到10次使用限制，请 <Typography variant="button" onClick={()=> showLogin()} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>登录</Typography> 或 <Typography variant="button" onClick={()=> showLogin(true)} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>注册</Typography>
                          </Box>
                        )
                      }
                      return (
                        <Box
                          display={'flex'}
                          data-index={virtualRow.index}
                          ref={virtualizer.measureElement}
                          key={virtualRow.key}
                          bgcolor={chats[virtualRow.index].role === "user" ? "#e7f8ff" : "rgba(0, 0, 0, .05)"}
                          border="1px solid #dedede"
                          color="#24292f"
                          borderRadius="10px"
                          p={1}
                          pl={2}
                          pr={2}
                          mb={1}
                          mt={1}
                          ml={chats[virtualRow.index].role === "user" ? "auto" : 0}
                          mr={chats[virtualRow.index].role === "user" ? 0 : "15%"}
                          letterSpacing={"1.2px"}
                          onClick={() => copyText(chats[virtualRow.index])}
                        >
                          {chats[virtualRow.index].loading ? (
                            <Skeleton
                              sx={{
                                width: "210px",
                                bgcolor: "grey.400",
                              }}
                            ></Skeleton>
                          ) : (
                            <Box className="chat-box" dangerouslySetInnerHTML={{__html: mdi.render(chats[virtualRow.index].content)}}></Box>
                          )}
                        </Box>
                      )})
                    }
                  </Stack>
                </Box>
                {/* <Stack direction="column-reverse">
                  {chats?.map((chat, index: number) => {
                    if(chat.role === 'recharge'){
                      return (
                        <Box key={index} color="#303030" display="flex" justifyContent="center" alignItems="center" p={2}>
                          余额不足，请前往<Typography variant="button" onClick={()=> setRechargeModalOpen(true)} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>充值</Typography>
                        </Box>
                      )
                    }
                    if(chat.role === 'guest'){
                      return (
                        <Box key={index} color="#303030" display="flex" justifyContent="center" alignItems="center" p={2}>
                          您已达到10次使用限制，请 <Typography variant="button" onClick={()=> showLogin()} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>登录</Typography> 或 <Typography variant="button" onClick={()=> showLogin(true)} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>注册</Typography>
                        </Box>
                      )
                    }
                    return (
                      <Box
                        key={index}
                        bgcolor={chat.role === "user" ? "#e7f8ff" : "rgba(0, 0, 0, .05)"}
                        border="1px solid #dedede"
                        color="#24292f"
                        borderRadius="10px"
                        p={1}
                        pl={2}
                        pr={2}
                        mb={1}
                        mt={1}
                        ml={chat.role === "user" ? "auto" : 0}
                        mr={chat.role === "user" ? 0 : "15%"}
                        letterSpacing={"1.2px"}
                        onClick={() => copyText(chat)}
                      >
                        {chat.loading ? (
                          <Skeleton
                            sx={{
                              width: "210px",
                              bgcolor: "grey.400",
                            }}
                          ></Skeleton>
                        ) : (
                          <Box className="chat-box" dangerouslySetInnerHTML={{__html: mdi.render(chat.content)}}></Box>
                        )}
                      </Box>
                    );
                  })}
                </Stack> */}
              </Box>
              <Box mx={2} my={1.5} position="relative">
                {presetQuestions.length > 0 && <Box pt={1} borderTop="1px solid #dedede">
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
              </Box>
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
