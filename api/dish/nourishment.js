import request from '@/utils/request'

// 查询食物营养列表
export function listNourishment(query) {
  return request({
    url: '/dish/nourishment/list',
    method: 'get',
    params: query
  })
}

// 查询食物营养详细
export function getNourishment(id) {
  return request({
    url: '/dish/nourishment/' + id,
    method: 'get'
  })
}

// 新增食物营养
export function addNourishment(data) {
  return request({
    url: '/dish/nourishment',
    method: 'post',
    data: data
  })
}

// 修改食物营养
export function updateNourishment(data) {
  return request({
    url: '/dish/nourishment',
    method: 'put',
    data: data
  })
}

// 删除食物营养
export function delNourishment(id) {
  return request({
    url: '/dish/nourishment/' + id,
    method: 'delete'
  })
}
