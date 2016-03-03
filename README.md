# airline3d

本项目只进行了最轻量级的框架化，用最简单的方式展示3d航线。对外部的包依赖为零。

##How to install

1) clone code

2) install node

3) node server.js (or click node.js/build.bat)

##包层次依赖关系

<!-- level 1：最基础的平台 -->
js/bootstrap.js

<!-- level 2 轻量级的webgl绘图引擎 —>
js/gl/vector.js
js/gl/matrix4x4.js
js/gl/mesh.js
js/gl/shader.js
js/gl/texture.js

<!-- level 3 framework相关的组件 —>
js/event/Dispatcher.js
js/event/Events.js
js/manager/dragMgr.js
js/manager/labelMgr.js
js/manager/behaviorMgr.js
js/util/bezier.js
js/util/Timer.js

<!-- level 4 建立在framework之上的组件 —>
js/component/ControlPanel.js
js/component/EarthCanvas.js

<!-- level 5 启动入口 —>
js/main.js