import request from '@/utils/request'

// 查询食堂管理列表
export function listCanteen(query) {
  return request({
    url: '/resource/canteen/list',
    method: 'get',
    params: query
  })
}

// 查询食堂管理详细
export function getCanteen(canteenId) {
  return request({
    url: '/resource/canteen/' + canteenId,
    method: 'get'
  })
}

// 新增食堂管理
export function addCanteen(data) {
  return request({
    url: '/resource/canteen',
    method: 'post',
    data: data
  })
}

// 修改食堂管理
export function updateCanteen(data) {
  return request({
    url: '/resource/canteen',
    method: 'put',
    data: data
  })
}

// 删除食堂管理
export function delCanteen(canteenId) {
  return request({
    url: '/resource/canteen/' + canteenId,
    method: 'delete'
  })
}
