import { useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material"
import { useQuery } from "react-query";
import useAPI from "../../hooks/useAPI";
import { useAuth } from "../../provider/AuthProvider";
import { useFeedback } from "../../components/Feedback";
import { RechargeModal } from "../../components/RechargeModal";
import localForage from "localforage";

function My() {
  const { userApi } = useAPI();
  const { token, showLogin, login, logout } = useAuth();
  const { showDialog } = useFeedback();
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);

  const { data: userInfo, refetch: refetchUserInfo } = useQuery(
    ["userinfo", token],
    () => userApi.userinfo(),
    {
      enabled: !!token,
      refetchOnWindowFocus: false
    }
  );

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

  return (
    <Box
      className="my-container"
      height="100%"
      p={3}
      sx={{}}
    >
      <Typography variant="h5">
        个人设置
      </Typography>
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
              width: "300px",
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
              width: "300px",
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
      <RechargeModal open={rechargeModalOpen} onClose={()=> setRechargeModalOpen(false)}/>
    </Box>
  )
}

export default My
