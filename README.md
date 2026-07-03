# 定时编辑器卡片 (Timer Editor Card)

一个仿照群里分享的卡片 UI 风格，为 Home Assistant 定制的定时自动化编辑器卡片。

## 效果预览

- 白色圆角弹窗，大圆角 (20px)
- 橙色渐变保存按钮
- 绿色同步状态标记
- 完整的表单：设备选择、动作、时间、周期
- 已创建的定时任务列表展示
- **倒计时模式**：设置延迟时间，保存后立即启动

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

或者手动在 `config/configuration.yaml` 中添加（**注意缩进！**）：

```yaml
lovelace:
  resources:
    - url: /local/timer-editor-card/timer-editor-card.js
      type: module
```

> **重要**：YAML 对缩进非常敏感。`resources:` 必须在 `lovelace:` 下面，`- url:` 必须在 `resources:` 下面，且前面要有两个空格。缩进错误会导致 HA 进入恢复模式！

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
2. 选择"定时"或"倒计时"模式
3. 使用 HA 原生实体选择器选择要控制的设备（支持 switch/light/fan/cover/script/scene 等）
4. 输入任务名称
5. 选择执行动作（关闭/开启/切换）
6. 选择执行条件（无条件/仅夜间/仅白天）
7. 设置重复周期、小时和分钟
8. 勾选"执行后自动停用"可实现真正的单次任务
9. 点击"保存"

### 创建倒计时任务

1. 点击卡片打开弹窗
2. 切换到"倒计时"模式
3. 选择设备和动作
4. 输入延迟时间（分钟）
5. 点击"启动倒计时"
6. 保存后自动触发，倒计时结束后执行动作

### 编辑/删除任务

- 点击列表中的任务卡片可编辑
- 编辑界面有红色删除按钮

### 查看任务列表

卡片下方会自动显示已创建的定时任务，状态颜色：

- 绿色 = 启用中
- 灰色 = 已停用

## 文件清单

| 文件 | 说明 |
|------|------|
| `timer-editor-card.js` | 主卡片文件（必需） |
| `timer-editor-theme.yaml` | 主题配置（可选） |
| `README.md` | 本文档 |

## 更新日志

### v1.4.0 (2026-07-03)

- **新增倒计时模式**：设置延迟分钟数，保存后立即启动倒计时
- **原生实体选择器**：使用 HA 内置 `<ha-entity-picker>`，支持搜索和过滤
- **执行条件**：支持无条件 / 仅夜间 / 仅白天
- **真正的单次任务**：勾选"执行后自动停用"，任务执行一次后自动关闭
- **支持切换动作**：新增"切换"选项
- **修复删除逻辑**：使用 REST API DELETE 正确删除自动化
- **修复 YAML 导出**：条件配置不再丢失
- **扩展设备支持**：增加 cover、script、scene、input_boolean
- **恢复模式检测**：YAML 弹窗增加恢复模式修复提示

### v1.3.1 (2026-07-02)

- 修复 HA 2024+ 兼容性（triggers/actions/conditions）
- 添加任务列表开关

### v1.0.0 (2026-07-02)

- 初始版本
- 支持创建/编辑/删除定时自动化
- 支持开关、灯光、风扇等设备
- 支持每天/工作日/周末重复
- 白底橙按钮的弹窗 UI

## 故障排查

### 恢复模式修复（最重要）

如果添加卡片后 HA 进入恢复模式，说明某个 YAML 文件有语法错误。请按以下步骤排查：

**第一步：查看错误日志**
在恢复模式页面点击"显示日志"或"加载日志"，查看具体的 YAML 错误信息。

**第二步：检查 configuration.yaml**
最常见的原因是 `lovelace:` 配置的缩进错误。请确认格式如下：

```yaml
lovelace:
  resources:
    - url: /local/timer-editor-card/timer-editor-card.js
      type: module
```

错误的例子（会导致恢复模式）：
```yaml
# 错误：resources 和 lovelace 同级
lovelace:
resources:
  - url: ...

# 错误：缩进使用了 Tab
lovelace:
	resources:
		- url: ...
```

**第三步：检查 automations.yaml**
如果之前手动粘贴过 YAML，检查是否有：
- 缩进不一致
- 特殊字符（如中文引号 `""` 而不是英文引号 `""`）
- 缺少冒号或连字符

**第四步：检查 themes 文件**
如果追加了 `timer-editor-theme.yaml` 内容到主题文件，检查：
- 是否重复定义了相同的主题名称
- 是否有乱码或特殊字符

**第五步：修复后重启**
修改完 YAML 后，保存文件，然后在恢复模式页面点击"重新启动 Home Assistant"。

### 卡片不显示

1. 确认 JS 文件路径正确：`/local/timer-editor-card/timer-editor-card.js`
2. 确认资源已注册（Dashboard → 管理资源）
3. 清除浏览器缓存，Ctrl+F5 刷新

### 保存失败

1. 确认选择了设备
2. 检查浏览器控制台是否有报错
3. 确认用户有创建自动化的权限

### 定时任务不执行

1. 确认自动化已启用（状态为 on）
2. 检查 HA 日志中是否有错误
3. 确认设备 entity_id 正确

### 倒计时任务不启动

1. 确认保存时没有报错
2. 倒计时自动化触发后需要保持 HA 运行，重启 HA 会中断倒计时
3. 检查自动化是否被禁用
