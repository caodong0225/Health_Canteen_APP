<template>
  <view class="user-search">
    <!-- 搜索表单 -->
    <view class="search-form">
      <view class="form-item">
        <text class="form-label">用户名称</text>
        <input 
          type="text" 
          v-model="form.userName" 
          placeholder="请输入用户名称"
          class="form-input"
          @confirm="handleQuery"
        />
      </view>
      <view class="form-item">
        <text class="form-label">手机号码</text>
        <input 
          type="text" 
          v-model="form.phonenumber" 
          placeholder="请输入手机号码"
          class="form-input"
          @confirm="handleQuery"
        />
      </view>
      <view class="search-buttons">
        <button class="search-btn" @click="handleQuery">搜索</button>
        <button class="reset-btn" @click="resetQuery">重置</button>
      </view>
    </view>

    <!-- 用户列表 -->
    <view class="user-list" v-if="!loading">
      <view 
        class="user-item" 
        v-for="item in userList" 
        :key="item.userId"
        @click="handleSelect(item)"
      >
        <view class="user-info">
          <view class="user-name-row">
            <text class="user-name">{{ item.userName }}</text>
            <text class="user-nickname">{{ item.nickName }}</text>
          </view>
          <view class="user-phone">{{ item.phonenumber }}</view>
        </view>
        <view class="user-status" :class="item.status === '0' ? 'status-normal' : 'status-disabled'">
          {{ item.status === '0' ? '正常' : '停用' }}
        </view>
      </view>
    </view>

    <!-- 加载中提示 -->
    <view class="loading-box" v-if="loading">
      <uni-load-more status="loading" :contentText="loadingText"></uni-load-more>
    </view>

    <!-- 分页器 -->
    <view class="pagination" v-if="total > 0 && showPagination">
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
  </view>
</template>

<script>
import { listUser } from '@/api/system/user'

export default {
  name: "UserSearch",
  props: {
    // 是否显示分页
    showPagination: {
      type: Boolean,
      default: true
    },
    // 每页显示条数
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      loadingText: {
        contentdown: "上拉加载更多",
        contentrefresh: "加载中...",
        contentnomore: "没有更多数据了"
      },
      // 总条数
      total: 0,
      // 用户列表数据
      userList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: this.pageSize,
        userName: null,
        phonenumber: null
      },
      // 表单参数
      form: {
        userName: null,
        phonenumber: null
      }
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.queryParams.pageSize);
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listUser(this.queryParams).then(res => {
        if (res.code === 200) {
          this.userList = res.rows;
          this.total = res.total;
        } else {
          uni.showToast({
            title: res.msg || '获取用户列表失败',
            icon: 'none'
          });
        }
      }).catch(error => {
        uni.showToast({
          title: '获取用户列表失败',
          icon: 'none'
        });
        console.error('获取用户列表失败:', error);
      }).finally(() => {
        this.loading = false;
      });
    },
       
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.queryParams.userName = this.form.userName;
      this.queryParams.phonenumber = this.form.phonenumber;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.form = {
        userName: null,
        phonenumber: null
      };
      this.queryParams = {
        pageNum: 1,
        pageSize: this.pageSize,
        userName: null,
        phonenumber: null
      };
      this.getList();
    },
    /** 选择用户 */
    handleSelect(user) {
      const userData = {
        userId: user.userId,
        userName: user.userName
      };
      this.$emit('select', userData);
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
.user-search {
  padding: 20rpx;
  background: #fff;
  border-radius: 12rpx;

  .search-form {
    margin-bottom: 20rpx;

    .form-item {
      margin-bottom: 20rpx;

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

  .user-list {
    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .user-info {
        flex: 1;

        .user-name-row {
          display: flex;
          align-items: center;
          gap: 10rpx;
          margin-bottom: 8rpx;

          .user-name {
            font-size: 28rpx;
            color: #303133;
            font-weight: bold;
          }

          .user-nickname {
            font-size: 24rpx;
            color: #909399;
          }
        }

        .user-phone {
          font-size: 24rpx;
          color: #606266;
        }
      }

      .user-status {
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

  .loading-box {
    padding: 40rpx 0;
    text-align: center;
  }
}
</style> 