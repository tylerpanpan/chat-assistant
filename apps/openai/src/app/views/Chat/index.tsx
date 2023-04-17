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
} from "@mui/material";
import { Box, Stack, useTheme } from "@mui/system";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useAuth } from "../../provider/AuthProvider";
import { CreateCharacterModal } from "../../components/CreateCharacterModal";
import useAPI from "../../hooks/useAPI";
import { useFeedback } from "../../components/Feedback";
import { CharacterList } from "./components/CharacterList";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { RechargeModal } from "../../components/RechargeModal";

const drawerWidth = 320;

export function Chat() {
  const { characterApi, chatApi, userApi, orderApi } = useAPI();
  const [characterId, setCharacterId] = useState<null | number>();
  const [curCharacter, setCurCharacter] = useState<any>();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { token, showLogin, logout } = useAuth();
  const { showDialog, showToast } = useFeedback();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);


  const { data: userInfo } = useQuery(
    ["userinfo", token],
    () => userApi.userinfo(),
    {
      enabled: !!token,
    }
  );

  const { data: chat } = useQuery(
    ["chat/last", token, characterId],
    () => chatApi.lastChat(characterId),
    { enabled: !!token && !!characterId }
  );
  const [showCreateCharacterModal, setShowCreateCharacterModal] =
    useState(false);

  const { data: characters, refetch: refetchCharacter } = useQuery(
    ["character", token],
    () => characterApi.getCharacters(),
    { enabled: !!token }
  );

  const { data, refetch: refetchChat } = useQuery(
    ["chats", chat],
    () => chatApi.getChats(chat?.id),
    {
      enabled: !!chat,
      onSuccess: (data) => {
        setChats(data);
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
    { role: "user" | "assistant" | "recharge"; content: string; loading?: boolean }[]
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

  const handleSend = () => {
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
      {
        role: "assistant",
        content: "",
        loading: true,
      },
      {
        role: "user",
        content: text,
      },
      ...chats,
    ]);
    chatApi
      .chat(chat.id, text)
      .then((res) => {
        // refetchChat();
        console.info(res);
        //delete first loading chat
        setChats([
          { role: "assistant", content: res },
          {
            role: "user",
            content: text,
          },
          ...chats,
        ]);
        setSending(false);
        setText("");
      })
      .catch((e) => {
        setSending(false);
        console.info(e.response)
        if (e.response.status === 402) {
          setChats([
            {
              'role': 'recharge',
              'content': 'Tokens不足，请充值',
            },
            ...chats
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
    if (!token) {
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
    dummy.value = text + `\n网站链接：https://grzl.ai`;
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
      }
    });
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [chats, chatEndRef]);

  const DrawerContent = () => {
    return (
      <Box width={drawerWidth} p={1.5} height="100%">
        <Stack direction={"column"} sx={{ height: "100%" }}>
          <Box height="60px" mb={1} color="#fff">
            <Stack
              justifyContent="space-between"
              direction="row"
              alignItems="center"
            >
              {token && (
                <Box>
                  <Typography variant="subtitle2">
                    {userInfo?.username || "未登录"}
                  </Typography>
                  <Box>
                    <Typography variant="caption">
                      余额: {userInfo?.balance} 元
                    </Typography>
                    <Button
                      onClick={()=> setRechargeModalOpen(true)}
                      sx={{ alignSelf: "center" }}
                      size="small"
                    >
                      充值
                    </Button>
                  </Box>
                </Box>
              )}
              {token && (
                <IconButton onClick={handleLogout}>
                  <ExitToAppIcon htmlColor="#fff" />
                </IconButton>
              )}
            </Stack>
          </Box>
          <Divider variant="fullWidth" light sx={{ marginBottom: "10px" }} />
          <CharacterList
            characterId={characterId}
            characters={characters}
            handleChooseCharacter={handleChooseCharacter}
            handleCreateCharacter={handleCreateCharacter}
            handleEditCharacter={handleEditCharacter}
            handleDeleteCharacter={handleDeleteCharacter}
          />
        </Stack>
      </Box>
    );
  };

  return (
    <>
      <Box height="100%" bgcolor={"#333"}>
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
                  backgroundColor: "#333",
                },
              }}
              open={mobileOpen}
              onClose={() => setMobileOpen(!mobileOpen)}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              <DrawerContent />
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: "none", sm: "block" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                  backgroundColor: "#333",
                },
              }}
              open
            >
              <DrawerContent />
            </Drawer>
          </Box>
          <Box
            height="100%"
            p={2}
            sx={{ width: { sm: `calc(100% - ${drawerWidth}px)`, xs: "100%" } }}
          >
            <Stack
              direction="column"
              height="100%"
              width="100%"
              justifyContent="space-between"
            >
              <Box height="44px" color="#fff" width="100%">
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
                        <MenuOpenIcon htmlColor="#fff" />
                      ) : (
                        <MenuIcon htmlColor="#fff" />
                      )}
                    </IconButton>
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      {currentCharacter?.name || "请选择或创建一个角色"}
                    </Typography>
                  </Box>
                  <Box width="44px">
                    {token && chat && (
                      <IconButton onClick={handleClearMessage}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    )}
                  </Box>
                </Stack>
              </Box>
              <Box height="100%" overflow={"scroll"} ref={chatEndRef}>
                <Stack direction="column-reverse">
                  {chats?.map((chat, index: number) => {
                    if(chat.role === 'recharge'){
                      return (
                        <Box  color="#fff" display="flex" justifyContent="center" alignItems="center" p={2}>
                          余额不足，请前往<Button onClick={()=> setRechargeModalOpen(true)} style={{fontSize: '18px'}}>充值</Button>
                        </Box>
                      )
                    }
                    return (
                      <Box
                        key={index}
                        bgcolor={chat.role === "user" ? "#4290f5" : "#fff"}
                        color={chat.role === "user" ? "#fff" : "#333"}
                        borderRadius="16px"
                        p={1}
                        pl={2}
                        pr={2}
                        mb={1}
                        mt={1}
                        ml={chat.role === "user" ? "auto" : 0}
                        mr={chat.role === "user" ? 0 : "auto"}
                        whiteSpace="pre-wrap"
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
                          chat.content
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
              <Box
                color="#fff"
                minHeight="32px"
                border={"1px solid #d1d1d1"}
                borderRadius="28px"
                p={1}
                pl={1.5}
                pr={1.5}
              >
                <Stack direction="row">
                  <InputBase
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ color: "#d1d1d1" }}
                    maxRows={4}
                    multiline
                    fullWidth
                    disabled={sending}
                    onKeyDown={handleKeyDown}
                  />
                  <Box position="relative">
                    <IconButton
                      onClick={handleSend}
                      disabled={!text || sending}
                      color="inherit"
                    >
                      <SendIcon />
                    </IconButton>
                    {sending && (
                      <CircularProgress
                        size={24}
                        sx={{
                          position: "absolute",
                          right: "50%",
                          top: "50%",
                          marginTop: "-12px",
                          marginRight: "-12px",
                        }}
                        color="primary"
                      />
                    )}
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
