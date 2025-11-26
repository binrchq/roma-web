// ROMA API 请求封装
// 基于 request.js 的模式，但适配 ROMA API 的认证方式（使用 apikey）

import { getApiBaseUrl } from '@/utils/env'
import { apiLogger } from '@/utils/logger'

const ensureTrailingSlash = (value) => value.endsWith('/') ? value : `${value}/`;
const stripLeadingSlash = (value) => value.startsWith('/') ? value.slice(1) : value;

const httpRequest = function (url, paramet, method, showToast = false, publicRequest = false, contentType = 'application/json') {
    const apiBaseUrl = getApiBaseUrl();
    const BASE_URL = ensureTrailingSlash(apiBaseUrl);

    if (showToast) {
        apiLogger.debug('加载中...');
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

    return new Promise((resolve, reject) => {
        const timeout = 30000;
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

        const sanitizedPath = stripLeadingSlash(url);
        const fullUrl = BASE_URL + sanitizedPath + queryString;
        apiLogger.log('Request:', method, fullUrl);

        fetch(fullUrl, fetchOptions)
            .then(async (response) => {
                clearTimeout(timeoutId);

                if (response.redirected) {
                    apiLogger.debug('Redirected:', response.url);
                }

                if (showToast) {
                    apiLogger.debug('加载完成');
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
                            apiLogger.error('response.json() 失败:', jsonError);
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
                                apiLogger.error('JSON解析失败:', parseError);
                                apiLogger.debug('响应文本前200字符:', text.substring(0, 200));
                                apiLogger.debug('响应状态:', response.status);
                                apiLogger.debug('Content-Type:', contentType);
                                apiLogger.debug('响应URL:', BASE_URL + url + queryString);

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
                    apiLogger.error('读取响应失败:', error);
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

                let errorMessage = '后端数据请求失败';
                if (err.name === 'AbortError') {
                    errorMessage = '请求超时，请检查网络连接或稍后重试';
                } else if (err.name === 'TypeError') {
                    errorMessage = '网络连接失败，请检查网络设置';
                }

                apiLogger.error(errorMessage, err);
                return reject({ message: errorMessage, originalError: err });
            });
    });
};

export default httpRequest;

