import request from '@/utils/request'

// 查询餐品历史推荐记录列表
export function listRecommend(query) {
  return request({
    url: '/dish/recommend/list',
    method: 'get',
    params: query
  })
}

// 查询餐品历史推荐记录详细
export function getRecommend(id) {
  return request({
    url: '/dish/recommend/' + id,
    method: 'get'
  })
}

// 新增餐品历史推荐记录
export function addRecommend(data) {
  return request({
    url: '/dish/recommend',
    method: 'post',
    data: data
  })
}

// 修改餐品历史推荐记录
export function updateRecommend(data) {
  return request({
    url: '/dish/recommend',
    method: 'put',
    data: data
  })
}

// 删除餐品历史推荐记录
export function delRecommend(id) {
  return request({
    url: '/dish/recommend/' + id,
    method: 'delete'
  })
}
