import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import en from './locales/en';
import fr from './locales/fr';
import es from './locales/es';
import pt from './locales/pt';
import de from './locales/de';
import it from './locales/it';
import nl from './locales/nl';
import ru from './locales/ru';
import ja from './locales/ja';
import ko from './locales/ko';
import zh from './locales/zh';
import ar from './locales/ar';
import hi from './locales/hi';
import tr from './locales/tr';
import pl from './locales/pl';

const i18n = new I18n({
  en, fr, es, pt, de, it, nl, ru, ja, ko, zh, ar, hi, tr, pl,
});

i18n.defaultLocale = 'en';
i18n.enableFallback = true;

const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
i18n.locale = deviceLocale;

export default i18n;

// date-fns locale mapping
export function getDateLocale() {
  const code = i18n.locale;
  // Lazy import to avoid bundling all locales
  switch (code) {
    case 'fr': return require('date-fns/locale/fr').fr;
    case 'es': return require('date-fns/locale/es').es;
    case 'pt': return require('date-fns/locale/pt').pt;
    case 'de': return require('date-fns/locale/de').de;
    case 'it': return require('date-fns/locale/it').it;
    case 'nl': return require('date-fns/locale/nl').nl;
    case 'ru': return require('date-fns/locale/ru').ru;
    case 'ja': return require('date-fns/locale/ja').ja;
    case 'ko': return require('date-fns/locale/ko').ko;
    case 'zh': return require('date-fns/locale/zh-CN').zhCN;
    case 'ar': return require('date-fns/locale/ar').ar;
    case 'hi': return require('date-fns/locale/hi').hi;
    case 'tr': return require('date-fns/locale/tr').tr;
    case 'pl': return require('date-fns/locale/pl').pl;
    default: return require('date-fns/locale/en-US').enUS;
  }
}
