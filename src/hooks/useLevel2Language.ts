/**
 * Level 2 Language Hook
 * 
 * Uses useSyncExternalStore for zero-overhead subscription to the
 * language store. On first render (L1), returns English fallbacks.
 * After bootstrap completes, triggers seamless re-render with
 * detected language translations.
 * 
 * Usage: const { t, language, ready, setLanguage, allLanguages } = useLevel2Language();
 *        <h1>{t('hero.title', 'Trusted Premium Shuttle Service')}</h1>
 */

import { useSyncExternalStore, useCallback, useEffect } from 'react';
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  bootstrap,
  switchLang,
  ALL_LANGUAGES,
} from '@/lib/level2-language';
import type { Language } from '@/contexts/LanguageContext';

export function useLevel2Language({ translateEnglish = false }: { translateEnglish?: boolean } = {}) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const source = snap.translations ?? (translateEnglish ? snap.allTranslations?.en : null);

  // Trigger bootstrap after first paint (idempotent — only runs once)
  useEffect(() => {
    bootstrap();
  }, []);

  /**
   * Translate a key with English fallback.
   * On L1 (translations === null): returns fallback immediately.
   * On L2+ (translations loaded): returns translated string.
   */
  const t = useCallback(
    (key: string, fallback: string): string => {
      const tr = source;
      if (!tr) return fallback;

      const parts = key.split('.');
      let value: any = tr;
      for (const p of parts) {
        if (value && typeof value === 'object' && p in value) {
          value = value[p];
        } else {
          return fallback;
        }
      }
      return typeof value === 'string' ? value : fallback;
    },
    [source]
  );

  return {
    t,
    language: snap.language,
    ready: snap.ready,
    setLanguage: switchLang,
    allLanguages: ALL_LANGUAGES,
  };
}

export type { Language };
