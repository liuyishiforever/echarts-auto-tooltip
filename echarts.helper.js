/*
 Version: 1.1.4
  Author: 行者
 Website: https://gitee.com/qw_xingzhe
    Docs: https://www.kancloud.cn/qw_xingzhe/echart-helper/668005
    Repo: https://gitee.com/qw_xingzhe/ECharts-Helper
  Issues: https://gitee.com/qw_xingzhe/ECharts-Helper/issues
 */
(function ($) {
	$.fn.extend({

		// 异步获取数据并绘制图表
		getDrawEChart : function(option){

			var defaultSetting = {
				'url':'',					// 数据请求地址
				'data':{},					// 数据请求附加参数
				'theme':'',
				'type':'GET',				// 
				'success':null,				// 数据请求成功回调函数
				'data_key':null,			// 数据字段key,多层用 . 号进行分割
				'success_key':null,			// 数据请求成功标识字段名
				'success_val':'1',			// 数据请求成功标识字段值				
				'drow_data':{				// 图表配置（说明参看 drawEChart 方法区）
					echart_data     : [],
        			echart_config   : {},
        			echart_option   : {}
				}			
			};
         	var setting = $.extend(defaultSetting,option);
         	var that 	= this;
			var myChart = echarts.init(this[0],setting.theme);

			// 显示加载中状态
			myChart.showLoading();
			
			$.ajax({
				type: setting.type,
				url: setting.url,
				data: setting.data,
				success: function(data){

					// 关闭加载中状态
					myChart.hideLoading();

					// 测试数据一：简洁版
					//data = [{"title":"基础知识","get_score":11},{"title":"加分知识","get_score":12},{"title":"未分组","get_score":8}];

					// 测试数据二：完整版（此处需要增加如下配置： {success_key:'code',success_val:'1'，data_key:'dataset'}）
					//data = {code:1,dataset:[{"title":"基础知识","get_score":11},{"title":"加分知识","get_score":12},{"title":"未分组","get_score":8}]};

					if(typeof data=='string'){
						data = eval('(' + data + ')');
						if(typeof data=='string')data = eval('(' + data + ')');
					}
					
					// 验证数据是否有效加载
					if( setting.success_key && (typeof data[setting.success_key]=='undefined' || data[setting.success_key]!=setting.success_val) ){
						// 将图表置为空-》冒泡动画
						// ...

						// 数据请求失败抛出异常
						//throw new Error('数据加载失败');
						console.log('对URL '+setting.url+' 的请求,数据验证无效...');
						return false;
					}
					// 取出有效数据并替换
					if(setting.data_key){
						data = eval('(data.'+setting.data_key+')');
					}
					
					if(setting.success){
						// 自定义回调处理
						func(myChart,data);
					}else{
						// 直接绘制图表（推荐）
						setting.drow_data.echart_data = data;
						that.drawEChart(setting.drow_data,{},myChart);
					}
				},
				error: function(data){
					console.log('err:');
					console.log(data);
				}
			});



			/*
			$.get(setting.url, setting.param, function (data) {
				myChart.hideLoading();

				// 测试数据一：简洁版
				//data = [{"title":"基础知识","get_score":11},{"title":"加分知识","get_score":12},{"title":"未分组","get_score":8}];

				// 测试数据二：完整版（此处需要增加如下配置： {success_key:'code',success_val:'1'，data_key:'dataset'}）
				//data = {code:1,dataset:[{"title":"基础知识","get_score":11},{"title":"加分知识","get_score":12},{"title":"未分组","get_score":8}]};
				console.log('setting:::::::::');
				console.log(setting);
				console.log(data);


				if(typeof data=='string'){
					data = eval('(' + data + ')');
				}
				


				// 验证数据是否有效加载
				if( setting.success_key && (typeof data[setting.success_key]=='undefined' || data[setting.success_key]!=setting.success_val) ){
					// 将图表置为空-》冒泡动画
					// ...

					// 数据请求失败抛出异常
					//throw new Error('数据加载失败');

					return false;
				}
				// 取出有效数据并替换
				if(setting.data_key){
					data = eval('(data.'+setting.data_key+')');
				}
				
				if(setting.success){
					// 自定义回调处理
					func(myChart,data);
				}else{
					// 直接绘制图表（推荐）
					setting.drow_data.echart_data = data;
					that.drawEChart(setting.drow_data,{},myChart);
				}
			})
			*/



		},

		// 依据数据单独绘制图表
		drawEChart : function(drowData,option,chart){
			var defaultDrowData = {
				'echart_data'	: [],	// 图表数据
				'echart_config'	: {},	// 图表配置（数据使用字段、图表类型、标题等，具体请查看文档）
				'echart_option'	: {}	// 单图表模版覆盖配置（可直接复制使用 echarts 配置，递归覆盖插件内模版）
			};
         	var drowData = $.extend(defaultDrowData,drowData);
			this.createEChartHelper(option).formatDrawOneChart(drowData,chart);
		},
		
		// 初始化页面图表
		EChartHelper : function(option){
			this.createEChartHelper(option).init();
		},
				
		// 获取一个助手对象
		createEChartHelper : function(option){
			var defaultSetting = {
				'theme'			:'',				// 主题，需要事先引入主题配置文件，方可生效
				'canvasBox'		:'.echart-canvas',	// 需要初始化的canvas盒子
				'chartOption'	:{},				// 默认图表 Option 配置
			};
         	var setting = $.extend(defaultSetting,option);
         	var topBox 	= this;
			
			// 各类型图表的 Option 默认配置模版，可使用 chartOption 进行覆盖，配置完全同 echarts
			var testOption = {
					// 饼状图
					'pie':{
						title : {
							text: '',
							subtext: '',
							x:'center'
						},
						tooltip : {
							trigger: 'item',
							formatter: "{a} <br/>{b} : {c} ({d}%)"
						},
						legend: {
							type: 'scroll',
							orient: 'vertical',
							left: 'left',
							data: []		// '直接访问','邮件营销',
						},
						series : [
							{
								name: '',	// 访问来源
								type: 'pie',
								radius : '55%',
								center: ['50%', '60%'],
								data:[],	// {value:335, name:'直接访问'},
								itemStyle: {
									emphasis: {
										shadowBlur: 10,
										shadowOffsetX: 0,
										shadowColor: 'rgba(0, 0, 0, 0.5)'
									}
								}
							}
						]
					},
					
					// 基础雷达图
					'radar': {
					    title: {
					        text: ''
					    },
					    tooltip: {},
					    legend: {
					    	left: 'left',
					        data: []		// '预算分配（Allocated Budget）', '实际开销（Actual Spending）'
					    },
					    radar: {
					        // shape: 'circle',
					        name: {
					            textStyle: {
					                color: '#fff',
					                backgroundColor: '#999',
					                borderRadius: 3,
					                padding: [3, 5]
					           }
					        },
					        indicator: []	// { name: '销售（sales）', max: 6500},
					    },
					    series: [{
					        name: '',		// 预算 vs 开销（Budget vs spending）
					        type: 'radar',
					        // areaStyle: {normal: {}},
					        data : []		// {value : [4300, 10000, 28000, 35000, 50000, 19000],name : '预算分配（Allocated Budget）'},
					    }]
					},
					
					// 柱状图
					'bar':{
					    tooltip : {
					        trigger: 'axis',
					        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
					            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
					        }
					    },
					    // toolbox: {
					    //     feature: {
					    //         magicType: {
					    //             type: ['stack', 'tiled']
					    //         },
					    //         dataView: {}
					    //     }
					    // },
					    legend: {
					        data:[]					// '直接访问','邮件营销'
					    },
					    grid: {
					        left: '3%',
					        right: '4%',
					        bottom: '3%',
					        containLabel: true
					    },
					    xAxis : [
					        {
					            type : 'category',
					            data : []			// '周一','周二','周三','周四','周五','周六','周日'
					        }
					    ],
					    yAxis : [
					        {
					            type : 'value'
					        }
					    ],
					    series : [
					        // {
					        //     name:'直接访问',
					        //     type:'bar',
					        //     data:[320, 332, 301, 334, 390, 330, 320]
					        // },
					        // {
					        //     name:'搜索引擎',
					        //     type:'bar',
					        //     data:[862, 1018, 964, 1026, 1679, 1600, 1570],
					        //     markLine : {
					        //         lineStyle: {
					        //             normal: {
					        //                 type: 'dashed'
					        //             }
					        //         },
					        //         data : [
					        //             [{type : 'min'}, {type : 'max'}]
					        //         ]
					        //     }
					        // },
					    ]
					},
					// 饼状堆叠图
					'bar-stack':{
                        angleAxis: {
                            type: 'category',
                            data: [],	// '周一', '周二', '周三', '周四', '周五', '周六', '周日'
                            z: 10
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        radiusAxis: {
                        },
                        polar: {
                        },
                        series: [{
                            type: 'bar',
                            data: [1, 2, 3, 4, 3, 5, 1],
                            coordinateSystem: 'polar',
                            name: 'A',
                            stack: 'a'
                        }, {
                            type: 'bar',
                            data: [2, 4, 6, 1, 3, 2, 1],
                            coordinateSystem: 'polar',
                            name: 'B',
                            stack: 'a'
                        }],
                        legend: {
                            show: true,
                            data: ['A', 'B']
                        }
                    },
					
					// 折线图
					'line':{
					    title: {
					        text: '',
					        //subtext: '纯属虚构'
					    },
					    tooltip: {
					        trigger: 'axis'
					    },
					    legend: {
					        data:[]		// '最高气温','最低气温'
					    },
					    toolbox: {
					        show: true,
					        feature: {
					            dataZoom: {
					                yAxisIndex: 'none'
					            },
					            dataView: {readOnly: false},
					            magicType: {type: ['line', 'bar']},
					            restore: {},
					            saveAsImage: {}
					        }
					    },
					    xAxis:  [{
					        type: 'category',
					        boundaryGap: false,
					        data: []	// '周一','周二','周三','周四','周五','周六','周日'
					    }],
					    yAxis: {
					        type: 'value',
					        axisLabel: {
					            //formatter: '{value} °C'
					        }
					    },
					    series: [
					        {
					            name:'',
					            type:'line',
					            data:[],		// 11, 11, 15, 13, 12, 13, 10
					            markPoint: {
					                data: []	// {type: 'max', name: '最大值'},{type: 'min', name: '最小值'}
					            },
					            markLine: {
					                data: []	// {type: 'average', name: '平均值'}
					            }
					        },
					        /*
					        {
					            name:'最低气温',
					            type:'line',
					            data:[1, -2, 2, 5, 3, 2, 0],
					            markPoint: {
					                data: [
					                    {name: '周最低', value: -2, xAxis: 1, yAxis: -1.5}
					                ]
					            },
					            markLine: {
					                data: [
					                    {type: 'average', name: '平均值'},
					                    [{
					                        symbol: 'none',
					                        x: '90%',
					                        yAxis: 'max'
					                    }, {
					                        symbol: 'circle',
					                        label: {
					                            normal: {
					                                position: 'start',
					                                formatter: '最大值'
					                            }
					                        },
					                        type: 'max',
					                        name: '最高点'
					                    }]
					                ]
					            }
					        }
					        */
					    ]
					},



					// 漏斗图
					'funnel':{
					    title: {
					        text: '',
					        //subtext: '纯属虚构'
					    },
					    tooltip: {
					        trigger: 'item',
					        formatter: "{a} <br/>{b} : {c}%"
					    },
					    toolbox: {
					        feature: {
					            dataView: {readOnly: false},
					            restore: {},
					            saveAsImage: {}
					        }
					    },
					    legend: {
					        data: []		// '展现','访问'
					    },
					    calculable: true,
					    series: [
					        {
					            name:'漏斗图',
					            type:'funnel',
					            left: '10%',
					            top: 60,
					            //x2: 80,
					            bottom: 60,
					            width: '80%',
					            // height: {totalHeight} - y - y2,
					            min: 0,
					            max: 100,
					            minSize: '0%',
					            maxSize: '100%',
					            sort: 'descending',
					            gap: 2,
					            label: {
					                normal: {
					                    show: true,
					                    position: 'inside'
					                },
					                emphasis: {
					                    textStyle: {
					                        fontSize: 20
					                    }
					                }
					            },
					            labelLine: {
					                normal: {
					                    length: 10,
					                    lineStyle: {
					                        width: 1,
					                        type: 'solid'
					                    }
					                }
					            },
					            itemStyle: {
					                normal: {
					                    borderColor: '#fff',
					                    borderWidth: 1
					                }
					            },
					            data: []	// {value: 60, name: '访问'},{value: 100, name: '展现'}
					        }
					    ]
					},
					// 仪表盘
					'gauge':{
					    tooltip : {
					        formatter: "{a} <br/>{b} : {c}%"
					    },
					    /*
					    toolbox: {
					        feature: {
					            restore: {},
					            saveAsImage: {}
					        }
					    },
					    */
					    series: [
					        {
					            name: '业务指标',
					            type: 'gauge',
					            detail: {formatter:'{value}%'},
					            data: [{value: 80, name: '完成率'}]
					        }
					    ]
					}
			}
			var testOption = $.extend(true, testOption, setting.chartOption);
			var chartWidget = {
					title : {
				        text: '',				// 某站点用户访问来源
				        subtext: '',			// 纯属虚构
				        x:'center'
				    },
				    tooltip : {
				        trigger: 'item',
				        formatter: "{a} <br/>{b} : {c} ({d}%)"
				    },
				    legend: {
				        orient: 'vertical',
				        left: 'left',
				        data: []				// '直接访问','邮件营销','联盟广告','视频广告','搜索引擎'
				    },
			}
			
			// 各类型图表公共基础数据
			var chartSeriesLayout = {
					'pie':{		// 饼状图
			            name: '',
			            type: 'pie',
			            radius : '55%',
			            center: ['50%', '60%'],
			            data:[],				// {value:335, name:'直接访问'},{value:1548, name:'搜索引擎'}
			            itemStyle: {
			                emphasis: {
			                    shadowBlur: 10,
			                    shadowOffsetX: 0,
			                    shadowColor: 'rgba(0, 0, 0, 0.5)'
			                }
			            }
			        },
                	'bar-stack':{		// 饼状堆叠图
                        type: 'bar',
                        data: [],
                        coordinateSystem: 'polar',
                        name: 'A',
                        stack: 'a'
                    },
			        'radar':{	// 雷达图
				        name: '',				// 预算 vs 开销（Budget vs spending）
				        type: 'radar',
				        // areaStyle: {normal: {}},
				        data : []				// {value : [4300, 10000, 28000, 35000, 50000, 19000],name : '预算分配（Allocated Budget）'},{value : [5000, 14000, 28000, 31000, 42000, 21000],name : '实际开销（Actual Spending）'}
				    },
				    'funnel':{	// 漏斗图
			            name:'',
			            type:'funnel',
			            left: '10%',
			            top: 60,
			            //x2: 80,
			            bottom: 60,
			            width: '80%',
			            // height: {totalHeight} - y - y2,
			            min: 0,
			            max: 100,
			            minSize: '0%',
			            maxSize: '100%',
			            sort: 'descending',
			            gap: 2,
			            label: {
			                normal: {
			                    show: true,
			                    position: 'inside'
			                },
			                emphasis: {
			                    textStyle: {
			                        fontSize: 20
			                    }
			                }
			            },
			            labelLine: {
			                normal: {
			                    length: 10,
			                    lineStyle: {
			                        width: 1,
			                        type: 'solid'
			                    }
			                }
			            },
			            itemStyle: {
			                normal: {
			                    borderColor: '#fff',
			                    borderWidth: 1
			                }
			            },
			            data: []				// {value: 60, name: '访问'},{value: 100, name: '展现'}
			        },
			        // 仪表盘
					'gauge':{	
						name: '',
			            type: 'gauge',
			            detail: {formatter:'{value}%'},
			            data: [{value: 80, name: '比率'}]
			        },
			        // 柱状图
			        'bar':{
			            name:'',
			            type:'bar',
			            data:[]
			        },
			        // 
			        'line':{
			            name:'',
			            type:'line',
			            data:[],
			            /*
			            markPoint: {
			                data: [
			                    {type: 'max', name: '最大值'},
			                    {type: 'min', name: '最小值'}
			                ]
			            },
			            markLine: {
			                data: [
			                    {type: 'average', name: '平均值'}
			                ]
			            }
			            */
			        }
			}
			
			
			
			
			var getTestOption = function(key){
				return jQuery.extend(true, {}, testOption[key]);
			}
			
			var getChartSeriesLayout = function(key){
				return jQuery.extend(true, {}, chartSeriesLayout[key]);
			}
			
			var getFormatOption = function(echartData,echartConfig,echartOption){
				var defaultEchartConfig = {
						type:'bar',
						x_name_key:'name',
						is_stack:0,
						name_key:'name',
						value_key:'value',
						name_value:'',
						data_key:'',
						data_name:'',
						max_key:'',
						data_type:0,	// 数据形式：0单组，1多组
						empty_val:0,	// 空数据的值：0或者-
						set_min:false,	// 是否依据数据设置最小值
				};
				echartConfig = $.extend({}, defaultEchartConfig, echartConfig);
								
				var data_type		= echartConfig.data_type;
				var max_key 		= echartConfig.max_key;
				var data_name 		= echartConfig.data_name;//'分值';
				var x_name_key  	= echartConfig.x_name_key;
				var is_stack  		= echartConfig.is_stack
				var name_key  		= echartConfig.name_key;	
				var value_key 		= echartConfig.value_key;
				var data_key		= echartConfig.data_key;
				var name_value		= echartConfig.name_value;
				var empty_val		= echartConfig.empty_val;
				var min_val			= 0;
				var max_val			= 0;
				
				
				
				// 常用配置词处理
				//-------------------------------------------------------
				var legendData 		= [];
				var seriesData 		= [];
				
				// 各类型图表单独处理
				var seriesLayout 	= [];
				if( typeof echartConfig.type != 'string' ){
					var first_type = echartConfig.type[0];
				}else{
					var first_type = echartConfig.type;
				}
				
				var option		= $.extend({}, getTestOption(first_type), echartOption);	// 整组配置替换
				seriesLayout 	= getChartSeriesLayout(first_type);//chartSeriesLayout[first_type];
				
				if( typeof echartConfig.title != 'undefined' ){
					if( typeof option.title == 'undefined' ){
						option.title = {};
					}
					option.title.text = echartConfig.title;
				}
				//-------------------------------------------------------
				switch( first_type ){
					case 'pie':		//饼状图
					case 'radar':
					case 'line':
					case 'bar':
					case 'gauge':
						option.series 		= [];
						break;
				}
				switch( first_type ){
					case 'pie':		//饼状图
						for(var i in echartData){
							var one = echartData[i];
							legendData.push( one[name_key] );
							seriesData.push( {value:one[value_key], name:one[name_key]} );
						}
						seriesLayout.name 	 = data_name;
						seriesLayout['data'] = seriesData;
						break;
					case 'radar':	//雷达图
						var indicatorData 	= [];
						
						seriesLayout.name 	= data_name;
						seriesLayout.data 	= [];
						
						legendData.push( data_name );
						var data_one 	= {name:data_name,value:[]}
						for(var i in echartData){
							var one = echartData[i];
							indicatorData.push( {max:one[max_key], name:one[name_key]} );
							data_one.value.push( one[value_key] );
						}
						seriesLayout.data.push(data_one);
						option.radar.indicator = indicatorData;

						break;
					case 'line':		// 折线
					case 'bar':			// 柱状图
					case 'bar-stack':	// 饼状堆叠图
						var xAxis_data 		= [];
						
						if( data_type==1 ){		//数据形式:1多组
							
							for(var k in echartData){
								var echartDataOne 	= echartData[k];
								xAxis_data.push( k );
								for(var i in echartDataOne){
									
									var one 		= echartDataOne[i];
									var one_name 	= one[name_key];
									var one_value	= one[value_key];
									
									if( typeof seriesData[one_name]=='undefined' ){
										seriesData[one_name] 		= jQuery.extend(true, {}, seriesLayout);
										seriesData[one_name].data 	= [];
										seriesData[one_name].name 	= one_name;
										legendData.push( one_name );
										if( is_stack==1 ){
											seriesData[one_name]['stack'] = k;
										}
									}
									
									if( echartConfig.set_min ){
										if( min_val==0 )min_val = one_value;
										if( min_val>one_value ){
											min_val=one_value;
										}
										if( max_val<one_value ){
											max_val=one_value;
										}
									}

									seriesData[one_name].data.push( one_value );
								}
								console.log(seriesData);
								option.series = [];
								for(var i in seriesData){
									option.series.push( seriesData[i] );
								}
							}
							// option.xAxis[0].data 	= xAxis_data;

		//					console.log('E----------------------------------');
		//					console.log(echartData);
		//					console.log(data_name+'--'+name_key+'--'+value_key);
		//					console.log(legendData);
		//					console.log(seriesLayout);
		//					console.log(xAxis_data);
		//					console.log(echartOption);
		//					console.log(option);
		//					console.log('F----------------------------------');

						}else{						//数据形式：0单组
							if( typeof value_key == 'string' ){
								if( data_key=='' ){		// 单统计元素
									legendData.push( data_name );
									seriesLayout.name 	= data_name;
									
									seriesLayout.data 	= [];
									for(var i in echartData){
										var one = echartData[i];
										var one_value = one[value_key];
										xAxis_data.push( one[name_key] );

										if( echartConfig.set_min ){
											if( min_val==0 )min_val = one_value;
											if( min_val>one_value ){
												min_val=one_value;
											}
											if( max_val<one_value ){
												max_val=one_value;
											}
										}

										seriesLayout.data.push( one[value_key] );
									}
									option.series.push( seriesLayout );
								}else{					// 多统计元素
									var seriesArr = [];

									// 对x轴无数据的品类增加空数据
									//-------------------------------------
									var legendData 		= [];
									var xAxis_data	  	= [];
									var format_data_arr = {};
									
									// 一、首先，获取所有品类及所有日期（x轴字段）
									for(var i in echartData){
										var one 			= echartData[i];
										var data_key_value 	= one[data_key];
										var value_key_value = one[value_key];
										var name_key_value	= one[name_key];


										if( echartConfig.set_min ){
											if( min_val==0 )min_val = value_key_value;
											if( min_val>value_key_value ){
												min_val=value_key_value;
											}
											if( max_val<value_key_value ){
												max_val=value_key_value;
											}
										}
										
										if( $.inArray(name_key_value, xAxis_data)==-1 ){				// x轴字段，例：日期
											xAxis_data.push( name_key_value );
										}
										if( $.inArray(data_key_value, legendData)==-1 ){				// x轴字段，例：日期
											legendData.push( data_key_value );
											
											if( typeof seriesArr[data_key_value]=='undefined' ){		// 品类
												seriesArr[data_key_value] 			= jQuery.extend({}, seriesLayout);
												seriesArr[data_key_value].data		= [];
												seriesArr[data_key_value]['name'] 	= data_key_value;
												//legendData.push( data_key_value );
											}
										}

										if( typeof format_data_arr[data_key_value]=='undefined' ){		// 品类
											format_data_arr[data_key_value] = {};
										}
										if( typeof format_data_arr[data_key_value][name_key_value]=='undefined' ){
											format_data_arr[data_key_value][name_key_value] = value_key_value;
										}

									}
		//
		//							console.log('C----------------------------------');
		//							console.log( xAxis_data );
		//							console.log( legendData );
		//							console.log( format_data_arr );

									// 二、其次，循环所有，按天载入数据
									for(var i in xAxis_data){
										var name_key_value = xAxis_data[i]
										for(var j in legendData){
											var data_key_value = legendData[j]
											var data_val = empty_val;
											if(typeof format_data_arr[data_key_value][name_key_value]!='undefined'){
												data_val = format_data_arr[data_key_value][name_key_value];
											}
											seriesArr[data_key_value].data.push( data_val );
										}
									}
									option.series = getIndexArr(seriesArr);
								}
								// option.xAxis[0].data 	= xAxis_data;

		//						console.log('E----------------------------------');
		//						console.log(option);
		//						console.log('F----------------------------------');

							}else{
								legendData = data_name;
								for(var k in value_key){
									var type_val 		= echartConfig.type[k];
									var data_name_val 	= data_name[k];
									var value_key_val 	= value_key[k];
									
									//--------------------------
									if( typeof seriesData[value_key_val]=='undefined' ){
										
										console.log('type_val::'+type_val);
										
										seriesData[value_key_val]				= getChartSeriesLayout(type_val);//jQuery.extend(true, {}, chartSeriesLayout[type_val]);
		//								seriesData[value_key_val] 				= jQuery.extend(true, {}, seriesLayout);
										seriesData[value_key_val].data 			= [];
										seriesData[value_key_val].name 			= data_name_val;
										seriesData[value_key_val].yAxisIndex 	= k;
									}
									
									for(var i in echartData){
										var one = echartData[i];
										if( k==0 ){
											xAxis_data.push( one[name_key] );
										}
										
										if( echartConfig.set_min ){
											if( min_val==0 )min_val = one[value_key_val];
											if( min_val>one[value_key_val] ){
												min_val=one[value_key_val];
											}
											if( max_val<one[value_key_val] ){
												max_val=one[value_key_val];
											}
										}
										
										//seriesLayout.data.push( one[value_key] );
										seriesData[value_key_val].data.push( one[value_key_val] );
									}

									//--------------------------
								}

								//seriesData = getIndexArr(seriesData);

								//option.xAxis[0].data 	= xAxis_data;
		//						console.log('E----------------------------------');
		//						console.log(xAxis_data);
		//						console.log(seriesData);
		//						console.log('F----------------------------------');
		//						option.series = [];
		//						for(var i in seriesData){
		//							option.series.push( seriesData[i] );
		//						}
		// 						option.xAxis[0].data 	= xAxis_data;
								option.series = getIndexArr(seriesData);
							}
						}
						if(typeof option.xAxis!='undefined'){
                            option.xAxis[0].data 	= xAxis_data;
						}else if(typeof option.angleAxis!='undefined'){
							option.angleAxis.data 	= xAxis_data;
						}
						break;
					case 'gauge':
						seriesLayout.name 	= data_name;
						seriesLayout.data	= [];
						seriesLayout.data.push({value: echartData[value_key], name: name_value});
						break;
				}
				switch( first_type ){
					case 'pie':		//饼状图
					case 'radar':
						option.legend.data = legendData;
						option.series.push( seriesLayout );
						break;
					case 'line':
					case 'bar':
						option.legend.data = legendData;
						if (typeof option.yAxis === "undefined")option.yAxis = {};
						option.yAxis.min = getProcessedMinValue(max_val,min_val);
						break;
                    case 'bar-stack':
                        option.legend.data = legendData;
                        break;
					case 'gauge':
						option.series.push( seriesLayout );
						break;
				}
				return option;
			}
			
			var getProcessedMinValue = function(max_val,min_val){
				var tenth_val = Math.floor((max_val-min_val) / 4);
				return min_val*1 - tenth_val*1;
			}
			
			// 取出对象中的某一个健组装成一个数组
			var getIndexArr = function(obj){
				var arr = [];
				for(var k in obj){
					arr.push( obj[k] );
				}
				return arr;
			}
			
			// 渲染页面上的所有图表
			var drawAllPageCharts = function(){
				topBox.find(setting.canvasBox).each(function(){
					var that = $(this);
					// 判断当前节点是否处于显示状态，是则加载，否则等待其他事件调用后加载
					if( that.is(':visible') ){
						drawAllOneCharts(that);
					}
				})
			}
			
			var drawAllOneCharts = function(that){					
				// 判断当前节点是否处于显示状态，是则加载，否则等待其他事件调用后加载
				if( that.is(':visible') ){
					var chart = echarts.init(that[0], setting.theme);	//'infographic'
					chart.showLoading();
					
					var echartData 		= that.attr('echart-data');
					var echartUrl 		= that.attr('echart-url');
					var echartAjax 		= that.attr('echart-ajax');
					var echartConfig 	= that.attr('echart-config');
					var echartOption	= that.attr('echart-option');
					
					echartData 		= eval('(' + echartData + ')');
					echartConfig 	= eval('(' + echartConfig + ')');
					echartOption 	= eval('(' + echartOption + ')');
					echartAjax 		= eval('(' + echartAjax + ')');

					console.log('echartConfig::::');console.log(echartData);console.log(echartConfig);console.log(echartUrl);

					if(typeof echartUrl!='undefined' || typeof echartAjax!='undefined'){
						// 数据需要异步请求
						var drow_data 	= {
							echart_data     : echartData,
		        			echart_config   : echartConfig,
		        			echart_option   : echartOption
						}
						var optionAjax 	= $.extend({}, {url:echartUrl,drow_data:drow_data}, echartAjax);
						that.getDrawEChart(optionAjax);
						return;
					}else if(typeof echartData=='undefined'){
						return;
					}
					var option = getFormatOption(echartData,echartConfig,echartOption);
					drawOneChart(chart,option);
				}
			}
			
			// 渲染一个图表
			var drawOneChart = function(chart,option){
				chart.setOption(option);
				chart.hideLoading();
				window.onresize = chart.resize;
			}
			
			// 绑定事件
			var BindingEvent = function(){
				
				// 延迟加载图表
				$("[echart-for]").each(function(){
					var that = $(this);
					var echartFor = that.attr('echart-for');
					
					that.click(function(){
						setTimeout(function(){
							drawAllOneCharts( $(echartFor).find(setting.canvasBox) );
						},50)
					})
				})
			}
			
			//+----------------------------------------------------------
			//+	开放方法区
			//+----------------------------------------------------------
			// 渲染绑定数据标签上的图表
			this.init = function(opt_para){
				// 渲染页面上的所有图表
				drawAllPageCharts();
				
				// 绑定事件
				BindingEvent();
			}
			
			// 设置option属性
			this.setChartOption = function(myChart,option,echart_config){
				if( echart_config && echart_config.set_min ){
					var min_val = 0;
					var max_val = 0;
					
					var data0 = option.series[0].data;
					for( var i in data0 ){
						var val = data0[i];
						if(min_val==0)min_val=val;
						if(max_val==0)max_val=val;
						
						if(min_val>val)min_val=val;
						if(max_val<val)max_val=val;
					}
					
					if (typeof option.yAxis === "undefined")option.yAxis = {};
					option.yAxis.min = getProcessedMinValue(max_val,min_val);
				}
				
				myChart.setOption(option);
			}
			
			// 绘制一张图表
			this.formatDrawOneChart = function( echartData,chart ){
				if( typeof chart == 'undefined' ){
					var chart = echarts.init( $(this)[0],setting.theme );
				}
				chart.showLoading();
				
				var defaultOption = {
						echart_data		: {},
						echart_config	: {},
						echart_option	: {}
				};
				var echartData = $.extend({}, defaultOption, echartData);
				
				var option = getFormatOption(echartData.echart_data,echartData.echart_config,echartData.echart_option);
				drawOneChart(chart,option);
				
				return option;
			}

			return this;
		},
	});
})(jQuery);