/**
 * Timer Editor Card for Home Assistant
 * A custom Lovelace card for creating time-based automations with a beautiful UI
 * Version: 1.0.0
 */

class TimerEditorCard extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._dialogOpen = false;
    this._formData = {
      entity_id: '',
      display_name: '',
      action: 'turn_off',
      repeat: 'once',
      hour: 2,
      minute: 0,
      automation_name: '',
      custom_text: '',
    };
    this._synced = false;
  }

  static getConfigElement() {
    return document.createElement('timer-editor-card-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:timer-editor-card',
      title: '定时编辑',
      icon: 'mdi:clock-outline',
      entities: [],
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this._config = {
      title: '定时编辑',
      icon: 'mdi:clock-outline',
      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._content) {
      this._render();
    }
  }

  get hass() {
    return this._hass;
  }

  _render() {
    this.innerHTML = '';
    this._content = document.createElement('ha-card');
    this._content.style.borderRadius = '16px';
    this._content.style.overflow = 'hidden';
    this._content.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    this._content.style.background = 'var(--card-background-color, #fff)';
    this.appendChild(this._content);

    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.06));
    `;
    header.addEventListener('click', () => this._openDialog());

    const iconBox = document.createElement('div');
    iconBox.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      flex-shrink: 0;
    `;
    iconBox.innerHTML = `<ha-icon icon="${this._config.icon || 'mdi:clock-outline'}"></ha-icon>`;

    const titleArea = document.createElement('div');
    titleArea.style.flex = '1';
    titleArea.innerHTML = `
      <div style="font-size: 16px; font-weight: 600; color: var(--primary-text-color, #333);">${this._config.title || '定时编辑'}</div>
      <div style="font-size: 13px; color: var(--secondary-text-color, #999); margin-top: 2px;">点击添加定时任务</div>
    `;

    const arrow = document.createElement('div');
    arrow.style.cssText = 'color: var(--secondary-text-color, #999); font-size: 20px;';
    arrow.innerHTML = '<ha-icon icon="mdi:chevron-right"></ha-icon>';

    header.appendChild(iconBox);
    header.appendChild(titleArea);
    header.appendChild(arrow);
    this._content.appendChild(header);

    // If there are existing automations, show them
    this._renderAutomationList();
  }

  _renderAutomationList() {
    const existingList = this._content.querySelector('.automation-list');
    if (existingList) existingList.remove();

    const list = document.createElement('div');
    list.className = 'automation-list';
    list.style.padding = '8px 16px 16px';

    const automations = this._getTimerAutomations();
    if (automations.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--secondary-text-color, #999); font-size: 14px;">
          暂无定时任务，点击上方添加
        </div>
      `;
    } else {
      automations.forEach((auto, idx) => {
        const item = document.createElement('div');
        item.style.cssText = `
          display: flex;
          align-items: center;
          padding: 12px 16px;
          margin-bottom: 8px;
          border-radius: 12px;
          background: var(--ha-card-background, #f5f5f5);
          cursor: pointer;
          transition: background 0.2s;
        `;
        item.addEventListener('mouseenter', () => item.style.background = 'var(--state-icon-active-color, #e8e8e8)');
        item.addEventListener('mouseleave', () => item.style.background = 'var(--ha-card-background, #f5f5f5)');

        const trigger = this._parseTrigger(auto);
        const friendlyName = auto.attributes?.friendly_name || auto.entity_id;
        const isActive = auto.state === 'on';

        item.innerHTML = `
          <div style="width: 36px; height: 36px; border-radius: 10px; background: ${isActive ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #9ca3af, #6b7280)'}; display: flex; align-items: center; justify-content: center; color: white; margin-right: 12px; flex-shrink: 0;">
            <ha-icon icon="mdi:timer-outline" style="font-size: 18px;"></ha-icon>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 14px; font-weight: 500; color: var(--primary-text-color, #333); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${friendlyName}</div>
            <div style="font-size: 12px; color: var(--secondary-text-color, #888); margin-top: 2px;">${trigger}</div>
          </div>
          <ha-icon icon="mdi:chevron-right" style="color: var(--secondary-text-color, #bbb); flex-shrink: 0;"></ha-icon>
        `;
        item.addEventListener('click', () => this._editAutomation(auto));
        list.appendChild(item);
      });
    }
    this._content.appendChild(list);
  }

  _getTimerAutomations() {
    if (!this._hass) return [];
    return Object.values(this._hass.states)
      .filter(s => s.entity_id.startsWith('automation.'))
      .filter(s => s.attributes?.timer_editor === true);
  }

  _parseTrigger(auto) {
    const triggers = auto.attributes?.trigger || [];
    if (triggers.length === 0) return '手动触发';
    const t = triggers[0];
    if (t.platform === 'time') {
      return `每天 ${t.at || '--:--'}`;
    }
    if (t.platform === 'time_pattern') {
      return `每${t.hours || t.minutes || ''}小时`;
    }
    return '定时触发';
  }

  _openDialog() {
    this._resetForm();
    this._showDialog();
  }

  _editAutomation(auto) {
    const attrs = auto.attributes || {};
    const triggers = attrs.trigger || [];
    const trigger = triggers[0] || {};
    const actions = attrs.action || [];
    const action = actions[0] || {};

    let timeStr = '';
    if (typeof trigger.at === 'string') {
      timeStr = trigger.at;
    }
    const [h, m] = timeStr.split(':').map(Number);

    this._formData = {
      entity_id: action.entity_id || action.target?.entity_id || '',
      display_name: attrs.friendly_name || '',
      action: action.service === 'homeassistant.turn_on' ? 'turn_on' : 'turn_off',
      repeat: trigger.platform === 'time' ? 'daily' : 'once',
      hour: h || 0,
      minute: m || 0,
      automation_name: attrs.friendly_name || '',
      custom_text: attrs.timer_custom_text || '',
    };
    this._editingEntityId = auto.entity_id;
    this._showDialog();
  }

  _resetForm() {
    this._formData = {
      entity_id: this._config.default_entity || '',
      display_name: '',
      action: 'turn_off',
      repeat: 'once',
      hour: 2,
      minute: 0,
      automation_name: '',
      custom_text: '',
    };
    this._editingEntityId = null;
    this._synced = false;
  }

  _showDialog() {
    if (this._dialog) {
      this._dialog.remove();
    }

    const dialog = document.createElement('div');
    dialog.className = 'timer-editor-overlay';
    dialog.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      backdrop-filter: blur(4px);
    `;

    const container = document.createElement('div');
    container.style.cssText = `
      background: #ffffff;
      border-radius: 20px;
      width: 100%;
      max-width: 460px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      animation: timerDialogIn 0.3s ease;
    `;

    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes timerDialogIn {
        from { opacity: 0; transform: translateY(20px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .timer-form-group { margin-bottom: 16px; }
      .timer-form-label {
        font-size: 13px; color: #666; margin-bottom: 6px;
        display: flex; align-items: center; gap: 4px;
      }
      .timer-form-input, .timer-form-select {
        width: 100%; padding: 10px 14px;
        border: 1px solid #e0e0e0; border-radius: 10px;
        font-size: 15px; background: #fff; color: #333;
        box-sizing: border-box; outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .timer-form-input:focus, .timer-form-select:focus {
        border-color: #f59e0b;
        box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
      }
      .timer-row { display: flex; gap: 12px; }
      .timer-row > * { flex: 1; }
    `;
    document.head.appendChild(style);

    container.innerHTML = this._buildDialogHTML();
    dialog.appendChild(container);
    document.body.appendChild(dialog);
    this._dialog = dialog;

    // Close on backdrop click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) this._closeDialog();
    });

    // Bind events
    this._bindDialogEvents(container);

    // Auto-generate automation name
    this._updateAutoName();
  }

  _buildDialogHTML() {
    const isEdit = !!this._editingEntityId;
    const entityOptions = this._getEntityOptions();

    return `
      <!-- Header -->
      <div style="padding: 20px 24px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #f0f0f0;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #f97316); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
          <ha-icon icon="mdi:clock-outline"></ha-icon>
        </div>
        <div style="flex: 1; font-size: 17px; font-weight: 600; color: #1a1a1a;">
          ${isEdit ? '编辑定时任务' : '定时编辑 — 添加任务'}
        </div>
        <div style="cursor: pointer; color: #999; padding: 4px; border-radius: 8px;" id="timer-close-btn">
          <ha-icon icon="mdi:close" style="font-size: 20px;"></ha-icon>
        </div>
      </div>

      <div style="padding: 20px 24px;">
        <!-- Entity Selector -->
        <div class="timer-form-group">
          <div style="display: flex; align-items: center; gap: 8px; padding: 12px 14px;
                      border: 1px solid #e0e0e0; border-radius: 12px; cursor: pointer;"
               id="timer-entity-selector">
            <ha-icon icon="mdi:power-socket" style="color: #666; font-size: 20px;"></ha-icon>
            <div style="flex: 1;">
              <div style="font-size: 15px; font-weight: 500; color: #333;" id="timer-entity-name">选择设备</div>
              <div style="font-size: 12px; color: #999;" id="timer-entity-area">点击选择要控制的设备</div>
            </div>
            <ha-icon icon="mdi:chevron-down" style="color: #bbb;"></ha-icon>
          </div>
        </div>

        <!-- Main Name -->
        <div class="timer-form-group">
          <div class="timer-form-label">主实体名称</div>
          <input type="text" class="timer-form-input" id="timer-display-name"
                 placeholder="输入任务名称" value="${this._escapeHtml(this._formData.display_name)}">
        </div>

        <!-- Action & Repeat Row -->
        <div class="timer-row">
          <div class="timer-form-group">
            <div class="timer-form-label">执行动作</div>
            <select class="timer-form-select" id="timer-action">
              <option value="turn_off" ${this._formData.action === 'turn_off' ? 'selected' : ''}>关闭</option>
              <option value="turn_on" ${this._formData.action === 'turn_on' ? 'selected' : ''}>开启</option>
              <option value="toggle" ${this._formData.action === 'toggle' ? 'selected' : ''}>切换</option>
            </select>
          </div>
          <div class="timer-form-group">
            <div class="timer-form-label">重复周期</div>
            <select class="timer-form-select" id="timer-repeat">
              <option value="once" ${this._formData.repeat === 'once' ? 'selected' : ''}>单次</option>
              <option value="daily" ${this._formData.repeat === 'daily' ? 'selected' : ''}>每天</option>
              <option value="weekdays" ${this._formData.repeat === 'weekdays' ? 'selected' : ''}>工作日</option>
              <option value="weekends" ${this._formData.repeat === 'weekends' ? 'selected' : ''}>周末</option>
            </select>
          </div>
        </div>

        <!-- Time Row -->
        <div class="timer-row">
          <div class="timer-form-group">
            <div class="timer-form-label">小时</div>
            <input type="number" class="timer-form-input" id="timer-hour" min="0" max="23"
                   value="${this._formData.hour}">
          </div>
          <div class="timer-form-group">
            <div class="timer-form-label">分钟</div>
            <input type="number" class="timer-form-input" id="timer-minute" min="0" max="59"
                   value="${this._formData.minute}">
          </div>
        </div>

        <!-- Automation Name -->
        <div class="timer-form-group">
          <div class="timer-form-label" style="display: flex; justify-content: space-between;">
            <span>自动化名称</span>
            ${isEdit ? '' : '<span style="color: #22c55e; font-size: 12px; display: flex; align-items: center; gap: 4px;" id="timer-sync-badge" style="display:none;"><ha-icon icon="mdi:check-circle" style="font-size: 14px;"></ha-icon>已同步到 HA</span>'}
          </div>
          <div style="display: flex; gap: 8px;">
            <input type="text" class="timer-form-input" id="timer-auto-name"
                   placeholder="留空自动生成" value="${this._escapeHtml(this._formData.automation_name)}"
                   style="flex: 1;">
            ${isEdit ? '<div style="width: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ef4444;" id="timer-delete-btn"><ha-icon icon="mdi:delete-outline"></ha-icon></div>' : ''}
          </div>
        </div>

        <!-- Entity ID (read-only) -->
        <div class="timer-form-group">
          <div class="timer-form-label">自动化实体ID</div>
          <input type="text" class="timer-form-input" id="timer-entity-id"
                 value="${this._editingEntityId || 'automation.' + this._generateEntityId()}"
                 readonly style="background: #f8f8f8; color: #888;">
        </div>

        <!-- Custom Text -->
        <div class="timer-form-group">
          <div class="timer-form-label">副文本自定义内容</div>
          <input type="text" class="timer-form-input" id="timer-custom-text"
                 placeholder="留空自动生成" value="${this._escapeHtml(this._formData.custom_text)}">
        </div>

        <!-- Conditions (collapsible) -->
        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; padding: 10px 0;
                      cursor: pointer; color: #666; font-size: 14px;"
               id="timer-conditions-toggle">
            <ha-icon icon="mdi:filter-variant" style="font-size: 18px;"></ha-icon>
            <span style="flex: 1;">附加条件（可选）</span>
            <ha-icon icon="mdi:chevron-down" id="timer-conditions-arrow" style="font-size: 18px; transition: transform 0.2s;"></ha-icon>
          </div>
          <div id="timer-conditions-panel" style="display: none; padding: 12px; background: #fafafa; border-radius: 10px;">
            <div style="font-size: 13px; color: #888; margin-bottom: 8px;">当前版本暂不支持条件设置，可通过 HA 自动化编辑器添加</div>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div style="padding: 0 24px 24px; display: flex; gap: 12px;">
        <button id="timer-cancel-btn" style="
          flex: 1; padding: 12px 20px; border-radius: 12px; border: 1px solid #e0e0e0;
          background: #fff; color: #666; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        ">取消</button>
        <button id="timer-save-btn" style="
          flex: 1; padding: 12px 20px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: #fff; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(245,158,11,0.3);
        ">保存</button>
      </div>
    `;
  }

  _bindDialogEvents(container) {
    // Close
    container.querySelector('#timer-close-btn')?.addEventListener('click', () => this._closeDialog());
    container.querySelector('#timer-cancel-btn')?.addEventListener('click', () => this._closeDialog());

    // Conditions toggle
    const conditionsToggle = container.querySelector('#timer-conditions-toggle');
    const conditionsPanel = container.querySelector('#timer-conditions-panel');
    const conditionsArrow = container.querySelector('#timer-conditions-arrow');
    conditionsToggle?.addEventListener('click', () => {
      const isOpen = conditionsPanel.style.display !== 'none';
      conditionsPanel.style.display = isOpen ? 'none' : 'block';
      conditionsArrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    // Entity selector
    container.querySelector('#timer-entity-selector')?.addEventListener('click', () => {
      this._showEntityPicker();
    });

    // Save
    container.querySelector('#timer-save-btn')?.addEventListener('click', () => this._saveAutomation());

    // Delete
    container.querySelector('#timer-delete-btn')?.addEventListener('click', () => this._deleteAutomation());

    // Auto-update name
    const displayNameInput = container.querySelector('#timer-display-name');
    const actionSelect = container.querySelector('#timer-action');
    displayNameInput?.addEventListener('input', () => this._updateAutoName());
    actionSelect?.addEventListener('change', () => this._updateAutoName());

    // Update entity name display
    if (this._formData.entity_id && this._hass) {
      const state = this._hass.states[this._formData.entity_id];
      if (state) {
        this._updateEntityDisplay(state);
      }
    }
  }

  _showEntityPicker() {
    if (!this._hass) return;
    const event = new Event('hass-more-info', { bubbles: true, composed: true });
    // Use browser prompt as simple picker, or create a custom dropdown
    const entities = Object.keys(this._hass.states)
      .filter(eid => eid.startsWith('switch.') || eid.startsWith('light.') || eid.startsWith('fan.') || eid.startsWith('climate.') || eid.startsWith('input_boolean.'));

    const entityNames = entities.map(eid => {
      const s = this._hass.states[eid];
      return `${eid} (${s.attributes?.friendly_name || eid})`;
    });

    const selected = prompt('选择设备 (输入 entity_id):\n\n示例: switch.living_room_light\n\n可用设备:\n' + entityNames.slice(0, 20).join('\n'));
    if (selected && this._hass.states[selected]) {
      this._formData.entity_id = selected;
      this._updateEntityDisplay(this._hass.states[selected]);
      this._updateAutoName();
    }
  }

  _updateEntityDisplay(state) {
    const nameEl = this._dialog?.querySelector('#timer-entity-name');
    const areaEl = this._dialog?.querySelector('#timer-entity-area');
    if (nameEl) nameEl.textContent = state.attributes?.friendly_name || state.entity_id;
    if (areaEl) areaEl.textContent = state.entity_id;
  }

  _updateAutoName() {
    const displayName = this._dialog?.querySelector('#timer-display-name')?.value || '';
    const action = this._dialog?.querySelector('#timer-action')?.value || 'turn_off';
    const actionText = { turn_on: '开启', turn_off: '关闭', toggle: '切换' }[action] || '执行';

    if (!displayName) return;

    const autoName = `${actionText}${displayName}`;
    const entityId = 'automation.' + this._pinyin(autoName);

    const autoNameInput = this._dialog?.querySelector('#timer-auto-name');
    const entityIdInput = this._dialog?.querySelector('#timer-entity-id');
    if (autoNameInput && !autoNameInput.value) {
      autoNameInput.value = autoName;
    }
    if (entityIdInput && !this._editingEntityId) {
      entityIdInput.value = entityId;
    }
  }

  _generateEntityId() {
    const name = this._formData.display_name || 'timer_task';
    return this._pinyin(name);
  }

  _pinyin(str) {
    // Simple romanization for automation IDs
    const map = {
      '定': 'ding', '时': 'shi', '关': 'guan', '开': 'kai', '充': 'chong',
      '电': 'dian', '器': 'qi', '灯': 'deng', '空': 'kong', '调': 'tiao',
      '窗': 'chuang', '帘': 'lian', '插': 'cha', '座': 'zuo', '扇': 'shan',
    };
    let result = '';
    for (const char of str) {
      if (map[char]) result += map[char];
      else if (/[a-zA-Z0-9]/.test(char)) result += char.toLowerCase();
      else if (char === ' ') result += '_';
    }
    return result || 'timer_task_' + Date.now().toString(36).slice(-4);
  }

  _getEntityOptions() {
    if (!this._hass) return '';
    const domains = ['switch', 'light', 'fan', 'climate', 'input_boolean'];
    return Object.values(this._hass.states)
      .filter(s => domains.some(d => s.entity_id.startsWith(d + '.')))
      .map(s => `<option value="${s.entity_id}">${s.attributes?.friendly_name || s.entity_id}</option>`)
      .join('');
  }

  async _saveAutomation() {
    if (!this._hass) return;

    const dialog = this._dialog;
    const entityId = this._formData.entity_id || dialog?.querySelector('#timer-entity-selector')?.dataset?.entity;
    const displayName = dialog?.querySelector('#timer-display-name')?.value || '';
    const action = dialog?.querySelector('#timer-action')?.value || 'turn_off';
    const repeat = dialog?.querySelector('#timer-repeat')?.value || 'once';
    const hour = parseInt(dialog?.querySelector('#timer-hour')?.value || '0');
    const minute = parseInt(dialog?.querySelector('#timer-minute')?.value || '0');
    const autoName = dialog?.querySelector('#timer-auto-name')?.value || displayName;
    const customText = dialog?.querySelector('#timer-custom-text')?.value || '';
    const entityIdField = dialog?.querySelector('#timer-entity-id')?.value || '';

    if (!entityId) {
      alert('请选择设备');
      return;
    }

    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    // Build trigger
    const trigger = {
      platform: 'time',
      at: timeStr,
    };

    // Build condition for repeat
    let conditions = [];
    if (repeat === 'weekdays') {
      conditions.push({
        condition: 'time',
        weekday: ['mon', 'tue', 'wed', 'thu', 'fri'],
      });
    } else if (repeat === 'weekends') {
      conditions.push({
        condition: 'time',
        weekday: ['sat', 'sun'],
      });
    }

    // Build action
    const serviceMap = {
      turn_on: 'homeassistant.turn_on',
      turn_off: 'homeassistant.turn_off',
      toggle: 'homeassistant.toggle',
    };

    const automationConfig = {
      alias: autoName || displayName,
      description: customText || `定时${action === 'turn_on' ? '开启' : '关闭'} ${displayName}`,
      trigger: [trigger],
      condition: conditions.length > 0 ? conditions : [],
      action: [{
        service: serviceMap[action] || 'homeassistant.turn_off',
        target: { entity_id: entityId },
      }],
      mode: 'single',
    };

    // Add marker attribute
    automationConfig.variables = { timer_editor: true };

    try {
      if (this._editingEntityId) {
        // Update existing
        await this._hass.callService('automation', 'reload');
      }

      // Call config/automation/config/set via websocket
      const msgId = Date.now();
      const ws = this._hass.connection;

      await ws.sendMessagePromise({
        type: 'config/automation/config/set',
        automation_id: this._editingEntityId ? this._editingEntityId.replace('automation.', '') : undefined,
        config: automationConfig,
      });

      // Show synced badge
      this._synced = true;
      const badge = dialog?.querySelector('#timer-sync-badge');
      if (badge) {
        badge.style.display = 'flex';
        setTimeout(() => {
          this._closeDialog();
          this._renderAutomationList();
        }, 800);
      } else {
        this._closeDialog();
        this._renderAutomationList();
      }

      // Reload automations
      this._hass.callService('automation', 'reload');

    } catch (err) {
      console.error('Failed to save automation:', err);
      alert('保存失败: ' + (err.message || '请检查配置'));
    }
  }

  async _deleteAutomation() {
    if (!this._editingEntityId || !this._hass) return;
    if (!confirm('确定要删除这个定时任务吗？')) return;

    try {
      await this._hass.callService('automation', 'delete', {
        entity_id: this._editingEntityId,
      });
      this._closeDialog();
      this._renderAutomationList();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('删除失败');
    }
  }

  _closeDialog() {
    if (this._dialog) {
      this._dialog.style.opacity = '0';
      this._dialog.style.transition = 'opacity 0.2s';
      setTimeout(() => {
        this._dialog?.remove();
        this._dialog = null;
      }, 200);
    }
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
    }

  getCardSize() {
    return 2;
  }
}

// Register the card
customElements.define('timer-editor-card', TimerEditorCard);

// Add to card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timer-editor-card',
  name: '定时编辑器',
  description: '创建和管理定时自动化任务',
  preview: false,
});

console.info(
  '%c TIMER-EDITOR-CARD %c v1.0.0 ',
  'color: white; background: #f59e0b; font-weight: 700;',
  'color: #f59e0b; background: #fff; font-weight: 700;'
);
