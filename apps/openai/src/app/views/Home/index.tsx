import { useEffect, useState } from "react";
import { Avatar, Box, Button, Divider, Stack, Typography } from "@mui/material"
import { useQuery } from "react-query";
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../provider/AuthProvider";
import useAPI from "../../hooks/useAPI";
import { getUrlParams } from "../../utils"
import { CreateCharacterModal } from "../../components/CreateCharacterModal";
import localForage from "localforage";
import AddCircleOutlineSharpIcon from '@mui/icons-material/AddCircleOutlineSharp';

function Home() {
  const navigate = useNavigate()
  const { characterApi, userApi } = useAPI();
  const { token, showLogin, login } = useAuth();
  const [showCreateCharacterModal, setShowCreateCharacterModal] = useState(false);

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
    navigate(`/chat?id=${value.id}`)
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
    setShowCreateCharacterModal(true);
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
                border="1px solid #dedede"
                borderRadius="10px"
                sx={{
                  width: "180px",
                  height: "256px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "12px",
                  flex: "0 0 auto",
                  cursor: "pointer"
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
                    marginTop: "15px",
                    width: "100%",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" sx={{ fontSize: "12px", color: "#666" }}>{item.isDefault ? "@系统" : "@我"}</Typography>
                    <Typography variant="body1" sx={{ fontSize: "12px", color: "#303030" }}>使用条数：2.3万条</Typography>
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
              <Box
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
                  <Box
                    sx={{
                      height: '48px',
                      background: "#f1f2f3",
                      borderRadius: '6px',
                      padding: '5px',
                      fontSize: '14px',
                      lineHeight: 1.4,
                      color: "#303030",
                      cursor: "pointer"
                    }}
                  >帮助我为一款新的电子游戏创建广告宣传话，500字左右</Box>
                  <Box
                    sx={{
                      height: '48px',
                      background: "#f1f2f3",
                      borderRadius: '6px',
                      padding: '5px',
                      fontSize: '14px',
                      lineHeight: 1.4,
                      color: "#303030",
                      cursor: "pointer"
                    }}
                  >帮助我为一款新的电子游戏创建广告宣传话，500字左右</Box>
                  <Box
                    sx={{
                      height: '48px',
                      background: "#f1f2f3",
                      borderRadius: '6px',
                      padding: '5px',
                      fontSize: '14px',
                      lineHeight: 1.4,
                      color: "#303030",
                      cursor: "pointer"
                    }}
                  >帮助我为一款新的电子游戏创建广告宣传话，500字左右</Box>
                </Stack>
              </Box>
            ))
          }
        </Stack>
      </Box>
      {/* 创建角色 */}
      <CreateCharacterModal
        open={showCreateCharacterModal}
        onCreated={handleCharacterCreated}
        onClose={() => setShowCreateCharacterModal(false)}
      />
    </Box>
  )
}

export default Home
