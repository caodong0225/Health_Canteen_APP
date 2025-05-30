<template>
  <view class="about-container">
    <view class="header-section text-center">
      <image style="width: 180rpx;height: 180rpx;" src="/static/logo200.png" mode="widthFix">
      </image>
      <uni-title type="h2" title="iDiet"></uni-title>
      <text class="subtitle">iDiet · 健康生活</text>
    </view>

    <view class="content-section">
      <view class="description-box">
        <text class="description-text">iDiet是一款专注于健康膳食管理的智能平台，致力于为用户提供个性化的健康饮食解决方案。通过智能算法和专业的营养分析，帮助用户实现科学饮食、健康生活的目标。</text>
      </view>

      <view class="menu-list">
        <view class="list-cell list-cell-arrow">
          <view class="menu-item-box">
            <view>当前版本</view>
            <view class="text-right">v{{version}}</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow">
          <view class="menu-item-box">
            <view>官方网站</view>
            <view class="text-right">
              <uni-link :href="webUrl" :text="webUrl" showUnderLine="false"></uni-link>
            </view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow">
          <view class="menu-item-box">
            <view>客户端地址</view>
            <view class="text-right">
              <uni-link :href="appUrl" :text="appUrl" showUnderLine="false"></uni-link>
            </view>
          </view>
        </view>
      </view>

      <view class="feature-section">
        <view class="feature-title">核心功能</view>
        <view class="feature-grid">
          <view class="feature-item">
            <uni-icons type="heart" size="24" color="#409EFF"></uni-icons>
            <text>健康监测</text>
          </view>
          <view class="feature-item">
            <uni-icons type="calendar" size="24" color="#67C23A"></uni-icons>
            <text>膳食管理</text>
          </view>
          <view class="feature-item">
            <uni-icons type="bars" size="24" color="#E6A23C"></uni-icons>
            <text>数据分析</text>
          </view>
          <view class="feature-item">
            <uni-icons type="notification" size="24" color="#F56C6C"></uni-icons>
            <text>智能提醒</text>
          </view>
        </view>
      </view>
    </view>

    <view class="copyright">
      <view>Copyright &copy; {{currentYear}} iDiet All Rights Reserved.</view>
      <view class="copyright-sub">让健康饮食更简单</view>
    </view>
  </view>
</template>

<script>
import uniIcons from '../../../uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
export default {
  components: { uniIcons },
  data() {
    return {
      webUrl: 'http://123.60.80.170/',
      appUrl: 'https://health-canteen.pages.dev/',
      version: getApp().globalData.config.appInfo.version,
      currentYear: new Date().getFullYear()
    }
  }
}
</script>

<style lang="scss" scoped>
page {
  background-color: #f8f8f8;
}

.about-container {
  padding: 30rpx;
}

.header-section {
  display: flex;
  padding: 40rpx 0;
  flex-direction: column;
  align-items: center;
  
  .subtitle {
    font-size: 28rpx;
    color: #666;
    margin-top: 10rpx;
  }
}

.description-box {
  background: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
  margin: 20rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .description-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}

.menu-list {
  background: #fff;
  border-radius: 12rpx;
  margin: 20rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .list-cell {
    padding: 30rpx;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .menu-item-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 28rpx;
      color: #333;

      .text-right {
        color: #666;
      }
    }
  }
}

.feature-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin: 20rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .feature-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
    text-align: center;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30rpx;

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx;
      background: #f8f8f8;
      border-radius: 8rpx;

      text {
        margin-top: 10rpx;
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

.copyright {
  margin-top: 60rpx;
  text-align: center;
  line-height: 1.6;
  color: #999;
  font-size: 24rpx;

  .copyright-sub {
    margin-top: 10rpx;
    color: #666;
  }
}
</style>
