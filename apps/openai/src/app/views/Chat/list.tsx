import { Avatar, Box, Divider, Stack, Typography } from "@mui/material"
import { useQuery } from "react-query";
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../provider/AuthProvider";
import useAPI from "../../hooks/useAPI";
import a1 from '../../avatar/1.jpeg'
import a2 from '../../avatar/2.jpeg'
import a3 from '../../avatar/3.jpeg'
import a4 from '../../avatar/4.jpeg'
import a5 from '../../avatar/5.jpeg'
import a6 from '../../avatar/6.jpeg'
import a7 from '../../avatar/7.jpeg'
import a8 from '../../avatar/8.jpeg'

function ChatList() {
  const navigate = useNavigate()
  const { characterApi } = useAPI();
  const { token } = useAuth();

  const getImg = (id: string) => {
    const imgMap: any = {
      21: a1,
      97: a2,
      55: a3,
      58: a4,
      59: a5,
      87: a6,
      93: a7,
      101: a8,
    }

    return imgMap[id] || null;
  }

  const { data: characters, refetch: refetchCharacter } = useQuery(
    ["character", token],
    () => characterApi.getRecentCharacter(10),
    {
      enabled: !!token,
      refetchOnWindowFocus: false
    }
  );

  const goChat = (value: any) => {
    navigate(`/chat?cid=${value.id}`)
  }

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
        <Stack
          direction="column"
          divider={<Divider orientation="horizontal" flexItem sx={{ display: { xs: "block", sm: "none"} }} />}
        >
          {
            characters?.map((item: any) => (
              <Box
                key={item.id}
                my={2}
                sx={{ cursor: "pointer" }}
                onClick={() => goChat(item)}
              >
                <Stack direction="row">
                  <Box>
                    <Avatar src={getImg(item.id)} sx={{ width: 55, height: 55 }}></Avatar>
                  </Box>
                  <Box marginLeft="10px">
                    <Typography variant="subtitle1" lineHeight="1" sx={{ marginTop: '5px' }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: '12px', marginTop: '5px' }}>{item.description}</Typography>
                  </Box>
                </Stack>
              </Box>
            ))
          }
        </Stack>
      </Box>
    </Box>
  )
}

export default ChatList
