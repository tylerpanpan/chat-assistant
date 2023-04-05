import {
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';

import * as yup from 'yup';
import { useFormik } from 'formik';
import { useAuth } from 'apps/openai/src/app/provider/AuthProvider';
import { useFeedback } from '../Feedback';
import axios from 'axios';
import useAPI from '../../hooks/useAPI';

interface LoginModalProps extends DialogProps {}

export function LoginModal({ ...props }: LoginModalProps) {
  const { login } = useAuth();
  const { showToast } = useFeedback();
  const { userApi } = useAPI();
  const validation = yup.object({
    username: yup
      .string()
      .email('Enter a valid email')
      .required('Email is required'),
    password: yup.string().required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validation,
    onSubmit: (values) => {
      userApi
        .login(values.username, values.password)
        .then((res) => {
          const user = res.user;
          login(res.access_token, res.user);
        })
        .catch((e) => {
          if (e.response.data) {
            showToast(e.response.data.message);
          }
        });
    },
  });

  return (
    <Dialog {...props}>
      <DialogTitle>登录</DialogTitle>
      <DialogContent>
        <Stack
          height="300px"
          width="100%"
          alignItems="center"
          justifyContent="center"
          direction="column"
          sx={{
            justifyContent: {
              xs: 'baseline',
              md: 'center',
            },
          }}
        >
          <Box
            sx={{
              width: {
                xs: '100%',
                md: '400px',
              },
              padding: {
                md: '30px',
              },

              boxShadow: {
                xs: 'none',
              },
            }}
          >
            <form onSubmit={formik.handleSubmit}>
              <Stack direction="column">
                <TextField
                  id="username"
                  name="username"
                  label="Email"
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
                  label="Password"
                  margin="normal"
                  type={'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                />
                <Button variant="contained" type="submit">
                  登录
                </Button>
              </Stack>
            </form>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
