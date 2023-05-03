import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import useAPI from "../../hooks/useAPI";
import { useFeedback } from "../Feedback";
import UploadView from "../UploadAvatarView";
import { useFormik } from "formik";
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
  const { showToast } = useFeedback();

  const formik = useFormik({
    initialValues: {
      name: "",
      definition: "",
      avatar: "",
      model: "gpt-3.5-turbo-0301",
      temperature: 1,
      frequencyPenalty: 0
    },
    onSubmit: (values) => {
      character?.id
        ? handleSaveCharacter(values)
        : handleCreateCharacter(values);
    },
  });

  const handleCreateCharacter = (values: any) => {
    characterApi
      .createCharacter(values)
      .then(() => {
        formik.resetForm();
        onCreated?.();
        showToast("角色创建成功");
      })
      .catch((e) => {
        showToast(e.message, 1);
      });
  };

  const handleSaveCharacter = (values: any) => {
    characterApi
      .editCharacter(character.id, values)
      .then(() => {
        formik.resetForm();
        onCreated?.();
        showToast("角色保存成功");
      })
      .catch((e) => {
        showToast(e.message, 1);
      });
  };

  useEffect(() => {
    if (character) {
      formik.setValues({
        name: character.name,
        definition: character.definition,
        avatar: character.avatar,
        model: character.model,
        temperature: character.temperature,
        frequencyPenalty: character.frequencyPenalty
      });
    }else{
      formik.setValues({
        name: "",
        definition: "",
        avatar: "",
        model:  "gpt-3.5-turbo-0301",
        temperature: 1,
        frequencyPenalty: 0
      });
    }

  }, [character]);

  return (
    <Dialog {...props}>
      <DialogTitle>{character?.name ? "角色编辑" : "创建角色"}</DialogTitle>
      <DialogContent>
        <Box component="form" py={1} onSubmit={formik.handleSubmit}>
          {/* <UploadView 
            filePath={formik.values.avatar}
            onValueChange={(value) => {
              formik.setFieldValue("avatar", value)
            }}
          /> */}
          <TextField
            sx={{ marginTop: "12px" }}
            label="角色名"
            fullWidth
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <TextField
            sx={{ marginTop: "12px" }}
            label="角色定义"
            placeholder=""
            fullWidth
            multiline
            rows={4}
            name="definition"
            value={formik.values.definition}
            onChange={formik.handleChange}
          />
          <TextField name="model" select value={formik.values.model} onChange={formik.handleChange} sx={{ marginTop: "12px" }} label="模型" fullWidth>
            <MenuItem value="gpt-3.5-turbo-0301">GPT-3.5</MenuItem>
            <MenuItem value="gpt-4">GPT-4</MenuItem>
          </TextField>
          <FormControl sx={{marginTop: '12px'}} fullWidth>
            <FormLabel>随机性 <Typography variant="caption">低（保守，每次基本一样），中，高（创新性强，也容易出错）  </Typography></FormLabel>
            {/* <RadioGroup name="temperature" row value={formik.values.temperature} onChange={formik.handleChange} >
              <FormControlLabel value={0} control={<Radio />} label="低"/>
              <FormControlLabel value={1} control={<Radio />} label="中"/>
              <FormControlLabel value={2} control={<Radio />} label="高"/>
            </RadioGroup> */}
            <Slider 
              name="temperature"
              value={formik.values.temperature}
              onChange={(_, value) => {
                formik.setFieldValue("temperature", value)
              }}
              min={0}
              max={2}
              step={0.1}
              marks={[
                {
                  value: 0,
                  label: '低',
                  
                },
                {
                  value: 1,
                  label: '中',
                },
                {
                  value: 2,
                  label: '高',
                }, 
              ]}
              />
          </FormControl>
          
          <br></br>
          <FormControl sx={{marginTop: '12px'}} fullWidth>
            <FormLabel>重复性 <Typography variant="caption">低（更多重复），中，高（很少重复，尝试新词）</Typography></FormLabel>
            {/* <RadioGroup name="frequencyPenalty" row value={formik.values.frequencyPenalty} onChange={formik.handleChange}>
              <FormControlLabel value={-2} control={<Radio />} label="低"/>
              <FormControlLabel value={0} control={<Radio />} label="中"/>
              <FormControlLabel value={2} control={<Radio />} label="高"/>
            </RadioGroup> */}
            <Slider 
              name="frequencyPenalty"
              value={formik.values.frequencyPenalty}
              onChange={(_, value) => {
                formik.setFieldValue("frequencyPenalty", value)
              }}
              min={-2}
              max={2}
              step={0.1}
              marks={[
                {
                  value: -2,
                  label: '低',
                },
                {
                  value: 0,
                  label: '中',
                },
                {
                  value: 2,
                  label: '高',
                }, 
              ]}
            />
          </FormControl>
          

          <Button
            disabled={!formik.values.name || !formik.values.definition}
            sx={{ marginTop: "20px" }}
            variant="contained"
            fullWidth
            type="submit"
          >
            {character?.name ? "保存" : "确定"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
