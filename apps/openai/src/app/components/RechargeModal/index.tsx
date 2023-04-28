import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import useAPI from "../../hooks/useAPI";
import { useFeedback } from "../Feedback";

const prices = [
  {
    chats: 140,
    amount: 10,
    gpt4: 2
  },
  {
    chats: 700,
    amount: 50,
    gpt4: 10
  },
  {
    chats: 1400,
    amount: 100,
    gpt4: 20
  },
  {
    chats: 7000,
    amount: 500,
    gpt4: 100
  },
];

export function RechargeModal({ ...props }: DialogProps) {
  const { orderApi } = useAPI();
  const { showToast } = useFeedback();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [amount, setAmount] = useState(10);

  const handleRecharge = () => {
    orderApi.createOrder({ amount, mobile: isMobile ? 1 : 0 }).then((res) => {
      let divForm = document.getElementsByTagName("divform");
      if (divForm.length) {
        document.body.removeChild(divForm[0]);
      }
      const div = document.createElement("divform");
      div.innerHTML = res;
      document.body.appendChild(div);
      div.getElementsByTagName("form")[0].submit();
    });
  };

  return (
    <Dialog {...props}>
      <DialogTitle>充值</DialogTitle>
      <DialogContent>
        <Box py={1} width="100%">
          <Stack
            width="100%"
            spacing={2}
            direction="row"
            flexWrap="wrap"
            useFlexGap
          >
            {prices.map((item) => {
              return (
                <Paper
                  key={item.amount}
                  elevation={0}
                  sx={{
                    width: {
                      xs: "100%",
                      md: "calc(50% - 10px)",
                    },
                    border: amount === item.amount ? "2px solid #1d93ab" : "2px solid #e5e5e5",
                    cursor: "pointer",
                  }}
                  onClick={() => setAmount(item.amount)}
                >
                  <Box p={2} bgcolor="#f3f3f3">
                    <Typography variant="subtitle1" display="block">
                      {item.amount} 元（{item.amount * 100} 积分）
                    </Typography>

                    <Typography variant="caption" color="#666" display="block">
                      ≈ {item.chats}次问答
                    </Typography>
                    <Typography variant="caption" color="#666" display="block">
                      获得{item.gpt4}次GPT-4问答
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ margin: "10px 15px" }}
          variant="contained"
          fullWidth
          onClick={handleRecharge}
        >
          充值
        </Button>
      </DialogActions>
    </Dialog>
  );
}
