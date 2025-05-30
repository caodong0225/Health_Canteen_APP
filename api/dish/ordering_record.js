import request from '@/utils/request'

// 查询历史点餐记录列表
export function listOrdering_record(query) {
  return request({
    url: '/dish/ordering_record/list',
    method: 'get',
    params: query
  })
}

// 查询历史点餐记录详细
export function getUser_record(id) {
  return request({
    url: '/dish/ordering_record/' + id,
    method: 'get'
  })
}

export function getOrdering_record(id) {
  return request({
    url: '/dish/ordering_record/order/' + id,
    method: 'get'
  })
}

// 新增历史点餐记录
export function addOrdering_record(data) {
  return request({
    url: '/dish/ordering_record',
    method: 'post',
    data: data
  })
}

// 修改历史点餐记录
export function updateOrdering_record(data) {
  return request({
    url: '/dish/ordering_record',
    method: 'put',
    data: data
  })
}

// 删除历史点餐记录
export function delOrdering_record(id) {
  return request({
    url: '/dish/ordering_record/' + id,
    method: 'delete'
  })
}

// 查询历史点餐记录列表
export function listOrdering_record_with_userinfo(query) {
  return request({
    url: '/dish/ordering_record/listUser',
    method: 'get',
    params: query
  })
}
