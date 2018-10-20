
## 前言
最近, 工作中要做类似这种的项目. 用到了百度的 [echarts](http://echarts.baidu.com) 这个开源的数据可视化的框架.
![安全态势感知](http://wx4.sinaimg.cn/mw690/0060lm7Tly1fwf14rudhqj30dx07g74q.jpeg)

因为投屏项目不像PC端的WEB, 它不允许用户用鼠标键盘等交互. 有些图表只能看到各部分的占比情况, 不能显示具体的数值.
比如:

![设计图1](http://wx3.sinaimg.cn/mw690/0060lm7Tly1fwf1gxza98j3076078412.jpg)
![设计图2](http://wx1.sinaimg.cn/mw690/0060lm7Tly1fwf3zn3wmvj30cx0870yw.jpg)

得让页面的数据(即tootips)自动轮播数据,效果是这样的.

![最终效果图1](http://wx1.sinaimg.cn/mw690/0060lm7Tly1fwf1iy6gh9g30ae06t0ul.gif)
![最终效果图2](http://wx2.sinaimg.cn/mw690/0060lm7Tly1fwf1iyqmpmg30bw06rq51.gif)

所以 echarts-auto-tooltips 就应运而生.

[博客地址](http://www.cnblogs.com/liuyishi/)

## 使用方法
1. 引入ehcrts-auto-tooltips

```html
<script type="text/javascript" src="js/echarts-auto-tooltip.js"></script>
```

2.  在初始化 echarts 实例并通过 setOption 方法生成图表的代码下添加如下代码

```js
// 使用指定的配置项和数据显示图表
myChart.setOption(option);
tools.loopShowTooltip(myChart, option, {loopSeries: true}); // 使用本插件
```

## 参数说明:

mychart: 初始化echarts的实例

option: 指定图表的配置项和数据

loopOption: 本插件的配置

| 属性          | 说明                                                                      | 默认值                 |
| ----------- | ------------------------------------------------------------------------- | ------------------- |
| interval    | 轮播时间间隔，单位毫秒                                                               | 默认为2000             |
| loopSeries  | true表示循环所有series的tooltip，false则显示指定seriesIndex的tooltip                    | boolean类型，默认为false |
| seriesIndex | 指定某个系列（option中的series索引）循环显示tooltip,当loopSeries为true时，从seriesIndex系列开始执行. | 默认为0|

实例代码

```js
function drawSensitiveFile() {
            let myChart = echarts.init(document.getElementById('sensitive-file'));
            let option = {
                title: {
                    text: '敏感文件分布分析',
                    x: '40',
                    textStyle: {
                        color: '#fff'
                    }

                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)",

                },
                legend: {
                    type: 'scroll',
                    orient: 'vertical',
                    right: 10,
                    top: 20,
                    bottom: 20,
                    data: ['人事类', '研发类', '营销类', '客户信息类'],
                    textStyle: {
                        color: '#fff'
                    }
                },
                series: [
                    {
                        name: '敏感文件分布数量',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '60%'],
                        data: [
                            {value: 335, name: '人事类'},
                            {value: 310, name: '研发类'},
                            {value: 234, name: '营销类'},
                            {value: 1548, name: '客户信息类'}
                        ],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                        labelLine: {
                            normal: {
                                //length:5,  // 改变标示线的长度
                                lineStyle: {
                                    color: "#fff"  // 改变标示线的颜色
                                }
                            },
                        },
                        label: {
                            normal: {
                                textStyle: {
                                    color: '#fff'  // 改变标示文字的颜色
                                }
                            }
                        },
                    }
                ]
            };

            myChart.setOption(option);

			tools.loopShowTooltip(myChart, option, {loopSeries: true});

        }
```
