
前端纳米学 Website Optimization 项目
===============================

本项目使用关键渲染路径等知识, 完成对 `index.html` 的优化, 使 `index.html` 在移动设备和桌面上的 `PageSpeed` 分数达到90分以上。 使用页面渲染相关知识解决了 `pizza` 页面的卡顿问题.

# Part 1: PageSpeed 分数

## 完成标准
`index.html` 在移动设备和桌面上的 `PageSpeed` 分数至少为90分。

## 优化内容
* 减少关键渲染资源数量
	* 将 `style.css` 内容变为内联, 因为 `style.css` 不是很大.
	* `<link href="css/print.css" rel="stylesheet" media="print">` 是适用于打印情况 css, 因此不是关键渲染资源, 通过添加媒体查询将其从关键渲染资源中删除
* 关键路径长度
	* 内联脚本会导致 html 解析 block, 并强制等待关键渲染资源的 css (字体 css)下载解析完毕后执行, 导致关键渲染路径长度增加. 本页面的 `<script>` 内容与页面显示并无关系, 因此将其移动至页面最底端, 避免 html 文档解析中断.
* 关键字节数量
	* 通过 gulp 插件对 html 文档进行压缩, 减少关键字节数量.
* 其它
	* 根据 `Pagespeed Insights` 还有 `Network` 面板信息, 发现页面引用了一个巨大的图片. 使用 `Pagespeed Insights` 提供的优化后的图片替代这些图片
	* 页面中有三个图片资源引用的其它域名, 响应时间慢且不稳定. 将其下载后放入项目资源中, 更改链接变为引用项目图片. 同样这些图片也经过了 `Pagespeed Insights` 的处理.
	* `Pagespeed Insights` 中还提示了需要使用缓存和 gzip 压缩, 但这两项是服务器端配置, 因此未实现.

## 检测
* 打开 [Pagespeed Insights](https://developers.google.com/speed/pagespeed/insights/)
* 填入路径 `https://quanquan2100.github.io/udacity-fe/WebsiteOptimization_zh/dist/index.html`
* 点击 `分析` 等待并查看结果

### gulp 相关操作
若您将本项目下载至本地并对其修改. 由于使用 gulp 进行了部分优化, 您需要的操作是:
1. 确保您的电脑上安装了 npm
1. 打开终端(命令行窗口)并进入项目文件夹 `udacity-fe/WebsiteOptimization_zh/`
1. 执行 `npm install` 安装需要的插件
1. 执行 `gulp` 命令
1. 您修改的 src 目录中的文件, 该命令执行后对于文件会在 `dist` 文件夹中, 请访问 `dist` 文件夹的文件

# Part 2: 去除卡顿
## 完成标准
对 `views/js/main.js` 进行的优化可使 `views/pizza.html` 在滚动时保持 60fps 的帧速。
利用 `views/pizza.html` 页面上的 pizza 尺寸滑块调整 pizza 大小的时间小于5毫秒，大小的调整时间在浏览器开发工具中显示。
## 优化内容
* 明显的问题是由强制同步布局. 首先处理该问题
* 使用 `performance` 工具分析页面由于每个小 pizza 元素的移动, 导致了布局的工作量大. 尝试通过学到的分层的方式优化该问题, 发现由于层数过多, 分层之后合成的工作量很大, 导致性能反而更加降低.
* 考虑分的层数不应该多多, 说明我们的分层方式不合理. 通过查看代码, 发现所有小 pizza 每5个就是重复的位移 `(i%5)`. 一起运动的(无相对位移) pizza 们如果可以做为一个层, 不光可以降低循环的次数, 由原来的 200 降低到 5, 还可以使用分层来提高渲染效率. 使用该方法, 通过 `performance` 结果反馈, 成功解决了卡顿问题.

## 检测
1. 打开页面 (https://quanquan2100.github.io/udacity-fe/WebsiteOptimization_zh/src/views/pizza.html)
1. 打开调试窗口
1. 滚动页面和调整滑块, 查看数值
