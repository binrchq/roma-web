/**
 * 环境配置工具
 * 用于管理不同环境的配置信息
 */

// 获取当前环境
export const getCurrentEnv = () => {
    return import.meta.env.VITE_ENV || 'development';
};

// 获取API基础地址
export const getApiBaseUrl = () => {
    // 优先使用环境变量配置的API地址
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;
    if (envApiUrl) {
        return envApiUrl;
    }

    // 根据环境自动判断API地址
    const hostname = window.location.hostname;

    if (isDevelopment()) {
        // 开发环境：使用代理或本地后端
        return '/api'; // Vite代理会自动转发到后端
    }

    if (isTest()) {
        // 测试环境：web-test.meshwise.cn -> plat-test.meshwise.cn
        return 'https://plat-test.meshwise.cn';
    }

    if (isStaging()) {
        // 预发布环境：web-staging.meshwise.cn -> plat-staging.meshwise.cn
        return 'https://plat-staging.meshwise.cn';
    }

    if (isProduction()) {
        // 生产环境：web.meshwise.cn -> plat.meshwise.cn
        return 'https://plat.meshwise.cn';
    }

    // 默认开发环境地址
    return 'http://localhost:8112';
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
