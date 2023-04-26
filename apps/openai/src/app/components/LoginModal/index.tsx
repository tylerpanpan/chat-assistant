import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
  Box,
  Typography
} from "@mui/material";

import * as yup from "yup";
import { useFormik } from "formik";
import { useAuth } from "apps/openai/src/app/provider/AuthProvider";
import { useFeedback } from "../Feedback";
import useAPI from "../../hooks/useAPI";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

interface LoginModalProps extends DialogProps {
  register?: number;
}

export function LoginModal({ ...props }: LoginModalProps) {
  const { login } = useAuth();
  const { showToast } = useFeedback();
  const { userApi } = useAPI();
  const [isRegister, setIsRegister] = useState(false);
  const [inviteId, setInviteId] = useState()
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const validation = yup.object({
    username: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: yup.string().required("Password is required"),
  });

  const handleLogin = (values: any) => {
    userApi
      .login(values.username, values.password)
      .then((res) => {
        props.onClose?.({}, "escapeKeyDown")
        history.pushState('', '', '/')
        login(res.access_token, res.user);
      })
      .catch((e) => {
        if (e.response.data) {
          showToast(e.response.data.message);
        }
        console.info(e);
      });
  };

  const handleRegister = (values: any) => {
    userApi
      .register(values.username, values.password, values.referUserId)
      .then((res) => {
        handleLogin(values);
      })
      .catch((e) => {
        if (e.response.data) {
          showToast(e.response.data.message);
        }
        console.info(e);
      });
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      referUserId: ""
    },
    validationSchema: validation,
    onSubmit: (values) => {
      const api = isRegister ? handleRegister(values) : handleLogin(values);
    },
  });

  const getUrlParams = (url: string) => {
    const u = new URL(url);
    const s = new URLSearchParams(u.search);
    const obj: any = {};
    s.forEach((v, k) => (obj[k] = v));
    return obj;
  }

  useEffect(() => {
    const urlQuery = getUrlParams(location.href)
    if (urlQuery.invite) {
      setInviteId(urlQuery.invite)
      formik.values.referUserId = urlQuery.invite
    }
    setIsRegister(!!props.register)
  }, [props.register])

  return (
    <Dialog {...props} fullScreen={isMobile}>
      <DialogTitle>
        {isRegister ? "注册" : "登录"}
        <IconButton
          aria-label="close"
          onClick={() => props.onClose?.({}, "escapeKeyDown")}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack
          width="100%"
          alignItems="center"
          justifyContent="center"
          direction="column"
          sx={{
            justifyContent: {
              xs: "baseline",
              md: "center",
            },
          }}
        >
          <Box
            sx={{
              width: {
                xs: "100%",
                md: "400px",
              },
              padding: {
                md: "0",
                xs: "0",
              },
              boxShadow: {
                xs: "none",
              },
            }}
          >
            <Stack direction="column">
              <TextField
                id="username"
                name="username"
                label="邮箱"
                margin="normal"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={
                  formik.touched.username && Boolean(formik.errors.username)
                }
                helperText={formik.touched.username && formik.errors.username}
              />
              <TextField
                id="password"
                name="password"
                label="密码"
                margin="normal"
                type={"password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
              />
              {inviteId && isRegister && <TextField
                id="referUserId"
                name="referUserId"
                label="邀请码"
                margin="normal"
                value={formik.values.referUserId}
                onChange={formik.handleChange}
              />}
            </Stack>
            <Button onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "登录" : "账号注册"}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{
            margin: '0 15px 5px'
          }}
          fullWidth
          variant="contained"
          onClick={() => formik.handleSubmit()}
        >
          {isRegister ? "注册" : "登录"}
        </Button>
      </DialogActions>
      {isRegister && <Typography sx={{textAlign: "center", marginBottom: "10px"}}>注册可获得500积分（≈ 140次问答）</Typography>}
    </Dialog>
  );
}
