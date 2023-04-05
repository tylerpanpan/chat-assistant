import { Button, Dialog as MuiDialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import * as React from "react";


type DialogProps = {
  title?: string;
  content: string | React.ReactNode;
  confirm?: string;
  cancel?: string;
  open: boolean;
  href?: string;
  onClose: (type: number) => void;
};

const Dialog = ({
  open,
  cancel,
  confirm,
  content,
  title,
  onClose,
  href,
}: DialogProps) => {
  const handleClose = (type: number) => () => {
    onClose(type);
  };

  return (
    <MuiDialog open={open} maxWidth="md" onClose={handleClose(2)}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent style={{ minWidth: "240px" }}>
        {typeof content === "string" ? (
          <DialogContentText>{content}</DialogContentText>
        ) : (
          content
        )}
      </DialogContent>
      <DialogActions>
        {cancel && (
          <Button size="small" variant="text" onClick={handleClose(0)}>
            {cancel}
          </Button>
        )}
        <Button href={href} size="small" onClick={handleClose(1)}>
          {confirm ? confirm : "confirm"}
        </Button>
      </DialogActions>
    </MuiDialog>
  );
};

export default Dialog;
