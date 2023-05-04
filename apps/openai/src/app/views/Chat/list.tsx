import { Avatar, Box, Stack, Typography } from "@mui/material"

function ChatList() {
  return (
    <Box
      className="chat-list-container"
      height="100%"
      p={3}
      sx={{}}
    >
      <Typography variant="h5">
        继续聊天
      </Typography>
      <Box marginTop="15px" marginBottom="20px">
        <Stack direction="column">
          <Box marginBottom="20px" sx={{ cursor: "pointer" }}>
            <Stack direction="row">
              <Box>
                <Avatar sx={{ width: 55, height: 55 }}></Avatar>
              </Box>
              <Box marginLeft="10px">
                <Typography variant="subtitle1" lineHeight="1.5">全能小助手</Typography>
                <Typography variant="overline" lineHeight="1">全能小助手的相关描述文案</Typography>
              </Box>
            </Stack>
          </Box>
          <Box marginBottom="20px" sx={{ cursor: "pointer" }}>
            <Stack direction="row">
              <Box>
                <Avatar sx={{ width: 55, height: 55 }}></Avatar>
              </Box>
              <Box marginLeft="10px">
                <Typography variant="subtitle1" lineHeight="1.5">全能小助手</Typography>
                <Typography variant="overline" lineHeight="1">全能小助手的相关描述文案</Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}

export default ChatList
