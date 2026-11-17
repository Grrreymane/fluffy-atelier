# 绒绒时装屋 · Fluffy Atelier

给动物人（furry）角色换装的单文件 HTML 小游戏。7 种动物、40 种毛色、148 件单品，男装偏美式复古工装、经典男装和 Ivy 风格，也有中式单品和可爱女装。另有前发 / 后发、3 种体型、5 个姿势、8 种表情、13 个场景、主题挑战（3 位动物评委打分）和拍照导出。

**在线试玩：** https://grrreymane.github.io/fluffy-atelier/

也可以下载 `dist/绒绒时装屋.html` 直接打开（不需要服务器，手机和电脑都能用）。

## 构建

```sh
node build.js        # src/ → dist/core.js 和 dist/game.html
cp dist/game.html dist/绒绒时装屋.html
cp dist/game.html index.html   # 在线试玩页（GitHub Pages）
```

角色全部由纯 JS 生成 SVG，没有图片素材。`src/` 里按部位分文件：身体和姿势（body.js）、各物种的头（toon.js、species.js）、五官（face.js）、头发（hair.js，描图数据在 hair_data.js）、衣服鞋帽（wear_*.js）、场景（scenes.js）、界面（ui.js、style.css、template.html）。

## 画法约定

- 线条统一深棕红色，平涂，硬边阴影；光源在左上方。
- 阴影用「正片叠底」叠浅紫色 `#D9C8E0`，深浅由 `SHADOW_GAIN` 控制。正片叠底的阴影必须和它下面的底色放在同一个组里，否则会露出一块浅紫。
- 衣服阴影分三种：贴着轮廓的侧影、压在别的部件上的投影、褶皱。

## 测试

需要 Node、Python 3、Playwright 和 Chrome。

| 命令 | 检查什么 |
| --- | --- |
| `node test/scan.js` | 每件单品 × 每个物种 / 体型 / 姿势全部渲染一遍，没有 NaN 或报错 |
| `python3 test/shadow_iso.py` | 正片叠底阴影没有和底色隔开 |
| `node test/front_arms.js` | 捧手 / 捧花时手肘离开身体、两只手碰到一起 |
| `node test/tongue.js` | 吐舌头不冒到嘴线上面 |
| `python3 test/stress.py` | 界面里连续点击 600 多次不报错 |
| `python3 test/migrate.py` | 旧存档能正确迁移 |
| `python3 test/score.py` | 主题挑战评分 |

`test/` 里其余脚本是出对照图用的。`tools/trace/` 是把参考发型图描成矢量的工具（工作目录用环境变量 `HAIRTRACE`、`HAIRREF` 指定），`ref/` 是画风参考图。
