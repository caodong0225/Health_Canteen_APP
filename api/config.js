import request from '@/utils/request'

// 获取系统配置列表
export function getConfigList(query) {
  return request({
    url: '/system/config/list',
    method: 'get',
    params: query
  })
}

// 获取系统配置详情
export function getConfigDetail(configId) {
  return request({
    url: '/system/config/' + configId,
    method: 'get'
  })
}

// 刷新系统缓存
export function refreshSystemCache() {
  return request({
    url: '/system/config/refreshCache',
    method: 'delete'
  })
}

// 清理系统缓存
export function cleanSystemCache() {
  return request({
    url: '/system/config/cleanCache',
    method: 'delete'
  })
} 