<template>
  <view class="behavior-container">
    <!-- 搜索表单 -->
    <view class="search-form">
      <view class="form-item">
        <text class="label">订单状态</text>
        <picker @change="handleStatusChange" :value="statusIndex" :range="statusOptions" range-key="label">
          <view class="picker-value">
            {{ statusOptions[statusIndex].label || '请选择订单状态' }}
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="label">用户</text>
        <view class="user-select" @click="showUserSearch">
          <text class="select-value">{{ queryParams.userName || '请选择用户' }}</text>
          <uni-icons type="search" size="16" color="#909399"></uni-icons>
        </view>
      </view>
      
      <view class="form-item">
        <text class="label">时间范围</text>
        <view class="date-range">
          <picker mode="date" :value="queryParams.beginTime" @change="handleStartDateChange">
            <view class="date-picker">{{ queryParams.beginTime || '开始日期' }}</view>
          </picker>
          <text class="date-separator">至</text>
          <picker mode="date" :value="queryParams.endTime" @change="handleEndDateChange">
            <view class="date-picker">{{ queryParams.endTime || '结束日期' }}</view>
          </picker>
        </view>
      </view>
      
      <view class="form-buttons">
        <button class="search-btn" @click="handleQuery">搜索</button>
        <button class="reset-btn" @click="resetQuery">重置</button>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="action-btn export-btn" @click="handleExport">
        <uni-icons type="download" size="16" color="#fff"></uni-icons>
        <text>导出</text>
      </button>
    </view>

    <!-- 数据列表 -->
    <view class="data-list">
      <view class="list-item" v-for="(item, index) in ordering_recordList" :key="index">
        <view class="item-header">
          <text class="user-name" @click="handleUserInfo(item)">{{ item.userName }}</text>
          <text class="order-status" :class="'status-' + item.status">
            {{ getStatusText(item.status) }}
          </text>
        </view>
        
        <view class="item-content">
          <view class="content-row">
            <text class="label">总热量：</text>
            <text class="value">{{ calculateTotalCalories(item) }} kcal</text>
          </view>
          <view class="content-row">
            <text class="label">菜品总数：</text>
            <text class="value">{{ item.dishCount }}</text>
          </view>
          <view class="content-row">
            <text class="label">创建时间：</text>
            <text class="value">{{ item.createTime }}</text>
          </view>
        </view>
        
        <view class="item-actions">
          <button class="action-link" @click="handleView(item)">查看详情</button>
          <button class="action-link delete" @click="handleDelete(item)">删除</button>
        </view>
      </view>
    </view>

    <!-- 分页器 -->
    <view class="pagination" v-if="total > 0">
      <view class="page-info">
        共 {{ total }} 条记录
      </view>
      <view class="page-buttons">
        <button 
          class="page-btn" 
          :disabled="queryParams.pageNum <= 1"
          @click="handlePageChange(queryParams.pageNum - 1)"
        >上一页</button>
        <text class="page-text">{{ queryParams.pageNum }} / {{ totalPages }}</text>
        <button 
          class="page-btn" 
          :disabled="queryParams.pageNum >= totalPages"
          @click="handlePageChange(queryParams.pageNum + 1)"
        >下一页</button>
      </view>
    </view>

    <!-- 用户搜索弹窗 -->
    <uni-popup ref="userSearchPopup" type="center">
      <view class="popup-content">
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
          <text class="popup-title">用户营养摄入统计报告</text>
          <button class="close-btn" @click="closeReport">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <view class="report-content" v-if="selected_user">
            <view class="user-info">
              <image class="user-avatar" :src="selected_user.avatar || '/static/images/profile.jpg'" mode="aspectFill"></image>
              <view class="user-detail">
                <text class="user-name">{{ selected_user.userName }}</text>
                <text class="user-nickname">{{ selected_user.nickName }}</text>
              </view>
            </view>
            
            <view class="report-summary">
              <view class="summary-item">
                <text class="label">平均每日热量</text>
                <text class="value">{{ averageCalories }} kcal</text>
              </view>
              <view class="summary-item">
                <text class="label">最高热量</text>
                <text class="value">{{ maxCalories }} kcal</text>
              </view>
              <view class="summary-item">
                <text class="label">最低热量</text>
                <text class="value">{{ minCalories }} kcal</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 订单详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-content detail-popup">
        <view class="popup-header">
          <text class="popup-title">订单详细信息</text>
          <button class="close-btn" @click="closeDetail">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <view class="detail-content" v-if="currentOrder">
            <!-- 基本信息 -->
            <view class="detail-section">
              <view class="section-title">基本信息</view>
              <view class="info-grid">
                <view class="info-item">
                  <text class="label">订单编号</text>
                  <text class="value">{{ currentOrder.id }}</text>
                </view>
                <view class="info-item">
                  <text class="label">订单状态</text>
                  <text class="value status-tag" :class="'status-' + currentOrder.status">
                    {{ getStatusText(currentOrder.status) }}
                  </text>
                </view>
                <view class="info-item">
                  <text class="label">总价格</text>
                  <text class="value">¥{{ currentOrder.price }}</text>
                </view>
                <view class="info-item">
                  <text class="label">菜品总数</text>
                  <text class="value">{{ currentOrder.dishCount }}</text>
                </view>
                <view class="info-item">
                  <text class="label">创建时间</text>
                  <text class="value">{{ currentOrder.createTime }}</text>
                </view>
                <view class="info-item">
                  <text class="label">总热量</text>
                  <text class="value">{{ calculateTotalCalories(currentOrder) }} kcal</text>
                </view>
              </view>
            </view>

            <!-- 菜品列表 -->
            <view class="detail-section">
              <view class="section-title">菜品列表</view>
              <view class="dish-list">
                <view class="dish-item" v-for="(dish, index) in parsedDishes" :key="index">
                  <view class="dish-info">
                    <text class="dish-name">{{ dish.name }}</text>
                    <view class="dish-detail">
                      <text class="dish-price">¥{{ dish.price }}</text>
                      <text class="dish-calories">{{ dish.calories }} kcal</text>
                    </view>
                    <view class="dish-nutrition">
                      <text class="nutrition-item">蛋白质: {{ dish.protein }}g</text>
                      <text class="nutrition-item">碳水: {{ dish.carbohydrates }}g</text>
                      <text class="nutrition-item">脂肪: {{ dish.fat }}g</text>
                    </view>
                  </view>
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
import { listOrdering_record_with_userinfo, delOrdering_record } from "@/api/dish/ordering_record";
import UserSearch from '@/components/user/UserSearch.vue';

export default {
  components: {
    UserSearch
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 历史点餐记录表格数据
      ordering_recordList: [],
      // 用户信息列表
      user_infoList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: null,
        userId: null,
        userName: null,
        beginTime: null,
        endTime: null,
      },
      // 状态选项
      statusOptions: [
        { value: '', label: '全部' },
        { value: '0', label: '待处理' },
        { value: '1', label: '已完成' },
        { value: '2', label: '已取消' }
      ],
      statusIndex: 0,
      // 选中的用户
      selected_user: null,
      // 统计数据
      averageCalories: 0,
      maxCalories: 0,
      minCalories: 0,
      currentOrder: null,
      parsedDishes: [],
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
    /** 查询历史点餐记录列表 */
    getList() {
      this.loading = true;
      listOrdering_record_with_userinfo(this.queryParams).then(response => {
        this.ordering_recordList = response.rows.map(item => item.orderingRecord);
        this.user_infoList = response.rows.map(item => item.user);
        for (let i = 0; i < this.ordering_recordList.length; i++) {
          this.ordering_recordList[i].userName = this.user_infoList[i].userName;
          this.ordering_recordList[i].user = this.user_infoList[i];
        }
        this.total = response.total;
        this.loading = false;
      });
    },
    
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    
    /** 重置按钮操作 */
    resetQuery() {
      this.statusIndex = 0;
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        status: null,
        userId: null,
        userName: null,
        beginTime: null,
        endTime: null,
      };
      this.handleQuery();
    },
    
    /** 状态选择器变化 */
    handleStatusChange(e) {
      this.statusIndex = e.detail.value;
      this.queryParams.status = this.statusOptions[this.statusIndex].value;
    },
    
    /** 开始日期变化 */
    handleStartDateChange(e) {
      this.queryParams.beginTime = e.detail.value;
    },
    
    /** 结束日期变化 */
    handleEndDateChange(e) {
      this.queryParams.endTime = e.detail.value;
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
      this.queryParams.userId = user.userId;
      this.queryParams.userName = user.userName;
      this.selected_user = user;
      this.closeUserSearch();
    },
    
    /** 获取状态文本 */
    getStatusText(status) {
      const option = this.statusOptions.find(item => item.value === status);
      return option ? option.label : '未知状态';
    },
    
    /** 计算订单总热量 */
    calculateTotalCalories(row) {
      try {
        const dishes = JSON.parse(row.dishes);
        return dishes.reduce((total, dish) => total + (dish.calories || 0), 0);
      } catch (e) {
        return 0;
      }
    },
    
    /** 查看用户信息 */
    handleUserInfo(row) {
      this.selected_user = row.user;
      uni.showModal({
        title: '用户信息',
        content: `用户名：${row.user.userName}\n昵称：${row.user.nickName}\n手机号：${row.user.phonenumber}`,
        showCancel: false
      });
    },
    
    /** 查看详情 */
    handleView(row) {
      this.currentOrder = row;
      try {
        this.parsedDishes = JSON.parse(row.dishes);
      } catch (e) {
        this.parsedDishes = [];
        console.error('解析菜品数据失败:', e);
      }
      this.$refs.detailPopup.open();
    },
    
    /** 关闭详情弹窗 */
    closeDetail() {
      this.$refs.detailPopup.close();
      this.currentOrder = null;
      this.parsedDishes = [];
    },
    
    /** 删除操作 */
    handleDelete(row) {
      const ids = row ? [row.id] : this.ids;
      uni.showModal({
        title: '提示',
        content: '是否确认删除选中的数据项？',
        success: (res) => {
          if (res.confirm) {
            delOrdering_record(ids.join(',')).then(() => {
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
    
    /** 导出操作 */
    handleExport() {
      uni.showToast({
        title: '导出功能开发中',
        icon: 'none'
      });
    },
    
    /** 处理统计报告 */
    handleReport() {
      if (!this.queryParams.userId) {
        uni.showToast({
          title: '请先选择用户',
          icon: 'none'
        });
        return;
      }
      
      this.selected_user = this.user_infoList.find(user => user.userId === this.queryParams.userId);
      if (!this.selected_user) {
        uni.showToast({
          title: '未找到用户信息',
          icon: 'none'
        });
        return;
      }
      
      // 计算统计数据
      const calories = this.ordering_recordList
        .filter(record => record.userId === this.queryParams.userId)
        .map(record => this.calculateTotalCalories(record));
      
      if (calories.length > 0) {
        this.averageCalories = Math.round(calories.reduce((a, b) => a + b, 0) / calories.length);
        this.maxCalories = Math.max(...calories);
        this.minCalories = Math.min(...calories);
      }
      
      this.$refs.reportPopup.open();
    },
    
    /** 关闭统计报告 */
    closeReport() {
      this.$refs.reportPopup.close();
    },
    
    /** 页码变化 */
    handlePageChange(page) {
      this.queryParams.pageNum = page;
      this.getList();
    }
  }
};
</script>

<style lang="scss" scoped>
.behavior-container {
  padding: 20rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

.search-form {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);

  .form-item {
    margin-bottom: 20rpx;

    .label {
      font-size: 28rpx;
      color: #606266;
      margin-bottom: 10rpx;
      display: block;
    }

    .picker-value, .user-select, .date-picker {
      height: 80rpx;
      line-height: 80rpx;
      padding: 0 20rpx;
      background: #f5f7fa;
      border-radius: 10rpx;
      font-size: 28rpx;
      color: #303133;
    }

    .user-select {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .date-separator {
        color: #909399;
      }
    }
  }

  .form-buttons {
    display: flex;
    gap: 20rpx;
    margin-top: 30rpx;

    button {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border-radius: 10rpx;

      &.search-btn {
        background: #409EFF;
        color: #fff;
      }

      &.reset-btn {
        background: #f5f7fa;
        color: #606266;
      }
    }
  }
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .action-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    font-size: 28rpx;
    color: #fff;
    border-radius: 10rpx;

    &.report-btn {
      background: #409EFF;
    }

    &.delete-btn {
      background: #F56C6C;
    }

    &.export-btn {
      background: #67C23A;
    }

    &:disabled {
      opacity: 0.6;
    }
  }
}

.data-list {
  .list-item {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .user-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #409EFF;
      }

      .order-status {
        font-size: 24rpx;
        padding: 4rpx 16rpx;
        border-radius: 20rpx;

        &.status-0 {
          background: #e6f7ff;
          color: #1890ff;
        }

        &.status-1 {
          background: #f6ffed;
          color: #52c41a;
        }

        &.status-2 {
          background: #fff2f0;
          color: #ff4d4f;
        }
      }
    }

    .item-content {
      .content-row {
        display: flex;
        margin-bottom: 10rpx;
        font-size: 28rpx;

        .label {
          color: #909399;
          width: 160rpx;
        }

        .value {
          color: #303133;
          flex: 1;
        }
      }
    }

    .item-actions {
      display: flex;
      justify-content: flex-end;
      gap: 20rpx;
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1px solid #f5f5f5;

      .action-link {
        font-size: 28rpx;
        color: #409EFF;
        background: none;
        padding: 0;
        line-height: 1;

        &.delete {
          color: #F56C6C;
        }
      }
    }
  }
}

.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);

  .page-info {
    font-size: 28rpx;
    color: #909399;
    margin-bottom: 20rpx;
  }

  .page-buttons {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .page-btn {
      width: 160rpx;
      height: 60rpx;
      line-height: 60rpx;
      font-size: 28rpx;
      color: #409EFF;
      background: #f5f7fa;
      border-radius: 30rpx;

      &:disabled {
        opacity: 0.6;
      }
    }

    .page-text {
      font-size: 28rpx;
      color: #606266;
    }
  }
}

.popup-content {
  background: #fff;
  border-radius: 20rpx;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #f5f5f5;

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
  }

  &.report-popup {
    .report-content {
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
            font-size: 28rpx;
            color: #909399;
          }
        }
      }

      .report-summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20rpx;

        .summary-item {
          background: #f5f7fa;
          border-radius: 10rpx;
          padding: 20rpx;
          text-align: center;

          .label {
            font-size: 24rpx;
            color: #909399;
            margin-bottom: 10rpx;
            display: block;
          }

          .value {
            font-size: 32rpx;
            font-weight: bold;
            color: #303133;
          }
        }
      }
    }
  }
}

.detail-popup {
  .detail-content {
    .detail-section {
      margin-bottom: 30rpx;

      .section-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #303133;
        margin-bottom: 20rpx;
        padding-left: 20rpx;
        border-left: 8rpx solid #409EFF;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20rpx;
        background: #f5f7fa;
        border-radius: 10rpx;
        padding: 20rpx;

        .info-item {
          .label {
            font-size: 24rpx;
            color: #909399;
            margin-bottom: 8rpx;
            display: block;
          }

          .value {
            font-size: 28rpx;
            color: #303133;

            &.status-tag {
              display: inline-block;
              padding: 4rpx 16rpx;
              border-radius: 20rpx;
              font-size: 24rpx;

              &.status-0 {
                background: #e6f7ff;
                color: #1890ff;
              }

              &.status-1 {
                background: #f6ffed;
                color: #52c41a;
              }

              &.status-2 {
                background: #fff2f0;
                color: #ff4d4f;
              }
            }
          }
        }
      }

      .dish-list {
        .dish-item {
          background: #f5f7fa;
          border-radius: 10rpx;
          padding: 20rpx;
          margin-bottom: 20rpx;

          &:last-child {
            margin-bottom: 0;
          }

          .dish-info {
            .dish-name {
              font-size: 28rpx;
              font-weight: bold;
              color: #303133;
              margin-bottom: 10rpx;
              display: block;
            }

            .dish-detail {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10rpx;

              .dish-price {
                font-size: 28rpx;
                color: #f56c6c;
              }

              .dish-calories {
                font-size: 24rpx;
                color: #909399;
              }
            }

            .dish-nutrition {
              display: flex;
              gap: 20rpx;
              font-size: 24rpx;
              color: #606266;

              .nutrition-item {
                background: #fff;
                padding: 4rpx 12rpx;
                border-radius: 6rpx;
              }
            }
          }
        }
      }
    }
  }
}
</style> 