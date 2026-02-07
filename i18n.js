import { execSync } from 'child_process';
import zh from './locales/zh.js';
import en from './locales/en.js';

const locales = { en, zh };

// 只区分 zh / en：默认英文，检测到中文则用中文
export const detectLocale = () => {
  // 1. 显式环境变量强制覆盖：DUAL_SUBTITLE_LANG=zh/en
  const override = (process.env.DUAL_SUBTITLE_LANG || '').toLowerCase();
  if (override === 'zh' || override === 'en') {
    return override;
  }

  // 2. 终端相关环境变量
  const env =
    process.env.LC_ALL ||
    process.env.LC_MESSAGES ||
    process.env.LANG ||
    '';
  const envLower = String(env).toLowerCase();
  if (envLower.includes('zh')) return 'zh';

  // 3. Node Intl 默认 locale
  const intl = Intl.DateTimeFormat().resolvedOptions().locale || '';
  const intlLower = String(intl).toLowerCase();
  if (intlLower.startsWith('zh')) return 'zh';

  // 4. macOS 上读取系统首选语言（AppleLanguages）
  if (process.platform === 'darwin') {
    try {
      const out = execSync('defaults read -g AppleLanguages', { encoding: 'utf8' });
      if (String(out).toLowerCase().includes('zh')) {
        return 'zh';
      }
    } catch (e) {
      // 忽略读取失败，继续走默认逻辑
    }
  }

  // 5. 默认英文
  return 'en';
};

const activeLocale = detectLocale();
const dict = locales[activeLocale] || locales.en;

/**
 * t('key', params) -> string
 * key 对应 locales 里的字段；字段可为字符串或 (params) => string
 */
export const t = (key, params = {}) => {
  const value = dict[key];
  if (typeof value === 'function') {
    return value(params);
  }
  if (typeof value === 'string') {
    return value;
  }
  // 未配置的 key，回退为 key 本身，方便在开发时发现问题
  return key;
};

