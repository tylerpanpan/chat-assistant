import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import useAPI from '../../hooks/useAPI';
import { useFeedback } from '../Feedback';
interface CreateCharacterModalProps extends DialogProps {
  onCreated?: () => void;
}

export function CreateCharacterModal({
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
      })
      .catch((e) => {
        showToast(e.message, 1);
      });
  };

  return (
    <Dialog {...props}>
      <DialogTitle>创建角色</DialogTitle>
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
            onClick={handleCreateCharacter}
          >
            创建
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
