# 项目三: 地图应用

# 查看方式
未提供在线查看的方法, 需要您下载本地后, 安装依赖的库并使用 webserver 查看. 需要操作如下:
1. 打开翻墙
1. 安装依赖库
   1. 如果未安装 npm, 需先安装 npm
   1. 执行指令安装 bower `npm install -g bower`
   1. 进入项目文件夹 `udacity-fe/NeighborhoodMap_zh`
   1. 执行命令 `bower install`
1. 安装 webserver
   1. 使用 chrome
   1. 安装 chrome 插件 [web server](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)
   1. 启动 webserver
   1. 设置 `CHOOSE FOLDER` 为文件夹 `NeighborhoodMap_zh`
   1. 设置 `Automatically show index.html` 勾选
1. 查看页面
   1. 点击 webserver 中的链接 (如http://127.0.1:8887) 即可浏览器中打开页面

# 应用描述
本应用提供用户搜索感兴趣的地点, 如访问地点, 可添加访问记录. 如果对地点感兴趣可以添加入心愿单.

提示: 本应用以手机为主要访问设备, 切换至手机模拟器, 可达到较好的 ui 效果. 另外, 本应用使用了 googlemap 和 Wikipedia, 需翻墙使用.

# 常用操作

* 由主界面点击地图图标进入地图界面, 自动定位当前位置并搜索附近相关地点并展示
* 由主界面点击进入列表界面, 查看地点列表(包括心愿列表和已访问列表)
* 由地图界面的搜索框, 可手动定位到指定地点. 如清空则回到当前位置
* 由地图界面点击搜索按钮, 可设置搜索地点类型, 关闭弹框自动进行搜索
* 在地图界面点击列表按钮, 显示当前搜索出的地点列表. 点击列表项定位地图对于地点, 并弹出地点信息框
* 地点信息框中可将该地点加入心愿单/添加访问记录/查看地点详情
* 由列表页可删除已记录的地点, 可以定位到地图中查看, 可以查看地点相关搜索详情

# 使用技术

* 使用 google map 展示地图; marker infoWindow 的基本使用; 地图搜索基本使用
* 使用第三方 api (wikipedia) 搜索地点相关内容
* 使用 knockoutjs 组织页面结构和数据
* 使用 promise 进行异步编程, 使用 localstorage 进行数据存储
* 使用 bootstrap4 构建页面
* 使用 requirejs 管理运行期加载资源
* 使用 bower 管理项目依赖
