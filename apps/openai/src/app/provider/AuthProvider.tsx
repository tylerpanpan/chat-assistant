import React, { FC, useEffect, useState } from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router';
import { useBlocker } from 'react-router/dist/lib/hooks';
import { LoginModal } from '../components/LoginModal';
const STORE_TOKEN_KEY = '__app_token';
const STORE_USER_KEY = '__app_user';

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

  useEffect(() => {
    // const unlock = history.block((location) => {
    //   // if (needAuth(location.pathname)) {
    //   //   if (!token) {
    //   //     showLogin((data) => {
    //   //       if (data && data.token) {
    //   //         // console.info(data);
    //   //         login(data.token, data.user);
    //   //       }
    //   //     });
    //   //     return false;
    //   //   }
    //   // }
    // });
    // return () => {
    //   unlock();
    // };
  }, [token]);

  const login = (token: string, user: any) => {
    setToken(token);
    setUser(user);
    localStorage.setItem(STORE_TOKEN_KEY, token);
    localStorage.setItem(STORE_USER_KEY, JSON.stringify(user));
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

  useEffect(()=> {
    if(token){
      setShowLoginModal(false)
    }
  },[token])

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
