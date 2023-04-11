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
} from "@mui/material";

import * as yup from "yup";
import { useFormik } from "formik";
import { useAuth } from "apps/openai/src/app/provider/AuthProvider";
import { useFeedback } from "../Feedback";
import useAPI from "../../hooks/useAPI";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

interface LoginModalProps extends DialogProps {}

export function LoginModal({ ...props }: LoginModalProps) {
  const { login } = useAuth();
  const { showToast } = useFeedback();
  const { userApi } = useAPI();
  const [isRegister, setIsRegister] = useState(false);
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
      .register(values.username, values.password)
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
    },
    validationSchema: validation,
    onSubmit: (values) => {
      const api = isRegister ? handleRegister(values) : handleLogin(values);
    },
  });

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
                md: "30px",
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
            </Stack>
            <Button onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "登录" : "账号注册"}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          fullWidth
          variant="contained"
          onClick={() => formik.handleSubmit()}
        >
          {isRegister ? "注册" : "登录"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
