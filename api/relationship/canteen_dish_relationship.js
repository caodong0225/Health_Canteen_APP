import request from '@/utils/request'

// 查询食堂-食品映射列表
export function listCanteen_dish_relationship(query) {
  return request({
    url: '/relationship/canteen_dish_relationship/list',
    method: 'get',
    params: query
  })
}

// 查询食堂-食品映射详细
export function getCanteen_dish_relationship(id) {
  return request({
    url: '/relationship/canteen_dish_relationship/' + id,
    method: 'get'
  })
}

// 新增食堂-食品映射
export function addCanteen_dish_relationship(data) {
  return request({
    url: '/relationship/canteen_dish_relationship',
    method: 'post',
    data: data
  })
}

// 修改食堂-食品映射
export function updateCanteen_dish_relationship(data) {
  return request({
    url: '/relationship/canteen_dish_relationship',
    method: 'put',
    data: data
  })
}

// 删除食堂-食品映射
export function delCanteen_dish_relationship(id) {
  return request({
    url: '/relationship/canteen_dish_relationship/' + id,
    method: 'delete'
  })
}

export function delCanteen_dish_relationship_all(data)
{
  return request({
    url: '/relationship/canteen_dish_relationship/delete?canteenId=' + data.canteenId + '&dishId=' + data.dishId,
    method: 'delete'
  })
}
