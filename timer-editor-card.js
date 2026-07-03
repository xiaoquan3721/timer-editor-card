/**
 * Timer Editor Card for Home Assistant
 * Version: 2.0.0 - 内嵌表单UI
 * 
 * 功能：
 * - 创建/编辑/删除 Home Assistant 自动化定时任务
 * - 内嵌折叠面板式配置界面（非弹窗）
 * - 支持倒计时模式、条件模式（仅夜间/白天）、单次任务
 * - 场景选择器（预设场景列表）
 * - YAML 代码编辑器
 * - 兼容 HA 2024+
 */

// ========== CSS 样式注入 ==========
const TIMER_EDITOR_CARD_STYLE_ID = 'timer-editor-card-style-v2';

function injectCardStyles() {
  if (document.getElementById(TIMER_EDITOR_CARD_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = TIMER_EDITOR_CARD_STYLE_ID;
  style.textContent = `
    /* 卡片容器 */
    .timer-editor-card {
      --tec-orange: #FF9500;
      --tec-orange-light: #FFF3E0;
      --tec-orange-gradient: linear-gradient(135deg, #FF9500, #FF6B00);
      --tec-gray-border: #e0e0e0;
      --tec-gray-light: #f5f5f5;
      --tec-gray-text: #888;
      --tec-gray-dark: #333;
      --tec-white: #ffffff;
      --tec-red: #ef4444;
      --tec-green: #22c55e;
      --tec-radius-card: 16px;
      --tec-radius-input: 10px;
      --tec-radius-btn: 12px;
      --tec-radius-toggle: 13px;
      --tec-font-title: 16px;
      --tec-font-body: 14px;
      --tec-font-small: 12px;
      --tec-spacing: 12px;
      --tec-padding: 16px;

      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--tec-white);
      border-radius: var(--tec-radius-card);
      padding: var(--tec-padding);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      gap: var(--tec-spacing);
      position: relative;
      overflow: hidden;
    }

    /* 头部区域 */
    .tec-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: var(--tec-spacing);
      border-bottom: 1px solid var(--tec-gray-border);
    }

    .tec-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .tec-header-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--tec-orange-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
    }

    .tec-header-title {
      font-size: var(--tec-font-title);
      font-weight: 600;
      color: var(--tec-gray-dark);
    }

    .tec-header-subtitle {
      font-size: var(--tec-font-small);
      color: var(--tec-gray-text);
      margin-top: 2px;
    }

    .tec-card-config {
      font-size: var(--tec-font-small);
      color: var(--tec-gray-text);
      text-align: right;
    }

    /* 折叠面板 */
    .tec-section {
      border: 1px solid var(--tec-gray-border);
      border-radius: var(--tec-radius-input);
      overflow: hidden;
    }

    .tec-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: var(--tec-white);
      cursor: pointer;
      user-select: none;
      transition: background 0.2s;
    }

    .tec-section-header:hover {
      background: var(--tec-gray-light);
    }

    .tec-section-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tec-section-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: var(--tec-orange-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      flex-shrink: 0;
    }

    .tec-section-title {
      font-size: var(--tec-font-body);
      font-weight: 600;
      color: var(--tec-gray-dark);
    }

    .tec-section-badge {
      font-size: var(--tec-font-small);
      color: var(--tec-gray-text);
      background: var(--tec-gray-light);
      padding: 2px 8px;
      border-radius: 10px;
    }

    .tec-section-arrow {
      width: 20px;
      height: 20px;
      transition: transform 0.3s ease;
      color: var(--tec-gray-text);
      flex-shrink: 0;
    }

    .tec-section-arrow.open {
      transform: rotate(90deg);
    }

    .tec-section-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.35s ease, padding 0.35s ease;
      padding: 0 14px;
      background: var(--tec-gray-light);
    }

    .tec-section-body.open {
      max-height: 2000px;
      padding: 14px;
    }

    /* Toggle 开关 */
    .tec-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
    }

    .tec-toggle-label {
      font-size: var(--tec-font-body);
      color: var(--tec-gray-dark);
    }

    .tec-toggle {
      position: relative;
      width: 48px;
      height: 26px;
      background: #d1d5db;
      border-radius: var(--tec-radius-toggle);
      cursor: pointer;
      transition: background 0.3s;
      flex-shrink: 0;
    }

    .tec-toggle.active {
      background: #f59e0b;
    }

    .tec-toggle-knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    .tec-toggle.active .tec-toggle-knob {
      transform: translateX(22px);
    }

    /* 表单输入 */
    .tec-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--tec-spacing);
      margin-top: var(--tec-spacing);
    }

    .tec-form-grid .tec-form-group.full-width {
      grid-column: 1 / -1;
    }

    .tec-form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tec-form-label {
      font-size: var(--tec-font-small);
      font-weight: 600;
      color: var(--tec-gray-text);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tec-form-input,
    .tec-form-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--tec-gray-border);
      border-radius: var(--tec-radius-input);
      font-size: var(--tec-font-body);
      color: var(--tec-gray-dark);
      background: var(--tec-white);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
      -webkit-appearance: none;
    }

    .tec-form-input:focus,
    .tec-form-select:focus {
      border-color: var(--tec-orange);
      box-shadow: 0 0 0 3px rgba(255, 149, 0, 0.15);
    }

    .tec-form-input::placeholder {
      color: #bbb;
    }

    .tec-form-input.error {
      border-color: var(--tec-red);
    }

    .tec-form-error {
      font-size: var(--tec-font-small);
      color: var(--tec-red);
      display: none;
    }

    .tec-form-error.visible {
      display: block;
    }

    /* 场景选择器 */
    .tec-scene-picker {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tec-scene-picker select {
      flex: 1;
    }

    .tec-scene-clear {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--tec-gray-border);
      background: var(--tec-white);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--tec-gray-text);
      font-size: 16px;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    .tec-scene-clear:hover {
      border-color: var(--tec-red);
      color: var(--tec-red);
      background: #FEF2F2;
    }

    /* 自动化操作按钮行 */
    .tec-automation-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: var(--tec-spacing);
    }

    .tec-btn {
      padding: 10px 20px;
      border: none;
      border-radius: var(--tec-radius-btn);
      font-size: var(--tec-font-body);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tec-btn-primary {
      background: var(--tec-orange-gradient);
      color: white;
      flex: 1;
      justify-content: center;
    }

    .tec-btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);
    }

    .tec-btn-primary:active {
      transform: translateY(0);
    }

    .tec-btn-delete {
      width: 40px;
      height: 40px;
      border-radius: var(--tec-radius-btn);
      border: 1px solid var(--tec-gray-border);
      background: var(--tec-white);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--tec-gray-text);
      font-size: 18px;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    .tec-btn-delete:hover {
      border-color: var(--tec-red);
      color: var(--tec-red);
      background: #FEF2F2;
    }

    .tec-btn-update {
      background: var(--tec-orange-gradient);
      color: white;
    }

    /* 同步状态 */
    .tec-sync-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--tec-font-small);
      color: var(--tec-gray-text);
      margin-top: 8px;
    }

    .tec-sync-status.synced {
      color: var(--tec-green);
    }

    .tec-sync-status.pending {
      color: var(--tec-orange);
    }

    .tec-entity-id {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: var(--tec-gray-text);
      word-break: break-all;
      margin-top: 4px;
    }

    /* 自动化列表 */
    .tec-automation-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tec-automation-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--tec-white);
      border: 1px solid var(--tec-gray-border);
      border-radius: var(--tec-radius-input);
      transition: all 0.2s;
    }

    .tec-automation-item:hover {
      border-color: var(--tec-orange);
      box-shadow: 0 1px 4px rgba(255, 149, 0, 0.1);
    }

    .tec-automation-item-toggle {
      flex-shrink: 0;
    }

    .tec-automation-item-info {
      flex: 1;
      min-width: 0;
    }

    .tec-automation-item-name {
      font-size: var(--tec-font-body);
      font-weight: 600;
      color: var(--tec-gray-dark);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tec-automation-item-desc {
      font-size: var(--tec-font-small);
      color: var(--tec-gray-text);
      margin-top: 2px;
    }

    .tec-automation-item-time {
      font-size: var(--tec-font-small);
      color: var(--tec-orange);
      font-weight: 600;
      flex-shrink: 0;
    }

    .tec-automation-item-edit {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--tec-gray-border);
      background: var(--tec-white);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--tec-gray-text);
      font-size: 14px;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    .tec-automation-item-edit:hover {
      border-color: var(--tec-orange);
      color: var(--tec-orange);
    }

    .tec-automation-item-delete {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--tec-gray-border);
      background: var(--tec-white);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--tec-gray-text);
      font-size: 14px;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    .tec-automation-item-delete:hover {
      border-color: var(--tec-red);
      color: var(--tec-red);
    }

    /* 底部操作栏 */
    .tec-bottom-bar {
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--tec-white);
      border-top: 1px solid var(--tec-gray-border);
      padding: 12px 0 0;
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .tec-bottom-code {
      font-size: var(--tec-font-small);
      color: var(--tec-orange);
      cursor: pointer;
      padding: 8px 0;
      font-weight: 600;
      white-space: nowrap;
      transition: opacity 0.2s;
    }

    .tec-bottom-code:hover {
      opacity: 0.8;
    }

    .tec-bottom-spacer {
      flex: 1;
    }

    .tec-bottom-cancel {
      padding: 10px 20px;
      border: 1px solid var(--tec-gray-border);
      border-radius: var(--tec-radius-btn);
      font-size: var(--tec-font-body);
      color: var(--tec-gray-text);
      background: var(--tec-white);
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .tec-bottom-cancel:hover {
      border-color: #999;
      color: #666;
    }

    .tec-bottom-save {
      padding: 10px 24px;
      border: none;
      border-radius: var(--tec-radius-btn);
      font-size: var(--tec-font-body);
      font-weight: 600;
      background: var(--tec-orange-gradient);
      color: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tec-bottom-save:hover {
      opacity: 0.9;
      box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);
    }

    /* 代码编辑器区域 */
    .tec-code-editor {
      border: 1px solid var(--tec-gray-border);
      border-radius: var(--tec-radius-input);
      overflow: hidden;
      margin-top: var(--tec-spacing);
    }

    .tec-code-editor-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #1e1e1e;
      color: #d4d4d4;
      font-size: var(--tec-font-small);
    }

    .tec-code-editor-close {
      cursor: pointer;
      color: #888;
      font-size: 16px;
      transition: color 0.2s;
    }

    .tec-code-editor-close:hover {
      color: white;
    }

    .tec-code-editor textarea {
      width: 100%;
      min-height: 200px;
      padding: 12px;
      background: #1e1e1e;
      color: #d4d4d4;
      border: none;
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.5;
      resize: vertical;
      outline: none;
      box-sizing: border-box;
    }

    /* 空状态 */
    .tec-empty {
      text-align: center;
      padding: 24px;
      color: var(--tec-gray-text);
    }

    .tec-empty-icon {
      font-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .tec-empty-text {
      font-size: var(--tec-font-body);
    }

    .tec-empty-sub {
      font-size: var(--tec-font-small);
      margin-top: 4px;
    }

    /* 加载状态 */
    .tec-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: var(--tec-gray-text);
    }

    .tec-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--tec-gray-border);
      border-top-color: var(--tec-orange);
      border-radius: 50%;
      animation: tec-spin 0.8s linear infinite;
      margin-right: 10px;
    }

    @keyframes tec-spin {
      to { transform: rotate(360deg); }
    }

    /* Toast 提示 */
    .tec-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: var(--tec-radius-input);
      font-size: var(--tec-font-body);
      color: white;
      z-index: 10000;
      animation: tec-toast-in 0.3s ease, tec-toast-out 0.3s ease 2.7s;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .tec-toast.success {
      background: var(--tec-green);
    }

    .tec-toast.error {
      background: var(--tec-red);
    }

    .tec-toast.info {
      background: var(--tec-orange);
    }

    @keyframes tec-toast-in {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes tec-toast-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    /* 条件选项标签 */
    .tec-condition-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }

    .tec-condition-tag {
      padding: 4px 10px;
      border-radius: 14px;
      font-size: var(--tec-font-small);
      border: 1px solid var(--tec-gray-border);
      background: var(--tec-white);
      cursor: pointer;
      color: var(--tec-gray-text);
      transition: all 0.2s;
    }

    .tec-condition-tag.selected {
      border-color: var(--tec-orange);
      background: var(--tec-orange-light);
      color: var(--tec-orange);
    }

    /* 倒计时特殊样式 */
    .tec-countdown-fields {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .tec-countdown-fields .tec-form-input {
      width: 60px;
      text-align: center;
    }

    .tec-countdown-unit {
      font-size: var(--tec-font-small);
      color: var(--tec-gray-text);
    }

    /* ha-entity-picker 容器 */
    .tec-entity-picker-wrap {
      width: 100%;
    }

    .tec-entity-picker-wrap ha-entity-picker {
      width: 100%;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Timer Editor Card 类
 * Home Assistant 自定义 Lovelace 卡片
 */
class TimerEditorCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._automations = [];
    this._formData = this._getDefaultFormData();
    this._editingId = null;
    this._sectionsOpen = {
      subEntity: false,
      icon: false,
      features: false,
      timer: true  // 默认展开定时区域
    };
    this._codeEditorVisible = false;
    this._loading = false;
    this._subEntities = [];
    this._initialized = false;
  }

  /**
   * 获取配置元素（编辑器侧边栏配置）
   */
  static getConfigElement() {
    return document.createElement('timer-editor-card-editor');
  }

  /**
   * 获取默认配置
   */
  static getStubConfig() {
    return {
      title: '定时编辑器',
      card_id: 'timer_card_1'
    };
  }

  /**
   * 设置卡片配置
   */
  setConfig(config) {
    this._config = Object.assign({}, {
      title: '定时编辑器',
      card_id: 'timer_card_1',
      icon: 'mdi:timer-outline',
      show_empty: true
    }, config);
    if (!this._initialized) {
      injectCardStyles();
      this._initialized = true;
    }
    this._render();
  }

  /**
   * 获取/设置 hass 对象
   */
  get hass() { return this._hass; }

  set hass(hass) {
    this._hass = hass;
    if (this._initialized) {
      this._updateAutomationStates();
      this._render();
    }
  }

  /**
   * 获取默认表单数据
   */
  _getDefaultFormData() {
    return {
      enabled: true,
      name: '',
      entity_id: '',
      action: 'turn_on',
      repeat: 'daily',
      hour: '',
      minute: '',
      scene_id: '',
      auto_name: '',
      condition: 'none',     // none / night_only / day_only
      is_countdown: false,
      countdown_hours: 0,
      countdown_minutes: 0,
      countdown_seconds: 0,
      once: false
    };
  }

  /**
   * 主渲染方法
   */
  _render() {
    if (!this.shadowRoot) return;
    const container = document.createElement('div');
    container.className = 'timer-editor-card';

    // 渲染头部
    container.appendChild(this._renderHeader());
    // 渲染配置区段
    container.appendChild(this._renderConfigSections());
    // 渲染已创建的自动化列表
    container.appendChild(this._renderAutomationList());
    // 渲染底部操作栏
    container.appendChild(this._renderBottomBar());

    // 清空并插入
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(container);

    // 绑定表单事件
    requestAnimationFrame(() => this._bindFormEvents());
  }

  /**
   * 渲染头部
   */
  _renderHeader() {
    const frag = document.createDocumentFragment();
    const header = document.createElement('div');
    header.className = 'tec-header';

    // 左侧：图标和标题
    const left = document.createElement('div');
    left.className = 'tec-header-left';

    const icon = document.createElement('div');
    icon.className = 'tec-header-icon';
    icon.innerHTML = '&#9201;'; // ⏱

    const titleWrap = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'tec-header-title';
    title.textContent = this._config.title || '定时编辑器';
    const subtitle = document.createElement('div');
    subtitle.className = 'tec-header-subtitle';
    subtitle.textContent = 'DIY卡片-' + (this._config.card_id || '1');

    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);
    left.appendChild(icon);
    left.appendChild(titleWrap);

    // 右侧：配置信息
    const right = document.createElement('div');
    right.className = 'tec-card-config';
    right.textContent = '卡片配置';

    header.appendChild(left);
    header.appendChild(right);
    frag.appendChild(header);
    return frag;
  }

  /**
   * 渲染配置区段（折叠面板）
   */
  _renderConfigSections() {
    const wrap = document.createElement('div');

    // 1. 副实体区段
    wrap.appendChild(this._renderSection(
      'subEntity',
      'mdi:link-variant',
      '副实体',
      '可选',
      this._renderSubEntityContent()
    ));

    // 2. 图标区段
    wrap.appendChild(this._renderSection(
      'icon',
      'mdi:palette',
      '图标',
      '',
      this._renderIconContent()
    ));

    // 3. 功能区段
    wrap.appendChild(this._renderSection(
      'features',
      'mdi:cog',
      '功能',
      '',
      this._renderFeaturesContent()
    ));

    // 4. 自动化定时区段（核心）
    wrap.appendChild(this._renderSection(
      'timer',
      'mdi:timer',
      '自动化定时',
      this._editingId ? '编辑中' : '新建',
      this._renderAutomationTimerContent()
    ));

    return wrap;
  }

  /**
   * 渲染单个折叠面板区段
   */
  _renderSection(sectionId, icon, title, badge, contentEl) {
    const section = document.createElement('div');
    section.className = 'tec-section';

    const header = document.createElement('div');
    header.className = 'tec-section-header';
    header.dataset.section = sectionId;

    const left = document.createElement('div');
    left.className = 'tec-section-header-left';

    const iconEl = document.createElement('div');
    iconEl.className = 'tec-section-icon';
    iconEl.textContent = ''; // 图标通过CSS background实现

    const titleEl = document.createElement('span');
    titleEl.className = 'tec-section-title';
    titleEl.textContent = title;

    left.appendChild(iconEl);
    left.appendChild(titleEl);

    if (badge) {
      const badgeEl = document.createElement('span');
      badgeEl.className = 'tec-section-badge';
      badgeEl.textContent = badge;
      left.appendChild(badgeEl);
    }

    const arrow = document.createElement('span');
    arrow.className = 'tec-section-arrow' + (this._sectionsOpen[sectionId] ? ' open' : '');
    arrow.innerHTML = '&#9654;'; // ▶

    header.appendChild(left);
    header.appendChild(arrow);

    const body = document.createElement('div');
    body.className = 'tec-section-body' + (this._sectionsOpen[sectionId] ? ' open' : '');
    body.id = 'tec-section-' + sectionId;

    if (contentEl) {
      body.appendChild(contentEl);
    }

    section.appendChild(header);
    section.appendChild(body);

    // 点击折叠/展开
    header.addEventListener('click', () => {
      this._toggleSection(sectionId);
    });

    return section;
  }

  /**
   * 切换折叠面板
   */
  _toggleSection(sectionId) {
    this._sectionsOpen[sectionId] = !this._sectionsOpen[sectionId];
    const body = this.shadowRoot.getElementById('tec-section-' + sectionId);
    const header = body ? body.previousElementSibling : null;
    if (body) {
      body.classList.toggle('open', this._sectionsOpen[sectionId]);
    }
    if (header) {
      const arrow = header.querySelector('.tec-section-arrow');
      if (arrow) {
        arrow.classList.toggle('open', this._sectionsOpen[sectionId]);
      }
    }
  }

  /**
   * 渲染副实体内容
   */
  _renderSubEntityContent() {
    const wrap = document.createElement('div');

    const desc = document.createElement('div');
    desc.style.cssText = 'font-size:13px;color:#888;margin-bottom:10px;';
    desc.textContent = '选择关联的副实体（可选，用于联动控制）';

    const pickerWrap = document.createElement('div');
    pickerWrap.className = 'tec-entity-picker-wrap';
    pickerWrap.innerHTML = '';

    // 创建实体选择器
    const picker = document.createElement('input');
    picker.type = 'text';
    picker.className = 'tec-form-input';
    picker.placeholder = '例如: light.bedroom';
    picker.dataset.field = 'sub_entity';
    picker.value = this._config.sub_entity || '';

    pickerWrap.appendChild(picker);
    wrap.appendChild(desc);
    wrap.appendChild(pickerWrap);

    return wrap;
  }

  /**
   * 渲染图标内容
   */
  _renderIconContent() {
    const wrap = document.createElement('div');

    const desc = document.createElement('div');
    desc.style.cssText = 'font-size:13px;color:#888;margin-bottom:10px;';
    desc.textContent = '选择卡片显示的图标';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tec-form-input';
    input.placeholder = '例如: mdi:timer-outline';
    input.dataset.field = 'card_icon';
    input.value = this._config.icon || 'mdi:timer-outline';

    wrap.appendChild(desc);
    wrap.appendChild(input);

    return wrap;
  }

  /**
   * 渲染功能内容
   */
  _renderFeaturesContent() {
    const wrap = document.createElement('div');

    // 条件选项
    const condLabel = document.createElement('div');
    condLabel.style.cssText = 'font-size:13px;color:#888;margin-bottom:8px;';
    condLabel.textContent = '执行条件';

    const tags = document.createElement('div');
    tags.className = 'tec-condition-tags';

    const conditions = [
      { value: 'none', label: '无条件' },
      { value: 'night_only', label: '🌙 仅夜间' },
      { value: 'day_only', label: '☀️ 仅白天' }
    ];

    conditions.forEach(cond => {
      const tag = document.createElement('span');
      tag.className = 'tec-condition-tag' + (this._formData.condition === cond.value ? ' selected' : '');
      tag.textContent = cond.label;
      tag.dataset.value = cond.value;
      tag.addEventListener('click', () => {
        this._formData.condition = cond.value;
        tags.querySelectorAll('.tec-condition-tag').forEach(t => t.classList.remove('selected'));
        tag.classList.add('selected');
      });
      tags.appendChild(tag);
    });

    wrap.appendChild(condLabel);
    wrap.appendChild(tags);

    // 倒计时模式
    const countdownRow = document.createElement('div');
    countdownRow.className = 'tec-toggle-row';
    countdownRow.style.marginTop = '12px';

    const countdownLabel = document.createElement('span');
    countdownLabel.className = 'tec-toggle-label';
    countdownLabel.textContent = '倒计时模式';

    const countdownToggle = document.createElement('div');
    countdownToggle.className = 'tec-toggle' + (this._formData.is_countdown ? ' active' : '');
    countdownToggle.innerHTML = '<div class="tec-toggle-knob"></div>';
    countdownToggle.addEventListener('click', () => {
      this._formData.is_countdown = !this._formData.is_countdown;
      countdownToggle.classList.toggle('active', this._formData.is_countdown);
    });

    countdownRow.appendChild(countdownLabel);
    countdownRow.appendChild(countdownToggle);
    wrap.appendChild(countdownRow);

    // 单次任务
    const onceRow = document.createElement('div');
    onceRow.className = 'tec-toggle-row';

    const onceLabel = document.createElement('span');
    onceLabel.className = 'tec-toggle-label';
    onceLabel.textContent = '单次任务（执行后自动删除）';

    const onceToggle = document.createElement('div');
    onceToggle.className = 'tec-toggle' + (this._formData.once ? ' active' : '');
    onceToggle.innerHTML = '<div class="tec-toggle-knob"></div>';
    onceToggle.addEventListener('click', () => {
      this._formData.once = !this._formData.once;
      onceToggle.classList.toggle('active', this._formData.once);
    });

    onceRow.appendChild(onceLabel);
    onceRow.appendChild(onceToggle);
    wrap.appendChild(onceRow);

    return wrap;
  }

  /**
   * 渲染自动化定时内容（核心区域）
   */
  _renderAutomationTimerContent() {
    const wrap = document.createElement('div');

    // Toggle 开关
    const toggleRow = document.createElement('div');
    toggleRow.className = 'tec-toggle-row';

    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'tec-toggle-label';
    toggleLabel.textContent = '启用定时自动化';

    const toggle = document.createElement('div');
    toggle.className = 'tec-toggle' + (this._formData.enabled ? ' active' : '');
    toggle.innerHTML = '<div class="tec-toggle-knob"></div>';
    toggle.addEventListener('click', () => {
      this._formData.enabled = !this._formData.enabled;
      toggle.classList.toggle('active', this._formData.enabled);
    });

    toggleRow.appendChild(toggleLabel);
    toggleRow.appendChild(toggle);
    wrap.appendChild(toggleRow);

    // 场景选择器
    wrap.appendChild(this._renderScenePicker());

    // 表单字段
    if (!this._formData.is_countdown) {
      wrap.appendChild(this._renderFormFields());
    } else {
      wrap.appendChild(this._renderCountdownFields());
    }

    // 操作按钮行
    wrap.appendChild(this._renderFormActions());

    // 同步状态
    if (this._editingId) {
      wrap.appendChild(this._renderSyncStatus());
    }

    return wrap;
  }

  /**
   * 渲染场景选择器
   */
  _renderScenePicker() {
    const group = document.createElement('div');
    group.className = 'tec-form-group full-width';
    group.style.marginTop = '12px';

    const label = document.createElement('label');
    label.className = 'tec-form-label';
    label.textContent = '场景选择（可选）';

    const pickerWrap = document.createElement('div');
    pickerWrap.className = 'tec-scene-picker';

    const select = document.createElement('select');
    select.className = 'tec-form-select';
    select.dataset.field = 'scene_id';

    // 默认空选项
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '— 不使用场景 —';
    select.appendChild(emptyOpt);

    // 预设场景列表
    const scenes = [
      { id: 'scene.home', label: '🏠 回家模式' },
      { id: 'scene.away', label: '🚪 离家模式' },
      { id: 'scene.sleep', label: '😴 睡眠模式' },
      { id: 'scene.wake', label: '🌅 起床模式' },
      { id: 'scene.movie', label: '🎬 影院模式' },
      { id: 'scene.work', label: '💼 工作模式' }
    ];

    // 尝试从 HA 获取实际场景
    if (this._hass) {
      const haScenes = Object.values(this._hass.states).filter(e => e.entity_id.startsWith('scene.'));
      if (haScenes.length > 0) {
        // 添加 HA 实际场景
        haScenes.forEach(scene => {
          const opt = document.createElement('option');
          opt.value = scene.entity_id;
          opt.textContent = scene.attributes.friendly_name || scene.entity_id;
          select.appendChild(opt);
        });
      } else {
        // 使用预设场景
        scenes.forEach(scene => {
          const opt = document.createElement('option');
          opt.value = scene.id;
          opt.textContent = scene.label;
          select.appendChild(opt);
        });
      }
    } else {
      scenes.forEach(scene => {
        const opt = document.createElement('option');
        opt.value = scene.id;
        opt.textContent = scene.label;
        select.appendChild(opt);
      });
    }

    select.value = this._formData.scene_id || '';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'tec-scene-clear';
    clearBtn.innerHTML = '&times;';
    clearBtn.title = '清除场景';
    clearBtn.addEventListener('click', () => {
      select.value = '';
      this._formData.scene_id = '';
    });

    pickerWrap.appendChild(select);
    pickerWrap.appendChild(clearBtn);
    group.appendChild(label);
    group.appendChild(pickerWrap);

    return group;
  }

  /**
   * 渲染表单字段（定时模式）
   */
  _renderFormFields() {
    const grid = document.createElement('div');
    grid.className = 'tec-form-grid';

    // 主实体名称（全宽）
    grid.appendChild(this._renderFormGroup('主实体', 'entity_id', 'text',
      this._formData.entity_id, '例如: light.living_room', true));

    // 执行动作（左列）
    const actionGroup = this._renderFormGroup('执行动作', 'action', 'select',
      this._formData.action, '', false);
    const actionSelect = actionGroup.querySelector('.tec-form-select');
    if (actionSelect) {
      actionSelect.innerHTML = '';
      const actions = [
        { value: 'turn_on', label: '打开' },
        { value: 'turn_off', label: '关闭' },
        { value: 'toggle', label: '切换' }
      ];
      actions.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.value;
        opt.textContent = a.label;
        actionSelect.appendChild(opt);
      });
      actionSelect.value = this._formData.action;
    }
    grid.appendChild(actionGroup);

    // 重复周期（右列）
    const repeatGroup = this._renderFormGroup('重复周期', 'repeat', 'select',
      this._formData.repeat, '', false);
    const repeatSelect = repeatGroup.querySelector('.tec-form-select');
    if (repeatSelect) {
      repeatSelect.innerHTML = '';
      const repeats = [
        { value: 'daily', label: '每天' },
        { value: 'weekday', label: '工作日' },
        { value: 'weekend', label: '周末' },
        { value: 'mon', label: '周一' },
        { value: 'tue', label: '周二' },
        { value: 'wed', label: '周三' },
        { value: 'thu', label: '周四' },
        { value: 'fri', label: '周五' },
        { value: 'sat', label: '周六' },
        { value: 'sun', label: '周日' },
        { value: 'once', label: '仅一次' }
      ];
      repeats.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.value;
        opt.textContent = r.label;
        repeatSelect.appendChild(opt);
      });
      repeatSelect.value = this._formData.repeat;
    }
    grid.appendChild(repeatGroup);

    // 小时（左列）
    grid.appendChild(this._renderFormGroup('小时', 'hour', 'number',
      this._formData.hour, '0-23', false));

    // 分钟（右列）
    grid.appendChild(this._renderFormGroup('分钟', 'minute', 'number',
      this._formData.minute, '0-59', false));

    // 自动化名称（全宽）
    grid.appendChild(this._renderFormGroup('自动化名称', 'auto_name', 'text',
      this._formData.auto_name, '留空自动生成', true));

    // 验证错误提示
    const errorDiv = document.createElement('div');
    errorDiv.className = 'tec-form-error';
    errorDiv.id = 'tec-form-error-msg';
    errorDiv.textContent = '';
    grid.appendChild(errorDiv);

    return grid;
  }

  /**
   * 渲染倒计时字段
   */
  _renderCountdownFields() {
    const grid = document.createElement('div');
    grid.className = 'tec-form-grid';
    grid.style.marginTop = '12px';

    // 主实体名称（全宽）
    grid.appendChild(this._renderFormGroup('主实体', 'entity_id', 'text',
      this._formData.entity_id, '例如: light.living_room', true));

    // 执行动作
    const actionGroup = this._renderFormGroup('执行动作', 'action', 'select',
      this._formData.action, '', false);
    const actionSelect = actionGroup.querySelector('.tec-form-select');
    if (actionSelect) {
      actionSelect.innerHTML = '';
      [{ value: 'turn_on', label: '打开' }, { value: 'turn_off', label: '关闭' }, { value: 'toggle', label: '切换' }]
        .forEach(a => {
          const opt = document.createElement('option');
          opt.value = a.value;
          opt.textContent = a.label;
          actionSelect.appendChild(opt);
        });
      actionSelect.value = this._formData.action;
    }
    grid.appendChild(actionGroup);

    // 倒计时设置（全宽）
    const cdGroup = document.createElement('div');
    cdGroup.className = 'tec-form-group full-width';

    const cdLabel = document.createElement('label');
    cdLabel.className = 'tec-form-label';
    cdLabel.textContent = '倒计时时长';

    const cdFields = document.createElement('div');
    cdFields.className = 'tec-countdown-fields';

    const cdH = document.createElement('input');
    cdH.type = 'number';
    cdH.className = 'tec-form-input';
    cdH.min = '0';
    cdH.max = '23';
    cdH.value = this._formData.countdown_hours;
    cdH.dataset.field = 'countdown_hours';
    cdH.addEventListener('input', () => { this._formData.countdown_hours = parseInt(cdH.value) || 0; });

    const cdHLabel = document.createElement('span');
    cdHLabel.className = 'tec-countdown-unit';
    cdHLabel.textContent = '时';

    const cdM = document.createElement('input');
    cdM.type = 'number';
    cdM.className = 'tec-form-input';
    cdM.min = '0';
    cdM.max = '59';
    cdM.value = this._formData.countdown_minutes;
    cdM.dataset.field = 'countdown_minutes';
    cdM.addEventListener('input', () => { this._formData.countdown_minutes = parseInt(cdM.value) || 0; });

    const cdMLabel = document.createElement('span');
    cdMLabel.className = 'tec-countdown-unit';
    cdMLabel.textContent = '分';

    const cdS = document.createElement('input');
    cdS.type = 'number';
    cdS.className = 'tec-form-input';
    cdS.min = '0';
    cdS.max = '59';
    cdS.value = this._formData.countdown_seconds;
    cdS.dataset.field = 'countdown_seconds';
    cdS.addEventListener('input', () => { this._formData.countdown_seconds = parseInt(cdS.value) || 0; });

    const cdSLabel = document.createElement('span');
    cdSLabel.className = 'tec-countdown-unit';
    cdSLabel.textContent = '秒';

    cdFields.appendChild(cdH);
    cdFields.appendChild(cdHLabel);
    cdFields.appendChild(cdM);
    cdFields.appendChild(cdMLabel);
    cdFields.appendChild(cdS);
    cdFields.appendChild(cdSLabel);

    cdGroup.appendChild(cdLabel);
    cdGroup.appendChild(cdFields);
    grid.appendChild(cdGroup);

    // 自动化名称（全宽）
    grid.appendChild(this._renderFormGroup('自动化名称', 'auto_name', 'text',
      this._formData.auto_name, '留空自动生成', true));

    // 验证错误提示
    const errorDiv = document.createElement('div');
    errorDiv.className = 'tec-form-error';
    errorDiv.id = 'tec-form-error-msg';
    grid.appendChild(errorDiv);

    return grid;
  }

  /**
   * 渲染单个表单组
   */
  _renderFormGroup(labelText, field, type, value, placeholder, fullWidth) {
    const group = document.createElement('div');
    if (fullWidth) group.className = 'tec-form-group full-width';
    else group.className = 'tec-form-group';

    const label = document.createElement('label');
    label.className = 'tec-form-label';
    label.textContent = labelText;

    let input;
    if (type === 'select') {
      input = document.createElement('select');
      input.className = 'tec-form-select';
    } else {
      input = document.createElement('input');
      input.className = 'tec-form-input';
      input.type = type || 'text';
    }
    input.dataset.field = field;
    input.value = value || '';
    if (placeholder) input.placeholder = placeholder;

    group.appendChild(label);
    group.appendChild(input);

    return group;
  }

  /**
   * 渲染表单操作按钮
   */
  _renderFormActions() {
    const row = document.createElement('div');
    row.className = 'tec-automation-actions';

    if (this._editingId) {
      // 编辑模式：更新按钮
      const updateBtn = document.createElement('button');
      updateBtn.className = 'tec-btn tec-btn-primary tec-btn-update';
      updateBtn.innerHTML = '&#10003; 更新自动化';
      updateBtn.addEventListener('click', () => this._saveAutomation());
      row.appendChild(updateBtn);

      const cancelEditBtn = document.createElement('button');
      cancelEditBtn.className = 'tec-btn tec-btn-delete';
      cancelEditBtn.innerHTML = '&#8634;';
      cancelEditBtn.title = '取消编辑';
      cancelEditBtn.style.borderColor = '#e0e0e0';
      cancelEditBtn.style.color = '#888';
      cancelEditBtn.addEventListener('click', () => this._cancelEdit());
      row.appendChild(cancelEditBtn);
    } else {
      // 新建模式：创建按钮
      const createBtn = document.createElement('button');
      createBtn.className = 'tec-btn tec-btn-primary';
      createBtn.innerHTML = '&#43; 创建自动化';
      createBtn.addEventListener('click', () => this._saveAutomation());
      row.appendChild(createBtn);
    }

    // 删除按钮（仅编辑模式显示）
    if (this._editingId) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'tec-btn-delete';
      deleteBtn.innerHTML = '&#128465;'; // 🗑
      deleteBtn.title = '删除自动化';
      deleteBtn.addEventListener('click', () => this._deleteAutomation(this._editingId));
      row.appendChild(deleteBtn);
    }

    return row;
  }

  /**
   * 渲染同步状态
   */
  _renderSyncStatus() {
    const wrap = document.createElement('div');
    wrap.style.marginTop = '12px';

    // 查找当前编辑的自动化
    const auto = this._automations.find(a => a.id === this._editingId);

    const syncRow = document.createElement('div');
    syncRow.className = 'tec-sync-status ' + (auto ? 'synced' : 'pending');
    syncRow.innerHTML = auto
      ? '&#10003; 已同步到 Home Assistant'
      : '&#9203; 未同步';

    if (this._editingId) {
      const entityId = document.createElement('div');
      entityId.className = 'tec-entity-id';
      entityId.textContent = 'Entity ID: ' + (auto ? auto.entity_id : 'automation.' + this._pinyin(this._formData.auto_name || 'timer'));
      wrap.appendChild(syncRow);
      wrap.appendChild(entityId);
    } else {
      wrap.appendChild(syncRow);
    }

    return wrap;
  }

  /**
   * 渲染自动化列表
   */
  _renderAutomationList() {
    const section = document.createElement('div');

    const listHeader = document.createElement('div');
    listHeader.style.cssText = 'font-size:14px;font-weight:600;color:#333;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;';

    const listTitle = document.createElement('span');
    listTitle.textContent = '已创建的自动化';

    const countBadge = document.createElement('span');
    countBadge.style.cssText = 'font-size:12px;color:#888;background:#f5f5f5;padding:2px 8px;border-radius:10px;';
    countBadge.textContent = this._automations.length + ' 个';

    listHeader.appendChild(listTitle);
    listHeader.appendChild(countBadge);
    section.appendChild(listHeader);

    const list = document.createElement('div');
    list.className = 'tec-automation-list';

    if (this._automations.length === 0) {
      // 空状态
      const empty = document.createElement('div');
      empty.className = 'tec-empty';
      empty.innerHTML = `
        <div class="tec-empty-icon">&#9201;</div>
        <div class="tec-empty-text">暂无自动化</div>
        <div class="tec-empty-sub">在上方定时区域创建你的第一个定时任务</div>
      `;
      list.appendChild(empty);
    } else {
      this._automations.forEach(auto => {
        list.appendChild(this._renderAutomationItem(auto));
      });
    }

    section.appendChild(list);
    return section;
  }

  /**
   * 渲染单个自动化项
   */
  _renderAutomationItem(auto) {
    const item = document.createElement('div');
    item.className = 'tec-automation-item';

    // Toggle 开关
    const toggleWrap = document.createElement('div');
    toggleWrap.className = 'tec-automation-item-toggle';

    const toggle = document.createElement('div');
    toggle.className = 'tec-toggle' + (auto.state === 'on' ? ' active' : '');
    toggle.innerHTML = '<div class="tec-toggle-knob"></div>';
    toggle.addEventListener('click', () => this._toggleAutomation(auto));

    toggleWrap.appendChild(toggle);

    // 信息
    const info = document.createElement('div');
    info.className = 'tec-automation-item-info';

    const name = document.createElement('div');
    name.className = 'tec-automation-item-name';
    name.textContent = auto.alias || auto.name || '未命名';

    const desc = document.createElement('div');
    desc.className = 'tec-automation-item-desc';
    desc.textContent = this._getAutoDescription(auto);

    info.appendChild(name);
    info.appendChild(desc);

    // 时间显示
    const timeEl = document.createElement('div');
    timeEl.className = 'tec-automation-item-time';
    timeEl.textContent = this._getAutoTimeDisplay(auto);

    // 编辑按钮
    const editBtn = document.createElement('button');
    editBtn.className = 'tec-automation-item-edit';
    editBtn.innerHTML = '&#9998;'; // ✎
    editBtn.title = '编辑';
    editBtn.addEventListener('click', () => this._editAutomation(auto));

    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'tec-automation-item-delete';
    deleteBtn.innerHTML = '&#10005;'; // ✕
    deleteBtn.title = '删除';
    deleteBtn.addEventListener('click', () => this._deleteAutomation(auto.id));

    item.appendChild(toggleWrap);
    item.appendChild(info);
    item.appendChild(timeEl);
    item.appendChild(editBtn);
    item.appendChild(deleteBtn);

    return item;
  }

  /**
   * 获取自动化描述文本
   */
  _getAutoDescription(auto) {
    const parts = [];
    if (auto.entity) parts.push(auto.entity);
    if (auto.action) {
      const actionMap = { 'turn_on': '打开', 'turn_off': '关闭', 'toggle': '切换' };
      parts.push(actionMap[auto.action] || auto.action);
    }
    if (auto.repeat) {
      const repeatMap = {
        'daily': '每天', 'weekday': '工作日', 'weekend': '周末',
        'once': '仅一次', 'mon': '周一', 'tue': '周二', 'wed': '周三',
        'thu': '周四', 'fri': '周五', 'sat': '周六', 'sun': '周日'
      };
      parts.push(repeatMap[auto.repeat] || auto.repeat);
    }
    return parts.join(' · ') || '定时任务';
  }

  /**
   * 获取自动化时间显示
   */
  _getAutoTimeDisplay(auto) {
    if (auto.is_countdown) {
      const h = auto.countdown_hours || 0;
      const m = auto.countdown_minutes || 0;
      const s = auto.countdown_seconds || 0;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    const hour = auto.hour || '00';
    const minute = auto.minute || '00';
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  /**
   * 渲染底部操作栏
   */
  _renderBottomBar() {
    const bar = document.createElement('div');
    bar.className = 'tec-bottom-bar';

    // 代码编辑器链接
    const codeLink = document.createElement('span');
    codeLink.className = 'tec-bottom-code';
    codeLink.innerHTML = '&lt;/&gt; 代码编辑器';
    codeLink.addEventListener('click', () => this._showCodeEditor());

    // 间隔
    const spacer = document.createElement('div');
    spacer.className = 'tec-bottom-spacer';

    // 取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'tec-bottom-cancel';
    cancelBtn.textContent = '取消';
    cancelBtn.addEventListener('click', () => {
      this._cancelEdit();
      this._formData = this._getDefaultFormData();
      this._render();
    });

    // 保存按钮
    const saveBtn = document.createElement('button');
    saveBtn.className = 'tec-bottom-save';
    saveBtn.textContent = '保存卡片';
    saveBtn.addEventListener('click', () => this._saveCard());

    bar.appendChild(codeLink);
    bar.appendChild(spacer);
    bar.appendChild(cancelBtn);
    bar.appendChild(saveBtn);

    return bar;
  }

  /**
   * 绑定表单事件
   */
  _bindFormEvents() {
    if (!this.shadowRoot) return;

    // 绑定所有带 data-field 属性的输入元素
    const inputs = this.shadowRoot.querySelectorAll('[data-field]');
    inputs.forEach(input => {
      const field = input.dataset.field;

      // 移除旧监听器（使用替换方式）
      const newInput = input.cloneNode(true);
      input.parentNode.replaceChild(newInput, input);

      newInput.addEventListener('input', () => {
        if (field === 'entity_id') {
          this._formData.entity_id = newInput.value;
          this._updateAutoName();
        } else if (field === 'action') {
          this._formData.action = newInput.value;
        } else if (field === 'repeat') {
          this._formData.repeat = newInput.value;
        } else if (field === 'hour') {
          this._formData.hour = newInput.value;
        } else if (field === 'minute') {
          this._formData.minute = newInput.value;
        } else if (field === 'auto_name') {
          this._formData.auto_name = newInput.value;
        } else if (field === 'scene_id') {
          this._formData.scene_id = newInput.value;
        } else if (field === 'sub_entity') {
          this._config.sub_entity = newInput.value;
        } else if (field === 'card_icon') {
          this._config.icon = newInput.value;
        } else if (field === 'countdown_hours') {
          this._formData.countdown_hours = parseInt(newInput.value) || 0;
        } else if (field === 'countdown_minutes') {
          this._formData.countdown_minutes = parseInt(newInput.value) || 0;
        } else if (field === 'countdown_seconds') {
          this._formData.countdown_seconds = parseInt(newInput.value) || 0;
        }
      });

      newInput.addEventListener('change', () => {
        if (field === 'scene_id') {
          this._formData.scene_id = newInput.value;
        }
      });
    });
  }

  /**
   * 自动更新自动化名称
   */
  _updateAutoName() {
    if (this._formData.auto_name && this._formData.auto_name !== '') return;
    // 留空时自动生成名称，不自动填充输入框
  }

  /**
   * 验证表单数据
   */
  _validateForm() {
    const errors = [];

    if (!this._formData.entity_id) {
      errors.push('请输入主实体');
    }

    if (this._formData.is_countdown) {
      const total = (this._formData.countdown_hours || 0) +
                    (this._formData.countdown_minutes || 0) +
                    (this._formData.countdown_seconds || 0);
      if (total <= 0) {
        errors.push('请设置倒计时时长');
      }
    } else {
      if (this._formData.hour === '' || this._formData.hour === null) {
        errors.push('未选择时间');
      }
    }

    // 显示或隐藏错误
    const errorEl = this.shadowRoot.getElementById('tec-form-error-msg');
    if (errorEl) {
      if (errors.length > 0) {
        errorEl.textContent = errors[0];
        errorEl.classList.add('visible');

        // 标记对应的输入框
        if (errors[0].includes('实体')) {
          const entityInput = this.shadowRoot.querySelector('[data-field="entity_id"]');
          if (entityInput) entityInput.classList.add('error');
        }
        if (errors[0].includes('时间') || errors[0].includes('倒计时')) {
          const hourInput = this.shadowRoot.querySelector('[data-field="hour"]');
          if (hourInput) hourInput.classList.add('error');
        }
      } else {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
        // 清除所有错误标记
        this.shadowRoot.querySelectorAll('.tec-form-input.error').forEach(el => el.classList.remove('error'));
      }
    }

    return errors.length === 0;
  }

  /**
   * 保存自动化
   */
  async _saveAutomation() {
    if (!this._hass) {
      this._showToast('请先连接 Home Assistant', 'error');
      return;
    }

    // 验证表单
    if (!this._validateForm()) return;

    // 生成自动化名称
    let autoName = this._formData.auto_name;
    if (!autoName || autoName.trim() === '') {
      autoName = this._generateAutoName();
      this._formData.auto_name = autoName;
    }

    // 构建 HA 自动化配置
    const automationConfig = this._buildAutomationConfig(autoName);

    try {
      if (this._editingId) {
        // 更新已有自动化
        const existingAuto = this._automations.find(a => a.id === this._editingId);
        if (existingAuto) {
          await this._hass.callApi('POST', `/api/config/automation/config/${existingAuto.config_id}`, automationConfig);
          this._showToast('自动化已更新', 'success');
        }
      } else {
        // 创建新自动化
        const result = await this._hass.callApi('POST', '/api/config/automation/config', automationConfig);
        this._showToast('自动化已创建', 'success');
      }

      // 刷新自动化列表
      await this._refreshAutomations();

      // 重置表单
      this._formData = this._getDefaultFormData();
      this._editingId = null;
      this._render();

    } catch (error) {
      console.error('保存自动化失败:', error);
      this._showToast('保存失败: ' + (error.message || '未知错误'), 'error');
    }
  }

  /**
   * 构建 Home Assistant 自动化配置对象
   */
  _buildAutomationConfig(name) {
    const alias = name || this._formData.auto_name || '定时任务';
    const entityId = 'automation.' + this._pinyin(alias);

    const config = {
      alias: alias,
      description: 'Timer Editor Card 创建的自动化',
    };

    // 设置触发器
    config.trigger = this._getTriggers();

    // 设置条件
    const conditions = this._getConditions();
    if (conditions && conditions.length > 0) {
      config.condition = conditions;
    }

    // 设置动作
    config.action = this._getActions();

    // 设置模式（单次）
    if (this._formData.once || this._formData.repeat === 'once') {
      config.mode = 'single';
    }

    return config;
  }

  /**
   * 获取触发器（兼容 HA 2024+）
   * HA 2024+ 使用 trigger/action/condition 替代 trigger/service/condition
   */
  _getTriggers() {
    if (this._formData.is_countdown) {
      // 倒计时模式：使用延时触发器
      const totalSeconds = (this._formData.countdown_hours || 0) * 3600 +
                           (this._formData.countdown_minutes || 0) * 60 +
                           (this._formData.countdown_seconds || 0);

      // 倒计时需要手动触发
      return [
        {
          trigger: 'numeric_state',
          entity_id: this._formData.entity_id,
          attribute: 'last_triggered',
          above: 0,
          below: 1,
          for: {
            hours: 0,
            minutes: 0,
            seconds: totalSeconds
          }
        }
      ];
    }

    // 定时模式：使用时间触发器
    const triggers = [];

    if (this._formData.repeat === 'once') {
      // 仅一次
      triggers.push({
        trigger: 'time',
        at: `${String(this._formData.hour).padStart(2, '0')}:${String(this._formData.minute).padStart(2, '0')}`
      });
    } else if (this._formData.repeat === 'weekday') {
      // 工作日
      triggers.push({
        trigger: 'time',
        at: `${String(this._formData.hour).padStart(2, '0')}:${String(this._formData.minute).padStart(2, '0')}`,
        weekday: ['mon', 'tue', 'wed', 'thu', 'fri']
      });
    } else if (this._formData.repeat === 'weekend') {
      // 周末
      triggers.push({
        trigger: 'time',
        at: `${String(this._formData.hour).padStart(2, '0')}:${String(this._formData.minute).padStart(2, '0')}`,
        weekday: ['sat', 'sun']
      });
    } else if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(this._formData.repeat)) {
      // 特定星期几
      triggers.push({
        trigger: 'time',
        at: `${String(this._formData.hour).padStart(2, '0')}:${String(this._formData.minute).padStart(2, '0')}`,
        weekday: [this._formData.repeat]
      });
    } else {
      // 每天
      triggers.push({
        trigger: 'time',
        at: `${String(this._formData.hour).padStart(2, '0')}:${String(this._formData.minute).padStart(2, '0')}`
      });
    }

    return triggers;
  }

  /**
   * 获取条件（兼容 HA 2024+）
   */
  _getConditions() {
    const conditions = [];

    if (this._formData.condition === 'night_only') {
      conditions.push({
        condition: 'time',
        after: '18:00:00',
        before: '06:00:00'
      });
    } else if (this._formData.condition === 'day_only') {
      conditions.push({
        condition: 'time',
        after: '06:00:00',
        before: '18:00:00'
      });
    }

    return conditions;
  }

  /**
   * 获取动作（兼容 HA 2024+）
   */
  _getActions() {
    // 如果选择了场景，优先执行场景
    if (this._formData.scene_id) {
      return [
        {
          action: 'scene.turn_on',
          target: {
            entity_id: this._formData.scene_id
          }
        }
      ];
    }

    // 否则执行实体动作
    return [
      {
        action: `homeassistant.${this._formData.action || 'turn_on'}`,
        target: {
          entity_id: this._formData.entity_id
        }
      }
    ];
  }

  /**
   * 删除自动化
   */
  async _deleteAutomation(id) {
    if (!confirm('确定要删除这个自动化吗？')) return;

    const auto = this._automations.find(a => a.id === id);
    if (!auto) return;

    try {
      if (auto.config_id) {
        await this._hass.callApi('DELETE', `/api/config/automation/config/${auto.config_id}`);
      }
      this._automations = this._automations.filter(a => a.id !== id);

      // 如果正在编辑被删除的自动化，取消编辑
      if (this._editingId === id) {
        this._cancelEdit();
      }

      this._showToast('自动化已删除', 'success');
      this._render();
    } catch (error) {
      console.error('删除自动化失败:', error);
      this._showToast('删除失败: ' + (error.message || '未知错误'), 'error');
    }
  }

  /**
   * 切换自动化启用/禁用
   */
  async _toggleAutomation(auto) {
    try {
      const service = auto.state === 'on' ? 'turn_off' : 'turn_on';
      await this._hass.callService('automation', service, {
        entity_id: auto.entity_id
      });
      auto.state = auto.state === 'on' ? 'off' : 'on';
      this._showToast(`自动化已${auto.state === 'on' ? '启用' : '禁用'}`, 'info');
      this._render();
    } catch (error) {
      console.error('切换自动化失败:', error);
      this._showToast('操作失败', 'error');
    }
  }

  /**
   * 编辑自动化
   */
  _editAutomation(auto) {
    this._editingId = auto.id;
    this._formData = {
      enabled: auto.state !== 'off',
      name: auto.alias || auto.name || '',
      entity_id: auto.entity || '',
      action: auto.action || 'turn_on',
      repeat: auto.repeat || 'daily',
      hour: auto.hour || '',
      minute: auto.minute || '',
      scene_id: auto.scene_id || '',
      auto_name: auto.alias || auto.name || '',
      condition: auto.condition || 'none',
      is_countdown: auto.is_countdown || false,
      countdown_hours: auto.countdown_hours || 0,
      countdown_minutes: auto.countdown_minutes || 0,
      countdown_seconds: auto.countdown_seconds || 0,
      once: auto.once || false
    };

    // 确保定时区段展开
    this._sectionsOpen.timer = true;

    this._render();
  }

  /**
   * 取消编辑
   */
  _cancelEdit() {
    this._editingId = null;
    this._formData = this._getDefaultFormData();
    this._render();
  }

  /**
   * 保存卡片配置
   */
  _saveCard() {
    this._showToast('卡片配置已保存', 'success');
    // 触发 HA 的 card 更新事件
    const event = new Event('config-changed', { bubbles: true, composed: true });
    event.detail = { config: this._config };
    this.dispatchEvent(event);
  }

  /**
   * 显示 YAML 代码编辑器
   */
  _showCodeEditor() {
    this._codeEditorVisible = !this._codeEditorVisible;

    // 查找底部操作栏之前的位置插入代码编辑器
    const bottomBar = this.shadowRoot.querySelector('.tec-bottom-bar');
    if (!bottomBar) return;

    // 移除已有的代码编辑器
    const existing = this.shadowRoot.querySelector('.tec-code-editor');
    if (existing) {
      existing.remove();
    }

    if (this._codeEditorVisible) {
      const editorWrap = document.createElement('div');
      editorWrap.className = 'tec-code-editor';

      const editorHeader = document.createElement('div');
      editorHeader.className = 'tec-code-editor-header';

      const editorTitle = document.createElement('span');
      editorTitle.textContent = 'YAML 自动化配置';

      const closeBtn = document.createElement('span');
      closeBtn.className = 'tec-code-editor-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => {
        this._codeEditorVisible = false;
        const ed = this.shadowRoot.querySelector('.tec-code-editor');
        if (ed) ed.remove();
      });

      editorHeader.appendChild(editorTitle);
      editorHeader.appendChild(closeBtn);

      const textarea = document.createElement('textarea');
      textarea.className = 'tec-code-editor-textarea';
      textarea.value = this._toYaml();

      // 应用YAML更改按钮
      const applyWrap = document.createElement('div');
      applyWrap.style.cssText = 'padding:8px 12px;background:#1e1e1e;display:flex;gap:8px;justify-content:flex-end;';

      const applyBtn = document.createElement('button');
      applyBtn.style.cssText = 'padding:6px 16px;border-radius:8px;border:none;background:var(--tec-orange-gradient);color:white;font-size:13px;cursor:pointer;';
      applyBtn.textContent = '应用更改';
      applyBtn.addEventListener('click', () => {
        this._showToast('YAML 配置已应用（仅显示）', 'info');
      });

      const copyBtn = document.createElement('button');
      copyBtn.style.cssText = 'padding:6px 16px;border-radius:8px;border:1px solid #444;background:transparent;color:#d4d4d4;font-size:13px;cursor:pointer;';
      copyBtn.textContent = '复制';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(textarea.value).then(() => {
          this._showToast('已复制到剪贴板', 'success');
        }).catch(() => {
          this._showToast('复制失败', 'error');
        });
      });

      applyWrap.appendChild(copyBtn);
      applyWrap.appendChild(applyBtn);

      editorWrap.appendChild(editorHeader);
      editorWrap.appendChild(textarea);
      editorWrap.appendChild(applyWrap);

      // 插入到底部操作栏之前
      bottomBar.parentNode.insertBefore(editorWrap, bottomBar);
    }
  }

  /**
   * 转换为 YAML 格式（简化版，不依赖 js-yaml 库）
   */
  _toYaml() {
    let yaml = '# Timer Editor Card - 自动化配置 YAML\n\n';

    if (this._automations.length === 0) {
      yaml += '# 暂无自动化配置\n';
      yaml += '# 请在上方表单中创建自动化\n';
      return yaml;
    }

    this._automations.forEach((auto, index) => {
      yaml += `- id: ${auto.config_id || 'auto_' + (index + 1)}\n`;
      yaml += `  alias: ${auto.alias || auto.name || '未命名'}\n`;
      yaml += `  description: 定时编辑器创建的自动化\n`;
      yaml += `  trigger:\n`;
      yaml += `    - trigger: time\n`;
      yaml += `      at: "${String(auto.hour || '00').padStart(2, '0')}:${String(auto.minute || '00').padStart(2, '0')}"\n`;
      if (auto.repeat && auto.repeat !== 'daily') {
        if (['weekday', 'weekend', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(auto.repeat)) {
          const weekdayMap = {
            weekday: ['mon', 'tue', 'wed', 'thu', 'fri'],
            weekend: ['sat', 'sun']
          };
          const days = weekdayMap[auto.repeat] || [auto.repeat];
          yaml += `      weekday:\n`;
          days.forEach(d => { yaml += `        - ${d}\n`; });
        }
      }
      yaml += `  action:\n`;
      if (auto.scene_id) {
        yaml += `    - action: scene.turn_on\n`;
        yaml += `      target:\n`;
        yaml += `        entity_id: ${auto.scene_id}\n`;
      } else {
        yaml += `    - action: homeassistant.${auto.action || 'turn_on'}\n`;
        yaml += `      target:\n`;
        yaml += `        entity_id: ${auto.entity || ''}\n`;
      }
      if (auto.condition && auto.condition !== 'none') {
        yaml += `  condition:\n`;
        yaml += `    - condition: time\n`;
        if (auto.condition === 'night_only') {
          yaml += `      after: "18:00:00"\n`;
          yaml += `      before: "06:00:00"\n`;
        } else if (auto.condition === 'day_only') {
          yaml += `      after: "06:00:00"\n`;
          yaml += `      before: "18:00:00"\n`;
        }
      }
      yaml += '\n';
    });

    return yaml;
  }

  /**
   * 获取定时相关的自动化列表
   */
  _getTimerAutomations() {
    if (!this._hass) return [];

    const automations = [];
    Object.values(this._hass.states).forEach(entity => {
      if (entity.entity_id.startsWith('automation.')) {
        // 检查是否是本卡片创建的自动化（通过 description 或 alias 判断）
        const desc = entity.attributes.description || '';
        const alias = entity.attributes.friendly_name || '';

        if (desc.includes('Timer Editor') || alias.includes('timer')) {
          automations.push(this._parseAutomation(entity));
        }
      }
    });

    return automations;
  }

  /**
   * 解析 HA 自动化实体为内部格式
   */
  _parseAutomation(entity) {
    const triggers = entity.attributes.triggers || [];
    const actions = entity.attributes.actions || [];
    const conditions = entity.attributes.conditions || [];

    // 解析时间触发器
    let hour = '', minute = '', repeat = 'daily', is_countdown = false;
    let countdown_hours = 0, countdown_minutes = 0, countdown_seconds = 0;

    if (triggers.length > 0) {
      const trigger = triggers[0];
      if (trigger.trigger === 'time') {
        const at = trigger.at || '';
        const timeParts = at.split(':');
        hour = parseInt(timeParts[0]) || 0;
        minute = parseInt(timeParts[1]) || 0;

        if (trigger.weekday) {
          const wd = trigger.weekday;
          if (wd.length === 5 && wd.includes('mon') && wd.includes('fri')) {
            repeat = 'weekday';
          } else if (wd.length === 2 && wd.includes('sat') && wd.includes('sun')) {
            repeat = 'weekend';
          } else if (wd.length === 1) {
            repeat = wd[0];
          }
        }
      }
    }

    // 解析动作
    let action = 'turn_on', entityId = '', scene_id = '';
    if (actions.length > 0) {
      const act = actions[0];
      if (act.action) {
        if (act.action.startsWith('scene.')) {
          scene_id = (act.target && act.target.entity_id) ? act.target.entity_id[0] : '';
          action = 'scene';
        } else if (act.action.includes('turn_on')) {
          action = 'turn_on';
          entityId = (act.target && act.target.entity_id) ? act.target.entity_id[0] : '';
        } else if (act.action.includes('turn_off')) {
          action = 'turn_off';
          entityId = (act.target && act.target.entity_id) ? act.target.entity_id[0] : '';
        } else if (act.action.includes('toggle')) {
          action = 'toggle';
          entityId = (act.target && act.target.entity_id) ? act.target.entity_id[0] : '';
        }
      }
    }

    // 解析条件
    let condition = 'none';
    if (conditions.length > 0) {
      const cond = conditions[0];
      if (cond.condition === 'time') {
        if (cond.after && cond.after.startsWith('18') && cond.before && cond.before.startsWith('06')) {
          condition = 'night_only';
        } else if (cond.after && cond.after.startsWith('06') && cond.before && cond.before.startsWith('18')) {
          condition = 'day_only';
        }
      }
    }

    return {
      id: entity.entity_id,
      config_id: entity.attributes.id || '',
      entity_id: entity.entity_id,
      alias: entity.attributes.friendly_name || '',
      name: entity.attributes.friendly_name || '',
      state: entity.state,
      entity: entityId,
      action: action,
      repeat: repeat,
      hour: hour,
      minute: minute,
      scene_id: scene_id,
      condition: condition,
      is_countdown: is_countdown,
      countdown_hours: countdown_hours,
      countdown_minutes: countdown_minutes,
      countdown_seconds: countdown_seconds,
      once: entity.attributes.mode === 'single'
    };
  }

  /**
   * 刷新自动化列表
   */
  async _refreshAutomations() {
    try {
      // 通过 REST API 获取所有自动化配置
      const configs = await this._hass.callApi('GET', '/api/config/automation/config');

      this._automations = configs.map(cfg => {
        // 解析触发器
        const triggers = cfg.trigger || [];
        let hour = '', minute = '', repeat = 'daily';

        triggers.forEach(trigger => {
          if (trigger.trigger === 'time' && trigger.at) {
            const parts = trigger.at.split(':');
            hour = parseInt(parts[0]) || 0;
            minute = parseInt(parts[1]) || 0;
          }
          if (trigger.trigger === 'time' && trigger.weekday) {
            const wd = trigger.weekday;
            if (wd.length === 5) repeat = 'weekday';
            else if (wd.length === 2) repeat = 'weekend';
            else if (wd.length === 1) repeat = wd[0];
          }
        });

        // 解析动作
        const actions = cfg.action || [];
        let action = 'turn_on', entityId = '', scene_id = '';

        actions.forEach(act => {
          if (act.action && act.action.startsWith('scene.')) {
            scene_id = (act.target && act.target.entity_id) ? (Array.isArray(act.target.entity_id) ? act.target.entity_id[0] : act.target.entity_id) : '';
            action = 'scene';
          } else if (act.action) {
            if (act.action.includes('turn_on')) action = 'turn_on';
            else if (act.action.includes('turn_off')) action = 'turn_off';
            else if (act.action.includes('toggle')) action = 'toggle';
            entityId = (act.target && act.target.entity_id) ? (Array.isArray(act.target.entity_id) ? act.target.entity_id[0] : act.target.entity_id) : '';
          }
        });

        // 解析条件
        const conditions = cfg.condition || [];
        let condition = 'none';
        conditions.forEach(cond => {
          if (cond.condition === 'time') {
            if (cond.after === '18:00:00') condition = 'night_only';
            else if (cond.after === '06:00:00') condition = 'day_only';
          }
        });

        // 获取当前状态
        const stateObj = this._hass.states['automation.' + this._pinyin(cfg.alias || '')] || {};

        return {
          id: 'auto_' + cfg.id,
          config_id: cfg.id,
          entity_id: 'automation.' + this._pinyin(cfg.alias || ''),
          alias: cfg.alias || '',
          name: cfg.alias || '',
          state: stateObj.state || 'off',
          entity: entityId,
          action: action,
          repeat: repeat,
          hour: hour,
          minute: minute,
          scene_id: scene_id,
          condition: condition,
          is_countdown: false,
          countdown_hours: 0,
          countdown_minutes: 0,
          countdown_seconds: 0,
          once: cfg.mode === 'single'
        };
      });

    } catch (error) {
      console.error('刷新自动化列表失败:', error);
      // 回退到通过 hass.states 获取
      this._automations = this._getTimerAutomations();
    }
  }

  /**
   * 更新自动化状态（从 hass.states）
   */
  _updateAutomationStates() {
    if (!this._hass || this._automations.length === 0) return;

    this._automations.forEach(auto => {
      const stateObj = this._hass.states[auto.entity_id];
      if (stateObj) {
        auto.state = stateObj.state;
      }
    });
  }

  /**
   * 生成自动化名称
   */
  _generateAutoName() {
    const entity = this._formData.entity_id || 'timer';
    const entityName = entity.split('.').pop() || 'timer';

    let timeStr = '';
    if (this._formData.is_countdown) {
      const h = this._formData.countdown_hours || 0;
      const m = this._formData.countdown_minutes || 0;
      const s = this._formData.countdown_seconds || 0;
      timeStr = `倒计时${h}时${m}分${s}秒`;
    } else {
      const h = String(this._formData.hour || '00').padStart(2, '0');
      const m = String(this._formData.minute || '00').padStart(2, '0');
      timeStr = `${h}:${m}`;
    }

    const repeatMap = {
      'daily': '每天', 'weekday': '工作日', 'weekend': '周末',
      'once': '单次', 'mon': '周一', 'tue': '周二', 'wed': '周三',
      'thu': '周四', 'fri': '周五', 'sat': '周六', 'sun': '周日'
    };
    const repeatStr = repeatMap[this._formData.repeat] || '';

    return `${entityName} ${timeStr} ${repeatStr}`.trim();
  }

  /**
   * 生成实体ID（使用拼音）
   */
  _generateEntityId(name) {
    return 'automation.' + this._pinyin(name || 'timer');
  }

  /**
   * 简易中文转拼音（用于生成实体ID）
   * 实际使用中建议引入完整的拼音库
   */
  _pinyin(str) {
    if (!str) return 'timer';

    // 常用中文字符映射
    const map = {
      '定': 'ding', '时': 'shi', '器': 'qi', '打': 'da', '开': 'kai',
      '关': 'guan', '切': 'qie', '换': 'huan', '每': 'mei', '天': 'tian',
      '早': 'zao', '晚': 'wan', '上': 'shang', '下': 'xia', '午': 'wu',
      '回': 'hui', '家': 'jia', '离': 'li', '睡': 'shui', '眠': 'mian',
      '起': 'qi', '床': 'chuang', '模': 'mo', '式': 'shi', '倒': 'dao',
      '计': 'ji', '数': 'shu', '工': 'gong', '作': 'zuo', '日': 'ri',
      '周': 'zhou', '一': 'yi', '二': 'er', '三': 'san', '四': 'si',
      '五': 'wu', '六': 'liu', '七': 'qi', '八': 'ba', '九': 'jiu',
      '十': 'shi', '零': 'ling', '灯': 'deng', '光': 'guang', '自': 'zi',
      '动': 'dong', '化': 'hua', '卧': 'wo', '室': 'shi', '客': 'ke',
      '厅': 'ting', '厨': 'chu', '房': 'fang', '卫': 'wei', '生': 'sheng',
      '间': 'jian', '阳': 'yang', '台': 'tai', '夜': 'ye', '影': 'ying',
      '院': 'yuan', '场': 'chang', '空': 'kong', '调': 'tiao', '插': 'cha',
      '座': 'zuo', '开': 'kai', '关': 'guan', '窗': 'chuang', '帘': 'lian',
      '门': 'men', '锁': 'suo', '摄': 'she', '像': 'xiang', '头': 'tou',
      '扫': 'sao', '地': 'di', '机': 'ji', '洗': 'xi', '衣': 'yi',
      '冰': 'bing', '箱': 'xiang', '电': 'dian', '视': 'shi', '音': 'yin',
      '响': 'xiang', '风': 'feng', '扇': 'shan', '加': 'jia', '热': 're',
      '器': 'qi'
    };

    let result = '';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (map[ch]) {
        result += map[ch] + '_';
      } else if (/[a-zA-Z0-9_]/.test(ch)) {
        result += ch.toLowerCase();
      } else if (/\s/.test(ch)) {
        result += '_';
      }
      // 忽略其他字符
    }

    // 清理结果
    result = result.replace(/_+/g, '_').replace(/^_|_$/g, '');
    return result || 'timer';
  }

  /**
   * HTML 转义
   */
  _escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * 显示 Toast 提示
   */
  _showToast(message, type) {
    // 移除已有 toast
    const existing = document.querySelector('.tec-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'tec-toast ' + (type || 'info');
    toast.textContent = message;
    document.body.appendChild(toast);

    // 3秒后自动移除
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 3000);
  }
}

// 注册自定义元素
if (!customElements.get('timer-editor-card')) {
  customElements.define('timer-editor-card', TimerEditorCard);
}

// ========== 卡片配置编辑器 ==========
class TimerEditorCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  _render() {
    this.shadowRoot.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = `
      .editor { padding: 16px; }
      .editor-row { margin-bottom: 12px; }
      .editor-label { display: block; font-size: 12px; font-weight: 600; color: #888; margin-bottom: 4px; }
      .editor-input { width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; box-sizing: border-box; outline: none; }
      .editor-input:focus { border-color: #FF9500; box-shadow: 0 0 0 3px rgba(255,149,0,0.15); }
    `;
    this.shadowRoot.appendChild(style);

    const editor = document.createElement('div');
    editor.className = 'editor';

    // 标题
    const titleRow = document.createElement('div');
    titleRow.className = 'editor-row';
    const titleLabel = document.createElement('label');
    titleLabel.className = 'editor-label';
    titleLabel.textContent = '卡片标题';
    const titleInput = document.createElement('input');
    titleInput.className = 'editor-input';
    titleInput.type = 'text';
    titleInput.value = this._config.title || '定时编辑器';
    titleInput.addEventListener('change', () => {
      this._config.title = titleInput.value;
      this._fireChanged();
    });
    titleRow.appendChild(titleLabel);
    titleRow.appendChild(titleInput);
    editor.appendChild(titleRow);

    // 卡片ID
    const idRow = document.createElement('div');
    idRow.className = 'editor-row';
    const idLabel = document.createElement('label');
    idLabel.className = 'editor-label';
    idLabel.textContent = '卡片ID';
    const idInput = document.createElement('input');
    idInput.className = 'editor-input';
    idInput.type = 'text';
    idInput.value = this._config.card_id || 'timer_card_1';
    idInput.addEventListener('change', () => {
      this._config.card_id = idInput.value;
      this._fireChanged();
    });
    idRow.appendChild(idLabel);
    idRow.appendChild(idInput);
    editor.appendChild(idRow);

    // 图标
    const iconRow = document.createElement('div');
    iconRow.className = 'editor-row';
    const iconLabel = document.createElement('label');
    iconLabel.className = 'editor-label';
    iconLabel.textContent = '图标（MDI）';
    const iconInput = document.createElement('input');
    iconInput.className = 'editor-input';
    iconInput.type = 'text';
    iconInput.value = this._config.icon || 'mdi:timer-outline';
    iconInput.addEventListener('change', () => {
      this._config.icon = iconInput.value;
      this._fireChanged();
    });
    iconRow.appendChild(iconLabel);
    iconRow.appendChild(iconInput);
    editor.appendChild(iconRow);

    this.shadowRoot.appendChild(editor);
  }

  _fireChanged() {
    const event = new Event('config-changed', { bubbles: true, composed: true });
    event.detail = { config: this._config };
    this.dispatchEvent(event);
  }
}

if (!customElements.get('timer-editor-card-editor')) {
  customElements.define('timer-editor-card-editor', TimerEditorCardEditor);
}

console.info('%c Timer Editor Card v2.0.0 %c 已加载', 'background:#FF9500;color:white;border-radius:4px;padding:2px 6px;', 'color:#FF9500;');
