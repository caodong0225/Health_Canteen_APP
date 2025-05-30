import request from '@/utils/request'

// 查询用户历史健康数据列表
export function listHistorical_health_data(query) {
  return request({
    url: '/system/historical_health_data/list',
    method: 'get',
    params: query
  })
}

// 查询用户历史健康数据详细
export function getHistorical_health_data(id) {
  return request({
    url: '/system/historical_health_data/' + id,
    method: 'get'
  })
}

// 新增用户历史健康数据
export function addHistorical_health_data(data) {
  return request({
    url: '/system/historical_health_data',
    method: 'post',
    data: data
  })
}

// 修改用户历史健康数据
export function updateHistorical_health_data(data) {
  return request({
    url: '/system/historical_health_data',
    method: 'put',
    data: data
  })
}

// 删除用户历史健康数据
export function delHistorical_health_data(id) {
  return request({
    url: '/system/historical_health_data/' + id,
    method: 'delete'
  })
}

// 导入健康数据
export function importHealthData(data) {
  return request({
    url: '/system/historical_health_data/import',
    method: 'post',
    data: data
  })
}
