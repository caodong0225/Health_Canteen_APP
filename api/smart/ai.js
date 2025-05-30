import request from '@/utils/request'

export function listDish(id) {
  return request({
    url: `/canteen/dish/recommend/${id}`,
    method: 'get'
  })
}