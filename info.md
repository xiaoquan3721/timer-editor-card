# Timer Editor Card

一个为 Home Assistant 定制的定时自动化编辑器卡片，支持创建、编辑和删除定时任务。

## 功能特点

- 白色/深色圆角弹窗，UI 精美
- 橙色渐变保存按钮
- 绿色同步状态标记
- 支持开关、灯光、风扇、窗帘、脚本、场景等设备
- 支持单次/每天/工作日/周末重复
- **倒计时模式**：设置延迟时间，保存后立即启动
- **执行条件**：无条件 / 仅夜间 / 仅白天
- **单次任务**：执行后自动停用，实现真正的单次定时
- **切换动作**：支持关闭/开启/切换三种动作
- 已创建任务列表展示
- 编辑和删除已有任务
- HA 原生实体选择器，支持搜索

## 安装

通过 HACS 添加此仓库为自定义前端仓库，搜索 "Timer Editor Card" 安装即可。

## 使用

```yaml
type: custom:timer-editor-card
title: 定时编辑
icon: mdi:clock-outline
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | required | `custom:timer-editor-card` |
| title | string | 定时编辑 | 卡片标题 |
| icon | string | mdi:clock-outline | 卡片图标 |
| default_entity | string | - | 默认选中的设备 entity_id |
