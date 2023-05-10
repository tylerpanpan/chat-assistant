import { useImperativeHandle, useState, forwardRef } from "react";
import { Box, Button, CircularProgress, InputBase, Stack } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';

interface ChatInsertProps {
  ref: any;
  presetQuestions: any[];
  sending: boolean;
  isMultiple?: boolean;
  curCharacter?: any;
  handleSend: (text?: string) => void;
  onMultiChange?: (boo: boolean) => void;
  shareContent?: () => void;
}

const ChatInsert = ({
  presetQuestions,
  sending,
  isMultiple,
  curCharacter,
  handleSend,
  onMultiChange,
  shareContent
}: ChatInsertProps, ref: any) => {
  const [text, setText] = useState("");

  useImperativeHandle(ref, () => ({
    clearText: () => setText("")
  }))

  const handleKeyDown = (e: any) => {
    if (e.keyCode === 13) {
      handleSend(text);
    }
  };

  const clickToSend = () => {
    handleSend(text);
  }

  const closeMultiple = () => {
    onMultiChange?.(false)
  }

  const shareMultiple = () => {
    shareContent?.()
  }

  return (
    <>
      <Box mx={2} my={1.5} position="relative">
        {presetQuestions.length > 0 && curCharacter?.recommendEnable && !isMultiple && <Box pt={1} borderTop="1px solid #dedede">
          <Stack direction="row" sx={{
            overflowY: 'auto',
            flexFlow: {
              sm: 'row wrap',
              xs: 'row nowrap'
            },
          }}>
            {
              presetQuestions.map((question, index) => (
                <Button key={index} variant="outlined" size="small" sx={{whiteSpace: 'nowrap',flexShrink: 0, marginRight: '10px', marginBottom: '8px', textTransform: 'none'}} onClick={() => handleSend(question)}>{question}</Button>
              ))
            }
          </Stack>
        </Box>}
        <Stack direction="row">
          <InputBase
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              border: '1px solid #dedede',
              borderRadius: '10px',
              color: "#303030",
              width: '100%',
              height: '100%',
              boxShadow: '0 -2px 5px rgba(0,0,0,.03)',
              padding: '10px 100px 10px 14px',
              resize: 'none',
              outline: 'none'
            }}
            maxRows={4}
            minRows={3}
            multiline
            fullWidth
            disabled={sending}
            placeholder="请输入内容，Enter发送"
            onKeyDown={handleKeyDown}
          />
          <Box
            position="absolute"
            right="10px"
            bottom="10px"
          >
            <Button
              variant="contained"
              onClick={() => clickToSend()}
              disabled={!text || sending}
              startIcon={sending ? <CircularProgress size="16px" /> : <SendIcon />}
            >发送</Button>
          </Box>
          {
            isMultiple && (
              <Box
                position="absolute"
                left="0"
                right="0"
                top="0"
                bottom="0"
                bgcolor="#fff"
              >
                <Stack height="100%" direction="row" alignItems="center" justifyContent="center" spacing={4}>
                  <Button variant="contained" startIcon={<ShareIcon fontSize="small" />} onClick={shareMultiple}>
                    分享到社区
                  </Button>
                  <Button variant="outlined" onClick={closeMultiple}>
                    取消
                  </Button>
                </Stack>
              </Box>
            )
          }
        </Stack>
      </Box>
    </>
  )
}

export default forwardRef(ChatInsert)
