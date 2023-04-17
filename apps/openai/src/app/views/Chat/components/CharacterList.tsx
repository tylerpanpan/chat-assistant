import { Avatar, Box, Button, Stack, IconButton } from "@mui/material";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from "@mui/icons-material/Delete";

export function CharacterList({
  characters,
  characterId,
  handleChooseCharacter,
  handleCreateCharacter,
  handleEditCharacter,
  handleDeleteCharacter
}: {
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
      <Box height={"100%"} overflow={'scroll'}>
        {characters?.map((bot: any) => (
          <Box
            onClick={handleChooseCharacter(bot.id)}
            key={bot.id}
            bgcolor={bot.id === characterId ? "#fff" : "#333"}
            color={bot.id === characterId ? "#333" : "#fff"}
            borderRadius="8px"
            p={1}
            mb={.5}
            sx={{
              'cursor': 'pointer',
              'transition': 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#fff',
                color: '#333',
              }
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center">
                <Box width="40px" height="40px" borderRadius="50%">
                  <Avatar src={bot.avatar} />
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
        <Button variant="contained" fullWidth onClick={handleCreateCharacter}>
          创建角色
        </Button>
      </Box>
    </Stack>
  );
}
