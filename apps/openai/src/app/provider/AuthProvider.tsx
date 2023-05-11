import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import { LoginModal } from '../components/LoginModal';
import localForage from "localforage";
import { useQuery } from "react-query";
import useAPI from "../hooks/useAPI";
export const STORE_TOKEN_KEY = '__app_token';
export const STORE_USER_KEY = '__app_user';

interface AuthContextType {
  token?: string;
  authed: boolean;
  user?: any;
  login: (token: string, user: any) => void;
  logout: () => void;
  showLogin: (type?: boolean) => void;
}
const AuthContext = React.createContext<AuthContextType>({
  authed: false,
  login: (token, user) => {},
  logout: () => {},
  showLogin: (type) => {},
});

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { userApi } = useAPI();
  const [token, setToken] = useState<string>();
  const [user, setUser] = useState<any>();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem(STORE_TOKEN_KEY);
      if (token) {
        setToken(token);
      }
      const user = localStorage.getItem(STORE_USER_KEY);
      if (user) {
        setUser(JSON.parse(user));
      }
    } catch (e) {}
  }, []);

  useQuery(
    ["ipLogin"],
    () => userApi.ipLogin(),
    {
      enabled: !localStorage.getItem('__app_token'),
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        localForage.setItem('character-chat', null)
        login(data.access_token, data.user)
      },
    }
  );

  const login = (token: string, user: any) => {
    setToken(token);
    setUser(user);
    localStorage.setItem(STORE_TOKEN_KEY, token);
    localStorage.setItem(STORE_USER_KEY, JSON.stringify(user));
    localForage.setItem('character-chat', null)
  };

  const logout = () => {
    setToken(undefined);
    setUser(undefined);
    localStorage.removeItem(STORE_TOKEN_KEY);
    localStorage.removeItem(STORE_USER_KEY);
  };

  const showLogin = (type = false) => {
    setIsRegister(!!type)
    setShowLoginModal(true)
  };

  const handleClose = () => {
    setShowLoginModal(false)
  }

  return (
    <AuthContext.Provider
      value={{
        authed: !!token,
        token: token,
        user,
        login,
        logout,
        showLogin,
      }}
    >
      {children}
      <LoginModal register={isRegister ? 1 : 0} onClose={handleClose} open={showLoginModal} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
