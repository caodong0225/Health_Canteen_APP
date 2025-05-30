<template>
  <view class="app-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-form">
        <view class="form-item">
          <text class="form-label">用户</text>
          <view class="form-input" @click="showUserSearch">
            <text>{{ queryParams.userName || '请选择用户' }}</text>
            <uni-icons type="search" size="16" color="#909399"></uni-icons>
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">时间范围</text>
          <picker 
            mode="date" 
            :value="dateRange[0]" 
            @change="onStartDateChange"
            class="date-picker"
          >
            <view class="picker-item">{{ dateRange[0] || '开始日期' }}</view>
          </picker>
          <text class="date-separator">至</text>
          <picker 
            mode="date" 
            :value="dateRange[1]" 
            @change="onEndDateChange"
            class="date-picker"
          >
            <view class="picker-item">{{ dateRange[1] || '结束日期' }}</view>
          </picker>
        </view>
        <view class="search-buttons">
          <button class="search-btn" @click="handleQuery">搜索</button>
          <button class="reset-btn" @click="resetQuery">重置</button>
        </view>
      </view>
    </view>

    <!-- 操作按钮栏 -->
    <view class="action-bar">

      <button class="action-btn delete" @click="handleDelete" :disabled="!selectedIds.length">
        <uni-icons type="trash" size="16" color="#fff"></uni-icons>
        <text>删除</text>
      </button>
      <button class="action-btn export" @click="handleExport">
        <uni-icons type="download" size="16" color="#fff"></uni-icons>
        <text>导出</text>
      </button>
      <button class="action-btn import" @click="handleImport">
        <uni-icons type="upload" size="16" color="#fff"></uni-icons>
        <text>导入</text>
      </button>
    </view>

    <!-- 健康数据列表 -->
    <view class="health-list" v-if="!loading">
      <view 
        class="health-card" 
        v-for="item in healthList" 
        :key="item.id"
        :class="{ 'selected': selectedIds.includes(item.id) }"
        @click="handleSelect(item)"
      >
        <view class="health-header">
          <text class="user-name">{{ showUserName(item.userId) }}</text>
          <text class="record-time">{{ formatDate(item.createTime) }}</text>
        </view>
        <view class="health-content">
          <view class="health-item">
            <text class="label">身高(cm)：</text>
            <text class="value">{{ item.height }}</text>
          </view>
          <view class="health-item">
            <text class="label">体重(kg)：</text>
            <text class="value">{{ item.weight }}</text>
          </view>
          <view class="health-item">
            <text class="label">BMI：</text>
            <text class="value">{{ calculateBMI(item) }}</text>
          </view>
          <view class="health-item">
            <text class="label">血糖值(mmol/L)：</text>
            <text class="value">{{ item.bloodGlucose }}</text>
          </view>
          <view class="health-item">
            <text class="label">血压(mmHg)：</text>
            <text class="value">{{ item.systolicPressure }}/{{ item.diastolicPressure }}</text>
          </view>
          <view class="health-item">
            <text class="label">总胆固醇(mmol/L)：</text>
            <text class="value">{{ item.totalCholesterol }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载中提示 -->
    <view class="loading-box" v-if="loading">
      <uni-load-more status="loading" :contentText="loadingText"></uni-load-more>
    </view>

    <!-- 分页器 -->
    <view class="pagination" v-if="total > 0">
      <view class="page-info">
        <text>共 {{ total }} 条</text>
      </view>
      <view class="page-buttons">
        <button 
          class="page-btn" 
          :disabled="queryParams.pageNum <= 1"
          @click="handlePageChange(queryParams.pageNum - 1)"
        >上一页</button>
        <text class="page-num">{{ queryParams.pageNum }}</text>
        <button 
          class="page-btn"
          :disabled="queryParams.pageNum >= totalPages"
          @click="handlePageChange(queryParams.pageNum + 1)"
        >下一页</button>
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

    <!-- 统计报告弹窗 -->
    <uni-popup ref="reportPopup" type="center">
      <view class="popup-content report-popup">
        <view class="popup-header">
          <text class="popup-title">健康数据统计报告</text>
          <button class="close-btn" @click="closeReport">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <view class="user-info" v-if="selectedUser">
            <image 
              class="user-avatar" 
              :src="selectedUser.avatar || '/static/images/profile.jpg'"
              mode="aspectFill"
            ></image>
            <view class="user-detail">
              <text class="user-name">{{ selectedUser.userName }}</text>
              <text class="user-nickname">{{ selectedUser.nickName }}</text>
            </view>
          </view>

          <view class="summary-grid">
            <view class="summary-item">
              <text class="label">平均BMI</text>
              <text class="value">{{ averageBMI }}</text>
            </view>
            <view class="summary-item">
              <text class="label">平均血糖</text>
              <text class="value">{{ averageBloodGlucose }} mmol/L</text>
            </view>
            <view class="summary-item">
              <text class="label">平均血压</text>
              <text class="value">{{ averageBloodPressure }}</text>
            </view>
          </view>

          <view class="trend-list">
            <view class="trend-title">历史记录</view>
            <view class="trend-item" v-for="(date, index) in trendData.dates" :key="date">
              <view class="trend-date">{{ date }}</view>
              <view class="trend-values">
                <view class="trend-value">
                  <text class="label">BMI：</text>
                  <text class="value">{{ trendData.bmi[index] }}</text>
                </view>
                <view class="trend-value">
                  <text class="label">血糖：</text>
                  <text class="value">{{ trendData.bloodGlucose[index] }} mmol/L</text>
                </view>
                <view class="trend-value">
                  <text class="label">血压：</text>
                  <text class="value">{{ trendData.bloodPressure[index] }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { listHistorical_health_data, delHistorical_health_data } from "@/api/system/historical_health_data";
import { listUser } from "@/api/system/user";
import UserSearch from '@/components/user/UserSearch.vue';

export default {
  name: "Health",
  components: {
    UserSearch
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      loadingText: {
        contentdown: "上拉加载更多",
        contentrefresh: "加载中...",
        contentnomore: "没有更多数据了"
      },
      // 选中数组
      selectedIds: [],
      // 总条数
      total: 0,
      // 健康数据列表
      healthList: [],
      // 用户列表
      userList: [],
      // 选中的用户
      selectedUser: null,
      // 日期范围
      dateRange: ['', ''],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        userName: null,
        beginTime: null,
        endTime: null
      },
      // 统计报告相关
      averageBMI: 0,
      averageBloodGlucose: 0,
      averageBloodPressure: '0/0',
      // 趋势数据
      trendData: {
        dates: [],
        bmi: [],
        bloodGlucose: [],
        bloodPressure: []
      }
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.queryParams.pageSize);
    }
  },
  onLoad() {
    this.getList();
  },
  methods: {
    // 格式化日期
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    // 显示用户名
    showUserName(userId) {
      const user = this.userList.find(item => item.userId === userId);
      return user ? user.userName : '未知用户';
    },
    // 计算BMI
    calculateBMI(row) {
      if (row.height && row.weight) {
        const heightInMeters = row.height / 100;
        return (row.weight / (heightInMeters * heightInMeters)).toFixed(1);
      }
      return '-';
    },
    // 获取列表数据
    getList() {
      this.loading = true;
      listHistorical_health_data(this.queryParams).then(response => {
        this.healthList = response.rows;
        this.total = response.total;
        return listUser({ pageNum: 1, pageSize: 9999 });
      }).then(response => {
        this.userList = response.rows;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    // 搜索按钮操作
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 重置按钮操作
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        userName: null,
        beginTime: null,
        endTime: null
      };
      this.dateRange = ['', ''];
      this.handleQuery();
    },
    // 选择数据
    handleSelect(item) {
      const index = this.selectedIds.indexOf(item.id);
      if (index > -1) {
        this.selectedIds.splice(index, 1);
      } else {
        this.selectedIds.push(item.id);
      }
    },
    // 删除按钮操作
    handleDelete() {
      if (!this.selectedIds.length) {
        uni.showToast({
          title: '请选择要删除的数据',
          icon: 'none'
        });
        return;
      }
      uni.showModal({
        title: '提示',
        content: '是否确认删除选中的数据？',
        success: (res) => {
          if (res.confirm) {
            delHistorical_health_data(this.selectedIds.join(',')).then(() => {
              this.getList();
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              });
            });
          }
        }
      });
    },
    // 导出按钮操作
    handleExport() {
      uni.showLoading({
        title: '导出中...'
      });
      // 这里实现导出逻辑
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '导出成功',
          icon: 'success'
        });
      }, 1500);
    },
    // 导入按钮操作
    handleImport() {
      uni.chooseFile({
        count: 1,
        type: 'file',
        extension: ['.csv'],
        success: (res) => {
          // 这里实现导入逻辑
          uni.showLoading({
            title: '导入中...'
          });
          setTimeout(() => {
            uni.hideLoading();
            uni.showToast({
              title: '导入成功',
              icon: 'success'
            });
          }, 1500);
        }
      });
    },
    // 显示用户搜索
    showUserSearch() {
      this.$refs.userSearchPopup.open();
    },
    // 关闭用户搜索
    closeUserSearch() {
      this.$refs.userSearchPopup.close();
    },
    // 处理用户选择
    handleUserSelect(user) {
      this.queryParams.userId = user.userId;
      this.queryParams.userName = user.userName;
      this.selectedUser = user;
      this.closeUserSearch();
    },
    // 开始日期变化
    onStartDateChange(e) {
      this.dateRange[0] = e.detail.value;
      this.queryParams.beginTime = e.detail.value;
    },
    // 结束日期变化
    onEndDateChange(e) {
      this.dateRange[1] = e.detail.value;
      this.queryParams.endTime = e.detail.value;
    },
    // 处理统计报告
    handleReport() {
      if (!this.queryParams.userId) {
        uni.showToast({
          title: '请先选择用户',
          icon: 'none'
        });
        return;
      }
      this.calculateStatistics();
      this.$refs.reportPopup.open();
    },
    // 计算统计数据
    calculateStatistics() {
      const userHealthData = this.healthList.filter(item => item.userId === this.queryParams.userId);
      
      // 按日期排序
      userHealthData.sort((a, b) => new Date(a.createTime) - new Date(b.createTime));
      
      // 准备趋势数据
      this.trendData = {
        dates: userHealthData.map(item => this.formatDate(item.createTime)),
        bmi: userHealthData.map(item => this.calculateBMI(item)),
        bloodGlucose: userHealthData.map(item => item.bloodGlucose),
        bloodPressure: userHealthData.map(item => `${item.systolicPressure}/${item.diastolicPressure}`)
      };
      
      // 计算平均值
      const bmiValues = this.trendData.bmi.filter(v => v !== '-').map(Number);
      const bloodGlucoseValues = this.trendData.bloodGlucose.map(Number);
      const systolicValues = userHealthData.map(item => Number(item.systolicPressure));
      const diastolicValues = userHealthData.map(item => Number(item.diastolicPressure));
      
      this.averageBMI = (bmiValues.reduce((a, b) => a + b, 0) / bmiValues.length).toFixed(1);
      this.averageBloodGlucose = (bloodGlucoseValues.reduce((a, b) => a + b, 0) / bloodGlucoseValues.length).toFixed(1);
      this.averageBloodPressure = `${(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length).toFixed(0)}/${(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length).toFixed(0)}`;
    },
    // 关闭统计报告
    closeReport() {
      this.$refs.reportPopup.close();
    },
    // 分页按钮操作
    handlePageChange(page) {
      this.queryParams.pageNum = page;
      this.getList();
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

.search-bar {
  background: #fff;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .search-form {
    .form-item {
      margin-bottom: 20rpx;

      .form-label {
        display: block;
        font-size: 28rpx;
        color: #606266;
        margin-bottom: 10rpx;
      }

      .form-input {
        background: #f5f7fa;
        padding: 20rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .date-picker {
        flex: 1;
      }

      .date-separator {
        margin: 0 20rpx;
        color: #909399;
      }

      .picker-item {
        background: #f5f7fa;
        padding: 20rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
      }
    }

    .search-buttons {
      display: flex;
      gap: 20rpx;

      button {
        flex: 1;
        font-size: 28rpx;
        padding: 20rpx 0;
      }

      .search-btn {
        background: #409EFF;
        color: #fff;
      }

      .reset-btn {
        background: #f5f7fa;
        color: #666;
      }
    }
  }
}

.action-bar {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    font-size: 28rpx;
    padding: 20rpx 0;
    border-radius: 8rpx;

    &[disabled] {
      opacity: 0.6;
    }

    &.report {
      background: #409EFF;
      color: #fff;
    }

    &.delete {
      background: #F56C6C;
      color: #fff;
    }

    &.export {
      background: #67C23A;
      color: #fff;
    }

    &.import {
      background: #E6A23C;
      color: #fff;
    }
  }
}

.health-list {
  .health-card {
    background: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

    &.selected {
      border: 2rpx solid #409EFF;
      background: #ecf5ff;
    }

    .health-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .user-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #303133;
      }

      .record-time {
        font-size: 24rpx;
        color: #909399;
      }
    }

    .health-content {
      .health-item {
        display: flex;
        margin-bottom: 10rpx;
        font-size: 28rpx;

        .label {
          color: #606266;
          width: 240rpx;
        }

        .value {
          color: #303133;
          flex: 1;
        }
      }
    }
  }
}

.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;

  .page-info {
    font-size: 24rpx;
    color: #909399;
    margin-bottom: 20rpx;
  }

  .page-buttons {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .page-btn {
      font-size: 28rpx;
      padding: 10rpx 30rpx;
      background: #409EFF;
      color: #fff;
      border-radius: 8rpx;

      &[disabled] {
        background: #a0cfff;
      }
    }

    .page-num {
      font-size: 28rpx;
      color: #303133;
    }
  }
}

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

  &.user-search-popup,
  &.report-popup {
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

  .popup-body {
    padding: 30rpx;

    .user-info {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;

      .user-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        margin-right: 20rpx;
      }

      .user-detail {
        .user-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #303133;
          margin-bottom: 10rpx;
          display: block;
        }

        .user-nickname {
          font-size: 24rpx;
          color: #909399;
        }
      }
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20rpx;
      margin-bottom: 30rpx;

      .summary-item {
        background: #f5f7fa;
        padding: 20rpx;
        border-radius: 8rpx;
        text-align: center;

        .label {
          font-size: 24rpx;
          color: #909399;
          margin-bottom: 10rpx;
          display: block;
        }

        .value {
          font-size: 32rpx;
          color: #303133;
          font-weight: bold;
        }
      }
    }

    .trend-list {
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 20rpx;

      .trend-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #303133;
        margin-bottom: 20rpx;
        padding-left: 20rpx;
        border-left: 4rpx solid #409EFF;
      }

      .trend-item {
        background: #fff;
        border-radius: 8rpx;
        padding: 20rpx;
        margin-bottom: 20rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .trend-date {
          font-size: 24rpx;
          color: #909399;
          margin-bottom: 10rpx;
        }

        .trend-values {
          .trend-value {
            display: flex;
            font-size: 26rpx;
            margin-bottom: 6rpx;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              color: #606266;
              width: 120rpx;
            }

            .value {
              color: #303133;
              flex: 1;
            }
          }
        }
      }
    }
  }
}

.loading-box {
  padding: 40rpx 0;
  text-align: center;
}

// 添加遮罩层样式
:deep(.uni-popup) {
  .uni-popup__mask {
    background-color: rgba(0, 0, 0, 0.6);
  }
}
</style> 