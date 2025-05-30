import request from '@/utils/request'

// 查询窗口列表
export function listWindows(query) {
  return request({
    url: '/resource/windows/list',
    method: 'get',
    params: query
  })
}

// 查询窗口详细
export function getWindows(windowsId) {
  return request({
    url: '/resource/windows/' + windowsId,
    method: 'get'
  })
}

// 新增窗口
export function addWindows(data) {
  return request({
    url: '/resource/windows',
    method: 'post',
    data: data
  })
}

// 修改窗口
export function updateWindows(data) {
  return request({
    url: '/resource/windows',
    method: 'put',
    data: data
  })
}

// 删除窗口
export function delWindows(windowsId) {
  return request({
    url: '/resource/windows/' + windowsId,
    method: 'delete'
  })
}
