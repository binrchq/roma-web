import httpRequest from './roma-request'

const isShowInfoToast = false // ROMA API 默认不显示 toast
const isPublicRequest = false // ROMA API 默认需要认证

// 认证相关
const login = (data) => httpRequest('auth/login', data, 'POST', isShowInfoToast, true) // 登录接口是公开的

// 系统相关
const getSystemInfo = () => httpRequest('system/info', {}, 'GET', isShowInfoToast, isPublicRequest)
const getHealth = () => httpRequest('system/health', {}, 'GET', isShowInfoToast, true) // 健康检查可以是公开的

// 用户相关
const getUsers = () => httpRequest('users', {}, 'GET', isShowInfoToast, isPublicRequest)
const getUserById = (id) => httpRequest(`users/${id}`, {}, 'GET', isShowInfoToast, isPublicRequest)
const getCurrentUser = () => httpRequest('users/me', {}, 'GET', isShowInfoToast, isPublicRequest)
const createUser = (data) => httpRequest('users', data, 'POST', isShowInfoToast, isPublicRequest)
const updateUser = (id, data) => httpRequest(`users/${id}`, data, 'PUT', isShowInfoToast, isPublicRequest)
const deleteUser = (id) => httpRequest(`users/${id}`, {}, 'DELETE', isShowInfoToast, isPublicRequest)
const updateProfile = (data) => httpRequest('users/me', data, 'PUT', isShowInfoToast, isPublicRequest)

// 角色相关
const getRoles = () => httpRequest('roles', {}, 'GET', isShowInfoToast, isPublicRequest)
const getRoleById = (id) => httpRequest(`roles/${id}`, {}, 'GET', isShowInfoToast, isPublicRequest)
const createRole = (data) => httpRequest('roles', data, 'POST', isShowInfoToast, isPublicRequest)
const updateRole = (id, data) => httpRequest(`roles/${id}`, data, 'PUT', isShowInfoToast, isPublicRequest)
const deleteRole = (id) => httpRequest(`roles/${id}`, {}, 'DELETE', isShowInfoToast, isPublicRequest)

// 资源相关
const getResources = (type = '', page = 1, pageSize = 10) => {
    const params = {}
    if (type) params.type = type
    // 如果后端支持分页，取消注释以下两行
    // params.page = page
    // params.pageSize = pageSize
    return httpRequest('resources', params, 'GET', isShowInfoToast, isPublicRequest)
}
const getResourceById = (id, type = '') => {
    const params = type ? { type } : {}
    return httpRequest(`resources/${id}`, params, 'GET', isShowInfoToast, isPublicRequest)
}
const createResource = (data) => {
    // 后端需要 { type: "linux", role: "ops", space_id: 1, data: [...] } 格式
    const { type, role, space_id, ...resourceData } = data
    const requestData = { type, data: [resourceData] }
    if (role) {
        requestData.role = role
    }
    // space_id 应该在顶层，而不是在 data 数组中
    if (space_id !== undefined && space_id !== null) {
        requestData.space_id = space_id
    }
    return httpRequest('resources', requestData, 'POST', isShowInfoToast, isPublicRequest)
}
const updateResource = (id, data) => {
    // 后端需要 { type: "linux", role: "ops", space_id: 1, data: [...] } 格式
    const { type, role, space_id, ...resourceData } = data
    resourceData.id = id
    const requestData = { type, data: [resourceData] }
    if (role) {
        requestData.role = role
    }
    // space_id 应该在顶层，而不是在 data 数组中
    if (space_id !== undefined && space_id !== null) {
        requestData.space_id = space_id
    }
    return httpRequest(`resources/${id}`, requestData, 'PUT', isShowInfoToast, isPublicRequest)
}
const deleteResource = (id, type) => {
    // 后端需要 { type: "linux", data: [{ id }] } 格式
    return httpRequest(`resources/${id}`, { type, data: [{ id }] }, 'DELETE', isShowInfoToast, isPublicRequest)
}
const getDatabaseTypes = () => httpRequest('resources/database-types', {}, 'GET', isShowInfoToast, isPublicRequest)

// SSH 相关
const executeCommand = (data) => httpRequest('ssh/execute', data, 'POST', isShowInfoToast, isPublicRequest)
const getSystemInfoSSH = (data) => httpRequest('ssh/system-info', data, 'POST', isShowInfoToast, isPublicRequest)
const checkHealth = (data) => httpRequest('ssh/health', data, 'POST', isShowInfoToast, isPublicRequest)
const batchExecute = (data) => httpRequest('ssh/batch-execute', data, 'POST', isShowInfoToast, isPublicRequest)

// 日志相关
const getAccessLogs = (params = {}) => httpRequest('logs/access', params, 'GET', isShowInfoToast, isPublicRequest)
const getCredentialLogs = (params = {}) => httpRequest('logs/credential', params, 'GET', isShowInfoToast, isPublicRequest)
const getAuditLogs = (params = {}) => httpRequest('logs/audit', params, 'GET', isShowInfoToast, isPublicRequest)

// API Key 相关（仅管理员）
const getApiKeys = () => httpRequest('apikeys', {}, 'GET', isShowInfoToast, isPublicRequest)
const getApiKeyById = (id) => httpRequest(`apikeys/${id}`, {}, 'GET', isShowInfoToast, isPublicRequest)
const createApiKey = (data) => httpRequest('apikeys', data, 'POST', isShowInfoToast, isPublicRequest)
const deleteApiKey = (id) => httpRequest(`apikeys/${id}`, {}, 'DELETE', isShowInfoToast, isPublicRequest)

// SSH 密钥管理（用户自己的）
const getMySSHKey = () => httpRequest('ssh-keys/me', {}, 'GET', isShowInfoToast, isPublicRequest)
const uploadSSHKey = (data) => httpRequest('ssh-keys/me/upload', data, 'POST', isShowInfoToast, isPublicRequest)
const generateSSHKey = () => httpRequest('ssh-keys/me/generate', {}, 'POST', isShowInfoToast, isPublicRequest)

// 空间相关
const getSpaces = () => httpRequest('spaces', {}, 'GET', isShowInfoToast, isPublicRequest)
const getSpaceById = (id) => httpRequest(`spaces/${id}`, {}, 'GET', isShowInfoToast, isPublicRequest)
const createSpace = (data) => httpRequest('spaces', data, 'POST', isShowInfoToast, isPublicRequest)
const addSpaceMember = (id, data) => httpRequest(`spaces/${id}/members`, data, 'POST', isShowInfoToast, isPublicRequest)
const removeSpaceMember = (id, data) => httpRequest(`spaces/${id}/members`, data, 'DELETE', isShowInfoToast, isPublicRequest)

// 黑名单相关
const getBlacklists = (page = 1, pageSize = 20) => {
    const params = { page, page_size: pageSize }
    return httpRequest('blacklist', params, 'GET', isShowInfoToast, isPublicRequest)
}
const getBlacklistByIP = (ip) => httpRequest(`blacklist/${ip}`, {}, 'GET', isShowInfoToast, isPublicRequest)
const addToBlacklist = (data) => httpRequest('blacklist', data, 'POST', isShowInfoToast, isPublicRequest)
const removeFromBlacklist = (ip) => httpRequest(`blacklist/${ip}`, {}, 'DELETE', isShowInfoToast, isPublicRequest)
const getIPInfo = (ip) => httpRequest(`blacklist/ip-info/${ip}`, {}, 'GET', isShowInfoToast, isPublicRequest)

export const api = {
    // 认证相关
    login,

    // 系统相关
    getSystemInfo,
    getHealth,

    // 用户相关
    getUsers,
    getUserById,
    getCurrentUser,
    createUser,
    updateUser,
    deleteUser,
    updateProfile,

    // 角色相关
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,

    // 资源相关
    getResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    getDatabaseTypes,

    // SSH 相关
    executeCommand,
    getSystemInfoSSH,
    checkHealth,
    batchExecute,

    // 日志相关
    getAccessLogs,
    getCredentialLogs,
    getAuditLogs,

    // API Key 相关（仅管理员）
    getApiKeys,
    getApiKeyById,
    createApiKey,
    deleteApiKey,

    // SSH 密钥管理（用户自己的）
    getMySSHKey,
    uploadSSHKey,
    generateSSHKey,

    // 空间相关
    getSpaces,
    getSpaceById,
    createSpace,
    addSpaceMember,
    removeSpaceMember,
    getBlacklists,
    getBlacklistByIP,
    addToBlacklist,
    removeFromBlacklist,
    getIPInfo,
}

export default api
