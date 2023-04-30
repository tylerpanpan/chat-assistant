import React, { useState } from "react";
import { useContext } from "react";
import { Howl } from "howler";
import { useAuth } from "./AuthProvider";
interface AudioContextType {
  tts: (text: string, key?: string) => void;
}
const AudioContext = React.createContext<AudioContextType>({
  tts: () => {},
});

export const AudioProvider = ({ children }: { children: any }) => {
  const { token } = useAuth()
  const [howl, setHowl] = useState<Howl | null>(null);
  const tts = (text: string, key?: string) => {
    if(howl){
      howl.stop()
    }
    let _howl = new Howl({
      src: `/api/speech/tts?text=${encodeURIComponent(text)}`,
      format: ["mp3"],
      xhr: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })
    _howl.play()
    setHowl(_howl)
  };

  return (
    <AudioContext.Provider
      value={{
        tts,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
