import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AvatarSpeechBubbleOptions = {
  messages?: string[];
  preferredMessages?: string[];
  fallbackMessages?: string[];
  active?: boolean;
  initialDelayMs?: [number, number];
  visibleDurationMs?: [number, number];
  repeatDelayMs?: [number, number];
};

type AvatarSpeechBubbleState = {
  message: string;
  visible: boolean;
};

const DEFAULT_INITIAL_DELAY_MS: [number, number] = [1500, 3000];
const DEFAULT_VISIBLE_DURATION_MS: [number, number] = [2000, 4000];
const DEFAULT_REPEAT_DELAY_MS: [number, number] = [8000, 16000];

const randomInRange = ([min, max]: [number, number]) => {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  return lower + Math.floor(Math.random() * (upper - lower + 1));
};

export function useAvatarSpeechBubble({
  messages = [],
  preferredMessages = [],
  fallbackMessages = [],
  active = true,
  initialDelayMs,
  visibleDurationMs,
  repeatDelayMs,
}: AvatarSpeechBubbleOptions) {
  const [state, setState] = useState<AvatarSpeechBubbleState>({
    message: '',
    visible: false,
  });

  const timeoutRef = useRef<number | null>(null);
  const messageIndexRef = useRef(0);
  const mountedRef = useRef(true);
  const resolvedInitialDelayMs = initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;
  const resolvedVisibleDurationMs = visibleDurationMs ?? DEFAULT_VISIBLE_DURATION_MS;
  const resolvedRepeatDelayMs = repeatDelayMs ?? DEFAULT_REPEAT_DELAY_MS;
  const allMessages = useMemo(
    () => [...preferredMessages, ...messages, ...fallbackMessages].filter((message): message is string => Boolean(message && message.trim())),
    [fallbackMessages, messages, preferredMessages]
  );

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const nextMessage = useCallback(() => {
    if (allMessages.length === 0) return '';
    if (allMessages.length === 1) return allMessages[0];

    const nextIndex = (messageIndexRef.current + 1 + Math.floor(Math.random() * (allMessages.length - 1))) % allMessages.length;
    messageIndexRef.current = nextIndex;
    return allMessages[nextIndex];
  }, [allMessages]);

  const showBubble = useCallback((message?: string) => {
    if (!mountedRef.current || allMessages.length === 0) return;

    clearTimer();

    const nextText = message ?? nextMessage();
    setState({ message: nextText, visible: true });

    const hideAfter = randomInRange(resolvedVisibleDurationMs);
    timeoutRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setState(current => ({ ...current, visible: false }));

      const restartAfter = randomInRange(resolvedRepeatDelayMs);
      timeoutRef.current = window.setTimeout(() => {
        if (!mountedRef.current || !active) return;
        showBubble();
      }, restartAfter);
    }, hideAfter);
  }, [active, allMessages.length, nextMessage, resolvedRepeatDelayMs, resolvedVisibleDurationMs]);

  useEffect(() => {
    mountedRef.current = true;
    clearTimer();

    if (!active || allMessages.length === 0) {
      setState(current => ({ ...current, visible: false }));
      return () => {
        mountedRef.current = false;
        clearTimer();
      };
    }

    timeoutRef.current = window.setTimeout(() => {
      if (mountedRef.current && active) {
        showBubble();
      }
    }, randomInRange(resolvedInitialDelayMs));

    return () => {
      mountedRef.current = false;
      clearTimer();
    };
  }, [active, allMessages.length, resolvedInitialDelayMs, showBubble]);

  const triggerBubble = useCallback(() => {
    if (allMessages.length === 0) return;
    showBubble(nextMessage());
  }, [allMessages.length, nextMessage, showBubble]);

  return {
    message: state.message,
    visible: state.visible,
    triggerBubble,
  };
}
