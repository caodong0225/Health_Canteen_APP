import request from '@/utils/request'

// 查询菜品列表
export function listManagement(query) {
  return request({
    url: '/dish/management/list',
    method: 'get',
    params: query
  })
}

// 查询菜品详细
export function getManagement(managementId) {
  return request({
    url: '/dish/management/' + managementId,
    method: 'get'
  })
}

// 新增菜品
export function addManagement(data) {
  return request({
    url: '/dish/management',
    method: 'post',
    data: data
  })
}

// 修改菜品
export function updateManagement(data) {
  return request({
    url: '/dish/management',
    method: 'put',
    data: data
  })
}

// 删除菜品
export function delManagement(managementId) {
  return request({
    url: '/dish/management/' + managementId,
    method: 'delete'
  })
}

// 根据食堂ID查询菜品列表
export function listManagementByCanteenId(canteenId, query) {
  return request({
    url: '/dish/management/canteen/' + canteenId,
    method: 'get',
    params: query
  })
}

// 通过食堂ID查询菜品管理列表
export function listExcludeManagementByCanteenId(canteenId,query) {
  return request({
    url: `/dish/management/list/exclude/${canteenId}`,
    method: 'get',
    params: query
  })
}
