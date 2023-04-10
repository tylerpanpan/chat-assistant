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
} from "@mui/material";
import { Box, Stack } from "@mui/system";
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

const drawerWidth = 320;

export function Chat() {
  const { characterApi, chatApi } = useAPI();
  const [characterId, setCharacter] = useState<null | number>();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { token, showLogin } = useAuth();
  const { showDialog, showToast } = useFeedback();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: chat } = useQuery(
    ["chat/last", token, characterId],
    () => chatApi.lastChat(characterId),
    { enabled: !!token && !!characterId }
  );
  const [showCreateCharacterModal, setShowCreateCharacterModal] =
    useState(false);

  const { data: characters, refetch: refetchCharacter } = useQuery(
    ["character", token],
    () => characterApi.getCharacters()
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

  useEffect(()=> {
    if(characters && !characterId){
      setCharacter(characters[0].id)
    }
  },[characters, characterId])


  const [chats, setChats] = useState<
    { role: "user" | "assistant"; content: string; loading?: boolean }[]
  >([]);

  const currentCharacter = characters?.find(
    (character: any) => character.id === characterId
  );

  const handleChooseCharacter = (id: number) => () => {
    setCharacter(id);
  };

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
        showToast(e.message);
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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [chats, chatEndRef]);

  return (
    <>
      <Box height="100vh" bgcolor={"#333"}>
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
              <Box width={drawerWidth} p={1.5} height="100%">
                <CharacterList
                  characterId={characterId}
                  characters={characters}
                  handleChooseCharacter={handleChooseCharacter}
                  handleCreateCharacter={handleCreateCharacter}
                />
              </Box>
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
              <Box width={drawerWidth} p={1.5} height="100%">
                <CharacterList
                  characterId={characterId}
                  characters={characters}
                  handleChooseCharacter={handleChooseCharacter}
                  handleCreateCharacter={handleCreateCharacter}
                />
              </Box>
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
          onCreated={handleCharacterCreated}
          onClose={() => setShowCreateCharacterModal(false)}
        />
      </Box>
    </>
  );
}

export default Chat;
