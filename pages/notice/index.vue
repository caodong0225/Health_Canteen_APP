<template>
  <view class="app-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-form">
        <view class="form-item">
          <input 
            type="text" 
            v-model="queryParams.noticeTitle" 
            placeholder="请输入公告标题"
            class="search-input"
          />
        </view>
        <view class="form-item">
          <picker 
            :range="noticeTypeOptions" 
            range-key="label"
            :value="noticeTypeIndex"
            @change="onNoticeTypeChange"
          >
            <view class="picker-item">
              <text>{{ queryParams.noticeType ? noticeTypeOptions[noticeTypeIndex].label : '请选择公告类型' }}</text>
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
      <button class="action-btn add" @click="handleAdd">
        <uni-icons type="plusempty" size="16" color="#fff"></uni-icons>
        <text>新增</text>
      </button>
      <button class="action-btn delete" @click="handleDelete" :disabled="!selectedNotice">
        <uni-icons type="trash" size="16" color="#fff"></uni-icons>
        <text>删除</text>
      </button>
    </view>

    <!-- 通知列表 -->
    <view class="notice-list" v-if="!loading">
      <view 
        class="notice-card" 
        v-for="item in noticeList" 
        :key="item.noticeId"
        :class="{ 'selected': selectedNotice && selectedNotice.noticeId === item.noticeId }"
        @click="handleSelectNotice(item)"
      >
        <view class="notice-header">
          <view class="notice-title">
            <text class="title-text">{{ item.noticeTitle }}</text>
            <text class="notice-type" :class="getNoticeTypeClass(item.noticeType)">
              {{ getNoticeTypeLabel(item.noticeType) }}
            </text>
          </view>
          <text class="notice-status" :class="item.status === '0' ? 'status-normal' : 'status-disabled'">
            {{ item.status === '0' ? '正常' : '关闭' }}
          </text>
        </view>
        <view class="notice-info">
          <text class="creator">创建者：{{ item.createBy }}</text>
          <text class="time">创建时间：{{ formatDate(item.createTime) }}</text>
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

    <!-- 添加或修改通知弹窗 -->
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
              <text class="form-label">公告标题</text>
              <input 
                v-model="form.noticeTitle" 
                placeholder="请输入公告标题"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="form-label">公告类型</text>
              <picker 
                :range="noticeTypeOptions" 
                range-key="label"
                :value="formNoticeTypeIndex"
                @change="onFormNoticeTypeChange"
              >
                <view class="form-picker">
                  <text>{{ form.noticeType ? noticeTypeOptions[formNoticeTypeIndex].label : '请选择公告类型' }}</text>
                  <uni-icons type="right" size="14" color="#909399"></uni-icons>
                </view>
              </picker>
            </view>
            <view class="form-item" v-if="form.noticeType === '1'">
              <text class="form-label">目标用户</text>
              <view class="form-input" @click="showUserSearch">
                <text>{{ form.targetUserName || '请选择目标用户' }}</text>
                <uni-icons type="search" size="16" color="#909399"></uni-icons>
              </view>
            </view>
            <view class="form-item">
              <text class="form-label">状态</text>
              <radio-group class="radio-group" @change="onStatusChange">
                <label class="radio-item" v-for="(item, index) in statusOptions" :key="index">
                  <radio :value="item.value" :checked="form.status === item.value" />
                  <text>{{ item.label }}</text>
                </label>
              </radio-group>
            </view>
            <view class="form-item">
              <text class="form-label">内容</text>
              <textarea 
                v-model="form.noticeContent" 
                placeholder="请输入公告内容"
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
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from "@/api/system/notice";
import UserSearch from '@/components/user/UserSearch.vue';

export default {
  name: "Notice",
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
      // 通知列表数据
      noticeList: [],
      // 选中的通知
      selectedNotice: null,
      // 弹出层标题
      title: "",
      // 公告类型选项
      noticeTypeOptions: [
        { value: "1", label: "通知" },
        { value: "2", label: "公告" }
      ],
      // 状态选项
      statusOptions: [
        { value: "0", label: "正常" },
        { value: "1", label: "关闭" }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: undefined,
        createBy: undefined,
        noticeType: undefined
      },
      // 表单参数
      form: {
        noticeId: undefined,
        noticeTitle: undefined,
        noticeType: undefined,
        noticeContent: undefined,
        status: "0",
        targetId: undefined,
        targetUserName: undefined
      }
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.queryParams.pageSize);
    },
    noticeTypeIndex() {
      return this.noticeTypeOptions.findIndex(item => item.value === this.queryParams.noticeType);
    },
    formNoticeTypeIndex() {
      return this.noticeTypeOptions.findIndex(item => item.value === this.form.noticeType);
    }
  },
  onLoad() {
    this.getList();
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
      return `${year}-${month}-${day}`;
    },
    // 获取公告类型标签
    getNoticeTypeLabel(type) {
      const option = this.noticeTypeOptions.find(item => item.value === type);
      return option ? option.label : '未知类型';
    },
    // 获取公告类型样式类
    getNoticeTypeClass(type) {
      return type === '1' ? 'type-notice' : 'type-announcement';
    },
    // 公告类型变化
    onNoticeTypeChange(e) {
      const index = e.detail.value;
      this.queryParams.noticeType = this.noticeTypeOptions[index].value;
    },
    // 表单公告类型变化
    onFormNoticeTypeChange(e) {
      const index = e.detail.value;
      this.form.noticeType = this.noticeTypeOptions[index].value;
      if (this.form.noticeType !== '1') {
        this.form.targetId = undefined;
        this.form.targetUserName = undefined;
      }
    },
    // 状态变化
    onStatusChange(e) {
      this.form.status = e.detail.value;
    },
    /** 查询通知列表 */
    getList() {
      this.loading = true;
      listNotice(this.queryParams).then(response => {
        this.noticeList = response.rows;
        this.total = response.total;
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
        noticeTitle: undefined,
        createBy: undefined,
        noticeType: undefined
      };
      this.handleQuery();
    },
    /** 选择通知 */
    handleSelectNotice(notice) {
      this.selectedNotice = notice;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.form = {
        noticeId: undefined,
        noticeTitle: undefined,
        noticeType: undefined,
        noticeContent: undefined,
        status: "0",
        targetId: undefined,
        targetUserName: undefined
      };
      this.title = "添加通知";
      this.$refs.formPopup.open();
    },
    /** 修改按钮操作 */
    handleUpdate() {
      if (!this.selectedNotice) {
        uni.showToast({
          title: '请选择通知',
          icon: 'none'
        });
        return;
      }
      getNotice(this.selectedNotice.noticeId).then(response => {
        this.form = response.data;
        this.title = "修改通知";
        this.$refs.formPopup.open();
      });
    },
    /** 提交表单 */
    submitForm() {
      if (!this.form.noticeTitle) {
        uni.showToast({
          title: '请输入公告标题',
          icon: 'none'
        });
        return;
      }
      if (!this.form.noticeType) {
        uni.showToast({
          title: '请选择公告类型',
          icon: 'none'
        });
        return;
      }
      if (this.form.noticeType === '1' && !this.form.targetId) {
        uni.showToast({
          title: '请选择目标用户',
          icon: 'none'
        });
        return;
      }

      const submitData = {
        ...this.form,
        targetUserName: undefined
      };

      if (this.form.noticeId != undefined) {
        updateNotice(submitData).then(() => {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          });
          this.$refs.formPopup.close();
          this.getList();
        });
      } else {
        addNotice(submitData).then(() => {
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
        noticeId: undefined,
        noticeTitle: undefined,
        noticeType: undefined,
        noticeContent: undefined,
        status: "0",
        targetId: undefined,
        targetUserName: undefined
      };
    },
    /** 删除按钮操作 */
    handleDelete() {
      if (!this.selectedNotice) {
        uni.showToast({
          title: '请选择通知',
          icon: 'none'
        });
        return;
      }
      uni.showModal({
        title: '提示',
        content: '是否确认删除该通知？',
        success: (res) => {
          if (res.confirm) {
            delNotice(this.selectedNotice.noticeId).then(() => {
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
      this.form.targetId = user.userId;
      this.form.targetUserName = user.userName;
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

      .search-input {
        width: 100%;
        height: 80rpx;
        background: #f5f7fa;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
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
  }
}

.notice-list {
  .notice-card {
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

    .notice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .notice-title {
        display: flex;
        align-items: center;
        gap: 20rpx;

        .title-text {
          font-size: 32rpx;
          font-weight: bold;
          color: #303133;
        }

        .notice-type {
          font-size: 24rpx;
          padding: 4rpx 12rpx;
          border-radius: 4rpx;

          &.type-notice {
            background: #ecf5ff;
            color: #409EFF;
          }

          &.type-announcement {
            background: #f0f9eb;
            color: #67C23A;
          }
        }
      }

      .notice-status {
        font-size: 24rpx;
        padding: 4rpx 12rpx;
        border-radius: 4rpx;

        &.status-normal {
          background: #f0f9eb;
          color: #67C23A;
        }

        &.status-disabled {
          background: #fef0f0;
          color: #F56C6C;
        }
      }
    }

    .notice-info {
      display: flex;
      justify-content: space-between;
      font-size: 24rpx;
      color: #909399;

      .creator, .time {
        display: flex;
        align-items: center;
        gap: 10rpx;
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
          width: 100%;
          height: 80rpx;
          background: #f5f7fa;
          border-radius: 8rpx;
          padding: 0 20rpx;
          font-size: 28rpx;
        }

        .form-picker {
          background: #f5f7fa;
          padding: 20rpx;
          border-radius: 8rpx;
          font-size: 28rpx;
          color: #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .radio-group {
          display: flex;
          gap: 30rpx;

          .radio-item {
            display: flex;
            align-items: center;
            gap: 10rpx;
            font-size: 28rpx;
          }
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