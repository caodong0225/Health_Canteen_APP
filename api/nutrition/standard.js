import request from '@/utils/request'

// 查询营养标准列表
export function listStandard(query) {
  return request({
    url: '/nutrition/standard/list',
    method: 'get',
    params: query
  })
}

// 查询营养标准详细
export function getStandard(standardId) {
  return request({
    url: '/nutrition/standard/' + standardId,
    method: 'get'
  })
}

// 新增营养标准
export function addStandard(data) {
  return request({
    url: '/nutrition/standard',
    method: 'post',
    data: data
  })
}

// 修改营养标准
export function updateStandard(data) {
  return request({
    url: '/nutrition/standard',
    method: 'put',
    data: data
  })
}

// 删除营养标准
export function delStandard(standardId) {
  return request({
    url: '/nutrition/standard/' + standardId,
    method: 'delete'
  })
}

// 导出营养标准
export function exportStandard(query) {
  return request({
    url: '/nutrition/standard/export',
    method: 'get',
    params: query
  })
}
