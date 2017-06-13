
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


# Part 2: 去除卡顿
## 完成标准

## 基本操作
## 优化内容

1. 打开游戏
	* 若是从文件夹中打开, 请找到 ArcadeGameClone_zh 中的 index.html 文件. 使用浏览器打开
	* 若是在线打开, 请[点击此处](https://quanquan2100.github.io/udacity-fe/ArcadeGameClone_zh/index.html)
1. 选择角色
	* 使用键盘左右方向键切换角色
	* 确定后点击回车键

