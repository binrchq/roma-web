// ROMA API 请求封装
// 基于 request.js 的模式，但适配 ROMA API 的认证方式（使用 apikey）

import { getApiBaseUrl } from '@/utils/env'

const httpRequest = function (url, paramet, method, showToast = false, publicRequest = false, contentType = 'application/json') {
    // ROMA API 基础路径 - 使用环境配置的 API URL
    const apiBaseUrl = getApiBaseUrl();
    // 如果 API URL 是完整 URL（如 https://roma-api.c.binrc.com），直接使用
    // 如果是相对路径（如 /api），拼接 /v1/
    let BASE_URL;
    if (apiBaseUrl.startsWith('http')) {
        // 完整 URL：直接使用，假设已经包含 /api/v1/ 或类似路径
        // 如果 VITE_API_BASE_URL 是 https://roma-api.c.binrc.com，需要拼接 /api/v1/
        BASE_URL = apiBaseUrl.endsWith('/')
            ? `${apiBaseUrl}api/v1/`
            : `${apiBaseUrl}/api/v1/`;
    } else {
        // 相对路径：使用 nginx 代理
        BASE_URL = apiBaseUrl.endsWith('/')
            ? `${apiBaseUrl}v1/`
            : `${apiBaseUrl}/v1/`;
    }

    if (showToast) {
        console.log('加载中...'); // 可以替换为实际的 toast 实现
    }

    // 设置头部信息
    const headers = {
        'Content-Type': contentType
    };

    // 如果不是公开接口，添加认证信息
    if (!publicRequest) {
        // 优先使用 token，如果没有则使用 API Key
        const token = localStorage.getItem('token');
        const apiKey = localStorage.getItem('apiKey');

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else if (apiKey) {
            headers['apikey'] = apiKey;
        }
    }

    // 重试配置
    const maxRetries = 3;
    const retryDelay = 1000; // 1秒
    let retryCount = 0;

    const makeRequest = () => {
        return new Promise((resolve, reject) => {
            // 设置超时
            const timeout = 30000; // 30秒超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            // 根据 Content-Type 处理请求体
            let requestBody = null;
            if (method !== 'GET' && method !== 'HEAD') {
                if (contentType === 'application/json') {
                    requestBody = JSON.stringify(paramet || {});
                } else if (contentType === 'application/x-www-form-urlencoded') {
                    requestBody = new URLSearchParams(paramet).toString();
                } else {
                    requestBody = JSON.stringify(paramet || {});
                }
            }

            // 过滤掉null和undefined值
            const filteredParams = paramet ? Object.fromEntries(
                Object.entries(paramet).filter(([key, value]) => value !== null && value !== undefined)
            ) : {};

            const fetchOptions = {
                method: method,
                headers: headers,
                signal: controller.signal,
                redirect: 'follow' // 明确跟随重定向（包括 308）
            };

            // GET和HEAD请求不能有body
            if (method !== 'GET' && method !== 'HEAD') {
                fetchOptions.body = requestBody;
            }

            // 处理查询参数（GET 请求）
            let queryString = '';
            if (method === 'GET' && Object.keys(filteredParams).length > 0) {
                // 添加认证信息到查询参数（如果使用 API Key 且没有 token）
                const params = { ...filteredParams };
                const token = localStorage.getItem('token');
                const apiKey = localStorage.getItem('apiKey');
                if (!token && apiKey && !publicRequest) {
                    params.apikey = apiKey;
                }
                queryString = '?' + new URLSearchParams(params).toString();
            } else if (method === 'GET') {
                // 即使没有其他参数，也要添加 API Key（如果没有 token）
                const token = localStorage.getItem('token');
                const apiKey = localStorage.getItem('apiKey');
                if (!token && apiKey && !publicRequest) {
                    queryString = '?apikey=' + encodeURIComponent(apiKey);
                }
            }

            const fullUrl = BASE_URL + url + queryString;
            console.log('[api] Request URL:', fullUrl);
            console.log('[api] API Base URL:', apiBaseUrl);
            console.log('[api] BASE_URL:', BASE_URL);
            console.log('[api] Full URL:', fullUrl);
            fetch(fullUrl, fetchOptions)
                .then(async (response) => {
                    clearTimeout(timeoutId);

                    // 记录响应状态和重定向信息
                    console.log('[api] Response status:', response.status);
                    console.log('[api] Response URL:', response.url);
                    if (response.redirected) {
                        console.log('[api] Request was redirected to:', response.url);
                    }

                    if (showToast) {
                        console.log('加载完成');
                    }

                    let res;
                    try {
                        // 检查 Content-Type
                        const contentType = response.headers.get('content-type') || '';

                        // 优先使用 response.json() 直接解析 JSON（避免响应体被读取两次）
                        if (contentType.includes('application/json') || contentType.includes('text/json')) {
                            try {
                                res = await response.json();
                            } catch (jsonError) {
                                // 如果 json() 失败，可能是响应格式问题
                                console.error('response.json() 失败:', jsonError);
                                // 尝试克隆响应并读取文本（但响应体只能读取一次，所以这里会失败）
                                // 作为备选方案，我们直接抛出错误
                                return reject({
                                    message: 'JSON 解析失败，响应可能不是有效的 JSON 格式',
                                    originalError: jsonError
                                });
                            }
                        } else {
                            // 非 JSON 类型，使用 text() 然后尝试解析
                            const text = await response.text();

                            if (text.trim() === '') {
                                res = { code: response.status, msg: 'ok', data: null };
                            } else {
                                // 尝试解析 JSON（可能 Content-Type 设置错误但实际是 JSON）
                                try {
                                    res = JSON.parse(text);
                                } catch (parseError) {
                                    // 如果解析失败，输出更多调试信息
                                    console.error('JSON解析失败:', parseError);
                                    console.error('响应文本前200字符:', text.substring(0, 200));
                                    console.error('响应状态:', response.status);
                                    console.error('Content-Type:', contentType);
                                    console.error('响应URL:', BASE_URL + url + queryString);

                                    // 检查是否是 HTML 响应（可能是错误页面）
                                    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                                        return reject({
                                            message: '服务器返回了 HTML 页面，可能是错误页面',
                                            originalError: parseError,
                                            responseText: text.substring(0, 200)
                                        });
                                    }

                                    return reject({
                                        message: '响应格式错误，不是有效的 JSON',
                                        originalError: parseError,
                                        responseText: text.substring(0, 200)
                                    });
                                }
                            }
                        }
                    } catch (error) {
                        console.error('读取响应失败:', error);
                        return reject({
                            message: '读取服务器响应失败',
                            originalError: error
                        });
                    }

                    switch (response.status) {
                        case 200:
                            // ROMA API 返回格式: { code: 200, data: {...}, msg: "success" }
                            if (res.code === 200 || res.code === 0) {
                                // 返回 data 字段，如果没有 data 则返回整个 res
                                return resolve(res.data !== undefined ? res.data : res);
                            } else {
                                const errorMsg = typeof res.data === 'string' ? res.data : res.msg || '请求失败';
                                return reject({ message: errorMsg, code: res.code, data: res });
                            }

                        case 401:
                            // Token 或 API Key 无效或过期
                            localStorage.removeItem('token');
                            localStorage.removeItem('apiKey');
                            localStorage.removeItem('username');
                            localStorage.removeItem('email');
                            // 可以重定向到登录页
                            if (window.location.pathname !== '/login') {
                                window.location.href = '/login';
                            }
                            return reject({ message: '认证失败，请重新登录', code: 401, data: res });

                        case 403:
                            // 权限不足
                            return reject({ message: '权限不足', code: 403, data: res });

                        default:
                            const errorMsg = res.msg || res.message || '请求失败';
                            return reject({ message: errorMsg, code: response.status, data: res });
                    }
                })
                .catch(err => {
                    clearTimeout(timeoutId);

                    // 网络错误或超时，尝试重试
                    if (retryCount < maxRetries && (err.name === 'TypeError' || err.name === 'AbortError')) {
                        retryCount++;
                        console.log(`请求失败，${retryDelay}ms后重试 (${retryCount}/${maxRetries})`);

                        setTimeout(() => {
                            makeRequest().then(resolve).catch(reject);
                        }, retryDelay * retryCount);
                        return;
                    }

                    // 处理不同类型的错误
                    let errorMessage = '后端数据请求失败';
                    if (err.name === 'AbortError') {
                        errorMessage = '请求超时，请检查网络连接或稍后重试';
                    } else if (err.name === 'TypeError') {
                        errorMessage = '网络连接失败，请检查网络设置';
                    }

                    console.error(errorMessage, err);
                    return reject({ message: errorMessage, originalError: err });
                });
        });
    };

    return makeRequest();
};

export default httpRequest;

