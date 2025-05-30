<template>
  <view class="dashboard-container">
    <!-- 欢迎卡片 -->
    <view class="welcome-card">
      <view class="welcome-content">
        <view class="welcome-text">
          <text class="welcome-title">欢迎回来</text>
          <text class="welcome-subtitle">今天是 {{ currentTime }}，系统运行正常。</text>
        </view>
        <view class="welcome-actions">
          <button class="action-btn" @click="handleSetting">
            <uni-icons type="gear" size="20"></uni-icons>
            <text>系统详情</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-links">
      <view class="section-title">快捷入口</view>
      <view class="quick-links-grid">
        <view 
          class="quick-link-item" 
          v-for="(link, index) in quickLinks" 
          :key="index"
          @click="handleQuickLink(link.url)"
        >
          <view class="quick-link-icon" :class="link.bgClass">
            <uni-icons :type="link.icon" size="24" color="#fff"></uni-icons>
          </view>
          <text class="quick-link-text">{{ link.text }}</text>
        </view>
      </view>
    </view>

    <!-- 最新动态 -->
    <view class="activities">
      <view class="section-header">
        <text class="section-title">最新动态</text>
        <text class="section-more" @click="handleAllActivities">查看全部</text>
      </view>
      <view class="activity-list">
        <view 
          class="activity-item" 
          v-for="(item, index) in activities" 
          :key="index"
        >
          <view class="activity-icon" :class="item.bgClass">
            <uni-icons :type="item.icon" size="20" color="#fff"></uni-icons>
          </view>
          <view class="activity-content">
            <text class="activity-text">{{ item.text }}</text>
            <text class="activity-time">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 用户搜索弹窗 -->
    <uni-popup ref="userSearchPopup" type="center">
      <view class="popup-content user-search-popup">
        <view class="popup-header">
          <text class="popup-title">选择用户</text>
          <button class="close-btn" @click="closeUserSearch">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <user-search @select="handleUserSelect" />
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { listManagement } from "@/api/dish/management";
import { listNotice } from "@/api/system/notice";
import UserSearch from '@/components/user/UserSearch.vue';

export default {
  components: {
    UserSearch
  },
  data() {
    return {
      currentTime: '',
      timer: null,
      statsData: [
        {
          label: '总菜品数',
          value: 0,
          icon: 'shop',
          bgClass: 'bg-primary',
          trendIcon: 'arrow-up',
          trendValue: '5.27%',
          trendClass: 'trend-up'
        },
        {
          label: '总访问量',
          value: 0,
          icon: 'eye',
          bgClass: 'bg-success',
          trendIcon: 'arrow-up',
          trendValue: '3.58%',
          trendClass: 'trend-up'
        },
        {
          label: '平均价格',
          value: '¥0',
          icon: 'wallet',
          bgClass: 'bg-warning',
          trendIcon: 'arrow-down',
          trendValue: '8.41%',
          trendClass: 'trend-down'
        },
        {
          label: '上线菜品数',
          value: 0,
          icon: 'checkbox-filled',
          bgClass: 'bg-info',
          trendIcon: 'arrow-up',
          trendValue: '12.35%',
          trendClass: 'trend-up'
        }
      ],
      quickLinks: [
        { icon: 'person', text: '用户健康', url: '/pages/user/health/index', bgClass: 'bg-warning' },
        { icon: 'heart', text: '健康数据', url: '/pages/health/index', bgClass: 'bg-success' },
        { icon: 'cart', text: '订单数据', url: '/pages/user/behavior/index', bgClass: 'bg-info' },
        { icon: 'star', text: '营养标准', url: '/pages/nutrition/index', bgClass: 'bg-danger' }
      ],
      activities: [],
      visitChartData: {
        categories: [],
        series: [{
          name: '访问量',
          data: []
        }]
      },
      visitChartOpts: {
        color: ['#188df0'],
        padding: [15, 15, 0, 15],
        legend: {},
        xAxis: {
          disableGrid: true
        },
        yAxis: {
          gridType: 'dash',
          dashLength: 2
        },
        extra: {
          line: {
            type: 'curve',
            width: 2
          }
        }
      },
      selectedUser: null, // 添加选中用户数据
    }
  },
  mounted() {
    this.initData()
    this.updateTime()
    this.timer = setInterval(() => {
      this.updateTime()
      this.initData()
    }, 60000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    handleExportLog() {
      uni.navigateTo({
        url: '/pages/system/log/operlog'
      })
    },
    handleSetting() {
      uni.navigateTo({
        url: '/pages/monitor/server/index'
      })
    },
    handleQuickLink(url) {
      uni.navigateTo({ url })
    },
    handleAllActivities() {
      uni.navigateTo({
        url: '/pages/notice/index'
      })
    },
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour12: false
      })
    },
    async initData() {
      try {
        // 获取菜品数据
        const dishResponse = await listManagement({
          pageNum: 1,
          pageSize: 10000
        })
        const dishData = dishResponse.rows

        // 更新统计数据
        this.statsData[0].value = dishData.length
        this.statsData[1].value = dishData.reduce((sum, item) => sum + (item.view || 0), 0)
        this.statsData[2].value = '¥' + (dishData.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0) / dishData.length).toFixed(2)
        this.statsData[3].value = dishData.filter(item => item.delFlag === '0').length

        // 获取通知数据
        const noticeResponse = await listNotice({
          pageNum: 1,
          pageSize: 5
        })
        this.activities = noticeResponse.rows.map(item => ({
          icon: this.getNoticeIcon(item.noticeType),
          text: item.noticeTitle,
          time: item.createTime,
          bgClass: this.getNoticeBgClass(item.noticeType)
        }))

        // 更新访问量趋势图数据
        this.updateVisitChartData(dishData)
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    },
    getNoticeIcon(type) {
      const icons = {
        '1': 'notification', // 通知
        '2': 'sound', // 公告
        '3': 'info', // 提醒
        '4': 'warning' // 警告
      }
      return icons[type] || 'info'
    },
    getNoticeBgClass(type) {
      const classes = {
        '1': 'bg-primary',
        '2': 'bg-success',
        '3': 'bg-warning',
        '4': 'bg-danger'
      }
      return classes[type] || 'bg-info'
    },
    updateVisitChartData(dishData) {
      // 生成最近30天的日期
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      })

      // 模拟访问量数据
      const visitData = dates.map(() => Math.floor(Math.random() * 1000) + 500)

      this.visitChartData = {
        categories: dates,
        series: [{
          name: '访问量',
          data: visitData
        }]
      }
    },
    /** 显示用户搜索弹窗 */
    showUserSearch() {
      this.$refs.userSearchPopup.open();
    },
    
    /** 关闭用户搜索弹窗 */
    closeUserSearch() {
      this.$refs.userSearchPopup.close();
    },
    
    /** 处理用户选择 */
    handleUserSelect(user) {
      this.selectedUser = user;
      // 这里可以处理选中用户后的逻辑
      console.log('选中的用户：', user);
      this.closeUserSearch();
      
      // 示例：显示选中用户信息
      uni.showToast({
        title: `已选择用户：${user.userName}`,
        icon: 'none'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

.welcome-card {
  background: linear-gradient(135deg, #4e73df, #224abe);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);

  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .welcome-text {
    .welcome-title {
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
      display: block;
    }

    .welcome-subtitle {
      font-size: 24rpx;
      opacity: 0.8;
    }
  }

  .welcome-actions {
    display: flex;
    gap: 20rpx;

    .action-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      padding: 15rpx 25rpx;
      border-radius: 10rpx;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10rpx;
      font-size: 24rpx;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 20rpx;

  .stats-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);

    .stats-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
    }

    .stats-info {
      flex: 1;

      .stats-label {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 10rpx;
        display: block;
      }

      .stats-value-row {
        display: flex;
        align-items: center;
        gap: 10rpx;
        margin-bottom: 5rpx;
      }

      .stats-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }

      .stats-trend {
        font-size: 22rpx;
        display: flex;
        align-items: center;
        gap: 5rpx;

        &.trend-up {
          color: #67C23A;
        }

        &.trend-down {
          color: #F56C6C;
        }
      }

      .stats-compare {
        font-size: 22rpx;
        color: #999;
      }
    }
  }
}

.chart-section {
  margin-bottom: 20rpx;

  .chart-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);

    .chart-header {
      margin-bottom: 20rpx;

      .chart-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .chart-body {
      height: 400rpx;
    }
  }
}

.quick-links {
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .quick-links-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;

    .quick-link-item {
      background: #fff;
      border-radius: 20rpx;
      padding: 30rpx 20rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);

      .quick-link-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15rpx;
      }

      .quick-link-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.activities {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .section-more {
      font-size: 24rpx;
      color: #409EFF;
    }
  }

  .activity-list {
    background: #fff;
    border-radius: 20rpx;
    padding: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);

    .activity-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .activity-icon {
        width: 60rpx;
        height: 60rpx;
        border-radius: 15rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
      }

      .activity-content {
        flex: 1;

        .activity-text {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 5rpx;
          display: block;
        }

        .activity-time {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}

// 背景色类
.bg-primary {
  background: linear-gradient(135deg, #4e73df, #224abe);
}

.bg-success {
  background: linear-gradient(135deg, #1cc88a, #13855c);
}

.bg-warning {
  background: linear-gradient(135deg, #f6c23e, #dda20a);
}

.bg-info {
  background: linear-gradient(135deg, #36b9cc, #258391);
}

.bg-danger {
  background: linear-gradient(135deg, #e74a3b, #be2617);
}

// 添加用户搜索弹窗样式
.popup-content {
  background: #fff;
  border-radius: 12rpx;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;

  &.user-search-popup {
    .popup-body {
      padding: 0;
      max-height: calc(90vh - 100rpx);
      overflow-y: auto;
    }
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #ebeef5;

    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
    }

    .close-btn {
      padding: 10rpx;
      background: none;
      border: none;
      line-height: 1;
    }
  }
}

// 添加遮罩层样式
:deep(.uni-popup) {
  .uni-popup__mask {
    background-color: rgba(0, 0, 0, 0.6);
  }
}
</style>
