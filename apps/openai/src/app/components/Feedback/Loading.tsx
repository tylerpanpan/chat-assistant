import { Backdrop, CircularProgress, styled, Typography } from '@mui/material';
import * as React from 'react';

export type LoadingProps = {
  show: boolean;
  message: string;
};

const StyledBackdrop = styled(
  Backdrop,
  {}
)(({ theme }) => ({
  root: {
    color: '#fff',
    zIndex: theme.zIndex.snackbar - 1,
    flexDirection: 'column',
  },
}));


function Loading({ show, message }: LoadingProps) {

  return (
    <StyledBackdrop  open={show}>
      <CircularProgress color="secondary" />
      <Typography
        style={{
          marginTop: '20px',
          padding: '0 32px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
        variant="body1"
        color="inherit"
      >
        {message}
      </Typography>
    </StyledBackdrop>
  );
}

export default Loading;
