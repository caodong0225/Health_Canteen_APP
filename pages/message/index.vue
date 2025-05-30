<template>
  <view class="app-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-form">
        <view class="form-item">
          <input 
            type="text" 
            v-model="queryParams.userName" 
            placeholder="请选择用户"
            readonly
            class="search-input"
            @click="showUserSearch"
          />
          <button class="search-icon-btn" @click="showUserSearch">
            <uni-icons type="search" size="16" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="form-item">
          <picker 
            mode="date" 
            :value="dateRange[0]"
            @change="onStartDateChange"
          >
            <view class="picker-item">
              <text>开始日期：{{ dateRange[0] || '请选择' }}</text>
            </view>
          </picker>
        </view>
        <view class="form-item">
          <picker 
            mode="date" 
            :value="dateRange[1]"
            @change="onEndDateChange"
          >
            <view class="picker-item">
              <text>结束日期：{{ dateRange[1] || '请选择' }}</text>
            </view>
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
      <button class="action-btn edit" @click="handleUpdate" :disabled="!selectedMessage">
        <uni-icons type="compose" size="16" color="#fff"></uni-icons>
        <text>修改</text>
      </button>
      <button class="action-btn delete" @click="handleDelete" :disabled="!selectedMessage">
        <uni-icons type="trash" size="16" color="#fff"></uni-icons>
        <text>删除</text>
      </button>
      <button class="action-btn export" @click="handleExport">
        <uni-icons type="download" size="16" color="#fff"></uni-icons>
        <text>导出</text>
      </button>
    </view>

    <!-- 消息列表 -->
    <view class="message-list" v-if="!loading">
      <view 
        class="message-card" 
        v-for="item in messageList" 
        :key="item.id"
        :class="{ 'selected': selectedMessage && selectedMessage.id === item.id }"
        @click="handleSelectMessage(item)"
      >
        <view class="message-header">
          <view class="message-user" @click.stop="showUserDetail(item)">
            <text class="user-name">{{ item.username }}</text>
            <uni-icons type="right" size="14" color="#909399"></uni-icons>
          </view>
          <text class="message-time">{{ formatDate(item.createTime) }}</text>
        </view>
        <view class="message-content">
          <text>{{ item.content }}</text>
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

    <!-- 添加或修改消息弹窗 -->
    <uni-popup ref="formPopup" type="center">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ title }}</text>
          <button class="close-btn" @click="cancel">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <view class="form-content">
            <view class="form-item">
              <text class="form-label">用户</text>
              <view class="form-input" disabled>
                <text>{{ form.userName || '请选择用户' }}</text>
              </view>
            </view>
            <view class="form-item">
              <text class="form-label">消息内容</text>
              <textarea 
                v-model="form.content" 
                placeholder="请输入消息内容"
                class="form-textarea"
              />
            </view>
          </view>
          <view class="form-buttons">
            <button class="submit-btn" @click="submitForm">确定</button>
            <button class="cancel-btn" @click="cancel">取消</button>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 用户详情弹窗 -->
    <uni-popup ref="userDetailPopup" type="center">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">用户详细信息</text>
          <button class="close-btn" @click="closeUserDetail">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <view class="user-detail">
            <view class="user-header">
              <image 
                :src="detailForm.avatar || '/static/images/profile.jpg'" 
                class="user-avatar"
                mode="aspectFill"
              ></image>
              <view class="user-info">
                <text class="user-nickname">{{ detailForm.nickName }}</text>
                <text class="user-name">{{ detailForm.userName }}</text>
              </view>
            </view>
            <view class="user-details">
              <view class="detail-item">
                <text class="label">用户邮箱</text>
                <text class="value">{{ detailForm.email || '未设置' }}</text>
              </view>
              <view class="detail-item">
                <text class="label">手机号码</text>
                <text class="value">{{ detailForm.phonenumber || '未设置' }}</text>
              </view>
              <view class="detail-item">
                <text class="label">用户性别</text>
                <text class="value">{{ detailForm.sex === '0' ? '男' : detailForm.sex === '1' ? '女' : '未知' }}</text>
              </view>
              <view class="detail-item">
                <text class="label">账号状态</text>
                <text class="value" :class="detailForm.status === '0' ? 'status-normal' : 'status-disabled'">
                  {{ detailForm.status === '0' ? '正常' : '停用' }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>

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
import { listMessage, getMessage, delMessage, addMessage, updateMessage } from "@/api/resource/message";
import { getUser, listUser } from "@/api/system/user";
import UserSearch from '@/components/user/UserSearch.vue';

export default {
  name: "Message",
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
      // 总条数
      total: 0,
      // 消息列表数据
      messageList: [],
      // 用户列表
      userList: [],
      // 选中的消息
      selectedMessage: null,
      // 弹出层标题
      title: "",
      // 日期范围
      dateRange: [],
      // 用户详情数据
      detailForm: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        userName: null,
        beginTime: null,
        endTime: null
      },
      // 表单参数
      form: {
        id: null,
        userId: null,
        userName: null,
        content: null
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
  onPullDownRefresh() {
    // 禁用下拉刷新
    uni.stopPullDownRefresh();
  },
  methods: {
    // 格式化日期
    formatDate(date) {
      if (!date) return '';
      if (typeof date === 'string') {
        date = new Date(date);
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },
    // 获取用户名
    getUserName(userId) {
      const user = this.userList.find(item => item.userId === userId);
      return user ? user.userName : '未知用户';
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
    /** 查询消息列表 */
    getList() {
      this.loading = true;
      listMessage(this.queryParams).then(response => {
        this.messageList = response.rows;
        this.total = response.total;
        listUser({pageNum: 1, pageSize: 9999}).then(response => {
          this.userList = response.rows;
        });
        this.loading = false;
      }).catch(() => {
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
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        userName: null,
        beginTime: null,
        endTime: null
      };
      this.dateRange = [];
      this.handleQuery();
    },
    /** 选择消息 */
    handleSelectMessage(message) {
      this.selectedMessage = message;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.form = {
        id: null,
        userId: null,
        userName: null,
        content: null
      };
      this.title = "添加消息";
      this.$refs.formPopup.open();
    },
    /** 修改按钮操作 */
    handleUpdate() {
      if (!this.selectedMessage) {
        uni.showToast({
          title: '请选择消息',
          icon: 'none'
        });
        return;
      }
      getMessage(this.selectedMessage.id).then(response => {
        const data = response.data;
        this.form = {
          ...data,
          userName: this.getUserName(data.userId)
        };
        this.title = "修改消息";
        this.$refs.formPopup.open();
      });
    },
    /** 提交表单 */
    submitForm() {
      if (!this.form.userId) {
        uni.showToast({
          title: '请选择用户',
          icon: 'none'
        });
        return;
      }
      if (!this.form.content) {
        uni.showToast({
          title: '请输入消息内容',
          icon: 'none'
        });
        return;
      }

      const submitData = {
        ...this.form,
        userName: undefined
      };

      if (this.form.id != null) {
        updateMessage(submitData).then(() => {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          });
          this.$refs.formPopup.close();
          this.getList();
        });
      } else {
        addMessage(submitData).then(() => {
          uni.showToast({
            title: '新增成功',
            icon: 'success'
          });
          this.$refs.formPopup.close();
          this.getList();
        });
      }
    },
    /** 取消按钮 */
    cancel() {
      this.$refs.formPopup.close();
      this.form = {
        id: null,
        userId: null,
        userName: null,
        content: null
      };
    },
    /** 删除按钮操作 */
    handleDelete() {
      if (!this.selectedMessage) {
        uni.showToast({
          title: '请选择消息',
          icon: 'none'
        });
        return;
      }
      uni.showModal({
        title: '提示',
        content: '是否确认删除该消息？',
        success: (res) => {
          if (res.confirm) {
            delMessage(this.selectedMessage.id).then(() => {
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
    /** 导出按钮操作 */
    handleExport() {
      uni.showLoading({
        title: '导出中...'
      });
      // 这里需要实现导出功能
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '导出成功',
          icon: 'success'
        });
      }, 1500);
    },
    /** 显示用户详情 */
    showUserDetail(message) {
      getUser(message.userId).then(response => {
        this.detailForm = response.data;
        this.$refs.userDetailPopup.open();
      });
    },
    /** 关闭用户详情 */
    closeUserDetail() {
      this.$refs.userDetailPopup.close();
    },
    /** 显示用户搜索 */
    showUserSearch() {
      this.$refs.userSearchPopup.open();
    },
    /** 关闭用户搜索 */
    closeUserSearch() {
      this.$refs.userSearchPopup.close();
    },
    /** 处理用户选择 */
    handleUserSelect(user) {
      if (this.$refs.formPopup.isOpen) {
        // 编辑表单选择用户
        this.form.userId = user.userId;
        this.form.userName = user.userName;
      } else {
        // 查询表单选择用户
        this.queryParams.userId = user.userId;
        this.queryParams.userName = user.userName;
      }
      this.closeUserSearch();
    },
    /** 分页按钮操作 */
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
      position: relative;

      .search-input {
        width: 100%;
        height: 80rpx;
        background: #f5f7fa;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
      }

      .search-icon-btn {
        position: absolute;
        right: 20rpx;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        padding: 10rpx;
      }

      .picker-item {
        background: #f5f7fa;
        padding: 20rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #333;
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

    &.add {
      background: #409EFF;
      color: #fff;
    }

    &.edit {
      background: #67C23A;
      color: #fff;
    }

    &.delete {
      background: #F56C6C;
      color: #fff;
    }

    &.export {
      background: #909399;
      color: #fff;
    }
  }
}

.message-list {
  .message-card {
    background: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &.selected {
      border: 2rpx solid #409EFF;
      background: #ecf5ff;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .message-user {
        display: flex;
        align-items: center;
        gap: 10rpx;
        color: #409EFF;
        font-size: 28rpx;
      }

      .message-time {
        font-size: 24rpx;
        color: #909399;
      }
    }

    .message-content {
      font-size: 28rpx;
      color: #303133;
      line-height: 1.6;
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
  width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;

  &.user-search-popup {
    width: 90vw;
    max-height: 90vh;
    
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

    .form-content {
      .form-item {
        margin-bottom: 30rpx;

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
          color: #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-textarea {
          width: 100%;
          height: 200rpx;
          background: #f5f7fa;
          border-radius: 8rpx;
          padding: 20rpx;
          font-size: 28rpx;
        }
      }
    }

    .form-buttons {
      display: flex;
      gap: 20rpx;
      margin-top: 40rpx;

      button {
        flex: 1;
        font-size: 28rpx;
        padding: 20rpx 0;
        border-radius: 8rpx;
      }

      .submit-btn {
        background: #409EFF;
        color: #fff;
      }

      .cancel-btn {
        background: #f5f7fa;
        color: #666;
      }
    }
  }
}

.user-detail {
  .user-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    .user-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-right: 20rpx;
    }

    .user-info {
      .user-nickname {
        font-size: 32rpx;
        font-weight: bold;
        color: #303133;
        display: block;
        margin-bottom: 8rpx;
      }

      .user-name {
        font-size: 24rpx;
        color: #909399;
      }
    }
  }

  .user-details {
    .detail-item {
      display: flex;
      margin-bottom: 20rpx;
      font-size: 28rpx;

      .label {
        color: #909399;
        width: 160rpx;
      }

      .value {
        color: #303133;
        flex: 1;

        &.status-normal {
          color: #67C23A;
        }

        &.status-disabled {
          color: #F56C6C;
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