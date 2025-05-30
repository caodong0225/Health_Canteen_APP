<template>
  <view class="server-container">
    <!-- CPU信息 -->
    <uni-card title="CPU" :is-shadow="false">
      <view class="info-table">
        <view class="info-row">
          <text class="info-label">核心数</text>
          <text class="info-value">{{ server.cpu ? server.cpu.cpuNum : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">用户使用率</text>
          <text class="info-value">{{ server.cpu ? server.cpu.used + '%' : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">系统使用率</text>
          <text class="info-value">{{ server.cpu ? server.cpu.sys + '%' : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">当前空闲率</text>
          <text class="info-value">{{ server.cpu ? server.cpu.free + '%' : '-' }}</text>
        </view>
      </view>
    </uni-card>

    <!-- 内存信息 -->
    <uni-card title="内存" :is-shadow="false">
      <view class="info-table">
        <view class="info-header">
          <text class="info-label">属性</text>
          <text class="info-value">内存</text>
          <text class="info-value">JVM</text>
        </view>
        <view class="info-row">
          <text class="info-label">总内存</text>
          <text class="info-value">{{ server.mem ? server.mem.total + 'G' : '-' }}</text>
          <text class="info-value">{{ server.jvm ? server.jvm.total + 'M' : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">已用内存</text>
          <text class="info-value">{{ server.mem ? server.mem.used + 'G' : '-' }}</text>
          <text class="info-value">{{ server.jvm ? server.jvm.used + 'M' : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">剩余内存</text>
          <text class="info-value">{{ server.mem ? server.mem.free + 'G' : '-' }}</text>
          <text class="info-value">{{ server.jvm ? server.jvm.free + 'M' : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">使用率</text>
          <text class="info-value" :class="{'text-danger': server.mem && server.mem.usage > 80}">
            {{ server.mem ? server.mem.usage + '%' : '-' }}
          </text>
          <text class="info-value" :class="{'text-danger': server.jvm && server.jvm.usage > 80}">
            {{ server.jvm ? server.jvm.usage + '%' : '-' }}
          </text>
        </view>
      </view>
    </uni-card>

    <!-- 服务器信息 -->
    <uni-card title="服务器信息" :is-shadow="false">
      <view class="info-table">
        <view class="info-row">
          <text class="info-label">服务器名称</text>
          <text class="info-value">{{ server.sys ? server.sys.computerName : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">服务器IP</text>
          <text class="info-value">{{ server.sys ? server.sys.computerIp : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">操作系统</text>
          <text class="info-value">{{ server.sys ? server.sys.osName : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">系统架构</text>
          <text class="info-value">{{ server.sys ? server.sys.osArch : '-' }}</text>
        </view>
      </view>
    </uni-card>

    <!-- Java虚拟机信息 -->
    <uni-card title="Java虚拟机信息" :is-shadow="false">
      <view class="info-table">
        <view class="info-row">
          <text class="info-label">Java名称</text>
          <text class="info-value">{{ server.jvm ? server.jvm.name : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">Java版本</text>
          <text class="info-value">{{ server.jvm ? server.jvm.version : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">启动时间</text>
          <text class="info-value">{{ server.jvm ? server.jvm.startTime : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">运行时长</text>
          <text class="info-value">{{ server.jvm ? server.jvm.runTime : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">安装路径</text>
          <text class="info-value info-value-long">{{ server.jvm ? server.jvm.home : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">项目路径</text>
          <text class="info-value info-value-long">{{ server.sys ? server.sys.userDir : '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">运行参数</text>
          <text class="info-value info-value-long">{{ server.jvm ? server.jvm.inputArgs : '-' }}</text>
        </view>
      </view>
    </uni-card>

    <!-- 磁盘状态 -->
    <uni-card title="磁盘状态" :is-shadow="false">
      <view class="disk-list">
        <view v-for="(sysFile, index) in server.sysFiles" :key="index" class="disk-item">
          <view class="disk-header">
            <text class="disk-path">{{ sysFile.dirName }}</text>
            <text class="disk-usage" :class="{'text-danger': sysFile.usage > 80}">{{ sysFile.usage }}%</text>
          </view>
          <view class="disk-info">
            <text class="disk-type">{{ sysFile.typeName }}</text>
            <text class="disk-size">总: {{ sysFile.total }} 可用: {{ sysFile.free }}</text>
          </view>
        </view>
      </view>
    </uni-card>
  </view>
</template>

<script>
import { getServer } from '@/api/monitor/server'

export default {
  data() {
    return {
      // 服务器信息
      server: {}
    }
  },
  onLoad() {
    this.getList()
    this.openLoading()
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.getList()
  },
  methods: {
    /** 查询服务器信息 */
    getList() {
      getServer().then(response => {
        this.server = response.data
        this.$modal.closeLoading()
        uni.stopPullDownRefresh()
      })
    },
    // 打开加载层
    openLoading() {
      this.$modal.loading('正在加载服务监控数据，请稍候！')
    }
  }
}
</script>

<style lang="scss" scoped>
.server-container {
  padding: 20rpx;
  
  .info-table {
    .info-header {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 1px solid #eee;
      font-weight: bold;
    }
    
    .info-row {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    .info-label {
      flex: 1;
      color: #666;
    }
    
    .info-value {
      flex: 1;
      text-align: right;
      
      &.info-value-long {
        flex: 2;
        word-break: break-all;
      }
    }
  }
  
  .disk-list {
    .disk-item {
      padding: 20rpx 0;
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      .disk-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10rpx;
        
        .disk-path {
          font-weight: bold;
        }
        
        .disk-usage {
          color: #67C23A;
          
          &.text-danger {
            color: #F56C6C;
          }
        }
      }
      
      .disk-info {
        display: flex;
        justify-content: space-between;
        font-size: 24rpx;
        color: #666;
      }
    }
  }
  
  .text-danger {
    color: #F56C6C;
  }
}
</style> 