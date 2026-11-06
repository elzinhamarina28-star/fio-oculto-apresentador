import { useEffect, useRef, useState } from "react";

interface FirstCommentDetail {
  user?: string;
  text?: string;
}

interface TvComment extends FirstCommentDetail {
  id: number;
  character: "owl" | "ghost";
}

const cleanForSpeech = (value: string, max = 180) =>
  value.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

/**
 * In-scene television. Every viewer activates it only on their first comment
 * during this page session. Browser speech is independent from ElevenLabs.
 */
export function StudioTelevision() {
  const [comment, setComment] = useState<TvComment | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const sequence = useRef(0);
  const voiceEnabledRef = useRef(false);
  const queueRef = useRef<string[]>([]);
  const activeRef = useRef(false);

  useEffect(() => {
    const speakNext = () => {
      if (!voiceEnabledRef.current || activeRef.current || queueRef.current.length === 0) return;
      const line = queueRef.current.shift();
      if (!line || !("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(line);
      const voices = window.speechSynthesis.getVoices();
      const portuguese = voices.find((voice) => voice.lang.toLowerCase() === "pt-br")
        ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("pt"));
      if (portuguese) utterance.voice = portuguese;
      utterance.lang = portuguese?.lang ?? "pt-BR";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      activeRef.current = true;
      setSpeaking(true);
      const finish = () => {
        activeRef.current = false;
        setSpeaking(false);
        window.setTimeout(speakNext, 180);
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
    };

    const enableVoice = () => {
      voiceEnabledRef.current = true;
      setVoiceEnabled(true);
      window.speechSynthesis?.resume();
      speakNext();
    };

    const onFirstComment = (event: Event) => {
      const detail = (event as CustomEvent<FirstCommentDetail>).detail ?? {};
      const user = cleanForSpeech(detail.user || "Visitante", 48) || "Visitante";
      const text = cleanForSpeech(detail.text || "Acabei de chegar!", 180) || "Acabei de chegar!";
      const next = sequence.current++;
      const character = next % 2 === 0 ? "owl" : "ghost";
      setComment({ id: next, character, user, text });
      queueRef.current.push(`${user} comentou: ${text}`);
      speakNext();
    };

    window.addEventListener("fio:tv-enable-voice", enableVoice);
    window.addEventListener("fio:tv-first-comment", onFirstComment);
    return () => {
      window.removeEventListener("fio:tv-enable-voice", enableVoice);
      window.removeEventListener("fio:tv-first-comment", onFirstComment);
      queueRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!comment) return;
    const timer = window.setTimeout(() => setComment(null), 10000);
    return () => window.clearTimeout(timer);
  }, [comment]);

  return (
    <div className="studio-tv" data-active={Boolean(comment)} aria-live="polite" aria-label="Televisão interativa do estúdio">
      <div className="studio-tv-frame">
        <div className="studio-tv-screen">
          {comment ? (
            <div key={comment.id} className={`studio-tv-show studio-tv-${comment.character}`}>
              <div className="studio-tv-character" aria-hidden="true">
                {comment.character === "owl" ? (
                  <><span className="tv-owl-ears">◆ ◆</span><span className="tv-owl-face"><i>●</i><i>●</i><b className={speaking ? "talking" : ""} /></span><span className="tv-owl-body">🦉</span></>
                ) : (
                  <><span className="tv-ghost-halo">✦</span><span className="tv-ghost-face"><i>●</i><i>●</i><b className={speaking ? "talking" : ""} /></span><span className="tv-ghost-body">👻</span></>
                )}
              </div>
              <div className="studio-tv-caption">
                <strong>{comment.character === "owl" ? "OLÍVIA, A CORUJA" : "NINO, O FANTASMINHA"}</strong>
                <span>{comment.user}</span>
                <p>{comment.text}</p>
                <small>{speaking ? "Falando o comentário…" : voiceEnabled ? "Comentário recebido" : "Ative o áudio para ouvir a TV"}</small>
              </div>
            </div>
          ) : (
            <div className="studio-tv-idle"><span>📺</span><small>CANAL FIO OCULTO</small></div>
          )}
        </div>
        <div className="studio-tv-controls"><i /><i /><i /></div>
      </div>
    </div>
  );
}
