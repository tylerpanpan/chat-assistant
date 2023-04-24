import { Avatar, Box, Button, Stack, IconButton } from "@mui/material";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineSharpIcon from '@mui/icons-material/AddCircleOutlineSharp';

export function CharacterList({
  isGuest,
  characters,
  characterId,
  handleChooseCharacter,
  handleCreateCharacter,
  handleEditCharacter,
  handleDeleteCharacter
}: {
  isGuest: boolean,
  characters: any[];
  characterId?: number | null;
  handleChooseCharacter: (characterId: number) => () => void;
  handleCreateCharacter: () => void;
  handleEditCharacter: (characterId: number) => () => void;
  handleDeleteCharacter: (characterId: number) => () => void;
}) {
  return (
    <Stack
      direction={"column"}
      sx={{ height: "100%" }}
      justifyContent="space-between"
    >
      <Box maxHeight={'calc(100vh - 172px)'} overflow={'scroll'}>
        {characters?.map((bot: any, index: number) => (
          <Box
            onClick={handleChooseCharacter(bot.id)}
            key={index}
            bgcolor="#fff"
            color="#303030"
            borderRadius="8px"
            border={bot.id === characterId ? '2px solid #1d93ab' : '2px solid transparent'}
            p={1}
            mb={.5}
            sx={{
              'cursor': 'pointer',
              'transition': 'all 0.3s ease',
              'marginBottom': '10px',
              '&:hover': {
                backgroundColor: '#f3f3f3'
              }
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center">
                <Box width="30px" height="30px" borderRadius="50%">
                  <Avatar sx={{ width: 30, height: 30 }} src={bot.avatar} />
                </Box>
                <Box ml={1}>{bot.name}</Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={.8}>
                {!bot.isDefault && bot.id === characterId && <IconButton onClick={handleEditCharacter(bot.id)}>
                  <BorderColorIcon sx={{ fontSize: 14 }} />
                </IconButton>}
                {!bot.isDefault && bot.id === characterId && <IconButton onClick={handleDeleteCharacter(bot.id)}>
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>}
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>
      <Box>
        <Button variant="outlined" size="large" fullWidth startIcon={!isGuest && <AddCircleOutlineSharpIcon />} onClick={handleCreateCharacter}>
          {isGuest ? '登录/注册' : '创建角色' }
        </Button>
      </Box>
    </Stack>
  );
}
