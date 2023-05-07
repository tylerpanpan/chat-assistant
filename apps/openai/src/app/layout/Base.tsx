import { Box, Stack, Typography } from "@mui/material";
import { Outlet, useNavigate } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
// import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
// import ManageSearchIcon from '@mui/icons-material/ManageSearch';

function BaseLayout () {
  const navigate = useNavigate()

  const jumpTo = (path: string) => {
    navigate(path, { replace: true })
  }

  return (
    <Box className="base-root" height="100%">
      <Stack
        height="100%"
        sx={{
          flexDirection: {
            xs: "column-reverse",
            sm: "row"
          },
          justifyContent: {
            xs: "space-between",
            sm: "flex-start"
          }
        }}
      >
        <Box
          className="nav"
          sx={{
            boxSizing: "border-box",
            height: {
              xs: "auto",
              sm: "100%"
            },
            width: {
              xs: "100%",
              sm: "70px"
            },
            backgroundColor: "#e7f8ff",
            boxShadow: {
              xs: 'inset 0 1px 2px 0 rgba(0,0,0,.05)',
              sm: 'inset -2px 0 2px 0 rgba(0,0,0,.05)'
            },
            borderRight: 'none'
          }}
        >
          <Stack direction="column" alignItems="center" width="100%">
            <Box
              mt={2}
              bgcolor="#fff"
              sx={{
                display: {
                  xs: "none",
                  sm: 'flex'
                },
                justifyContent: 'center',
                alignItems: 'center',
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                marginBottom: "20px"
              }}
            >
              <img src="../../assets/logo.png" alt="logo" style={{ width: '40px' }} />
            </Box>
            <Box width="100%">
              <Stack
                sx={{
                  flexDirection: {
                    xs: "row",
                    sm: "column"
                  },
                  alignItems: "center",
                  justifyContent: {
                    xs: "space-between",
                    sm: "flex-start"
                  },
                  padding: {
                    xs: "10px 16px",
                    sm: 0
                  }
                }}
              >
                <Box onClick={() => jumpTo('/')} sx={{ cursor: 'pointer', color: "#555", '&:hover': { color: '#1976d2'}, marginBottom: { xs: 0, sm: '24px'} }}>
                  <HomeIcon />
                  <Typography variant="caption" display="block" mt={-1}>
                    首页
                  </Typography>
                </Box>
                <Box onClick={() => jumpTo('/chatList')} sx={{ cursor: 'pointer', color: "#555", '&:hover': { color: '#1976d2'}, marginBottom: { xs: 0, sm: '24px'} }}>
                  <QuestionAnswerIcon />
                  <Typography variant="caption" display="block" mt={-1}>
                    对话
                  </Typography>
                </Box>
                {/* <Box onClick={() => jumpTo('/community')} sx={{ cursor: 'pointer', color: "#555", '&:hover': { color: '#1976d2'}, marginBottom: { xs: 0, sm: '24px'} }}>
                  <PeopleIcon />
                  <Typography variant="caption" display="block" mt={-1}>
                    社区
                  </Typography>
                </Box> */}
                {/* <Box sx={{ cursor: 'pointer', color: "#555", '&:hover': { color: '#1976d2'} }}>
                  <ManageSearchIcon />
                  <Typography variant="caption" display="block" mt={-1}>
                    发现
                  </Typography>
                </Box> */}
                <Box onClick={() => jumpTo('/my')} sx={{ cursor: 'pointer', color: "#555", '&:hover': { color: '#1976d2'}, marginBottom: { xs: 0, sm: '24px'} }}>
                  <PersonIcon />
                  <Typography variant="caption" display="block" mt={-1}>
                    我的
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
        <Box
          className="main-body"
          sx={{
            width: {
              xs: "100%",
              sm: "calc(100% - 70px)"
            },
            flex: 1,
            overflowY: "auto"
          }}
        >
          <Outlet />
        </Box>
      </Stack>
    </Box>
  )
}

export default BaseLayout
