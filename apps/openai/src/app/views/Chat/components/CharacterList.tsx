import { Avatar, Box, Button, Stack } from "@mui/material";

export function CharacterList({
  characters,
  characterId,
  handleChooseCharacter,
  handleCreateCharacter,
}: {
  characters: any[];
  characterId?: number | null;
  handleChooseCharacter: (characterId: number) => () => void;
  handleCreateCharacter: () => void;
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
          >
            <Stack direction="row" alignItems="center">
              <Box width="40px" height="40px" borderRadius="50%">
                <Avatar src={bot.avatar} />
              </Box>
              <Box ml={1}>{bot.name}</Box>
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
