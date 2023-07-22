# 大作业

***总体的思路就是： 通过html标签得到绘制的参数，包括数据、柱状图参数、折线图参数、文字参数、显示参数、数据筛选参数等等； 然后根据参数，在后端用javascript和canvasAPIs进行绘制；***

## 输入-这些是需要用到的参数输入 
- 二元数组数据
[{a1, p1}, {a2, p2}, ...] 
- 柱状图
    - 填充颜色、填充样式、渐变控制
渐变控制应该可以参考那个蜡笔那个，用java script来实现，或者是参考一下canvas的技术方案 
fill-color fill-form “渐变控制” 
- 折线图
    - 线的颜色、线性、粗细
line-color, line-type, line-thickness 
    - 点的形状、颜色、大小
point-shape, point-color, point-size 
- 文字
    - 字体、字号、颜色
font-family, font-size, font-color 
- 隐藏/透明标记
is-bar-hide, is-line-hide 
- 交互式缩放
？ 这个是主要的存在问题的内容，缩放是如何进行缩放呢？通过html收集一下鼠标滚轮的参数 
- 数据筛选
数据筛选是如何进行筛选呢？或许可以通过表格来进行展示嘛？ 

通过多种多样的输入标签进行收入输入信息，然后凭借输入信息利用canvas技术绘制到屏幕上。 

输入的形式可以是多样的，但是最终就是获得对应的值，然后用canvas画出来




## 绘制方案

- 坐标系可以是固定的
- 同时坐标系可以先画好，后面可以一直不变
- 标签自适应 原点自适应
- 缩放 



## 框架文件简介： 
### "./index.html" 
***TO DO: 主要是更好地展示数据、更好地获得参数供后端绘制***
- html
    - `<canvas>`画板
    - `<div>`配置板
        - `<div>`显示参数配置
            - 柱状图/折线图：隐藏/透明
        - `<div>`柱状图参数配置
            - 填充颜色，填充样式，渐变控制
            - 二元数组数据
        - `<div>`折线图参数配置
            - 线的颜色、线性、粗细
            - 点的颜色、形状、大小
        - `<div>`文字参数配置
            - 文字的字体、字号、颜色
### "./styles.css" 
***TO DO: 设置展示格式以获得更好的观感和体验***

### "./chart.js" 
***TO DO: 主要是获得各种参数，并进行绘制***
- 定义绘制函数
- 初始化和配置listener

- drawInteractiveChart() 绘制主函数
    - drawLineChartLineAndDataPoints() 绘制折线图的线和数据点
    - drawLineChartPercentageLabels() 绘制折线图的百分比标签
    - 

- drawInteractiveChart() 
    - drawBarChart() 
        - drawBar() 
        - drawBarData() 
    - drawLineChart() 
        - drawLinePoint() 
        - drawLine() 
        - drawLineData() 
    



## TO DO : 

需要的工作主要有： 
1. 完善前端的参数配置板块
    - 增加输入二元数组数据的板块； 
    - 增加设置柱状图填充颜色、填充样式、渐变控制参数的板块；
    - 完善参数的输入体验； 
    - 完善和优化前端展示的观感； 增加样式和其他配置等等；
2. 完善后端的绘制板块
    - 

