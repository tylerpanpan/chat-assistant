import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import useAPI from '../../hooks/useAPI';
import { useFeedback } from '../Feedback';
interface CreateCharacterModalProps extends DialogProps {
  character?: any;
  onCreated?: () => void;
}

export function CreateCharacterModal({
  character,
  onCreated,
  ...props
}: CreateCharacterModalProps) {
  const { characterApi } = useAPI();
  const [name, setName] = useState('');
  const [definition, setDefinition] = useState('');
  const { showToast } = useFeedback();

  const handleCreateCharacter = () => {
    characterApi
      .createCharacter({ name, definition })
      .then(() => {
        setName('');
        setDefinition('');
        onCreated?.();
        showToast('角色创建成功')
      })
      .catch((e) => {
        showToast(e.message, 1);
      });
  };

  const handleSaveCharacter = () => {
    characterApi
      .editCharacter(character.id, { name, definition })
      .then(() => {
        setName('');
        setDefinition('');
        onCreated?.();
        showToast('角色保存成功')
      })
      .catch((e) => {
        showToast(e.message, 1);
      });
  }

  useEffect(() => {
    if (character) {
      setName(character.name);
      setDefinition(character.definition);
    } else {
      setName('');
      setDefinition('');
    }
  }, [character])

  return (
    <Dialog {...props}>
      <DialogTitle>{character?.name ? '角色编辑' : '创建角色'}</DialogTitle>
      <DialogContent>
        <Box p={1.5}>
          <TextField
            label="角色名"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            sx={{ marginTop: '10px' }}
            label="角色定义"
            fullWidth
            multiline
            rows={4}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
          />

          <Button
            disabled={!name || !definition}
            sx={{ marginTop: '20px' }}
            variant="contained"
            fullWidth
            onClick={character?.name ? handleSaveCharacter : handleCreateCharacter}
          >
            {character?.name ? '保存' : '创建'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
