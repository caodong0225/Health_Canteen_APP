<template>
  <view class="app-container">
    <view class="page-header" v-if="canteenTitle">
      <text class="header-title">{{ canteenTitle }}菜品管理</text>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-form">
        <view class="form-item">
          <text class="form-label">菜品名称</text>
          <input 
            class="form-input" 
            v-model="queryParams.name" 
            placeholder="请输入菜品名称"
            @confirm="handleQuery"
            type="text"
            confirm-type="search"
          />
        </view>
        <view class="form-item">
          <text class="form-label">口味</text>
          <picker 
            class="form-picker" 
            :range="flavorOptions" 
            range-key="dictLabel"
            @change="handleFlavorChange"
            mode="selector"
          >
            <view class="picker-value">
              {{ getFlavorLabel(queryParams.flavor) || '请选择口味' }}
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">菜系</text>
          <input 
            class="form-input" 
            v-model="queryParams.tag" 
            placeholder="请输入菜系"
            @confirm="handleQuery"
            type="text"
            confirm-type="search"
          />
        </view>
        <view class="search-buttons">
          <button class="search-btn" @click="handleQuery">搜索</button>
          <button class="reset-btn" @click="resetQuery">重置</button>
        </view>
      </view>
    </view>


    <!-- 菜品列表 -->
    <view class="dish-list" v-if="!loading">
      <view 
        class="dish-card" 
        v-for="item in managementList" 
        :key="item.managementId"
      >
        <view class="dish-header">
          <text class="dish-name">{{ item.name }}</text>
          <text class="dish-price">¥{{ item.price }}</text>
        </view>
        <view class="dish-content">
          <image 
            v-if="item.image" 
            :src="item.image" 
            mode="aspectFill" 
            class="dish-image"
            @click="previewImage(item.image)"
          ></image>
          <view class="dish-info">
            <view class="info-item">
              <text class="label">菜系：</text>
              <text class="value">{{ item.tag }}</text>
            </view>
            <view class="info-item">
              <text class="label">口味：</text>
              <text class="value">{{ getFlavorLabel(item.flavor) }}</text>
            </view>
            <view class="info-item">
              <text class="label">访问量：</text>
              <text class="value">{{ item.view }}</text>
            </view>
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
  </view>
</template>

<script>
import { listManagement, getManagement, delManagement, listManagementByCanteenId } from "@/api/dish/management";
import { getCanteen } from "@/api/resource/canteen";
import { getDicts } from "@/api/system/dict/data";

export default {
  name: "DishManagement",
  components: {
    uniLoadMore: () => import('@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue')
  },
  data() {
    return {
      // 食堂ID
      canteenId: null,
      // 遮罩层
      loading: true,
      loadingText: {
        contentdown: "上拉加载更多",
        contentrefresh: "加载中...",
        contentnomore: "没有更多数据了"
      },
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 食堂名称
      canteenTitle: null,
      // 总条数
      total: 0,
      // 菜品列表数据
      managementList: [],
      // 口味选项
      flavorOptions: [],
      // 字典数据
      dict: {
        type: {
          food_flavor: []
        }
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        flavor: null,
        tag: null,
        delFlag: "0"
      }
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.queryParams.pageSize);
    }
  },
  created() {
    this.getDicts();
    this.getList();
  },
  methods: {
    /** 获取字典数据 */
    getDicts() {
      getDicts("food_flavor").then(response => {
        this.dict.type.food_flavor = response.data;
        this.flavorOptions = response.data;
      });
    },
    /** 查询菜品列表 */
    getList() {
      this.loading = true;
      if (this.canteenId) {
        listManagementByCanteenId(this.canteenId, this.queryParams).then(response => {
          this.managementList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
        getCanteen(this.canteenId).then(response => {
          this.canteenTitle = response.data.name;
        });
      } else {
        this.canteenTitle = null;
        listManagement(this.queryParams).then(response => {
          this.managementList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      }
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
        name: null,
        flavor: null,
        tag: null,
        delFlag: "0"
      };
      this.handleQuery();
    },
    /** 口味选择器变化 */
    handleFlavorChange(e) {
      const index = e.detail.value;
      this.queryParams.flavor = this.flavorOptions[index].dictValue;
    },
    /** 获取口味标签 */
    getFlavorLabel(value) {
      if (!value) return '';
      const flavor = this.dict.type.food_flavor.find(item => item.dictValue === value);
      return flavor ? flavor.dictLabel : '';
    },
    /** 预览图片 */
    previewImage(url) {
      uni.previewImage({
        urls: [url],
        current: url
      });
    },
    /** 分页按钮操作 */
    handlePageChange(page) {
      this.queryParams.pageNum = page;
      this.getList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      uni.navigateTo({
        url: '/pages/dish/management/edit'
      });
    },
    /** 修改按钮操作 */
    handleUpdate() {
      if (this.ids.length !== 1) {
        uni.showToast({
          title: '请选择一条记录',
          icon: 'none'
        });
        return;
      }
      uni.navigateTo({
        url: `/pages/dish/management/edit?id=${this.ids[0]}`
      });
    },
    /** 删除按钮操作 */
    handleDelete() {
      if (this.ids.length === 0) {
        uni.showToast({
          title: '请选择要删除的记录',
          icon: 'none'
        });
        return;
      }
      uni.showModal({
        title: '提示',
        content: '是否确认删除选中的数据项？',
        success: (res) => {
          if (res.confirm) {
            delManagement(this.ids).then(() => {
              this.getList();
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              });
            });
          }
        }
      });
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

.page-header {
  margin-bottom: 20rpx;
  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #303133;
  }
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
        width: 100%;
        box-sizing: border-box;
        height: 80rpx;
        line-height: 80rpx;
        border: 1px solid #dcdfe6;
        color: #303133;

        &::placeholder {
          color: #c0c4cc;
        }
      }

      .form-picker {
        position: relative;
        background: #f5f7fa;
        padding: 20rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
        width: 100%;
        box-sizing: border-box;
        height: 80rpx;
        border: 1px solid #dcdfe6;

        &::after {
          content: '';
          position: absolute;
          right: 20rpx;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 12rpx solid transparent;
          border-right: 12rpx solid transparent;
          border-top: 12rpx solid #909399;
        }

        .picker-value {
          color: #303133;
          height: 40rpx;
          line-height: 40rpx;
          padding-right: 40rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .search-buttons {
      display: flex;
      gap: 20rpx;
      margin-top: 30rpx;

      button {
        flex: 1;
        font-size: 28rpx;
        padding: 20rpx 0;
        height: 80rpx;
        line-height: 40rpx;
        border-radius: 8rpx;
        border: none;

        &::after {
          border: none;
        }
      }

      .search-btn {
        background: #409EFF;
        color: #fff;

        &:active {
          background: #66b1ff;
        }
      }

      .reset-btn {
        background: #f5f7fa;
        color: #666;
        border: 1px solid #dcdfe6;

        &:active {
          background: #e6e6e6;
        }
      }
    }
  }
}

.action-bar {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
  padding: 0 20rpx;

  .action-btn {
    flex: 1;
    font-size: 28rpx;
    padding: 20rpx 0;
    height: 80rpx;
    line-height: 40rpx;
    border-radius: 8rpx;
    border: none;

    &::after {
      border: none;
    }

    &[disabled] {
      opacity: 0.6;
    }

    &.primary {
      background: #409EFF;
      color: #fff;

      &:active {
        background: #66b1ff;
      }
    }

    &.success {
      background: #67C23A;
      color: #fff;

      &:active {
        background: #85ce61;
      }
    }

    &.danger {
      background: #F56C6C;
      color: #fff;

      &:active {
        background: #f78989;
      }
    }
  }
}

.dish-list {
  .dish-card {
    background: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

    .dish-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .dish-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #303133;
      }

      .dish-price {
        font-size: 32rpx;
        color: #F56C6C;
        font-weight: bold;
      }
    }

    .dish-content {
      display: flex;
      gap: 24rpx;

      .dish-image {
        width: 200rpx;
        height: 200rpx;
        border-radius: 8rpx;
        flex-shrink: 0;
      }

      .dish-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12rpx;
        min-width: 0;

        .info-item {
          font-size: 26rpx;
          line-height: 1.5;
          display: flex;
          align-items: flex-start;

          .label {
            color: #909399;
            flex-shrink: 0;
            margin-right: 8rpx;
          }

          .value {
            color: #303133;
            flex: 1;
            min-width: 0;
          }
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

.loading-box {
  padding: 40rpx 0;
  text-align: center;
}
</style> 