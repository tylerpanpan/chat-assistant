import { useFeedback } from "../components/Feedback";
import { useAuth } from "../provider/AuthProvider";

export const useClipboard = () => {
  const { showToast } = useFeedback()
  const { user } = useAuth()
  const copy = (text: string) => {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text + `\nAI个人助理：https://grzl.ai/${user?.username ? '?invite=' + user?.id : ''}`;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    showToast("已拷贝到剪贴板");
  }

  return {
    copy
  }
};