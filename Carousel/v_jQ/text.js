<template>
  <!-- 携程数据填充与TMC页面跳转组件 by 陈宏 -->
  <div id="ctripAndTmcTransfer">
    <!-- 携程表单 -->
    <form :action="action" method="post" class="xiechengform">
      <input
        v-for="(item, i) in xiechengData"
        :key="i"
        type="hidden"
        :name="i"
        :value="item"
      />
    </form>
    <iframe src="" frameborder="0" name="form" id="form" style="display:none"></iframe>
  </div>
</template>
<script>
  // 引入接口文件
  import Urlconst from "@/services/beforeService";
  // 函数调用
  import {
    Dialog
  } from "vant";
  export default {
    components: {},
    props: {

    },
    data() {
      return {
        // 携程订单详情请求地址
        action: "https://ct.ctrip.com/m/SingleSignOn/H5SignInfo",
        // 携程数据
        xiechengData: {
          // appKey
          AccessUserId: '',
          // card
          EmployeeID: '',
          // 页类型面
          InitPage: '',
          // appKey
          Appid: '',
          Token: '',
          Callback: '',
          // ErrorCode
          OnError: '',
          // sig
          Signature: '',
          // 订单类型
          // site: '',
          // 订单号
          // orderNumber: ''
        },
        // 跳转对应信息
        routerInfo: {
          // 培训酒店
          10: {
            // 查询页
            reserve: '',
            // 详情页
            order: '',
          },
          // 滴滴
          11: {
            // 查询页
            reserve: '',
            // 详情页
            order: '',
          },
          // 12306直连
          101: {
            // 查询页
            reserve: '/trainSearchPage',
            // 详情页
            order: '/trainOrderInfo',
          },
          // 精选机票
          102: {
            // 查询页
            reserve: '',
            // 详情页
            order: '',
          },
          // 优享酒店
          103: {
            // 查询页
            reserve: '',
            // 详情页
            order: '',
          },
        },
        // 默认秒数
        count: 3,
        // 弹窗定时器
        dialogInterval: null,
      };
    },
    created() {},
    mounted() {},
    methods: {
      // 携程数据填充与TMC页面跳转方法
      submit(data, ticketTypes) {
        // 传参
        let params = {
          // 预订类型
          ticketType: data.ticketType,
          // 类型 1 仅查询 2 普通
          type: data.type,
          // 申请单号或者订单编号
          travelInfoNo: data.travelInfoNo,
        };	
        this.$axios(Urlconst.loginByTicketType, params).then(res => {
            if (res.statusCode !== this.$utils.statusCode.success) {
              return;
            };

            console.log(res);

            return;
            
            // 获取订单来源 1是tmc/12306直连标识 2是代表携程
            let channel = res.data.channel;
            // 判断订单来源 1 tmc/12306
            if (channel === 1) {
              // 获取tmc参数
              let tmcLogin = res.data.tmcLogin;
              // 获取路由信息
              let routerInfo = this.routerInfo[data.ticketType];
              let path = routerInfo[data.category];
              if (this.$utils.methods.hasVal(path)) {
                // 缓存tmc token信息到vuex
                this.$store.commit('setCache', {
                  key: "tmcToken",
                  data: tmcLogin.token
                });
                // 根据不同ticketType进行不同处理方式
                this.ticketType(data.ticketType, path, data);
              } else {
                // 暂无权限跳转
                this.$utils.methods.toast({
                  message: '暂无权限跳转',
                });
              };
            }
            // 携程
            else if (channel === 2 || !channel) {
              // 获取携程参数
              let {
                appKey,
                card,
                sig,
                token
              } = res.data.ctripLogin;
              // 赋值
              this.xiechengData.AccessUserId = appKey;
              this.xiechengData.Appid = appKey;
              this.xiechengData.EmployeeID = card;
              this.xiechengData.Signature = sig;
              this.xiechengData.Token = token;
              this.xiechengData.Callback = `http://weapp.igw.com/index.html?_bids=SGCCINTGWSL#${data.path}`;
              this.xiechengData.OnError = 'ErrorCode';
              // 预订
              if (data.category === "reserve") {
                this.xiechengData.EndorsementID = data.travelInfoNo;
              }
              // 详情
              else if (data.category === "order") {
                this.xiechengData.orderNumber = data.travelInfoNo;
              }
              // 飞机
              if (ticketTypes === 2) {
                this.xiechengData.InitPage = 'FlightSearch';
                if (data.category === "order") {
                  this.xiechengData.site = 'Flight';
                }
              }
              // 火车
              else if (ticketTypes === 1) {
                this.xiechengData.InitPage = 'TrainSearch';
                if (data.category === "order") {
                  this.xiechengData.site = 'Train';
                }
              }
              // 酒店
              else if (ticketTypes === 3) {
                this.xiechengData.InitPage = 'HotelSearch';
                if (data.category === "order") {
                  this.xiechengData.site = 'Hotel';
                }
              }
              this.$utils.methods.setToolBar({
                show:1,
                url:this.action,
                
              })
              
              this.$nextTick(() => {
                document.getElementsByClassName('xiechengform')[0].submit();
              }
              );
              $('form').load(function(){
                var text = $(this).contents().find('body').text()
                console.log('111',"text:",text);
                var j =$.parseJSON(text);
                console.log("j:",j);
              });
            };
          })
          .catch(error => {});
      },
      // 根据不同ticketType进行不同处理方式
      ticketType(ticketType, path, data) {
        // 12306直连
        if (ticketType === 101) {
          // 预订
          if (data.category === "reserve") {
            let that = this;
            Dialog.alert({
                className: "homePageDialog",
                title: "重要提示",
                message: "目前直购火车票已实现公司批量制票，您无需再打印车票及手续费报销凭证哦。",
                confirmButtonText: '知道了 (' + that.count + 's)',
                confirmButtonColor: "#C6CCCC",
              })
              .then(() => {
                that.$store.commit('setCache', {
                  key: 'query',
                  data: {
                    // 上个页面路由
                    fromPath: '/homePage',
                    // 需要的参数
                    data: {
                      // 首页信息
                      homePage: {
                        // 带过来的数据
                        ...data,
                        // 申请单号
                        applicationCode: data.travelInfoNo,
                      },
                    },
                    // 业务类型 0-预订 1-退票 2-改签
                    businessType: 0,
                  }
                });
                that.$router.push({
                  path: path
                });
                // 删除弹窗组件
                let parent = document.querySelectorAll("body")[0];
                let dialog = document.querySelectorAll('.van-dialog.homePageDialog')[0];
                if (that.$utils.methods.hasVal(dialog)) {
                  parent.removeChild(dialog);
                };
              })
              .catch(() => {
                // on cancel
              });
            setTimeout(() => {
              this.dialogTimer();
            }, 50);
          }
          // 详情
          else if (data.category === "order") {
            this.$store.commit('setCache', {
              key: 'query',
              data: {
                 ...this.$store.getters.query,
                // 上个页面路由
                // fromPath: '/my',
                // 需要的参数
                data: {
                  ...this.$store.getters.query.data,
                  // 我的订单信息
                  myOrder: {
                    // 带过来的数据
                    ...data,
                  },
                },
                // 业务类型 0-预订 1-退票 2-改签
                businessType: 0,
              }
            });
            this.$router.push({
              path: path
            });
          };
        };
      },
      // 弹窗定时器
      dialogTimer() {
        // 定时器不存在时
        if (!this.dialogInterval) {
          // 初始化信息数据与dom元素
          let count = this.count;
          let buttonDiv = document.querySelectorAll('.van-dialog.homePageDialog .van-dialog__confirm')[0];
          let buttonText = document.querySelectorAll(
            '.van-dialog.homePageDialog .van-dialog__confirm .van-button__text')[0];
          buttonDiv.disabled = true;
          buttonDiv.style.color = '#C6CCCC';
          buttonText.innerHTML = '知道了 (' + count + 's)';
          // 添加定时器计算秒数
          this.dialogInterval = setInterval(() => {
            count--;
            let confirmButtonText = '知道了 (' + count + 's)';
            buttonText.innerHTML = confirmButtonText;
            // 清空定时器
            if (count === 0) {
              buttonDiv.disabled = false;
              buttonDiv.style.color = '#16C9C5';
              buttonText.innerHTML = '知道了';
              clearInterval(this.dialogInterval);
              this.dialogInterval = null;
            };
          }, 1000);
        };
      }
    },
    filters: {},
    watch: {},
    computed: {}
  };

</script>
<style scoped lang="less">
// 携程数据填充与TMC页面跳转组件
#ctripAndTmcTransfer {
  // 携程表单
  .xiechengform {
    display: none;
  }
}
</style>
