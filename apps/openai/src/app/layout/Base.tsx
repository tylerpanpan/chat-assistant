import { Box, Stack, Typography } from "@mui/material";
import { Outlet, useNavigate } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';

function BaseLayout () {
  const navigate = useNavigate()

  const jumpTo = (path: string) => {
    navigate(path, { replace: true })
  }

  return (
    <Box className="base-root" height="100%">
      <Stack direction="row" height="100%">
        <Box
          className="pc-nav"
          height="100%"
          sx={{
            display: { xs: "none", sm: "block" },
            boxSizing: "border-box",
            width: "70px",
            backgroundColor: "#e7f8ff",
            boxShadow: 'inset -2px 0 2px 0 rgba(0,0,0,.05)',
            borderRight: 'none'
          }}
        >
          <Stack direction="column" alignItems="center">
            <Box
              mt={2}
              bgcolor="#fff"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                marginBottom: "10px"
              }}
            >
              <img src="../../assets/logo.png" alt="logo" style={{ width: '40px' }} />
            </Box>
            <Box mt={2}>
              <Stack direction="column" alignItems="center" spacing={3}>
                <Box onClick={() => jumpTo('/')} sx={{ cursor: 'pointer', color: "#555", '&:hover': { color: '#1976d2'} }}>
                  <HomeIcon />
                  <Typography variant="caption" display="block" mt={-1}>
                    首页
                  </Typography>
                </Box>
                <Box onClick={() => jumpTo('/chatList')} sx={{ cursor: 'pointer', color: "#555", '&:hover': { color: '#1976d2'} }}>
                  <QuestionAnswerIcon />
                  <Typography variant="caption" display="block" mt={-1}>
                    对话
                  </Typography>
                </Box>
                {/* <Box onClick={() => jumpTo('/community')} sx={{ cursor: 'pointer', color: "#555", '&:hover': { color: '#1976d2'} }}>
                  <PeopleIcon />
                  <Typography variant="caption" display="block" mt={-1}>
                    社区
                  </Typography>
                </Box> */}
                <Box onClick={() => jumpTo('/my')} sx={{ cursor: 'pointer', color: "#555", '&:hover': { color: '#1976d2'} }}>
                  <PersonIcon />
                  <Typography variant="caption" display="block" mt={-1}>
                    我的
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
        <Box className="main-body" width="calc(100% - 70px)">
          <Outlet />
        </Box>
      </Stack>
    </Box>
  )
}

export default BaseLayout
