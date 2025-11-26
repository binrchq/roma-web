/**
 * 环境配置工具
 * 用于管理不同环境的配置信息
 */

// 获取当前环境
// 使用占位符 'VITE_ENV_PLACEHOLDER'，在容器启动时由 docker-entrypoint.sh 替换
export const getCurrentEnv = () => {
    // 运行时环境变量占位符（会被 docker-entrypoint.sh 替换）
    const runtimeEnv = 'VITE_ENV_PLACEHOLDER';

    // 如果占位符没有被替换，使用构建时环境变量或默认值
    if (runtimeEnv === 'VITE_ENV_PLACEHOLDER' || runtimeEnv.includes('PLACEHOLDER')) {
        return import.meta.env.VITE_ENV || 'development';
    }

    // 返回运行时替换的值
    return runtimeEnv;
};

// 获取API基础地址
// 使用占位符 'VITE_API_BASE_URL_PLACEHOLDER'，在容器启动时由 docker-entrypoint.sh 替换
// 注意：占位符必须是一个完整的字符串常量，不能包含变量或表达式，以确保构建后能被正确替换
export const getApiBaseUrl = () => {
    // 运行时环境变量占位符（会被 docker-entrypoint.sh 替换）
    // 使用单引号字符串，确保构建后格式一致
    const runtimeApiUrl = 'VITE_API_BASE_URL_PLACEHOLDER';

    // 如果占位符没有被替换（开发环境），使用构建时环境变量或默认值
    // 检查占位符是否仍然存在（可能被压缩成不同格式）
    if (runtimeApiUrl === 'VITE_API_BASE_URL_PLACEHOLDER' || runtimeApiUrl.includes('PLACEHOLDER')) {
        // 构建时注入的环境变量
        const envApiUrl = import.meta.env.VITE_API_BASE_URL;
        if (envApiUrl) {
            console.log('[env] Using build-time VITE_API_BASE_URL:', envApiUrl);
            return envApiUrl;
        }

        // 开发环境：使用代理或本地后端
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
            console.log('[env] Using relative path /api for development');
            return '/api'; // Vite代理会自动转发到后端
        }

        // 默认：使用相对路径，由 nginx 代理处理
        console.warn('[env] Placeholder not replaced, using default /api');
        return '/api';
    }

    // 返回运行时替换的值
    console.log('[env] Using runtime replaced API URL:', runtimeApiUrl);
    return runtimeApiUrl;
};


// 检查是否为开发环境
export const isDevelopment = () => {
    return getCurrentEnv() === 'development';
};

// 检查是否为生产环境
export const isProduction = () => {
    return getCurrentEnv() === 'prod';
};

// 检查是否为测试环境
export const isTest = () => {
    return getCurrentEnv() === 'test';
};

// 检查是否为预发布环境
export const isStaging = () => {
    return getCurrentEnv() === 'staging';
};

// 检查是否为演示环境
export const isDemo = () => {
    return import.meta.env.VITE_DEMO === 'true' ||
        import.meta.env.VITE_ENV === 'demo' ||
        window.location.hostname.includes('demo') ||
        window.location.hostname.includes('demo.roma');
};

// 获取环境配置信息
export const getEnvConfig = () => {
    return {
        env: getCurrentEnv(),
        apiBaseUrl: getApiBaseUrl(),
        isDev: isDevelopment(),
        isProd: isProduction(),
        isTest: isTest(),
        isStaging: isStaging(),
        isDemo: isDemo()
    };
};

// 打印环境信息（开发环境使用）
export const logEnvInfo = () => {
    if (isDevelopment()) {
        console.log('🌍 当前环境配置:', getEnvConfig());
    }
}; 
