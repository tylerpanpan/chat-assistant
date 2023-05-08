import { useEffect, useRef, useState } from "react";
import { Avatar, Box, CircularProgress, IconButton } from "@mui/material";
import CancelIcon from '@mui/icons-material/Cancel';
import Compressor from "compressorjs";
import { upload } from "../../utils/upload"

interface UploadAvatarProps {
  name?: string;
  value?: string[] | string;
  onChange?: (value: any) => void;
}

export function UploadAvatar({
  value,
  onChange
}: UploadAvatarProps) {
  const imgRef = useRef<any>();
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!value || !value.length) {
      setFileList([])
    }
    if (typeof value === 'string' && value) {
      setFileList([value])
    }
    if (typeof value !== 'string' && value?.length) {
      setFileList(value)
    }
  }, [value]);

  const imgChange = () => {
    const imgFile = imgRef.current.files[0]
    new Compressor(imgFile, {
      quality: 0.6,
      success: async (res: any) => {
        const file = new File([res], `${new Date().getTime()}.${res.name.split('.')[1]}`, { type: res.type });
        setLoading(true);
        try {
          const fileUrl = await upload(file)
          setLoading(false)
          setFileList([fileUrl])
          onChange && onChange(fileUrl)
          imgRef.current && (imgRef.current.value = '')
        } catch (e) {
          console.log(e)
        }
      }
    })
  }

  const removeImg = () => {
    setFileList([])
    onChange && onChange('')
  }

  return (
    <Box>
      <Box position="relative">
        {
          loading && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '66px',
                height: '62px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}
            >
              <CircularProgress />
            </Box>
          )
        }
        {
          fileList.length > 0 && (
            <CancelIcon onClick={removeImg} sx={{ cursor: 'pointer', position: 'absolute', top: '0px', right: '2px', zIndex: 1 }} />
          )
        }
        <IconButton component="label">
          <Avatar src={fileList.length > 0 ? fileList[0] : null} sx={{ width: 50, height: 50, border: '1px solid #dedede' }}></Avatar>
          <input ref={imgRef} type="file" accept="image/*" hidden onChange={imgChange} />
        </IconButton>
      </Box>
    </Box>
  )
}
