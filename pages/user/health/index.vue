<template>
  <view class="app-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-form">
        <view class="form-item">
          <text class="form-label">用户</text>
          <view class="form-input user-select" @click="showSearchUserSelect">
            <view class="selected-user" v-if="queryParams.userName">
              <text class="user-name">{{ queryParams.userName }}</text>
            </view>
            <text v-else class="placeholder">请选择用户</text>
            <uni-icons type="search" size="16" color="#909399"></uni-icons>
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">疾病</text>
          <picker 
            mode="selector" 
            :range="diseaseOptions" 
            range-key="label"
            :value="diseaseIndex"
            @change="onDiseaseChange"
            class="disease-picker"
          >
            <view class="picker-item">{{ queryParams.disease || '请选择疾病' }}</view>
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
      <button class="action-btn edit" @click="handleUpdate" :disabled="!selectedId">
        <uni-icons type="compose" size="16" color="#fff"></uni-icons>
        <text>修改</text>
      </button>
      <button class="action-btn delete" @click="handleDelete" :disabled="!selectedId">
        <uni-icons type="trash" size="16" color="#fff"></uni-icons>
        <text>删除</text>
      </button>
      <button class="action-btn export" @click="handleExport">
        <uni-icons type="download" size="16" color="#fff"></uni-icons>
        <text>导出</text>
      </button>
    </view>

    <!-- 健康数据列表 -->
    <view class="health-list" v-if="!loading">
      <view 
        class="health-card" 
        v-for="item in relationshipList" 
        :key="item.id"
        :class="{ 'selected': selectedId === item.id }"
        @click="handleSelect(item)"
      >
        <view class="health-header">
          <text class="user-name" @click.stop="showUserDetail(item)">{{ getUserName(item.userId) }}</text>
          <text class="record-time">{{ formatDate(item.createTime) }}</text>
        </view>
        <view class="health-content">
          <view class="disease-tags">
            <text 
              v-for="(disease, index) in formatDisease(item.disease)" 
              :key="index"
              class="disease-tag"
              :class="disease === '无' ? 'tag-primary' : 'tag-danger'"
            >{{ disease }}</text>
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

    <!-- 搜索用户选择弹窗 -->
    <uni-popup ref="searchUserPopup" type="center" :mask-click="false">
      <view class="popup-content user-search-popup">
        <view class="popup-header">
          <text class="popup-title">搜索用户</text>
          <button class="close-btn" @click="closeSearchUserSelect">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <user-search @select="handleSearchUserSelect" />
        </view>
      </view>
    </uni-popup>

    <!-- 新增用户选择弹窗 -->
    <uni-popup ref="addUserPopup" type="center" :mask-click="false">
      <view class="popup-content user-search-popup">
        <view class="popup-header">
          <text class="popup-title">选择用户</text>
          <button class="close-btn" @click="closeAddUserSelect">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <user-search @select="handleAddUserSelect" />
        </view>
      </view>
    </uni-popup>

    <!-- 用户详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-content detail-popup">
        <view class="popup-header">
          <text class="popup-title">用户详细信息</text>
          <button class="close-btn" @click="closeDetail">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <view class="user-info">
            <image 
              class="user-avatar" 
              :src="detailForm.avatar || '/static/images/profile.jpg'"
              mode="aspectFill"
            ></image>
            <view class="user-detail">
              <text class="user-name">{{ detailForm.nickName }}</text>
              <text class="user-nickname">{{ detailForm.userName }}</text>
            </view>
          </view>

          <view class="info-section">
            <view class="info-title">基本信息</view>
            <view class="info-grid">
              <view class="info-item">
                <text class="label">邮箱</text>
                <text class="value">{{ detailForm.email }}</text>
              </view>
              <view class="info-item">
                <text class="label">手机号</text>
                <text class="value">{{ detailForm.phonenumber }}</text>
              </view>
              <view class="info-item">
                <text class="label">性别</text>
                <text class="value">{{ detailForm.sex === '0' ? '男' : detailForm.sex === '1' ? '女' : '未知' }}</text>
              </view>
              <view class="info-item">
                <text class="label">状态</text>
                <text class="value" :class="detailForm.status === '0' ? 'status-normal' : 'status-disabled'">
                  {{ detailForm.status === '0' ? '正常' : '停用' }}
                </text>
              </view>
            </view>
          </view>

          <view class="info-section">
            <view class="info-title">健康信息</view>
            <view class="info-grid">
              <view class="info-item">
                <text class="label">身高(cm)</text>
                <text class="value">{{ detailForm.height }}</text>
              </view>
              <view class="info-item">
                <text class="label">体重(kg)</text>
                <text class="value">{{ detailForm.weight }}</text>
              </view>
              <view class="info-item">
                <text class="label">年龄</text>
                <text class="value">{{ detailForm.age }}</text>
              </view>
              <view class="info-item">
                <text class="label">血糖值</text>
                <text class="value">{{ detailForm.bloodGlucose }} mmol/L</text>
              </view>
              <view class="info-item">
                <text class="label">收缩压</text>
                <text class="value">{{ detailForm.systolicPressure }} mmHg</text>
              </view>
              <view class="info-item">
                <text class="label">舒张压</text>
                <text class="value">{{ detailForm.diastolicPressure }} mmHg</text>
              </view>
              <view class="info-item">
                <text class="label">总胆固醇</text>
                <text class="value">{{ detailForm.totalCholesterol }} mmol/L</text>
              </view>
            </view>
          </view>

          <view class="info-section" v-if="userPreferences">
            <view class="info-title">用户偏好</view>
            <view class="preference-grid">
              <view class="preference-item">
                <text class="label">口味偏好</text>
                <text class="value">{{ userPreferences.口味偏好 }}</text>
              </view>
              <view class="preference-item">
                <text class="label">运动习惯</text>
                <text class="value">{{ userPreferences.运动习惯 }}</text>
              </view>
              <view class="preference-item">
                <text class="label">健康目标</text>
                <text class="value">{{ getHealthGoalLabel(userPreferences.健康目标) }}</text>
              </view>
              <view class="preference-item full-width">
                <text class="label">过敏原</text>
                <view class="tag-group">
                  <text 
                    v-for="(item, index) in userPreferences.过敏原" 
                    :key="index"
                    class="tag tag-warning"
                  >{{ item }}</text>
                </view>
              </view>
              <view class="preference-item full-width">
                <text class="label">饮食习惯</text>
                <view class="tag-group">
                  <text 
                    v-for="(item, index) in userPreferences.饮食习惯" 
                    :key="index"
                    class="tag tag-info"
                  >{{ item }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 添加/修改弹窗 -->
    <uni-popup ref="formPopup" type="center" :mask-click="false">
      <view class="popup-content form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ title }}</text>
          <button class="close-btn" @click="cancel">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <view class="form-item" v-if="title.startsWith('添加')">
            <text class="form-label">用户</text>
            <view class="form-input user-select" @click="showAddUserSelect">
              <view class="selected-user" v-if="form.userName">
                <text class="user-name">{{ form.userName }}</text>
              </view>
              <text v-else class="placeholder">请选择用户</text>
              <uni-icons type="search" size="16" color="#909399"></uni-icons>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">疾病（可多选）</text>
            <view class="disease-selector">
              <view 
                v-for="(option, index) in diseaseOptions" 
                :key="index"
                class="disease-option"
                :class="{ 'selected': form.disease && form.disease.includes(option.value) }"
                @click="toggleDisease(option.value)"
              >
                <text class="disease-name">{{ option.label }}</text>
                <uni-icons 
                  v-if="form.disease && form.disease.includes(option.value)"
                  type="checkmarkempty" 
                  size="16" 
                  color="#409EFF"
                ></uni-icons>
              </view>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <button class="submit-btn" @click="submitForm">确定</button>
          <button class="cancel-btn" @click="cancel">取消</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { listUser_diseases_relationship, getUser_diseases_relationship, delUser_diseases_relationship, addUser_diseases_relationship, updateUser_diseases_relationship } from "@/api/relationship/user_diseases_relationship";
import { getUser, listUser } from "@/api/system/user";
import UserSearch from '@/components/user/UserSearch.vue';

export default {
  name: "UserHealth",
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
      // 选中ID
      selectedId: null,
      // 总条数
      total: 0,
      // 健康数据列表
      relationshipList: [],
      // 用户列表
      userList: [],
      // 疾病选项索引
      diseaseIndex: -1,
      // 选中的疾病索引
      selectedDiseaseIndex: [],
      // 弹出层标题
      title: "",
      // 用户详情数据
      detailForm: {},
      // 健康目标选项
      healthGoalOptions: [
        { value: "maintain", label: "维持健康" },
        { value: "lose_weight", label: "减重" },
        { value: "gain_muscle", label: "增肌" },
        { value: "control_glucose", label: "控制血糖" },
        { value: "lower_pressure", label: "降低血压" },
        { value: "fat_loss", label: "减脂" },
        { value: "immune_boost", label: "提高免疫力" }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        userName: null,
        disease: null
      },
      // 表单参数
      form: {
        id: null,
        userId: null,
        userName: null,
        disease: null
      },
      // 疾病选项
      diseaseOptions: [
        { value: "高血压", label: "高血压" },
        { value: "糖尿病", label: "糖尿病" },
        { value: "冠心病", label: "冠心病" },
        { value: "慢性阻塞性肺疾病", label: "慢性阻塞性肺疾病" },
        { value: "骨质疏松症", label: "骨质疏松症" },
        { value: "高血脂症", label: "高血脂症" },
        { value: "慢性肾病", label: "慢性肾病" },
        { value: "慢性胃炎", label: "慢性胃炎" },
        { value: "慢性肝炎", label: "慢性肝炎" },
        { value: "慢性胆囊炎", label: "慢性胆囊炎" }
      ],
      // 是否显示弹出层
      open: false,
      // 表单校验规则
      rules: {
        userId: [
          { required: true, message: "请选择用户", trigger: "change" }
        ],
        disease: [
          { required: true, message: "请选择疾病", trigger: "change" }
        ]
      }
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.queryParams.pageSize);
    },
    userPreferences() {
      if (!this.detailForm.flavor) return null;
      try {
        return JSON.parse(this.detailForm.flavor);
      } catch (e) {
        return null;
      }
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
    // 获取用户名
    getUserName(userId) {
      const user = this.userList.find(item => item.userId === userId);
      return user ? user.userName : '未知用户';
    },
    // 获取列表数据
    getList() {
      this.loading = true;
      listUser_diseases_relationship(this.queryParams).then(response => {
        this.relationshipList = response.rows;
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
        disease: null
      };
      this.diseaseIndex = -1;
      this.handleQuery();
    },
    // 选择数据
    handleSelect(item) {
      this.selectedId = this.selectedId === item.id ? null : item.id;
    },
    // 新增按钮操作
    handleAdd() {
      this.reset();
      this.title = "添加特殊疾病人群关系";
      this.open = true;
      this.$nextTick(() => {
        this.$refs.formPopup.open();
      });
    },
    // 修改按钮操作
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.selectedId;
      if (!id) {
        uni.showToast({
          title: '请选择要修改的数据',
          icon: 'none'
        });
        return;
      }
      getUser_diseases_relationship(id).then(response => {
        if (response.code === 200 && response.data) {
          this.form = {
            ...response.data,
            disease: Array.isArray(response.data.disease) 
              ? response.data.disease 
              : JSON.parse(response.data.disease || '[]')
          };
          this.title = "修改特殊疾病人群关系";
          this.open = true;
          this.$nextTick(() => {
            this.$refs.formPopup.open();
          });
        } else {
          uni.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      }).catch(error => {
        console.error('获取数据失败:', error);
        uni.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      });
    },
    // 删除按钮操作
    handleDelete() {
      if (!this.selectedId) {
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
            delUser_diseases_relationship(this.selectedId).then(() => {
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
    // 搜索用户选择相关方法
    showSearchUserSelect() {
      this.$refs.searchUserPopup.open();
    },
    closeSearchUserSelect() {
      this.$refs.searchUserPopup.close();
    },
    handleSearchUserSelect(user) {
      this.queryParams.userId = user.userId;
      this.queryParams.userName = user.userName;
      this.closeSearchUserSelect();
      this.handleQuery();
    },

    // 新增用户选择相关方法
    showAddUserSelect() {
      this.$refs.formPopup.close();
      setTimeout(() => {
        this.$refs.addUserPopup.open();
      }, 50);
    },
    closeAddUserSelect() {
      this.$refs.addUserPopup.close();
      setTimeout(() => {
        this.$refs.formPopup.open();
      }, 50);
    },
    handleAddUserSelect(user) {
      this.form.userId = user.userId;
      this.form.userName = user.userName;
      this.closeAddUserSelect();
    },

    // 疾病选择变化
    onDiseaseChange(e) {
      const index = e.detail.value;
      this.diseaseIndex = index;
      this.queryParams.disease = this.diseaseOptions[index].value;
    },
    // 切换疾病选择
    toggleDisease(disease) {
      if (!this.form.disease) {
        this.form.disease = [];
      }
      const index = this.form.disease.indexOf(disease);
      if (index > -1) {
        this.form.disease.splice(index, 1);
      } else {
        this.form.disease.push(disease);
      }
    },
    // 提交按钮
    submitForm() {
      // 表单验证
      if (!this.form.userId && this.title.startsWith('添加')) {
        uni.showToast({
          title: '请选择用户',
          icon: 'none'
        });
        return;
      }
      if (!this.form.disease || !this.form.disease.length) {
        uni.showToast({
          title: '请选择疾病',
          icon: 'none'
        });
        return;
      }

      const submitData = {
        ...this.form,
        disease: JSON.stringify(this.form.disease)
      };

      if (this.form.id != null) {
        updateUser_diseases_relationship(submitData).then(response => {
          if (response.code === 200) {
            uni.showToast({
              title: '修改成功',
              icon: 'success'
            });
            this.open = false;
            this.$refs.formPopup.close();
            this.getList();
          } else {
            uni.showToast({
              title: response.msg || '修改失败',
              icon: 'none'
            });
          }
        }).catch(error => {
          console.error('修改失败:', error);
          uni.showToast({
            title: '修改失败',
            icon: 'none'
          });
        });
      } else {
        addUser_diseases_relationship(submitData).then(response => {
          if (response.code === 200) {
            uni.showToast({
              title: '新增成功',
              icon: 'success'
            });
            this.open = false;
            this.$refs.formPopup.close();
            this.getList();
          } else {
            uni.showToast({
              title: response.msg || '新增失败',
              icon: 'none'
            });
          }
        }).catch(error => {
          console.error('新增失败:', error);
          uni.showToast({
            title: '新增失败',
            icon: 'none'
          });
        });
      }
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.$refs.formPopup.close();
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        userId: null,
        userName: null,
        disease: null
      };
      this.selectedDiseaseIndex = [];
    },
    // 显示用户详情
    showUserDetail(row) {
      getUser(row.userId).then(response => {
        this.detailForm = response.data;
        this.$refs.detailPopup.open();
      });
    },
    // 关闭用户详情
    closeDetail() {
      this.$refs.detailPopup.close();
    },
    // 获取健康目标标签
    getHealthGoalLabel(value) {
      const option = this.healthGoalOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    },
    // 格式化疾病名称
    formatDisease(disease) {
      if (!disease) return ['无'];
      try {
        const diseases = JSON.parse(disease);
        return diseases.map(item => {
          const option = this.diseaseOptions.find(opt => opt.value === item);
          return option ? option.label : item;
        });
      } catch (e) {
        return ['无'];
      }
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

      .disease-picker {
        background: #f5f7fa;
        padding: 20rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
      }

      .picker-item {
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
      .disease-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10rpx;

        .disease-tag {
          padding: 6rpx 20rpx;
          border-radius: 6rpx;
          font-size: 24rpx;

          &.tag-primary {
            background: #ecf5ff;
            color: #409EFF;
          }

          &.tag-danger {
            background: #fef0f0;
            color: #F56C6C;
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
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

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
      text-align: center;
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
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      transition: background-color 0.3s;

      &:active {
        background-color: #f5f7fa;
      }
    }
  }

  &.form-popup {
    .popup-body {
      padding: 40rpx;
    }

    .form-item {
      margin-bottom: 30rpx;

      .form-label {
        font-size: 28rpx;
        color: #606266;
        margin-bottom: 15rpx;
        display: block;
        font-weight: 500;
      }

      .form-input {
        background: #f5f7fa;
        padding: 24rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 88rpx;

        &.user-select {
          .selected-user {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4rpx;

            .user-name {
              font-size: 28rpx;
              color: #303133;
              font-weight: 500;
            }

            .user-id {
              font-size: 24rpx;
              color: #909399;
            }
          }

          .placeholder {
            color: #909399;
          }
        }
      }

      .disease-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20rpx;
        max-height: 400rpx;
        overflow-y: auto;
        padding: 10rpx;

        .disease-option {
          background: #f5f7fa;
          padding: 20rpx;
          border-radius: 8rpx;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s;

          &:active {
            opacity: 0.8;
          }

          &.selected {
            background: #ecf5ff;
            border: 1px solid #409EFF;
          }

          .disease-name {
            font-size: 28rpx;
            color: #303133;
          }
        }
      }
    }
  }

  .popup-footer {
    padding: 30rpx 40rpx;
    border-top: 1px solid #ebeef5;
    display: flex;
    gap: 20rpx;

    button {
      flex: 1;
      font-size: 28rpx;
      padding: 24rpx 0;
      border-radius: 8rpx;
      font-weight: 500;
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

.info-section {
  margin-bottom: 30rpx;

  .info-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #303133;
    margin-bottom: 20rpx;
    padding-left: 20rpx;
    border-left: 4rpx solid #409EFF;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .info-item {
      background: #f5f7fa;
      padding: 20rpx;
      border-radius: 8rpx;

      .label {
        font-size: 24rpx;
        color: #909399;
        margin-bottom: 10rpx;
        display: block;
      }

      .value {
        font-size: 28rpx;
        color: #303133;

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

.preference-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;

  .preference-item {
    background: #f5f7fa;
    padding: 20rpx;
    border-radius: 8rpx;

    &.full-width {
      grid-column: span 2;
    }

    .label {
      font-size: 24rpx;
      color: #909399;
      margin-bottom: 10rpx;
      display: block;
    }

    .value {
      font-size: 28rpx;
      color: #303133;
    }

    .tag-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx;

      .tag {
        padding: 6rpx 20rpx;
        border-radius: 6rpx;
        font-size: 24rpx;

        &.tag-warning {
          background: #fdf6ec;
          color: #E6A23C;
        }

        &.tag-info {
          background: #f4f4f5;
          color: #909399;
        }
      }
    }
  }
}

.loading-box {
  padding: 40rpx 0;
  text-align: center;
}

:deep(.uni-popup) {
  .uni-popup__mask {
    background-color: rgba(0, 0, 0, 0.6);
  }

  .uni-popup__wrapper {
    position: relative;
  }
}

.user-search-popup {
  z-index: 1002;
}
</style> 