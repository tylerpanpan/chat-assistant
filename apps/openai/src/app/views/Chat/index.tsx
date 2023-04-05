import {
  Avatar,
  Divider,
  IconButton,
  InputBase,
  CircularProgress,
  Button,
  Typography,
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../provider/AuthProvider';
import { CreateCharacterModal } from '../../components/CreateCharacterModal';
import useAPI from '../../hooks/useAPI';
import { useFeedback } from '../../components/Feedback';

export function Chat() {
  const { characterApi, chatApi } = useAPI();
  const [characterId, setCharacter] = useState<null | number>();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const { token, showLogin } = useAuth();
  const { showDialog, showToast } = useFeedback();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: chat } = useQuery(
    ['chat/last', token, characterId],
    () => chatApi.lastChat(characterId),
    { enabled: !!token && !!characterId }
  );
  const [showCreateCharacterModal, setShowCreateCharacterModal] =
    useState(false);

  const { data: characters, refetch: refetchCharacter } = useQuery(
    ['character', token],
    () => characterApi.getCharacters()
  );

  const { data: chats, refetch: refetchChat } = useQuery(
    ['chats', chat],
    () => chatApi.getChats(chat?.id),
    { enabled: !!chat }
  );

  const currentCharacter = characters?.find(
    (character: any) => character.id === characterId
  );

  const handleChooseCharacter = (id: number) => () => {
    setCharacter(id);
  };

  const handleSend = () => {
    if (!token) {
      showLogin();
      return;
    }
    if (!chat) {
      return;
    }
    setSending(true);

    chatApi
      .chat(chat.id, text)
      .then((res) => {
        refetchChat();
        setSending(false);
        setText('');
      })
      .catch((e) => {
        setSending(false);
        showToast(e.message);
      });
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
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
    showDialog('确定要清除会话吗?', '清除会话', '取消', '确定', (confirm) => {
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
      <Box height="100vh" p={1} pb={2} bgcolor={'#333'}>
        <Stack
          direction="row"
          height="100%"
          divider={<Divider color="#d1d1d1" orientation="vertical" flexItem />}
          spacing={2}
        >
          <Box width="60%" height="100%">
            <Stack
              direction="column"
              height="100%"
              justifyContent="space-between"
            >
              <Box height="44px" color="#fff">
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box width="44px"></Box>
                  <Box>
                    <Typography variant="h6">
                      {currentCharacter?.name || '请选择或创建一个角色'}
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
              <Box height="100%" overflow={'scroll'} ref={chatEndRef}>
                <Stack direction="column-reverse">
                  {chats?.map((chat: any) => {
                    if (chat.role === 'system') {
                      return;
                    }

                    return (
                      <Box
                        key={chat.id}
                        bgcolor={chat.role === 'user' ? '#fff' : '#333'}
                        color={chat.role === 'user' ? '#333' : '#fff'}
                        borderRadius="16px"
                        p={1}
                        pl={2}
                        pr={2}
                        mb={1}
                        ml={chat.role === 'user' ? 'auto' : 0}
                        mr={chat.role === 'user' ? 0 : 'auto'}
                        whiteSpace="pre-wrap"
                      >
                        {chat.content}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
              <Box
                color="#fff"
                minHeight="32px"
                border={'1px solid #d1d1d1'}
                borderRadius="28px"
                p={1}
                pl={1.5}
                pr={1.5}
              >
                <Stack direction="row">
                  <InputBase
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ color: '#d1d1d1' }}
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
                          position: 'absolute',
                          right: '50%',
                          top: '50%',
                          marginTop: '-12px',
                          marginRight: '-12px',
                        }}
                        color="primary"
                      />
                    )}
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
          <Box width="40%" p={1.5} height="100%">
            <Stack
              direction={'column'}
              sx={{ height: '100%' }}
              justifyContent="space-between"
            >
              <Box height={'100%'}>
                {characters?.map((bot: any) => (
                  <Box
                    onClick={handleChooseCharacter(bot.id)}
                    key={bot.id}
                    bgcolor={bot.id === characterId ? '#fff' : '#333'}
                    color={bot.id === characterId ? '#333' : '#fff'}
                    borderRadius="16px"
                    p={1}
                    mb={1}
                  >
                    <Stack direction="row" alignItems="center">
                      <Box width="40px" height="40px" borderRadius="50%">
                        <Avatar src={bot.avatar} />
                      </Box>
                      <Box ml={1}>{bot.name}</Box>
                    </Stack>
                  </Box>
                ))}
              </Box>
              <Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCreateCharacter}
                >
                  创建角色
                </Button>
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
