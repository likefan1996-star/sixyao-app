# 六爻小程序 — 工程规范

## 目录结构

```
D:\sixyao\                    # 开发工作目录（Windows）
  ├── app.js                  # 全局配置
  ├── app.json                # 页面路由
  ├── app.wxss                # 全局样式
  ├── images/                 # 静态资源
  ├── data/                   # 数据层
  │   ├── constants.js        # 通用常量/映射
  │   ├── hexagrams.js        # 64 卦数据
  │   └── najia.js            # 纳甲表
  ├── pages/
  │   ├── index/              # 首页（摇卦）
  │   └── result/             # 结果页
  ├── utils/                  # 工具/引擎
  │   ├── paipan.js           # 排盘主引擎
  │   ├── fortune.js          # 结构评分
  │   ├── najia.js            # 纳甲子模块
  │   ├── shiying.js          # 世应定位
  │   ├── liuqin.js           # 六亲装配
  │   ├── liushen.js          # 六神装配
  │   └── dateutil.js         # 干支日期
  ├── scripts/
  │   └── save-version.sh     # 版本自动保存脚本
  ├── CONVENTIONS.md          # 本文件
  └── README.md

D:\sixyao-versions\           # 版本快照目录
  └── sixyao_v0.1_xxx/        # 每次迭代的完整快照
```

## 版本命名规范

```
格式: v<主版本>.<迭代序号>_<特性标签>

主版本:  0=开发期, 1=首次发布, 2+=重大更新
迭代序号: 从 1 开始递增
特性标签: 英文驼峰，描述核心变更

示例:
  v0.1_FrameworkInit     - 工程骨架搭建
  v0.2_PaipanOverhaul    - 排盘引擎重构
  v0.3_UIOverhaul        - 用户体验大改
  v0.4_LearningAssist    - 学习辅助集成
  v1.0_Launch            - 微信商店发布
```

## 版本保存流程

每次重大迭代结束时执行：

```bash
bash scripts/save-version.sh v0.2_PaipanOverhaul
```

该脚本自动：
1. 创建文件系统快照到 `D:\sixyao-versions\`
2. 提交 git 并打 tag
3. 推送到 GitHub

## Git 分支策略

采用简化版主干开发（适合单人/小团队）：

```
main         稳定版本，直接开发
  ├── 日常开发直接在 main 提交
  ├── 迭代完成时打 tag + push
  └── 重大实验性修改切 feat/* 分支
```

- `main` — 受保护，始终保持可发布状态
- `feat/*` — 实验性大改，合并后删除

## Commit Message 规范

```
<类型>: <简要描述>

<正文（可选）>
```

类型：
- `feat` — 新功能
- `fix` — 修 Bug
- `refactor` — 重构
- `style` — 样式/UI
- `docs` — 文档
- `chore` — 杂项/工具
- `release` — 版本发布

## 代码风格

- JavaScript: ES6，CommonJS 模块 (`require/module.exports`)
- 命名: camelCase（变量/函数），PascalCase（类/组件）
- 样式: CSS 自定义属性（var(--xxx)），rpx 单位
- 注释: JSDoc 风格（/** ... */）

## 关键配置

- 开发工具: 微信开发者工具
- 基础库: trial（开发期），发布前锁定稳定版
- AppID: 发布前需绑定
- 远程仓库: https://github.com/likefan1996-star/sixyao-app
