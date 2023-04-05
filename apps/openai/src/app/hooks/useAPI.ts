import { API } from "../api";
import { useAuth } from "../provider/AuthProvider";


export default () => {
  const { token, logout } = useAuth();
  const api = new API(token, '', logout);
  return api;
};
