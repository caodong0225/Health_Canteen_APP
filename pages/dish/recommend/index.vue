<template>
  <view class="app-container">
    <!-- 食堂选择 -->
    <view class="canteen-select">
      <view class="select-header" @click="toggleCanteenList">
        <text class="header-title">选择食堂</text>
        <uni-icons 
          :type="showCanteenList ? 'top' : 'bottom'" 
          size="16" 
          color="#909399"
        ></uni-icons>
      </view>
      <view class="canteen-list" v-if="!loading && showCanteenList">
        <view 
          class="canteen-card" 
          v-for="item in canteenList" 
          :key="item.canteenId"
          :class="{ active: selectedCanteenId === item.canteenId }"
          @click="handleSelectCanteen(item)"
        >
          <view class="canteen-info">
            <text class="canteen-name">{{ item.name }}</text>
            <text class="canteen-desc">{{ item.characteristic }}</text>
          </view>
          <uni-icons 
            v-if="selectedCanteenId === item.canteenId" 
            type="checkmarkempty" 
            size="20" 
            color="#67C23A"
          ></uni-icons>
        </view>
      </view>
      <!-- 已选食堂显示 -->
      <view class="selected-canteen" v-if="selectedCanteen && !showCanteenList">
        <view class="canteen-info">
          <text class="canteen-name">{{ selectedCanteen.name }}</text>
          <text class="canteen-desc">{{ selectedCanteen.characteristic }}</text>
        </view>
        <button class="change-btn" @click="toggleCanteenList">
          <text>更换</text>
          <uni-icons type="right" size="14" color="#409EFF"></uni-icons>
        </button>
      </view>
    </view>

    <!-- 推荐菜品列表 -->
    <view class="recommend-section" v-if="selectedCanteenId">
      <view class="section-header">
        <text class="section-title">推荐菜品</text>
        <view class="header-actions">
          <button class="refresh-btn" @click="handleRefresh">
            <uni-icons type="refresh" size="16" color="#409EFF"></uni-icons>
            <text>刷新</text>
          </button>
        </view>
      </view>
      
      <view class="dish-list" v-if="!recommendLoading">
        <view 
          class="dish-card" 
          v-for="item in recommendList" 
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
          <view class="dish-footer">
            <button 
              class="recommend-btn" 
              :class="{ 'recommended': item.recommended }"
              @click="handleRecommend(item)"
            >
              <uni-icons 
                :type="item.recommended ? 'checkmarkempty' : 'plusempty'" 
                size="16" 
                :color="item.recommended ? '#fff' : '#409EFF'"
              ></uni-icons>
              <text>{{ item.recommended ? '已推荐' : '推荐' }}</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 加载中提示 -->
      <view class="loading-box" v-if="recommendLoading">
        <uni-load-more status="loading" :contentText="loadingText"></uni-load-more>
      </view>

      <!-- 无数据提示 -->
      <view class="empty-box" v-if="!recommendLoading && recommendList.length === 0">
        <text class="empty-text">暂无推荐菜品</text>
      </view>

      <!-- 分页器 -->
      <view class="pagination" v-if="total > 0">
        <view class="page-info">
          共 {{ total }} 条记录
        </view>
        <view class="page-buttons">
          <button 
            class="page-btn" 
            :disabled="currentPage <= 1"
            @click="handlePageChange(currentPage - 1)"
          >上一页</button>
          <text class="page-text">{{ currentPage }} / {{ totalPages }}</text>
          <button 
            class="page-btn" 
            :disabled="currentPage >= totalPages"
            @click="handlePageChange(currentPage + 1)"
          >下一页</button>
        </view>
      </view>
    </view>

    <!-- 未选择食堂提示 -->
    <view class="empty-tip" v-else-if="!selectedCanteenId">
      <text class="tip-text">请先选择食堂</text>
    </view>

    <!-- 批量推荐弹窗 -->
    <uni-popup ref="batchPopup" type="center">
      <view class="batch-popup">
        <view class="popup-header">
          <text class="popup-title">选择推荐菜品</text>
          <uni-icons type="closeempty" size="20" color="#909399" @click="closeBatchPopup"></uni-icons>
        </view>
        <view class="popup-content">
          <view class="dish-grid">
            <view 
              class="dish-item" 
              v-for="item in allDishList" 
              :key="item.managementId"
              :class="{ 'selected': selectedDishes.includes(item.managementId) }"
              @click="toggleDishSelection(item)"
            >
              <image 
                v-if="item.image" 
                :src="item.image" 
                mode="aspectFill" 
                class="dish-image"
              ></image>
              <view class="dish-info">
                <text class="dish-name">{{ item.name }}</text>
                <text class="dish-price">¥{{ item.price }}</text>
              </view>
              <view class="select-icon" v-if="selectedDishes.includes(item.managementId)">
                <uni-icons type="checkmarkempty" size="20" color="#67C23A"></uni-icons>
              </view>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeBatchPopup">取消</button>
          <button class="confirm-btn" @click="handleBatchConfirm">确定推荐</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { listCanteen } from "@/api/resource/canteen";
import { listDish } from "@/api/smart/ai";
import { getDicts } from "@/api/system/dict/data";
import { addManagement } from "@/api/dish/management";
import { addCanteen_dish_relationship } from "@/api/relationship/canteen_dish_relationship";

export default {
  name: "DishRecommend",
  components: {
    uniLoadMore: () => import('@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue'),
    uniIcons: () => import('@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue')
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      recommendLoading: false,
      loadingText: {
        contentdown: "上拉加载更多",
        contentrefresh: "加载中...",
        contentnomore: "没有更多数据了"
      },
      // 食堂列表
      canteenList: [],
      // 选中的食堂ID
      selectedCanteenId: null,
      // 所有菜品数据
      allDishList: [],
      // 当前页数据
      recommendList: [],
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
        canteenId: null
      },
      // 总条数
      total: 0,
      // 是否显示食堂列表
      showCanteenList: true,
      // 当前选中的食堂信息
      selectedCanteen: null,
      // 分页参数
      pageSize: 5,
      currentPage: 1,
      selectedDishes: [], // 新增：存储选中的菜品ID
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize);
    }
  },
  created() {
    this.getDicts();
    this.getCanteenList();
  },
  methods: {
    /** 获取字典数据 */
    getDicts() {
      getDicts("food_flavor").then(response => {
        this.dict.type.food_flavor = response.data;
      });
    },
    /** 获取食堂列表 */
    getCanteenList() {
      this.loading = true;
      listCanteen().then(response => {
        this.canteenList = response.rows;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    /** 切换食堂列表显示状态 */
    toggleCanteenList() {
      this.showCanteenList = !this.showCanteenList;
    },
    /** 选择食堂 */
    handleSelectCanteen(canteen) {
      this.selectedCanteenId = canteen.canteenId;
      this.selectedCanteen = canteen;
      this.queryParams.canteenId = canteen.canteenId;
      this.currentPage = 1; // 重置页码
      this.getRecommendList();
    },
    /** 获取推荐菜品列表 */
    getRecommendList() {
      if (!this.queryParams.canteenId) return;
      
      this.recommendLoading = true;
      listDish(this.queryParams.canteenId).then(response => {
        // 保存所有数据，并标记已推荐的菜品
        this.allDishList = response.data.map(item => ({
          ...item,
          recommended: item.recommended || false // 根据后端返回的推荐状态设置
        }));
        this.total = this.allDishList.length;
        // 更新当前页数据
        this.updateCurrentPageData();
        this.recommendLoading = false;
      }).catch(() => {
        this.recommendLoading = false;
        uni.showToast({
          title: '获取菜品列表失败',
          icon: 'error'
        });
      });
    },
    /** 更新当前页数据 */
    updateCurrentPageData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.recommendList = this.allDishList.slice(start, end);
    },
    /** 页码变化 */
    handlePageChange(page) {
      this.currentPage = page;
      this.updateCurrentPageData();
    },
    /** 推荐菜品 */
    handleRecommend(dish) {
      if (dish.recommended) {
        uni.showToast({
          title: '该菜品已推荐',
          icon: 'none'
        });
        return;
      }

      // 添加食堂-菜品映射关系
      addCanteen_dish_relationship({
        canteenId: this.queryParams.canteenId,
        dishId: dish.managementId
      }).then(() => {
        uni.showToast({
          title: '推荐成功',
          icon: 'success'
        });
        // 刷新列表
        this.getRecommendList();
      }).catch(() => {
        uni.showToast({
          title: '推荐失败',
          icon: 'error'
        });
      });
    },
    /** 刷新推荐列表 */
    handleRefresh() {
      this.currentPage = 1; // 重置页码
      this.getRecommendList();
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
    /** 打开批量推荐弹窗 */
    handleBatchRecommend() {
      this.selectedDishes = [];
      this.$refs.batchPopup.open();
    },
    /** 关闭批量推荐弹窗 */
    closeBatchPopup() {
      this.$refs.batchPopup.close();
      this.selectedDishes = [];
    },
    /** 切换菜品选中状态 */
    toggleDishSelection(dish) {
      const index = this.selectedDishes.indexOf(dish.managementId);
      if (index === -1) {
        this.selectedDishes.push(dish.managementId);
      } else {
        this.selectedDishes.splice(index, 1);
      }
    },
    /** 确认批量推荐 */
    handleBatchConfirm() {
      if (this.selectedDishes.length === 0) {
        uni.showToast({
          title: '请至少选择一个菜品',
          icon: 'none'
        });
        return;
      }

      // 获取选中的菜品数据
      const selectedDishData = this.allDishList.filter(dish => 
        this.selectedDishes.includes(dish.managementId)
      );

      // 显示加载提示
      uni.showLoading({
        title: '正在推荐...',
        mask: true
      });

      // 串行处理每个菜品
      const processDish = async (index) => {
        if (index >= selectedDishData.length) {
          // 所有菜品处理完成
          uni.hideLoading();
          uni.showToast({
            title: '批量推荐完成',
            icon: 'success'
          });
          this.closeBatchPopup();
          this.getRecommendList();
          return;
        }

        const dish = selectedDishData[index];
        try {
          // 创建菜品
          const createResult = await addManagement({
            name: dish.name,
            price: dish.price,
            image: dish.image,
            tag: dish.tag,
            flavor: dish.flavor,
            tip: dish.tip
          });

          // 添加映射关系
          await addCanteen_dish_relationship({
            canteenId: this.queryParams.canteenId,
            dishId: createResult.data.managementId
          });

          // 处理下一个菜品
          processDish(index + 1);
        } catch (error) {
          console.error('处理菜品失败:', error);
          uni.hideLoading();
          uni.showToast({
            title: `第 ${index + 1} 个菜品推荐失败`,
            icon: 'error'
          });
          // 继续处理下一个
          processDish(index + 1);
        }
      };

      // 开始处理第一个菜品
      processDish(0);
    },
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

.canteen-select {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .select-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx 0;
    cursor: pointer;

    .header-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
    }
  }

  .selected-canteen {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background: #f0f9eb;
    border-radius: 8rpx;
    border: 2rpx solid #67C23A;

    .canteen-info {
      flex: 1;
      margin-right: 20rpx;

      .canteen-name {
        font-size: 28rpx;
        font-weight: bold;
        color: #303133;
        margin-bottom: 8rpx;
        display: block;
      }

      .canteen-desc {
        font-size: 24rpx;
        color: #909399;
        display: block;
      }
    }

    .change-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 26rpx;
      color: #409EFF;
      background: none;
      border: none;
      padding: 0;

      &::after {
        border: none;
      }
    }
  }

  .canteen-list {
    margin-top: 20rpx;
    max-height: 600rpx;
    overflow-y: auto;
    transition: all 0.3s ease;

    &::-webkit-scrollbar {
      width: 6rpx;
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3rpx;
    }

    .canteen-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      border-radius: 8rpx;
      background: #f5f7fa;
      margin-bottom: 20rpx;
      border: 2rpx solid transparent;
      transition: all 0.3s;

      &.active {
        background: #f0f9eb;
        border-color: #67C23A;
      }

      .canteen-info {
        flex: 1;
        margin-right: 20rpx;

        .canteen-name {
          font-size: 28rpx;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8rpx;
          display: block;
        }

        .canteen-desc {
          font-size: 24rpx;
          color: #909399;
          display: block;
        }
      }
    }
  }
}

.recommend-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .action-btn {
        display: flex;
        align-items: center;
        gap: 8rpx;
        font-size: 26rpx;
        color: #409EFF;
        background: #f0f9ff;
        border: 2rpx solid #409EFF;
        border-radius: 32rpx;
        padding: 12rpx 24rpx;
        transition: all 0.3s ease;

        &::after {
          border: none;
        }

        &:active {
          transform: scale(0.98);
        }
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
    transition: all 0.3s ease;

    &:active {
      transform: translateY(2rpx);
    }

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
      margin-bottom: 20rpx;

      .dish-image {
        width: 200rpx;
        height: 200rpx;
        border-radius: 8rpx;
        flex-shrink: 0;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
        }
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

    .dish-footer {
      display: flex;
      justify-content: stretch;
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1px solid #f0f0f0;

      .recommend-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        font-size: 28rpx;
        padding: 20rpx 0;
        border-radius: 8rpx;
        background: #f0f9ff;
        color: #409EFF;
        border: 2rpx solid #409EFF;
        transition: all 0.3s ease;
        width: 100%;
        margin: 0;

        &::after {
          border: none;
        }

        &:active {
          transform: scale(0.98);
          opacity: 0.9;
        }

        &.recommended {
          background: #67C23A;
          border-color: #67C23A;
          color: #fff;
          
          &:active {
            background: #85ce61;
            border-color: #85ce61;
          }
        }

        &:not(.recommended) {
          &:active {
            background: #ecf5ff;
            border-color: #79bbff;
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

.empty-box {
  padding: 60rpx 0;
  text-align: center;

  .empty-text {
    font-size: 28rpx;
    color: #909399;
  }
}

.empty-tip {
  padding: 60rpx 0;
  text-align: center;

  .tip-text {
    font-size: 28rpx;
    color: #909399;
  }
}

.pagination {
  margin-top: 30rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .page-info {
    text-align: center;
    font-size: 26rpx;
    color: #909399;
    margin-bottom: 20rpx;
  }

  .page-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20rpx;

    .page-btn {
      min-width: 160rpx;
      height: 64rpx;
      line-height: 64rpx;
      font-size: 28rpx;
      color: #409EFF;
      background: #f0f9ff;
      border: 2rpx solid #409EFF;
      border-radius: 32rpx;
      padding: 0 30rpx;
      transition: all 0.3s ease;

      &::after {
        border: none;
      }

      &:active {
        transform: scale(0.98);
        opacity: 0.8;
      }

      &:disabled {
        opacity: 0.5;
        background: #f5f7fa;
        border-color: #dcdfe6;
        color: #909399;
        transform: none;
      }
    }

    .page-text {
      font-size: 28rpx;
      color: #606266;
      min-width: 120rpx;
      text-align: center;
    }
  }
}

.batch-popup {
  background: #fff;
  border-radius: 12rpx;
  width: 90vw;
  max-width: 750rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
    }
  }

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 20rpx;

    .dish-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20rpx;
      padding: 10rpx;

      .dish-item {
        position: relative;
        background: #fff;
        border-radius: 12rpx;
        overflow: hidden;
        box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
        border: 2rpx solid transparent;
        transition: all 0.3s ease;

        &.selected {
          border-color: #67C23A;
          background: #f0f9eb;
        }

        .dish-image {
          width: 100%;
          height: 200rpx;
          object-fit: cover;
        }

        .dish-info {
          padding: 16rpx;

          .dish-name {
            font-size: 28rpx;
            color: #303133;
            margin-bottom: 8rpx;
            display: block;
          }

          .dish-price {
            font-size: 26rpx;
            color: #F56C6C;
            font-weight: bold;
          }
        }

        .select-icon {
          position: absolute;
          top: 10rpx;
          right: 10rpx;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          padding: 4rpx;
        }
      }
    }
  }

  .popup-footer {
    display: flex;
    justify-content: flex-end;
    gap: 20rpx;
    padding: 20rpx;
    border-top: 2rpx solid #f0f0f0;

    button {
      min-width: 160rpx;
      height: 64rpx;
      line-height: 64rpx;
      font-size: 28rpx;
      border-radius: 32rpx;
      padding: 0 30rpx;

      &::after {
        border: none;
      }

      &.cancel-btn {
        color: #909399;
        background: #f4f4f5;
        border: 2rpx solid #dcdfe6;
      }

      &.confirm-btn {
        color: #fff;
        background: #409EFF;
        border: 2rpx solid #409EFF;
      }

      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
    }
  }
}
</style> 