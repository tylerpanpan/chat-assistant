import { useEffect, useState } from "react";
import { Avatar, Box, Button, Divider, IconButton, Stack, Typography } from "@mui/material"
import { useQuery } from "react-query";
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../provider/AuthProvider";
import useAPI from "../../hooks/useAPI";
import { getUrlParams } from "../../utils";
import { useFeedback } from "../../components/Feedback";
import { CreateCharacterModal } from "../../components/CreateCharacterModal";
import localForage from "localforage";
import AddCircleOutlineSharpIcon from '@mui/icons-material/AddCircleOutlineSharp';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from "@mui/icons-material/Delete";

function Home() {
  const navigate = useNavigate()
  const { characterApi, userApi } = useAPI();
  const { token, showLogin } = useAuth();
  const { showDialog, showToast } = useFeedback();
  const [showCreateCharacterModal, setShowCreateCharacterModal] = useState(false);
  const [curCharacter, setCurCharacter] = useState<any>();

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

  const { data: characters, refetch: refetchCharacter } = useQuery(
    ["character", token],
    () => characterApi.getCharacters(),
    {
      enabled: !!token,
      refetchOnWindowFocus: false
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

  const goChat = (value: any) => {
    navigate(`/chat?cid=${value.id}`)
  }

  const handleCharacterCreated = () => {
    setShowCreateCharacterModal(false);
    refetchCharacter();
  };

  const handleCreateCharacter = () => {
    if (!token || userInfo?.type === 'guest') {
      showLogin();
      return;
    }
    setCurCharacter(null);
    setShowCreateCharacterModal(true);
  }

  const handleEditCharacter = (event: any, data: any) => {
    event.stopPropagation();
    setCurCharacter(data);
    setShowCreateCharacterModal(true);
  }

  const handleDeleteCharacter = (event: any, id: number) => {
    event.stopPropagation();
    showDialog("确定要删除该角色吗?", "删除角色", "取消", "确定", (confirm) => {
      if (confirm == 1) {
        characterApi
          .deleteCharacter(`${id}`)
          .then(() => {
            showToast('删除成功');
            refetchCharacter();
          })
          .catch((err) => {});
      }
    });
  }

  const goChatWithText = (value: any, text: string) => {
    localForage.setItem('once-text', text).then(() => {
      navigate(`/chat?cid=${value.id}`)
    })
  }

  return (
    <Box
      className="home-container"
      height="100%"
      p={3}
      sx={{}}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">
          所有角色
        </Typography>
        <Button variant="outlined" startIcon={userInfo?.type !== 'guest' && <AddCircleOutlineSharpIcon />} onClick={handleCreateCharacter}>
          {userInfo?.type === 'guest' ? '登录/注册' : '创建角色' }
        </Button>
      </Stack>
      <Box marginTop="15px" marginBottom="20px">
        <Stack
          direction="row"
          spacing={2}
          sx={{
            overflowX: "scroll"
          }}
        >
          {
            characters?.map((item: any) => (
              <Box
                key={item.id}
                bgcolor="#f3f0f0"
                borderRadius="10px"
                sx={{
                  width: "180px",
                  height: "256px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "12px",
                  flex: "0 0 auto",
                  cursor: "pointer",
                  '&:hover': {
                    backgroundColor: '#dedede'
                  }
                }}
                onClick={() => goChat(item)}
              >
                <Box>
                  <Avatar src={item.avatar} variant="square" sx={{ width: 108, height: 108, borderRadius: "10px" }}></Avatar>
                </Box>
                <Box
                  sx={{
                    textAlign: "center",
                    marginTop: "10px",
                    flexGrow: "1",
                  }}
                >
                  <Typography variant="subtitle1">{item.name}</Typography>
                  <Typography
                    title={item.description}
                    variant="overline"
                    sx={{
                      color: "#666",
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4
                    }}
                  >{item.description}</Typography>
                </Box>
                <Box
                  sx={{
                    marginTop: "10px",
                    width: "100%",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" height="22px">
                    <Typography component={'span'} variant="body1" sx={{ fontSize: "12px", color: "#303030" }}>使用数：{item.usageCount}</Typography>
                    <Typography component={'span'} variant="body1" sx={{ fontSize: "12px", color: "#666" }}>
                      {item.isDefault
                        ? "@系统"
                        : (
                          <Stack direction="row" alignItems="center">
                            <IconButton onClick={(event) => handleEditCharacter(event, item)} size="small">
                              <BorderColorIcon sx={{ color: '#1976d2', fontSize: '10px' }} />
                            </IconButton>
                            <IconButton onClick={(event) => handleDeleteCharacter(event, item.id)} size="small">
                              <DeleteIcon sx={{ color: '#1976d2', fontSize: '12px', marginLeft: "2px" }} />
                            </IconButton>
                          </Stack>
                        )
                      }
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            ))
          }
        </Stack>
      </Box>
      <Divider />
      <Box marginTop="20px">
        <Stack
          direction="row"
          spacing={2}
          sx={{
            overflowX: "scroll"
          }}
        >
          {
            characters?.map((item: any) => (
              item.isDefault && <Box
                key={item.id}
                sx={{
                  width: "280px",
                  flex: "0 0 auto"
                }}
              >
                <Stack direction="column" spacing={1}>
                  <Box>
                    <Stack direction="row">
                      <Box>
                        <Avatar src={item.avatar} variant="square" sx={{ width: 48, height: 48, borderRadius: "6px" }}></Avatar>
                      </Box>
                      <Box marginLeft="10px">
                        <Typography variant="body1" sx={{ fontSize: "14px", color: "#303030" }}>{item.name}</Typography>
                        <Typography variant="body1" sx={{ fontSize: "12px", color: "#666" }}>尝试说：</Typography>
                      </Box>
                    </Stack>
                  </Box>
                  {
                    item.presetQuestions?.map((question: any, index: number) => (
                      <Box
                        key={index}
                        bgcolor="#f3f0f0"
                        sx={{
                          height: '48px',
                          borderRadius: '6px',
                          padding: '5px',
                          fontSize: '14px',
                          lineHeight: 1.4,
                          color: "#303030",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          '&:hover': {
                            backgroundColor: '#dedede'
                          }
                        }}
                        onClick={() => goChatWithText(item, question)}
                      >
                        <Box
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                          title={question}
                        >{question}</Box>
                      </Box>
                    ))
                  }
                </Stack>
              </Box>
            ))
          }
        </Stack>
      </Box>
      {/* 创建角色 */}
      <CreateCharacterModal
        open={showCreateCharacterModal}
        character={curCharacter}
        onCreated={handleCharacterCreated}
        onClose={() => {
          setShowCreateCharacterModal(false)
          setCurCharacter(null)
        }}
      />
    </Box>
  )
}

export default Home
