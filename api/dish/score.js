import request from '@/utils/request'

// 查询校医端评分列表
export function listScore(query) {
  return request({
    url: '/dish/score/list',
    method: 'get',
    params: query
  })
}

// 查询校医端评分详细
export function getScore(id) {
  return request({
    url: '/dish/score/' + id,
    method: 'get'
  })
}

// 新增校医端评分
export function addScore(data) {
  return request({
    url: '/dish/score',
    method: 'post',
    data: data
  })
}

// 修改校医端评分
export function updateScore(data) {
  return request({
    url: '/dish/score',
    method: 'put',
    data: data
  })
}

// 删除校医端评分
export function delScore(id) {
  return request({
    url: '/dish/score/' + id,
    method: 'delete'
  })
}
