import { useEffect } from 'react';
import languageToggle from '../languageToggleHelper';
import { useTranslation } from 'react-i18next';

interface AppEvent extends CustomEvent<{ language: string }> {}

export default function useAppLanguageToggle(dataBundles: string[] = []): void {
  const { i18n } = useTranslation();
  useEffect(() => {
    const eventHandler = (e: Event) => {
      const event = e as AppEvent;
      languageToggle(event.detail.language, i18n, dataBundles);
    };
    window.addEventListener('APP_LANGUAGE_TOGGLE', eventHandler);
    return () => {
      window.removeEventListener('APP_LANGUAGE_TOGGLE', eventHandler);
    };
  }, []);
}
