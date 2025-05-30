<template>
  <view class="recommend-container">
    <!-- 搜索表单 -->
    <view class="search-form">
      <view class="form-item">
        <text class="label">是否合理</text>
        <picker @change="handleIsOkChange" :value="isOkIndex" :range="isOkOptions" range-key="label">
          <view class="picker-value">
            {{ isOkOptions[isOkIndex].label }}
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="label">推荐用户</text>
        <view class="user-select" @click="showUserSearch">
          <text class="select-value">{{ queryParams.userName || '请选择用户' }}</text>
          <uni-icons type="search" size="16" color="#909399"></uni-icons>
        </view>
      </view>
      
      <view class="form-item">
        <text class="label">推荐类型</text>
        <picker @change="handleTypeChange" :value="typeIndex" :range="typeOptions" range-key="label">
          <view class="picker-value">
            {{ typeOptions[typeIndex].label }}
          </view>
        </picker>
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
      <view class="list-item" v-for="(item, index) in recommendList" :key="index">
        <view class="item-header">
          <text class="user-name" @click="showUserDetail(item.recommendTo)">
            {{ getUserName(item.recommendTo) }}
          </text>
          <text class="recommend-status" :class="item.isOk === 1 ? 'status-ok' : 'status-no'">
            {{ item.isOk === 1 ? '合理' : '不合理' }}
          </text>
        </view>
        
        <view class="item-content">
          <view class="content-row">
            <text class="label">推荐类型：</text>
            <text class="value type-tag" :class="getTypeClass(item.type)">{{ getTypeText(item.type) }}</text>
          </view>
          <view class="content-row">
            <text class="label">推荐菜品：</text>
            <view class="dish-list">
              <text 
                v-for="(dish, dIndex) in parseDishes(item.dishes)" 
                :key="dIndex"
                class="dish-tag"
                @click="handleViewDish(item.dishes, dIndex)"
              >{{ dish.name }}</text>
            </view>
          </view>
          <view class="content-row" v-if="item.remark">
            <text class="label">备注：</text>
            <text class="value">{{ item.remark }}</text>
          </view>
          <view class="content-row">
            <text class="label">创建时间：</text>
            <text class="value">{{ item.createTime }}</text>
          </view>
        </view>
        
        <view class="item-actions">
          <button class="action-link" @click="handleUpdate(item)">修改</button>
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

    <!-- 菜品详情弹窗 -->
    <uni-popup ref="dishDetailPopup" type="center">
      <view class="popup-content dish-detail-popup">
        <view class="popup-header">
          <text class="popup-title">菜品详情</text>
          <button class="close-btn" @click="closeDishDetail">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <view class="dish-detail" v-if="viewForm">
            <image class="dish-image" :src="viewForm.image" mode="aspectFill"></image>
            <view class="dish-info">
              <text class="dish-name">{{ viewForm.name }}</text>
              <view class="dish-tags">
                <text class="tag">{{ viewForm.tag }}</text>
                <text class="tag">{{ getFlavorText(viewForm.flavor) }}</text>
              </view>
              <view class="dish-meta">
                <text class="price">¥{{ viewForm.price }}</text>
                <text class="view">访问量: {{ viewForm.view }}</text>
              </view>
              
              <view class="dish-section" v-if="viewForm.ingredient">
                <text class="section-title">食材清单</text>
                <view class="ingredient-list">
                  <text 
                    v-for="(item, i) in parseIngredients(viewForm.ingredient)" 
                    :key="i"
                    class="ingredient-tag"
                  >{{ item.name }}{{ item.quantity ? `: ${item.quantity}` : '' }}</text>
                </view>
              </view>
              
              <view class="dish-section" v-if="viewForm.step">
                <text class="section-title">烹饪步骤</text>
                <view class="step-list">
                  <view 
                    v-for="(step, i) in parseSteps(viewForm.step)" 
                    :key="i"
                    class="step-item"
                  >
                    <text class="step-number">步骤 {{ step.number }}</text>
                    <text class="step-desc">{{ step.description }}</text>
                  </view>
                </view>
              </view>
              
              <view class="dish-section" v-if="viewForm.tip">
                <text class="section-title">小贴士</text>
                <text class="tip-text">{{ viewForm.tip }}</text>
              </view>
              
              <view class="dish-section" v-if="viewForm.remark">
                <text class="section-title">说明</text>
                <text class="remark-text">{{ viewForm.remark }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 用户详情弹窗 -->
    <uni-popup ref="userDetailPopup" type="center">
      <view class="popup-content user-detail-popup">
        <view class="popup-header">
          <text class="popup-title">用户详细信息</text>
          <button class="close-btn" @click="closeUserDetail">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <view class="user-detail" v-if="detailForm">
            <view class="user-header">
              <image class="user-avatar" :src="detailForm.avatar || '/static/images/profile.jpg'" mode="aspectFill"></image>
              <view class="user-basic">
                <text class="user-nickname">{{ detailForm.nickName }}</text>
                <text class="user-name">{{ detailForm.userName }}</text>
              </view>
            </view>
            
            <view class="info-section">
              <view class="info-row">
                <text class="label">邮箱</text>
                <text class="value">{{ detailForm.email }}</text>
              </view>
              <view class="info-row">
                <text class="label">手机号</text>
                <text class="value">{{ detailForm.phonenumber }}</text>
              </view>
              <view class="info-row">
                <text class="label">性别</text>
                <text class="value">{{ getSexText(detailForm.sex) }}</text>
              </view>
              <view class="info-row">
                <text class="label">状态</text>
                <text class="value status-tag" :class="detailForm.status === '0' ? 'status-normal' : 'status-disabled'">
                  {{ detailForm.status === '0' ? '正常' : '停用' }}
                </text>
              </view>
            </view>
            
            <view class="health-section">
              <text class="section-title">健康指标</text>
              <view class="health-grid">
                <view class="health-item">
                  <text class="label">身高</text>
                  <text class="value">{{ detailForm.height }}cm</text>
                </view>
                <view class="health-item">
                  <text class="label">体重</text>
                  <text class="value">{{ detailForm.weight }}kg</text>
                </view>
                <view class="health-item">
                  <text class="label">年龄</text>
                  <text class="value">{{ detailForm.age }}岁</text>
                </view>
                <view class="health-item">
                  <text class="label">血糖值</text>
                  <text class="value">{{ detailForm.bloodGlucose }}mmol/L</text>
                </view>
                <view class="health-item">
                  <text class="label">收缩压</text>
                  <text class="value">{{ detailForm.systolicPressure }}mmHg</text>
                </view>
                <view class="health-item">
                  <text class="label">舒张压</text>
                  <text class="value">{{ detailForm.diastolicPressure }}mmHg</text>
                </view>
                <view class="health-item">
                  <text class="label">总胆固醇</text>
                  <text class="value">{{ detailForm.totalCholesterol }}mmol/L</text>
                </view>
              </view>
            </view>
            
            <view class="preference-section" v-if="userPreferences">
              <text class="section-title">用户偏好</text>
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
                  <text class="value">{{ userPreferences.健康目标 }}</text>
                </view>
                <view class="preference-item" v-if="userPreferences.过敏原 && userPreferences.过敏原.length">
                  <text class="label">过敏原</text>
                  <view class="tag-list">
                    <text 
                      v-for="(item, index) in userPreferences.过敏原" 
                      :key="index"
                      class="tag warning"
                    >{{ item }}</text>
                  </view>
                </view>
                <view class="preference-item" v-if="userPreferences.饮食习惯 && userPreferences.饮食习惯.length">
                  <text class="label">饮食习惯</text>
                  <view class="tag-list">
                    <text 
                      v-for="(item, index) in userPreferences.饮食习惯" 
                      :key="index"
                      class="tag info"
                    >{{ item }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 新增/修改弹窗 -->
    <uni-popup ref="formPopup" type="center">
      <view class="popup-content form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ title }}</text>
          <button class="close-btn" @click="cancel">
            <uni-icons type="close" size="20" color="#909399"></uni-icons>
          </button>
        </view>
        <view class="popup-body">
          <view class="form-content">
            <view class="form-item">
              <text class="label">推荐类型</text>
              <picker 
                @change="handleFormTypeChange" 
                :value="formTypeIndex" 
                :range="formTypeOptions" 
                range-key="label"
              >
                <view class="picker-value">
                  {{ formTypeOptions[formTypeIndex].label }}
                </view>
              </picker>
            </view>
            
            <view class="form-item">
              <text class="label">备注</text>
              <input 
                class="input" 
                v-model="form.remark" 
                placeholder="请输入备注"
                type="text"
              />
            </view>
            
            <view class="form-item">
              <text class="label">是否合理</text>
              <radio-group class="radio-group" @change="handleFormIsOkChange">
                <label class="radio" v-for="(item, index) in formIsOkOptions" :key="index">
                  <radio :value="item.value" :checked="form.isOk === parseInt(item.value)" />
                  <text>{{ item.label }}</text>
                </label>
              </radio-group>
            </view>
          </view>
          
          <view class="form-buttons">
            <button class="submit-btn" @click="submitForm">确定</button>
            <button class="cancel-btn" @click="cancel">取消</button>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { listRecommend, getRecommend, delRecommend, addRecommend, updateRecommend } from "@/api/dish/recommend";
import { getUser, listUser } from "@/api/system/user";
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
      // 推荐记录列表
      recommendList: [],
      // 弹出层标题
      title: "",
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        isOk: null,
        recommendTo: null,
        userName: null,
        type: null
      },
      // 表单参数
      form: {
        id: null,
        dishIds: null,
        createTime: null,
        remark: null,
        isOk: 1,
        updateTime: null,
        updateBy: null,
        recommendTo: null,
        userName: null,
        type: null
      },
      // 搜索表单的是否合理选项
      isOkOptions: [
        { value: '', label: '全部' },
        { value: '1', label: '是' },
        { value: '0', label: '否' }
      ],
      // 编辑表单的是否合理选项
      formIsOkOptions: [
        { value: '1', label: '是' },
        { value: '0', label: '否' }
      ],
      isOkIndex: 0,
      // 查看详情相关
      viewForm: null,
      // 用户列表
      userList: [],
      // 用户详情数据
      detailForm: {},
      // 搜索表单的推荐类型选项
      typeOptions: [
        { value: '', label: '全部' },
        { value: '0', label: '基于口味' },
        { value: '1', label: '基于健康' },
        { value: '2', label: '基于疾病' }
      ],
      // 编辑表单的推荐类型选项
      formTypeOptions: [
        { value: '0', label: '基于口味' },
        { value: '1', label: '基于健康' },
        { value: '2', label: '基于疾病' }
      ],
      typeIndex: 0,
      formTypeIndex: 0,
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
    // 获取所有用户信息
    listUser({size:10000}).then(response => {
      this.userList = response.rows;
    });
  },
  methods: {
    /** 查询推荐记录列表 */
    getList() {
      this.loading = true;
      listRecommend(this.queryParams).then(response => {
        this.recommendList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    
    /** 是否合理选择器变化 */
    handleIsOkChange(e) {
      this.isOkIndex = e.detail.value;
      this.queryParams.isOk = this.isOkOptions[this.isOkIndex].value || null;
    },
    
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    
    /** 重置按钮操作 */
    resetQuery() {
      this.isOkIndex = 0;
      this.typeIndex = 0;
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        isOk: null,
        recommendTo: null,
        userName: null,
        type: null
      };
      this.handleQuery();
    },
    
    /** 页码变化 */
    handlePageChange(page) {
      this.queryParams.pageNum = page;
      this.getList();
    },
    
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.title = "添加推荐记录";
      this.$refs.formPopup.open();
    },
    
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getRecommend(id).then(response => {
        this.form = response.data;
        this.formTypeIndex = this.formTypeOptions.findIndex(item => item.value === this.form.type.toString());
        this.$refs.formPopup.open();
        this.title = "修改推荐记录";
      });
    },
    
    /** 提交按钮 */
    submitForm() {
      if (!this.form.type) {
        uni.showToast({
          title: '请输入推荐类型',
          icon: 'none'
        });
        return;
      }
      
      if (this.form.id != null) {
        updateRecommend(this.form).then(response => {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          });
          this.$refs.formPopup.close();
          this.getList();
        });
      } else {
        addRecommend(this.form).then(response => {
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
      this.reset();
    },
    
    /** 表单重置 */
    reset() {
      this.form = {
        id: null,
        dishIds: null,
        createTime: null,
        remark: null,
        isOk: 1,
        updateTime: null,
        updateBy: null,
        recommendTo: null,
        userName: null,
        type: null
      };
      this.formTypeIndex = 0;
    },
    
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      uni.showModal({
        title: '提示',
        content: '是否确认删除该推荐记录？',
        success: (res) => {
          if (res.confirm) {
            delRecommend(ids).then(() => {
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
      uni.showToast({
        title: '导出功能开发中',
        icon: 'none'
      });
    },
    
    /** 查看菜品详情 */
    handleViewDish(dishes, index) {
      try {
        const dishesList = JSON.parse(dishes);
        this.viewForm = dishesList[index];
        this.$refs.dishDetailPopup.open();
      } catch (error) {
        console.error('解析菜品数据失败:', error);
        uni.showToast({
          title: '获取菜品详情失败',
          icon: 'none'
        });
      }
    },
    
    /** 关闭菜品详情 */
    closeDishDetail() {
      this.$refs.dishDetailPopup.close();
      this.viewForm = null;
    },
    
    /** 获取用户名 */
    getUserName(userId) {
      const user = this.userList.find(item => item.userId === userId);
      return user ? user.userName : '未知用户';
    },
    
    /** 显示用户详情 */
    showUserDetail(userId) {
      getUser(userId).then(response => {
        this.detailForm = response.data;
        this.$refs.userDetailPopup.open();
      });
    },
    
    /** 关闭用户详情 */
    closeUserDetail() {
      this.$refs.userDetailPopup.close();
      this.detailForm = {};
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
      if (this.$refs.formPopup.isOpen) {
        // 编辑表单选择用户
        this.form.recommendTo = user.userId;
        this.form.userName = user.userName;
      } else {
        // 查询表单选择用户
        this.queryParams.recommendTo = user.userId;
        this.queryParams.userName = user.userName;
        this.handleQuery();
      }
      this.closeUserSearch();
    },
    
    /** 解析菜品数据 */
    parseDishes(dishes) {
      try {
        return JSON.parse(dishes);
      } catch (e) {
        return [];
      }
    },
    
    /** 解析食材数据 */
    parseIngredients(ingredients) {
      try {
        return JSON.parse(ingredients);
      } catch (e) {
        return [];
      }
    },
    
    /** 解析步骤数据 */
    parseSteps(steps) {
      try {
        return JSON.parse(steps);
      } catch (e) {
        return [];
      }
    },
    
    /** 推荐类型选择器变化 */
    handleTypeChange(e) {
      this.typeIndex = e.detail.value;
      this.queryParams.type = this.typeOptions[this.typeIndex].value || null;
    },
    
    /** 表单推荐类型选择器变化 */
    handleFormTypeChange(e) {
      this.formTypeIndex = e.detail.value;
      this.form.type = parseInt(this.formTypeOptions[this.formTypeIndex].value);
    },
    
    /** 获取推荐类型文本 */
    getTypeText(type) {
      const option = this.typeOptions.find(item => item.value === type.toString());
      return option ? option.label : '未知类型';
    },
    
    /** 获取推荐类型样式类 */
    getTypeClass(type) {
      const typeMap = {
        '0': 'type-taste',
        '1': 'type-health',
        '2': 'type-disease'
      };
      return typeMap[type] || '';
    },
    
    /** 获取口味文本 */
    getFlavorText(flavor) {
      const flavors = {
        '1': '清淡',
        '2': '适中',
        '3': '重口'
      };
      return flavors[flavor] || '未知口味';
    },
    
    /** 获取性别文本 */
    getSexText(sex) {
      const sexes = {
        '0': '男',
        '1': '女',
        '2': '未知'
      };
      return sexes[sex] || '未知';
    },
    
    /** 表单是否合理选择器变化 */
    handleFormIsOkChange(e) {
      this.form.isOk = parseInt(e.detail.value);
    },
  }
};
</script>

<style lang="scss" scoped>
.recommend-container {
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

    .picker-value, .user-select, .input {
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

    .input {
      width: 100%;
      box-sizing: border-box;
    }

    .radio-group {
      display: flex;
      gap: 30rpx;

      .radio {
        display: flex;
        align-items: center;
        gap: 8rpx;
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

    &.add-btn {
      background: #409EFF;
    }

    &.edit-btn {
      background: #67C23A;
    }

    &.delete-btn {
      background: #F56C6C;
    }

    &.export-btn {
      background: #909399;
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

      .recommend-status {
        font-size: 24rpx;
        padding: 4rpx 16rpx;
        border-radius: 20rpx;

        &.status-ok {
          background: #f6ffed;
          color: #52c41a;
        }

        &.status-no {
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

        .dish-list {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 10rpx;

          .dish-tag {
            background: #f5f7fa;
            color: #409EFF;
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 24rpx;
          }
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
}

.dish-detail-popup {
  .dish-detail {
    .dish-image {
      width: 100%;
      height: 400rpx;
      border-radius: 10rpx;
      margin-bottom: 20rpx;
    }

    .dish-info {
      .dish-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #303133;
        margin-bottom: 20rpx;
        display: block;
      }

      .dish-tags {
        display: flex;
        gap: 20rpx;
        margin-bottom: 20rpx;

        .tag {
          background: #f5f7fa;
          color: #606266;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          font-size: 24rpx;
        }
      }

      .dish-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30rpx;

        .price {
          font-size: 32rpx;
          color: #f56c6c;
          font-weight: bold;
        }

        .view {
          font-size: 24rpx;
          color: #909399;
        }
      }

      .dish-section {
        margin-bottom: 30rpx;

        .section-title {
          font-size: 28rpx;
          font-weight: bold;
          color: #303133;
          margin-bottom: 20rpx;
          display: block;
        }

        .ingredient-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10rpx;

          .ingredient-tag {
            background: #f5f7fa;
            color: #606266;
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 24rpx;
          }
        }

        .step-list {
          .step-item {
            display: flex;
            margin-bottom: 20rpx;

            .step-number {
              width: 120rpx;
              font-size: 28rpx;
              color: #409EFF;
              font-weight: bold;
            }

            .step-desc {
              flex: 1;
              font-size: 28rpx;
              color: #606266;
            }
          }
        }

        .tip-text, .remark-text {
          font-size: 28rpx;
          color: #606266;
          line-height: 1.6;
        }
      }
    }
  }
}

.user-detail-popup {
  .user-detail {
    .user-header {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;

      .user-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        margin-right: 20rpx;
      }

      .user-basic {
        .user-nickname {
          font-size: 32rpx;
          font-weight: bold;
          color: #303133;
          margin-bottom: 10rpx;
          display: block;
        }

        .user-name {
          font-size: 28rpx;
          color: #909399;
        }
      }
    }

    .info-section {
      background: #f5f7fa;
      border-radius: 10rpx;
      padding: 20rpx;
      margin-bottom: 30rpx;

      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20rpx;
        font-size: 28rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #909399;
        }

        .value {
          color: #303133;

          &.status-tag {
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 24rpx;

            &.status-normal {
              background: #f6ffed;
              color: #52c41a;
            }

            &.status-disabled {
              background: #fff2f0;
              color: #ff4d4f;
            }
          }
        }
      }
    }

    .health-section, .preference-section {
      margin-bottom: 30rpx;

      .section-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #303133;
        margin-bottom: 20rpx;
        display: block;
        padding-left: 20rpx;
        border-left: 8rpx solid #409EFF;
      }

      .health-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20rpx;

        .health-item {
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
            font-size: 28rpx;
            color: #303133;
            font-weight: bold;
          }
        }
      }

      .preference-grid {
        .preference-item {
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
          }

          .tag-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10rpx;

            .tag {
              padding: 4rpx 16rpx;
              border-radius: 20rpx;
              font-size: 24rpx;

              &.warning {
                background: #fff7e6;
                color: #fa8c16;
              }

              &.info {
                background: #f4f4f5;
                color: #909399;
              }
            }
          }
        }
      }
    }
  }
}

.form-popup {
  .form-content {
    .form-item {
      margin-bottom: 30rpx;

      .label {
        font-size: 28rpx;
        color: #606266;
        margin-bottom: 10rpx;
        display: block;
      }

      .picker-value {
        height: 80rpx;
        line-height: 80rpx;
        padding: 0 20rpx;
        background: #f5f7fa;
        border-radius: 10rpx;
        font-size: 28rpx;
        color: #303133;
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

      &.submit-btn {
        background: #409EFF;
        color: #fff;
      }

      &.cancel-btn {
        background: #f5f7fa;
        color: #606266;
      }
    }
  }
}

.type-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  
}
</style> 