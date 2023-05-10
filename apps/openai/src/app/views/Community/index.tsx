import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Divider, Grid, Stack, Typography } from "@mui/material"
import { useNavigate } from 'react-router-dom'
import { useQuery } from "react-query";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useAPI from "../../hooks/useAPI";
import { useFeedback } from "../../components/Feedback";
import moment from "moment";

function Community() {
  const navigate = useNavigate()
  const { shareAPI } = useAPI();
  const { showToast } = useFeedback();

  const { data: shareList, refetch: refetchShareList } = useQuery(
    ["all-share"],
    () => shareAPI.getShareList(),
    {
      refetchOnWindowFocus: false
    }
  );

  // 点赞
  const handleLike = (event:any, value: any) => {
    event.stopPropagation();
    shareAPI
      .likeShare(value.id)
      .then(res => {
        refetchShareList();
        if (!value.liked) {
          showToast("点赞成功");
        } else {
          showToast("点赞取消");
        }
      })
      .catch(err => {})
  }

  // 进入详情页
  const goDetail = (id: number) => {
    navigate(`/share?id=${id}`)
  }

  return (
    <Box
      className="community-container"
      height="100%"
      p={3}
      sx={{}}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={8}>
          <Box>
            <Typography variant="h5">
              热门分享
            </Typography>
            <Box marginTop="15px" marginBottom="20px">
              <Stack direction="column">
                {
                  shareList?.map((item: any) => (
                    <Box
                      key={item.id}
                      sx={{
                        boxShadow: '0 0 #0000,0 0 #0000, 0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)',
                        padding: '12px',
                        border: '1px solid rgba(243, 244, 246, 1)',
                        borderRadius: '5px',
                        marginBottom: "10px",
                        transition: 'all .3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#f5f6f7'
                        }
                      }}
                      onClick={() => goDetail(item.id)}
                    >
                      <Stack direction="row" justifyContent="space-between">
                        <Box>
                          <Typography
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              marginBottom: "5px",
                              color: '#303030',
                              cursor: 'pointer',
                              '&:hover': {
                                fontWeight: 'bold'
                              }
                            }}
                          >{item.messages[0].content}</Typography>
                          <Stack
                            direction="row"
                            divider={<Divider orientation="vertical" flexItem />}
                            alignItems="center"
                            spacing={2}
                          >
                            <Box>
                              <Stack direction="row" alignItems="center">
                                <Avatar sx={{ width: 20, height: 20, marginRight: "5px" }}></Avatar>
                                <Typography variant="body2" color="#666">时间：{moment(item.createdAt).format('YYYY-MM-DD')}</Typography>
                              </Stack>
                            </Box>
                            <Typography variant="body2" color="#666">浏览：{item.numberOfViews}</Typography>
                            {/* <Typography variant="body2" color="#666" sx={{ display: { xs: "none", sm: "initial" } }}>评论：20</Typography> */}
                          </Stack>
                        </Box>
                        <Box flex="0 0 auto" width="48px" marginLeft="5px" marginTop="3px" color="#666" onClick={(event) => handleLike(event, item)} sx={{ cursor: 'pointer' }}>
                          <Stack direction="column" alignItems="center">
                            {item.liked ? <ThumbUpAltIcon fontSize="small" /> : <ThumbUpOffAltIcon fontSize="small" />}
                            <Typography variant="body1">{item.numberOfLikes}</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  ))
                }
              </Stack>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="h5">
              常见问题
            </Typography>
            <Box marginTop="15px" marginBottom="20px">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>我如何提供帮助</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    构建角色并与角色交谈！您在谈话期间的反馈，以及您在设计技术新用法时体现出的创造力将为所有人改进产品
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Community
