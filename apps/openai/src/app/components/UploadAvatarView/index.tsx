import React, { useEffect, useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import { FilePondFile } from "filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { Box, BoxProps } from "@mui/system";
import { STORE_TOKEN_KEY } from "../../provider/AuthProvider";

registerPlugin(FilePondPluginImagePreview);
registerPlugin(FilePondPluginImageCrop);

interface UploadViewProps extends BoxProps {
  filePath?: string;
  onValueChange?: (path?: string) => void;
}
function UploadView({ filePath, onValueChange, ...props }: UploadViewProps) {
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    console.info(filePath)
    if (filePath) {
      setFiles([{ source: filePath, options: { type: "local" } }]);
    }
  }, [filePath]);

  const handleUpdate = (remove: boolean) => (e: any, file: FilePondFile) => {
    if (remove) {
      onValueChange && onValueChange(undefined);
      setFiles([]);
      return;
    }
    if (file.serverId) {
      onValueChange && onValueChange(file.serverId);
    }
  };

  useEffect(() => {
    if (files.length > 0) {
      if (files[0].source && typeof files[0].source !== "string") {
        return;
      }
      onValueChange && onValueChange(files[0].serverId || files[0].source);
    }
  }, [files]);

  return (
    <Box width="120px" height="120px" {...props}>
      <FilePond
        labelIdle="点击上传头像"
        files={files}
        onupdatefiles={setFiles}
        acceptedFileTypes={["jpeg", "jpg", "png"]}
        maxFiles={1}
        stylePanelAspectRatio="1:1"
        stylePanelLayout="compact circle"
        imageCropAspectRatio="1:1"
        imagePreviewHeight={120}
        credits={false}
        styleProgressIndicatorPosition="center bottom"
        styleButtonRemoveItemPosition="center bottom"
        styleButtonProcessItemPosition="center bottom"
        name="file"
        server={{
          process: `/api/upload`,
          fetch: null,
          headers: {
            Authorization: `Bearer ${localStorage.getItem(STORE_TOKEN_KEY)}`,
          },
          load: (source, load, error, progress, abort, headers) => {
            const myRequest = new Request(source);
            fetch(myRequest)
              .then((response) => response.blob())
              .then((blob) => {
                load(blob);
              })
              .catch((e) => {
                error(e.message);
              });
          },
          revert: () => {},
        }}
        onprocessfile={handleUpdate(false)}
        onremovefile={handleUpdate(true)}
      />
    </Box>
  );
}

export default UploadView;
