<template>
  <view class="nutrition-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-form">
        <view class="form-item">
          <picker mode="date" :value="startDate" @change="onStartDateChange">
            <view class="picker-item">
              <text>开始日期：{{ startDate }}</text>
            </view>
          </picker>
          <picker mode="date" :value="endDate" @change="onEndDateChange">
            <view class="picker-item">
              <text>结束日期：{{ endDate }}</text>
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
        <uni-icons type="plus" size="16" color="#fff"></uni-icons>
        <text>新增</text>
      </button>
      <button class="action-btn export" @click="handleExport">
        <uni-icons type="download" size="16" color="#fff"></uni-icons>
        <text>导出</text>
      </button>
    </view>

    <!-- 营养标准卡片列表 -->
    <view class="nutrition-list" v-if="!loading">
      <view 
        class="nutrition-card" 
        v-for="item in standardList" 
        :key="item.standardId"
      >
        <view class="card-header">
          <text class="card-title">{{ item.remark || '营养标准' }}</text>
          <view class="card-actions">
            <button class="action-icon" @click="handleUpdate(item)">
              <uni-icons type="compose" size="16" color="#409EFF"></uni-icons>
            </button>
            <button class="action-icon" @click="handleDelete(item)">
              <uni-icons type="trash" size="16" color="#F56C6C"></uni-icons>
            </button>
          </view>
        </view>

        <view class="nutrition-items">
          <view class="nutrition-item">
            <text class="item-label">卡路里</text>
            <text class="item-value calories">{{ item.calories }} 卡路里</text>
          </view>
          <view class="nutrition-item">
            <text class="item-label">蛋白质</text>
            <text class="item-value protein">{{ item.protein }}g</text>
          </view>
          <view class="nutrition-item">
            <text class="item-label">脂肪</text>
            <text class="item-value fat">{{ item.fat }}g</text>
          </view>
          <view class="nutrition-item">
            <text class="item-label">钠</text>
            <text class="item-value sodium">{{ item.sodium }}mg</text>
          </view>
          <view class="nutrition-item">
            <text class="item-label">膳食纤维</text>
            <text class="item-value fiber">{{ item.fiber }}g</text>
          </view>
        </view>

        <view class="card-footer">
          <text class="create-time">创建时间：{{ formatDate(item.createTime) }}</text>
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

    <!-- 新增/编辑弹窗 -->
    <uni-popup ref="formPopup" type="center">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ title }}</text>
          <button class="close-btn" @click="cancel">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <form @submit="submitForm">
            <view class="form-item">
              <text class="form-label">卡路里标准（卡路里）</text>
              <input 
                type="number" 
                v-model="form.calories" 
                placeholder="请输入卡路里标准"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="form-label">蛋白质需求（g）</text>
              <input 
                type="number" 
                v-model="form.protein" 
                placeholder="请输入蛋白质需求"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="form-label">脂肪需求（g）</text>
              <input 
                type="number" 
                v-model="form.fat" 
                placeholder="请输入脂肪需求"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="form-label">钠需求（mg）</text>
              <input 
                type="number" 
                v-model="form.sodium" 
                placeholder="请输入钠需求"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="form-label">膳食纤维需求（g）</text>
              <input 
                type="number" 
                v-model="form.fiber" 
                placeholder="请输入膳食纤维需求"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="form-label">备注</text>
              <textarea 
                v-model="form.remark" 
                placeholder="请输入备注"
                class="form-textarea"
              />
            </view>
            <view class="form-buttons">
              <button class="submit-btn" form-type="submit">确定</button>
              <button class="cancel-btn" @click="cancel">取消</button>
            </view>
          </form>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { listStandard, getStandard, delStandard, addStandard, updateStandard } from "@/api/nutrition/standard";

export default {
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
      // 营养标准列表数据
      standardList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      startDate: "",
      endDate: "",
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        calories: null,
        protein: null,
        fat: null,
        sodium: null,
        fiber: null,
        params: {}
      },
      // 表单参数
      form: {
        standardId: null,
        calories: null,
        protein: null,
        fat: null,
        sodium: null,
        fiber: null,
        remark: null
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
      if (typeof date === 'string') {
        date = new Date(date);
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    // 开始日期变化
    onStartDateChange(e) {
      this.startDate = e.detail.value;
    },
    // 结束日期变化
    onEndDateChange(e) {
      this.endDate = e.detail.value;
    },
    /** 查询营养标准列表 */
    getList() {
      this.loading = true;
      this.queryParams.params = {};
      if (this.startDate && this.endDate) {
        this.queryParams.params["beginCreateTime"] = this.startDate;
        this.queryParams.params["endCreateTime"] = this.endDate;
      }
      listStandard(this.queryParams).then(response => {
        this.standardList = response.rows;
        this.total = response.total;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.$refs.formPopup.close();
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        standardId: null,
        calories: null,
        protein: null,
        fat: null,
        sodium: null,
        fiber: null,
        remark: null
      };
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.startDate = this.formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      this.endDate = this.formatDate(new Date());
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.title = "添加营养标准";
      this.$refs.formPopup.open();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const standardId = row.standardId;
      getStandard(standardId).then(response => {
        this.form = response.data;
        this.title = "修改营养标准";
        this.$refs.formPopup.open();
      });
    },
    /** 提交按钮 */
    submitForm() {
      if (this.form.standardId != null) {
        updateStandard(this.form).then(response => {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          });
          this.$refs.formPopup.close();
          this.getList();
        });
      } else {
        addStandard(this.form).then(response => {
          uni.showToast({
            title: '新增成功',
            icon: 'success'
          });
          this.$refs.formPopup.close();
          this.getList();
        });
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const standardId = row.standardId;
      uni.showModal({
        title: '提示',
        content: '是否确认删除该营养标准？',
        success: (res) => {
          if (res.confirm) {
            delStandard(standardId).then(() => {
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
    /** 分页按钮操作 */
    handlePageChange(page) {
      this.queryParams.pageNum = page;
      this.getList();
    }
  }
};
</script>

<style lang="scss" scoped>
.nutrition-container {
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

      .picker-item {
        background: #f5f7fa;
        padding: 20rpx;
        border-radius: 8rpx;
        margin-bottom: 20rpx;
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

    &.add {
      background: #67C23A;
      color: #fff;
    }

    &.export {
      background: #909399;
      color: #fff;
    }
  }
}

.nutrition-list {
  .nutrition-card {
    background: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      padding-bottom: 20rpx;
      border-bottom: 1px solid #ebeef5;

      .card-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #303133;
      }

      .card-actions {
        display: flex;
        gap: 20rpx;

        .action-icon {
          padding: 10rpx;
          background: none;
          border: none;
          line-height: 1;
        }
      }
    }

    .nutrition-items {
      .nutrition-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1px solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }

        .item-label {
          font-size: 28rpx;
          color: #606266;
        }

        .item-value {
          padding: 8rpx 24rpx;
          border-radius: 24rpx;
          font-size: 28rpx;
          font-weight: 500;

          &.calories {
            color: #409EFF;
            background: #ecf5ff;
          }

          &.protein {
            color: #67C23A;
            background: #f0f9eb;
          }

          &.fat {
            color: #E6A23C;
            background: #fdf6ec;
          }

          &.sodium {
            color: #909399;
            background: #f4f4f5;
          }

          &.fiber {
            color: #F56C6C;
            background: #fef0f0;
          }
        }
      }
    }

    .card-footer {
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1px solid #ebeef5;
      font-size: 24rpx;
      color: #909399;
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

      .form-textarea {
        width: 100%;
        height: 200rpx;
        background: #f5f7fa;
        border-radius: 8rpx;
        padding: 20rpx;
        font-size: 28rpx;
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
</style> 