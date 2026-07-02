# 定时编辑器卡片 (Timer Editor Card)

一个仿照群里分享的卡片 UI 风格，为 Home Assistant 定制的定时自动化编辑器卡片。

## 效果预览

- 白色圆角弹窗，大圆角 (20px)
- 橙色渐变保存按钮
- 绿色同步状态标记
- 完整的表单：设备选择、动作、时间、周期
- 已创建的定时任务列表展示

## 安装步骤

### 第一步：上传文件

将 `timer-editor-card.js` 上传到你的 HA 配置目录：

```
config/
└── www/
    └── timer-editor-card/
        └── timer-editor-card.js
```

上传方式（任选其一）：
- **File Editor 插件**：在 HA 中安装 File Editor，直接上传
- **Samba 共享**：通过文件共享直接复制
- **VSCode Server 插件**：通过 VSCode 上传

### 第二步：注册资源

打开你的 Dashboard → 右上角菜单 → **管理资源** → **添加资源**

```
URL: /local/timer-editor-card/timer-editor-card.js
资源类型: JavaScript Module
```

或者手动在 `config/configuration.yaml` 中添加：

```yaml
lovelace:
  resources:
    - url: /local/timer-editor-card/timer-editor-card.js
      type: module
```

然后 **Configuration → Server Controls → Reload UI**

### 第三步：添加卡片

编辑 Dashboard，添加卡片：

```yaml
type: custom:timer-editor-card
title: 定时编辑
icon: mdi:clock-outline
```

可选配置：

```yaml
type: custom:timer-editor-card
title: 定时编辑
icon: mdi:clock-outline
default_entity: switch.living_room_light  # 默认选中设备
```

### 第四步：应用主题（可选）

将 `timer-editor-theme.yaml` 中的内容追加到你的主题文件末尾：

```
config/
└── themes/
    └── 你的主题.yaml   ← 把 timer-editor-theme.yaml 中的内容追加到这里
```

然后在用户资料中切换主题为 `timer-editor-light` 或 `timer-editor-dark`。

> 注意：这个卡片是自包含样式的，不应用主题也能正常工作。主题只是让颜色变量更统一。

## 使用说明

### 创建定时任务

1. 点击卡片打开弹窗
2. 点击"选择设备"选择要控制的设备（switch/light/fan 等）
3. 输入任务名称
4. 选择执行动作（关闭/开启/切换）
5. 选择重复周期（单次/每天/工作日/周末）
6. 设置小时和分钟
7. 点击"保存"

### 编辑/删除任务

- 点击列表中的任务卡片可编辑
- 编辑界面有红色删除按钮

### 查看任务列表

卡片下方会自动显示已创建的定时任务，状态颜色：
- 绿色 = 启用中
- 灰色 = 已停用

## 已知限制

1. **实体选择器**：当前版本使用浏览器 prompt 选择设备，不够优雅。后续版本会升级为 HA 原生实体选择器。
2. **附加条件**：当前版本条件设置提示"暂不支持"，如需复杂条件请在 HA 自动化编辑器中编辑。
3. **重复周期**："单次"实际上和"每天"效果相同（HA time trigger 没有真正的单次概念），建议用完后手动删除或停用。

## 文件清单

| 文件 | 说明 |
|------|------|
| `timer-editor-card.js` | 主卡片文件（必需） |
| `timer-editor-theme.yaml` | 主题配置（可选） |
| `README.md` | 本文档 |

## 更新日志

### v1.0.0 (2026-07-02)
- 初始版本
- 支持创建/编辑/删除定时自动化
- 支持开关、灯光、风扇等设备
- 支持每天/工作日/周末重复
- 白底橙按钮的弹窗 UI

## 故障排查

**卡片不显示**
1. 确认 JS 文件路径正确：`/local/timer-editor-card/timer-editor-card.js`
2. 确认资源已注册（Dashboard → 管理资源）
3. 清除浏览器缓存，Ctrl+F5 刷新

**保存失败**
1. 确认选择了设备
2. 检查浏览器控制台是否有报错
3. 确认用户有创建自动化的权限

**定时任务不执行**
1. 确认自动化已启用（状态为 on）
2. 检查 HA 日志中是否有错误
3. 确认设备 entity_id 正确
