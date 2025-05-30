import request from '@/utils/request'

// 查询特殊疾病人群关系映射列表
export function listUser_diseases_relationship(query) {
  return request({
    url: '/relationship/user_diseases_relationship/list',
    method: 'get',
    params: query
  })
}

// 查询特殊疾病人群关系映射详细
export function getUser_diseases_relationship(id) {
  return request({
    url: '/relationship/user_diseases_relationship/' + id,
    method: 'get'
  })
}

// 新增特殊疾病人群关系映射
export function addUser_diseases_relationship(data) {
  return request({
    url: '/relationship/user_diseases_relationship',
    method: 'post',
    data: data
  })
}

// 修改特殊疾病人群关系映射
export function updateUser_diseases_relationship(data) {
  return request({
    url: '/relationship/user_diseases_relationship',
    method: 'put',
    data: data
  })
}

// 删除特殊疾病人群关系映射
export function delUser_diseases_relationship(id) {
  return request({
    url: '/relationship/user_diseases_relationship/' + id,
    method: 'delete'
  })
}
