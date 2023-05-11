import { useState } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useQuery } from "react-query";
import useAPI from "../../hooks/useAPI";
import { useAuth } from "../../provider/AuthProvider";
import { useFeedback } from "../../components/Feedback";
import { ChatContent } from "../Chat/components/ChatContent"
import { getUrlParams } from "../../utils";
import moment from "moment";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import '../Chat/index.scss';

function Share() {
  const { userApi, shareAPI } = useAPI();
  const { token, showLogin } = useAuth();
  const { showToast } = useFeedback();
  const [curCharacter, setCurCharacter] = useState<any>();
  const [chats, setChats] = useState<{ role: "user" | "assistant" | "recharge" | "guest" | "gpt4limit"; content: string; loading?: boolean }[]>([]);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const { data: shareData, refetch: refetchShareData } = useQuery(
    ["share-detail"],
    () => shareAPI.getShareDetail(getUrlParams(location.href)?.id),
    {
      enabled: !!getUrlParams(location.href)?.id,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setCurCharacter(data.chat.character);
        setChats(data.messages);
        if (isLiking) {
          setIsLiking(false);
          if (data.liked) {
            showToast("点赞成功");
          } else {
            showToast("点赞取消");
          }
        }
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

  // 点赞
  const handleLike = () => {
    if (!userInfo?.username) {
      showLogin()
    } else {
      setIsLiking(true);
      shareAPI
        .likeShare(shareData.id)
        .then(() => {
          refetchShareData();
        })
        .catch(() => {
          setIsLiking(false);
        })
    }
  }

  return (
    <Box
      className="share-container"
      width="100%"
      height="100%"
    >
      <Stack
        direction="column"
        height="100%"
        width="100%"
        justifyContent="space-between"
      >
        <Box color="#303030" width="100%" p={1} borderBottom="1px solid rgba(0, 0, 0, .1)">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box flex={1}>
              <Stack sx={{minHeight: '60px'}} direction="column" justifyContent="center" alignItems="center">
                <Typography fontWeight="500">
                  {curCharacter?.name || ""}
                </Typography>
                <Typography sx={{lineHeight: 1.2,marginTop: '5px'}} variant="caption">分享自：{shareData?.user?.username}，时间：{moment(shareData?.updatedAt).format('YYYY-MM-DD')}</Typography>
              </Stack>
            </Box>
            <Box height="42px" flexShrink={0}>
              {token && (
                <IconButton sx={{ border: '1px solid #dedede' }} disabled={isLiking} onClick={handleLike}>
                  {shareData?.liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
                </IconButton>
              )}
            </Box>
          </Stack>
        </Box>
        <ChatContent isShare={true} character={curCharacter} chats={chats} userInfo={userInfo} onRecharge={() => null} />
      </Stack>
    </Box>
  )
}

export default Share
