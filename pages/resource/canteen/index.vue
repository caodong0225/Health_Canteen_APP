<template>
  <view class="app-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-form">
        <view class="form-item">
          <text class="form-label">食堂名称</text>
          <input 
            class="form-input" 
            v-model="queryParams.name" 
            placeholder="请输入食堂名称"
            @confirm="handleQuery"
            type="text"
            confirm-type="search"
          />
        </view>
        <view class="form-item">
          <text class="form-label">经营特色</text>
          <input 
            class="form-input" 
            v-model="queryParams.characteristic" 
            placeholder="请输入经营特色"
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

    <!-- 食堂列表 -->
    <view class="canteen-list" v-if="!loading">
      <view 
        class="canteen-card" 
        v-for="item in canteenList" 
        :key="item.canteenId"
        @click="showDetail(item)"
      >
        <view class="canteen-header">
          <view class="name-time">
            <text class="canteen-name">{{ item.name }}</text>
            <text class="work-time">{{ item.workTime }}</text>
          </view>
        </view>
        <view class="canteen-content">
          <image 
            v-if="item.images" 
            :src="item.images" 
            mode="aspectFill" 
            class="canteen-image"
            @click.stop="previewImage(item.images)"
          ></image>
          <view class="canteen-info">
            <view class="info-item">
              <text class="label">地址：</text>
              <text class="value text-ellipsis">{{ item.location }}</text>
            </view>
            <view class="info-item">
              <text class="label">特色：</text>
              <text class="value text-ellipsis">{{ item.characteristic }}</text>
            </view>
            <view class="info-item description">
              <text class="label">简介：</text>
              <text class="value">{{ item.description }}</text>
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

    <!-- 详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-content detail-popup">
        <view class="popup-header">
          <text class="popup-title">食堂详情</text>
          <button class="close-btn" @click="closeDetail">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <image 
            v-if="currentDetail.images" 
            :src="currentDetail.images" 
            mode="widthFix" 
            class="detail-image"
            @click="previewImage(currentDetail.images)"
          ></image>
          <view class="detail-info">
            <view class="detail-item">
              <text class="label">食堂名称</text>
              <text class="value">{{ currentDetail.name }}</text>
            </view>
            <view class="detail-item">
              <text class="label">营业时间</text>
              <text class="value">{{ currentDetail.workTime }}</text>
            </view>
            <view class="detail-item">
              <text class="label">地址</text>
              <text class="value">{{ currentDetail.location }}</text>
            </view>
            <view class="detail-item">
              <text class="label">经营特色</text>
              <text class="value">{{ currentDetail.characteristic }}</text>
            </view>
            <view class="detail-item">
              <text class="label">简介</text>
              <text class="value">{{ currentDetail.description }}</text>
            </view>
            <view class="detail-item" v-if="currentDetail.remark">
              <text class="label">备注</text>
              <text class="value">{{ currentDetail.remark }}</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { listCanteen } from "@/api/resource/canteen";

export default {
  name: "Canteen",
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
      // 食堂列表数据
      canteenList: [],
      // 当前查看的详情
      currentDetail: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        characteristic: null
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
    /** 查询食堂列表 */
    getList() {
      this.loading = true;
      listCanteen(this.queryParams).then(response => {
        this.canteenList = response.rows;
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
        name: null,
        characteristic: null
      };
      this.handleQuery();
    },
    /** 显示详情 */
    showDetail(row) {
      this.currentDetail = row;
      this.$refs.detailPopup.open();
    },
    /** 关闭详情 */
    closeDetail() {
      this.$refs.detailPopup.close();
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
        width: 100%;
        box-sizing: border-box;
        height: 80rpx;
        line-height: 80rpx;
        border: 1px solid #dcdfe6;
        color: #303133;

        &::placeholder {
          color: #c0c4cc;
        }

        &:focus {
          border-color: #409EFF;
          outline: none;
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

.canteen-list {
  .canteen-card {
    background: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

    .canteen-header {
      margin-bottom: 20rpx;

      .name-time {
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .canteen-name {
          font-size: 34rpx;
          font-weight: bold;
          color: #303133;
          line-height: 1.4;
        }

        .work-time {
          font-size: 24rpx;
          color: #909399;
        }
      }
    }

    .canteen-content {
      display: flex;
      gap: 24rpx;

      .canteen-image {
        width: 220rpx;
        height: 220rpx;
        border-radius: 8rpx;
        flex-shrink: 0;
      }

      .canteen-info {
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

            &.text-ellipsis {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          &.description {
            .value {
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              overflow: hidden;
              white-space: normal;
            }
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

.popup-content {
  background: #fff;
  border-radius: 12rpx;
  width: 85vw;
  max-height: 80vh;
  overflow-y: auto;

  .popup-header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #ebeef5;

    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
    }

    .close-btn {
      position: absolute;
      right: 20rpx;
      top: 50%;
      transform: translateY(-50%);
      padding: 10rpx;
      background: none;
      border: none;
      line-height: 1;
    }
  }

  .popup-body {
    padding: 30rpx;

    .detail-image {
      width: 100%;
      border-radius: 8rpx;
      margin-bottom: 30rpx;
    }

    .detail-info {
      .detail-item {
        margin-bottom: 20rpx;

        .label {
          font-size: 28rpx;
          color: #909399;
          margin-bottom: 10rpx;
          display: block;
        }

        .value {
          font-size: 28rpx;
          color: #303133;
          line-height: 1.5;
        }
      }
    }
  }
}

.loading-box {
  padding: 40rpx 0;
  text-align: center;
}
</style> 