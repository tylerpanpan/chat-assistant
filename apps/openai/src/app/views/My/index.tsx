import { useState } from "react";
import { Avatar, Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material"
import { useNavigate } from 'react-router-dom'
import { useQuery } from "react-query";
import useAPI from "../../hooks/useAPI";
import { useAuth } from "../../provider/AuthProvider";
import { useFeedback } from "../../components/Feedback";
import { RechargeModal } from "../../components/RechargeModal";
import { CreateCharacterModal } from "../../components/CreateCharacterModal";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from "@mui/icons-material/Delete";
import localForage from "localforage";

function My() {
  const navigate = useNavigate()
  const { userApi, characterApi } = useAPI();
  const { token, showLogin, logout } = useAuth();
  const { showDialog, showToast } = useFeedback();
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [showCreateCharacterModal, setShowCreateCharacterModal] = useState(false);
  const [curCharacter, setCurCharacter] = useState<any>();

  const { data: characters, refetch: refetchCharacter } = useQuery(
    ["my-character", token],
    () => characterApi.getCharacters(),
    {
      enabled: !!token,
      refetchOnWindowFocus: false
    }
  );

  const { data: userInfo, refetch: refetchUserInfo } = useQuery(
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

  const handleLogout = () => {
    if (!token) {
      showLogin();
      return;
    }
    showDialog("确定要退出登录吗?", "退出登录", "取消", "确定", (confirm) => {
      if (confirm == 1) {
        localForage.setItem('character-chat', null)
        logout();
      }
    });
  };

  const handleLogin = () => {
    showLogin();
  }

  return (
    <Box
      className="my-container"
      height="100%"
      p={3}
      sx={{}}
    >
      {
        userInfo?.username && (
          <>
            <Typography variant="h5">
              我创建的角色
            </Typography>
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
                    !item.isDefault && <Box
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
          </>
        )
      }
      <Typography variant="h5">
        个人设置
      </Typography>
      {
        userInfo?.username && (
          <>
            <Box marginTop="15px" marginBottom="20px">
              <Stack direction="column">
                {/* <TextField
                  label="用户名"
                  name="name"
                  size="small"
                  sx={{
                    width: "300px",
                    marginBottom: "25px",
                  }}
                /> */}
                <TextField
                  placeholder="邮箱"
                  name="name"
                  size="small"
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "300px"
                    },
                    marginBottom: "25px",
                  }}
                  value={userInfo?.email}
                />
                <Box>
                  <Stack direction="column" spacing={1}>
                    <Typography>可用积分：{Math.floor(userInfo?.balance ? userInfo?.balance * 100 : 0)}</Typography>
                    <Typography>GPT-4 可用次数：{userInfo?.gpt4Limit || 0}次</Typography>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    marginTop: "20px",
                    width: {
                      xs: "100%",
                      sm: "300px"
                    },
                    marginBottom: "25px",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Button variant="contained" size="small" onClick={()=> setRechargeModalOpen(true)}>充值</Button>
                    <Button variant="outlined" size="small" onClick={handleLogout}>退出登录</Button>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </>
        )
      }
      {
        !userInfo?.username && (
          <Button variant="outlined" size="small" onClick={handleLogin} sx={{ marginTop: "10px" }}>登录/注册</Button>
        )
      }
      <RechargeModal open={rechargeModalOpen} onClose={()=> setRechargeModalOpen(false)}/>
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

export default My
