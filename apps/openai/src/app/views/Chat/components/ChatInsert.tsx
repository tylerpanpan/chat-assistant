import { useImperativeHandle, useState, forwardRef } from "react";
import { Box, Button, CircularProgress, InputBase, Stack } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface ChatInsertProps {
  ref: any;
  presetQuestions: any[];
  sending: boolean;
  handleSend: (text?: string) => void;
  curCharacter?: any;
}

const ChatInsert = ({
  presetQuestions,
  sending,
  handleSend,
  curCharacter,
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

  return (
    <>
      <Box mx={2} my={1.5} position="relative">
        {presetQuestions.length > 0 && curCharacter?.recommendEnable && <Box pt={1} borderTop="1px solid #dedede">
          <Stack direction="row" sx={{
            overflowY: 'auto',
            flexFlow: {
              sm: 'row wrap',
              xs: 'row nowrap'
            },
          }}>
            {
              presetQuestions.map((question, index) => (
                <Button key={index} variant="outlined" size="small" sx={{whiteSpace: 'nowrap',flexShrink: 0, marginRight: '10px', marginBottom: '8px'}} onClick={() => handleSend(question)}>{question}</Button>
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
              onClick={() => handleSend()}
              disabled={!text || sending}
              startIcon={sending ? <CircularProgress size="16px" /> : <SendIcon />}
            >发送</Button>
          </Box>
        </Stack>
      </Box>
    </>
  )
}

export default forwardRef(ChatInsert)
