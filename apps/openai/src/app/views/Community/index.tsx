import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Divider, Grid, Stack, Typography } from "@mui/material"
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function Community() {
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
                <Box
                  sx={{
                    boxShadow: '0 0 #0000,0 0 #0000, 0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)',
                    padding: '12px',
                    border: '1px solid rgba(243, 244, 246, 1)',
                    borderRadius: '5px',
                    marginBottom: "10px"
                  }}
                >
                  <Stack direction="row">
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
                      >需要注意的是，股票市场是复杂和充满风险的，模型预测结果可能受到许多因素的干扰，如经济和政治情况、技术进步、自然灾害等等。因此，机器学习模型需要持续和充分的监控和改进，并且需要适应市场不断变化的特性。</Typography>
                      <Stack
                        direction="row"
                        divider={<Divider orientation="vertical" flexItem />}
                        alignItems="center"
                        spacing={2}
                      >
                        <Box>
                          <Stack direction="row" alignItems="center">
                            <Avatar sx={{ width: 20, height: 20, marginRight: "5px" }}></Avatar>
                            <Typography variant="body2" color="#666">时间：122天前</Typography>
                          </Stack>
                        </Box>
                        <Typography variant="body2" color="#666">浏览：4.7万</Typography>
                        <Typography variant="body2" color="#666" sx={{ display: { xs: "none", sm: "initial" } }}>评论：20</Typography>
                      </Stack>
                    </Box>
                    <Box flex="0 0 auto" width="48px" marginLeft="5px" marginTop="3px" color="#666">
                      <Stack direction="column" alignItems="center">
                        <BookmarkBorderIcon fontSize="small" />
                        <Typography variant="body1">373</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    boxShadow: '0 0 #0000,0 0 #0000, 0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)',
                    padding: '12px',
                    border: '1px solid rgba(243, 244, 246, 1)',
                    borderRadius: '5px',
                    marginBottom: "10px"
                  }}
                >
                  <Stack direction="row">
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
                      >需要注意的是，股票市场是复杂和充满风险的，模型预测结果可能受到许多因素的干扰，如经济和政治情况、技术进步、自然灾害等等。因此，机器学习模型需要持续和充分的监控和改进，并且需要适应市场不断变化的特性。</Typography>
                      <Stack
                        direction="row"
                        divider={<Divider orientation="vertical" flexItem />}
                        alignItems="center"
                        spacing={2}
                      >
                        <Box>
                          <Stack direction="row" alignItems="center">
                            <Avatar sx={{ width: 20, height: 20, marginRight: "5px" }}></Avatar>
                            <Typography variant="body2" color="#666">时间：122天前</Typography>
                          </Stack>
                        </Box>
                        <Typography variant="body2" color="#666">浏览：4.7万</Typography>
                        <Typography variant="body2" color="#666" sx={{ display: { xs: "none", sm: "initial" } }}>评论：20</Typography>
                      </Stack>
                    </Box>
                    <Box flex="0 0 auto" width="48px" marginLeft="5px" marginTop="3px" color="#666">
                      <Stack direction="column" alignItems="center">
                        <BookmarkBorderIcon fontSize="small" />
                        <Typography variant="body1">373</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    boxShadow: '0 0 #0000,0 0 #0000, 0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)',
                    padding: '12px',
                    border: '1px solid rgba(243, 244, 246, 1)',
                    borderRadius: '5px',
                    marginBottom: "10px"
                  }}
                >
                  <Stack direction="row">
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
                      >需要注意的是，股票市场是复杂和充满风险的，模型预测结果可能受到许多因素的干扰，如经济和政治情况、技术进步、自然灾害等等。因此，机器学习模型需要持续和充分的监控和改进，并且需要适应市场不断变化的特性。</Typography>
                      <Stack
                        direction="row"
                        divider={<Divider orientation="vertical" flexItem />}
                        alignItems="center"
                        spacing={2}
                      >
                        <Box>
                          <Stack direction="row" alignItems="center">
                            <Avatar sx={{ width: 20, height: 20, marginRight: "5px" }}></Avatar>
                            <Typography variant="body2" color="#666">时间：122天前</Typography>
                          </Stack>
                        </Box>
                        <Typography variant="body2" color="#666">浏览：4.7万</Typography>
                        <Typography variant="body2" color="#666" sx={{ display: { xs: "none", sm: "initial" } }}>评论：20</Typography>
                      </Stack>
                    </Box>
                    <Box flex="0 0 auto" width="48px" marginLeft="5px" marginTop="3px" color="#666">
                      <Stack direction="column" alignItems="center">
                        <BookmarkBorderIcon fontSize="small" />
                        <Typography variant="body1">373</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    boxShadow: '0 0 #0000,0 0 #0000, 0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)',
                    padding: '12px',
                    border: '1px solid rgba(243, 244, 246, 1)',
                    borderRadius: '5px',
                    marginBottom: "10px"
                  }}
                >
                  <Stack direction="row">
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
                      >需要注意的是，股票市场是复杂和充满风险的，模型预测结果可能受到许多因素的干扰，如经济和政治情况、技术进步、自然灾害等等。因此，机器学习模型需要持续和充分的监控和改进，并且需要适应市场不断变化的特性。</Typography>
                      <Stack
                        direction="row"
                        divider={<Divider orientation="vertical" flexItem />}
                        alignItems="center"
                        spacing={2}
                      >
                        <Box>
                          <Stack direction="row" alignItems="center">
                            <Avatar sx={{ width: 20, height: 20, marginRight: "5px" }}></Avatar>
                            <Typography variant="body2" color="#666">时间：122天前</Typography>
                          </Stack>
                        </Box>
                        <Typography variant="body2" color="#666">浏览：4.7万</Typography>
                        <Typography variant="body2" color="#666" sx={{ display: { xs: "none", sm: "initial" } }}>评论：20</Typography>
                      </Stack>
                    </Box>
                    <Box flex="0 0 auto" width="48px" marginLeft="5px" marginTop="3px" color="#666">
                      <Stack direction="column" alignItems="center">
                        <BookmarkBorderIcon fontSize="small" />
                        <Typography variant="body1">373</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    boxShadow: '0 0 #0000,0 0 #0000, 0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)',
                    padding: '12px',
                    border: '1px solid rgba(243, 244, 246, 1)',
                    borderRadius: '5px',
                    marginBottom: "10px"
                  }}
                >
                  <Stack direction="row">
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
                      >需要注意的是，股票市场是复杂和充满风险的，模型预测结果可能受到许多因素的干扰，如经济和政治情况、技术进步、自然灾害等等。因此，机器学习模型需要持续和充分的监控和改进，并且需要适应市场不断变化的特性。</Typography>
                      <Stack
                        direction="row"
                        divider={<Divider orientation="vertical" flexItem />}
                        alignItems="center"
                        spacing={2}
                      >
                        <Box>
                          <Stack direction="row" alignItems="center">
                            <Avatar sx={{ width: 20, height: 20, marginRight: "5px" }}></Avatar>
                            <Typography variant="body2" color="#666">时间：122天前</Typography>
                          </Stack>
                        </Box>
                        <Typography variant="body2" color="#666">浏览：4.7万</Typography>
                        <Typography variant="body2" color="#666" sx={{ display: { xs: "none", sm: "initial" } }}>评论：20</Typography>
                      </Stack>
                    </Box>
                    <Box flex="0 0 auto" width="48px" marginLeft="5px" marginTop="3px" color="#666">
                      <Stack direction="column" alignItems="center">
                        <BookmarkBorderIcon fontSize="small" />
                        <Typography variant="body1">373</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
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
