# airline3d

本项目意在用最轻量级的架构实现3d airline，除了使用node实现了测试服务器外，对第三方包的依赖为零。

##How to install

1) clone code

2) install node.js

3) npm start

4) open browser and input http://localhost:8080/airLine.html

##包层次依赖关系
```
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
```