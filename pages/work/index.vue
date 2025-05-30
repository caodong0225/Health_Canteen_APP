<template>
  <view class="work-container">
    <!-- 轮播图 -->
    <uni-swiper-dot class="uni-swiper-dot-box" :info="data" :current="current" field="content">
      <swiper class="swiper-box" :current="swiperDotIndex" @change="changeSwiper">
        <swiper-item v-for="(item, index) in data" :key="index">
          <view class="swiper-item" @click="clickBannerItem(item)">
            <image :src="item.image" mode="aspectFill" :draggable="false" />
          </view>
        </swiper-item>
      </swiper>
    </uni-swiper-dot>

    <!-- 宫格组件 -->
    <uni-section title="系统管理" type="line"></uni-section>
    <view class="grid-body">
      <uni-grid :column="4" :showBorder="false">
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick('user')">
            <uni-icons type="person-filled" size="30" color="#409EFF"></uni-icons>
            <text class="text">用户健康</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick('config')">
            <uni-icons type="gear-filled" size="30" color="#67C23A"></uni-icons>
            <text class="text">系统监控</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick('notice')">
            <uni-icons type="chat-filled" size="30" color="#E6A23C"></uni-icons>
            <text class="text">通知公告</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick('news')">
            <uni-icons type="notification-filled" size="30" color="#F56C6C"></uni-icons>
            <text class="text">最新动态</text>
          </view>
        </uni-grid-item>
      </uni-grid>
    </view>

    <!-- 健康管理模块 -->
    <uni-section title="健康管理" type="line"></uni-section>
    <view class="grid-body">
      <uni-grid :column="4" :showBorder="false">
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick('behavior')">
            <uni-icons type="shop-filled" size="30" color="#409EFF"></uni-icons>
            <text class="text">订单管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick('healthData')">
            <uni-icons type="calendar-filled" size="30" color="#67C23A"></uni-icons>
            <text class="text">健康数据</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick('nutrition')">
            <uni-icons type="heart-filled" size="30" color="#E6A23C"></uni-icons>
            <text class="text">营养管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="handleGridClick('suggestion')">
            <uni-icons type="info-filled" size="30" color="#909399"></uni-icons>
            <text class="text">健康建议</text>
          </view>
        </uni-grid-item>
      </uni-grid>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        current: 0,
        swiperDotIndex: 0,
        data: [{
            image: '/static/images/banner/banner01.jpg'
          },
          {
            image: '/static/images/banner/banner02.jpg'
          },
          {
            image: '/static/images/banner/banner03.jpg'
          }
        ]
      }
    },
    methods: {
      clickBannerItem(item) {
        console.info(item)
      },
      changeSwiper(e) {
        this.current = e.detail.current
      },
      handleGridClick(type) {
        switch(type) {
          case 'user':
            uni.navigateTo({
              url: '/pages/user/health/index'
            });
            break;
          case 'config':
            uni.navigateTo({
              url: '/pages/monitor/server/index'
            });
            break;
          case 'notice':
            uni.navigateTo({
              url: '/pages/message/index'
            });
            break;
          case 'news':
            uni.navigateTo({
              url: '/pages/notice/index'
            });
            break;
          case 'health':
            // 健康管理模块点击，可以添加提示或展开动画
            uni.showToast({
              title: '请选择具体功能',
              icon: 'none'
            });
            break;
          case 'behavior':
            uni.navigateTo({
              url: '/pages/user/behavior/index'
            });
            break;
          case 'healthData':
            uni.navigateTo({
              url: '/pages/user/health/index'
            });
            break;
          case 'nutrition':
            uni.navigateTo({
              url: '/pages/nutrition/index'
            });
            break;
          case 'suggestion':
            uni.navigateTo({
              url: '/pages/dish/recommend/index'
            });
            break;
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  /* #ifndef APP-NVUE */
  page {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background-color: #fff;
    min-height: 100%;
    height: auto;
  }

  view {
    font-size: 14px;
    line-height: inherit;
  }
  /* #endif */

  .text {
    text-align: center;
    font-size: 26rpx;
    margin-top: 10rpx;
  }

  .grid-item-box {
    flex: 1;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 0;
    background: #fff;
    border-radius: 20rpx;
    margin: 10rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  }

  .uni-margin-wrap {
    width: 690rpx;
    width: 100%;
    ;
  }

  .swiper {
    height: 300rpx;
  }

  .swiper-box {
    height: 150px;
  }

  .swiper-item {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    height: 300rpx;
    line-height: 300rpx;
  }

  @media screen and (min-width: 500px) {
    .uni-swiper-dot-box {
      width: 400px;
      /* #ifndef APP-NVUE */
      margin: 0 auto;
      /* #endif */
      margin-top: 8px;
    }

    .image {
      width: 100%;
    }
  }

  .health-grid {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx !important;
    margin: 10rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;

    .health-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      background: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
    }

    .health-info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .health-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #303133;
        margin-bottom: 8rpx;
      }

      .health-desc {
        font-size: 24rpx;
        color: #909399;
        line-height: 1.4;
      }
    }
  }

  .grid-body {
    padding: 20rpx;
    background: #f5f7fa;
    border-radius: 20rpx;
    margin: 20rpx;
  }
</style>
