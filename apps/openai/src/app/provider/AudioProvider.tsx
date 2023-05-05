import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { Howl } from "howler";
import { useAuth } from "./AuthProvider";
interface AudioContextType {
  tts: (text: string, key?: string) => void;
  append: (text: string, key?: string) => void;
  stop: () => void;
}
const AudioContext = React.createContext<AudioContextType>({
  tts: () => {},
  append: () => {},
  stop: () => {},
});

export const AudioProvider = ({ children }: { children: any }) => {
  const { token } = useAuth();

  const [playHowl, setPlayHowl] = useState<Howl | null>(null);
  const [loadHowl, setLoadHowl] = useState<Howl | null>(null);
  const [playQueue, setPlayQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [loadIndex, setLoadIndex] = useState<number | null>(null);
  const [currentKey, setCurrentKey] = useState<string>();

  const append = (text: string, key?: string) => {
    if (!text) {
      return;
    }
    const sentences = splitText(text);
    setPlayQueue([...playQueue, ...sentences]);
  };

  const tts = (text: string, key?: string) => {
    if (!text) {
      return;
    }
    if (playHowl) {
      playHowl.stop();
      setPlayHowl(null);
    }
    if (loadHowl) {
      loadHowl.stop();
      setLoadHowl(null);
    }
    const sentences = splitText(text);
    setPlayQueue([...sentences]);
    setCurrentIndex(0);
    setCurrentKey(key);
  };

  const stop = (key?: string) => {
    if (playHowl) {
      playHowl.stop();
      setPlayHowl(null);
    }
    if (loadHowl) {
      loadHowl.stop();
      setLoadHowl(null);
    }
    setPlayQueue([]);
    setCurrentIndex(null);
    setLoadIndex(null);
    setCurrentKey(undefined);
  };

  useEffect(() => {
    if (playHowl) {
      playHowl.play();
    }
  }, [playHowl]);

  useEffect(() => {
    if (
      playQueue.length > 0 &&
      currentIndex !== null &&
      currentIndex < playQueue.length &&
      playHowl === null
    ) {
      if (currentIndex === 0) {
        const playHowl = load(playQueue[currentIndex]);
        playHowl.on("end", () => {
          setCurrentIndex(currentIndex + 1);
          console.info("set next index", currentIndex + 1);
          setPlayHowl(null);
        });
        setPlayHowl(playHowl);
      } else {
        if (loadHowl) {
          loadHowl.on("end", () => {
            setCurrentIndex(currentIndex + 1);
            setPlayHowl(null);
            console.info("set next index 1", currentIndex + 1);
          });
          setPlayHowl(loadHowl);
          setLoadHowl(null);
        }
      }
      setLoadIndex(currentIndex + 1);
    }
  }, [currentIndex, playQueue, loadHowl, playHowl]);

  useEffect(() => {
    if (
      loadIndex !== null &&
      loadIndex < playQueue.length &&
      loadIndex > 0 &&
      playQueue.length > 0
    ) {
      const loadHowl = load(playQueue[loadIndex]);
      setLoadHowl(loadHowl);
    }
  }, [loadIndex, playQueue]);

  /*
   * split text into sentences
   * if sentence is less 20 chars, merge it with the next sentence
   */
  const splitText = (text: string) => {
    const sentences = text.match(/[^.!?。！？]+[.!?。！？]/g);
    if (!sentences) {
      return [text];
    }
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].length < 20) {
        sentences[i + 1] = sentences[i] + sentences[i + 1];
        sentences.splice(i, 1);
        i--;
      }
    }
    return sentences;
  };

  const load = (text: string) => {
    let _howl = new Howl({
      src: `/api/speech/tts?text=${encodeURIComponent(text)}`,
      format: ["mp3"],
      xhr: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    return _howl;
  };

  return (
    <AudioContext.Provider
      value={{
        tts,
        stop,
        append
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
