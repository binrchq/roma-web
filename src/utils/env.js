const PLACEHOLDER_FLAG = 'PLACEHOLDER';

const pickRuntimeValue = (raw) => {
    if (!raw) {
        return null;
    }
    return raw.includes(PLACEHOLDER_FLAG) ? null : raw;
};

const normalizeUrl = (url) => {
    if (!url) {
        return url;
    }
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

const runtimeEnv = pickRuntimeValue('VITE_ENV_PLACEHOLDER');
const runtimeApiBaseUrl = normalizeUrl(pickRuntimeValue('VITE_API_BASE_URL_PLACEHOLDER'));

const isLocalhost = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    const hostname = window.location.hostname;
    return hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.')
};

const isDevelopmentEnv = () => {
    return import.meta.env.DEV || isLocalhost();
};

export const getCurrentEnv = () => {
    if (runtimeEnv) {
        return runtimeEnv;
    }
    if (isDevelopmentEnv()) {
        return 'development';
    }
    return 'production';
};

export const getApiBaseUrl = () => {
    // 优先级1: 如果有运行时注入配置，优先使用（无论在什么环境访问）
    if (runtimeApiBaseUrl) {
        console.log('[env] ✓ 使用运行时注入的 API 地址:', runtimeApiBaseUrl);
        return runtimeApiBaseUrl;
    }

    // 优先级2: Vite 开发模式（npm run dev）
    if (import.meta.env.DEV) {
        console.log('[env] ✓ Vite 开发模式，使用代理: /api');
        return '/api';
    }

    // 优先级3: 生产构建但在本地访问（用于本地测试）
    if (isLocalhost()) {
        console.log('[env] ⚠️  本地访问生产构建，使用代理: /api（建议配置 VITE_API_BASE_URL）');
        return '/api';
    }

    // 优先级4: 无配置且非本地环境，报错
    throw new Error('[env] ❌ 生产环境缺少 VITE_API_BASE_URL 运行时注入，请检查部署配置');
};

export const isDevelopment = () => getCurrentEnv() === 'development';
export const isProduction = () => {
    const env = getCurrentEnv();
    return env === 'prod' || env === 'production';
};
export const isTest = () => getCurrentEnv() === 'test';
export const isStaging = () => getCurrentEnv() === 'staging';
export const isDemo = () => {
    if (getCurrentEnv() === 'demo') {
        return true;
    }
    if (typeof window === 'undefined') {
        return false;
    }
    return window.location.hostname.includes('demo') || window.location.hostname.includes('demo.roma');
};

export const getEnvConfig = () => ({
    env: getCurrentEnv(),
    apiBaseUrl: getApiBaseUrl(),
    isDev: isDevelopment(),
    isProd: isProduction(),
    isTest: isTest(),
    isStaging: isStaging(),
    isDemo: isDemo()
});

export const logEnvInfo = () => {
    if (isDevelopment()) {
        console.log('🌍 当前环境配置:', getEnvConfig());
    }
};
