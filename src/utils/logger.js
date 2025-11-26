const isDevelopment = () => {
    return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

const isDebugEnabled = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return localStorage.getItem('DEBUG_MODE') === 'true' || isDevelopment();
};

const noop = () => { };

const createLogger = (prefix = '') => {
    const formatMessage = (message, ...args) => {
        return prefix ? `${prefix} ${message}` : message;
    };

    return {
        log: (...args) => {
            if (isDebugEnabled()) {
                console.log(formatMessage(...args));
            }
        },
        info: (...args) => {
            if (isDebugEnabled()) {
                console.info(formatMessage(...args));
            }
        },
        warn: (...args) => {
            if (isDebugEnabled()) {
                console.warn(formatMessage(...args));
            }
        },
        error: (...args) => {
            console.error(formatMessage(...args));
        },
        debug: (...args) => {
            if (isDebugEnabled()) {
                console.debug(formatMessage(...args));
            }
        }
    };
};

export const logger = createLogger();
export const apiLogger = createLogger('[api]');
export const envLogger = createLogger('[env]');

export const enableDebugMode = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('DEBUG_MODE', 'true');
        console.log('🐛 调试模式已开启');
    }
};

export const disableDebugMode = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('DEBUG_MODE');
        console.log('✅ 调试模式已关闭');
    }
};

export default logger;

