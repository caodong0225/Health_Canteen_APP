<template>
  <view class="help-container">
    <view v-for="(item, findex) in list" :key="findex" :title="item.title" class="list-title">
      <view class="text-title">
        <view :class="item.icon"></view>{{ item.title }}
      </view>
      <view class="childList">
        <view v-for="(child, zindex) in item.childList" :key="zindex" class="question" hover-class="hover"
          @click="handleText(child)">
          <view class="text-item">{{ child.title }}</view>
          <view class="line" v-if="zindex !== item.childList.length - 1"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        list: [{
            icon: 'iconfont icon-health',
            title: '健康管理',
            childList: [{
              title: '如何添加我的健康数据？',
              content: '您可以在[用户健康]页面点击"新增"按钮，选择用户并填写相关健康数据，包括身高、体重、血压等指标。'
            }, {
              title: '如何查看我的健康趋势？',
              content: '在[健康数据]页面，您可以查看各项健康指标的历史记录和变化趋势，系统会自动生成健康报告。'
            }, {
              title: '如何设置健康提醒？',
              content: '在[健康数据]页面，点击右上角的设置图标，可以设置各项健康指标的提醒阈值，系统会在指标异常时及时提醒。'
            }, {
              title: '如何导出健康报告？',
              content: '在[健康数据]页面，点击右上角的导出按钮，可以选择导出时间范围，系统会生成详细的健康报告供您下载。'
            }]
          },
          {
            icon: 'iconfont icon-food',
            title: '饮食建议',
            childList: [{
              title: '如何获取个性化饮食建议？',
              content: '系统会根据您的健康数据、饮食习惯和偏好，在[营养标准]页面为您推荐合适的饮食方案。'
            }, {
              title: '如何记录每日饮食？',
              content: '在[健康数据]页面，点击"记录饮食"，可以添加您每日的饮食记录，系统会自动分析营养摄入情况。'
            }, {
              title: '如何查看营养分析？',
              content: '在[营养标准]页面，您可以查看每日营养摄入分析，包括热量、蛋白质、脂肪等营养成分的摄入情况。'
            }, {
              title: '如何设置饮食偏好？',
              content: '在[我的]-[个人设置]中，可以设置您的口味偏好、过敏原等信息，系统会根据这些信息调整饮食建议。'
            }]
          },
          {
            icon: 'iconfont icon-user',
            title: '用户指南',
            childList: [{
              title: '如何修改个人信息？',
              content: '请点击[我的]-[个人设置]，可以修改您的头像、昵称、联系方式等基本信息。'
            }, {
              title: '如何管理家庭成员？',
              content: '在[用户健康]页面，点击"新增"可以添加家庭成员的健康档案，方便统一管理全家人的健康数据。'
            }, {
              title: '如何设置隐私保护？',
              content: '在[我的]-[隐私设置]中，可以设置健康数据的访问权限，保护您的个人隐私。'
            }, {
              title: '如何获取专业建议？',
              content: '系统会根据您的健康数据，在必要时提供专业的饮食和健康建议，您也可以在[营养标准]页面查看详细的健康指导。'
            }]
          }
        ]
      }
    },
    methods: {
      handleText(item) {
        this.$tab.navigateTo(`/pages/common/textview/index?title=${item.title}&content=${item.content}`)
      }
    }
  }
</script>

<style lang="scss" scoped>
  page {
    background-color: #f8f8f8;
  }

  .help-container {
    margin-bottom: 100rpx;
    padding: 30rpx;
  }

  .list-title {
    margin-bottom: 30rpx;
  }

  .childList {
    background: #ffffff;
    box-shadow: 0px 0px 10rpx rgba(193, 193, 193, 0.2);
    border-radius: 16rpx;
    margin-top: 10rpx;
  }

  .line {
    width: 100%;
    height: 1rpx;
    background-color: #F5F5F5;
  }

  .text-title {
    color: #303133;
    font-size: 32rpx;
    font-weight: bold;
    margin-left: 10rpx;
    display: flex;
    align-items: center;

    .iconfont {
      font-size: 36rpx;
      margin-right: 16rpx;
      color: #409EFF;
    }
  }

  .text-item {
    font-size: 28rpx;
    padding: 24rpx;
    line-height: 1.6;
  }

  .question {
    color: #606266;
    font-size: 28rpx;
    transition: all 0.3s;

    &:active {
      background-color: #f5f7fa;
    }
  }
</style>
