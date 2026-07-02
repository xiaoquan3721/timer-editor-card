/**
 * Timer Editor Card for Home Assistant
 * A custom Lovelace card for creating time-based automations with a beautiful UI
 * Version: 1.2.1
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
      hour: 19,
      minute: 30,
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
        const trigger = this._parseTrigger(auto);
        const friendlyName = auto.attributes?.friendly_name || auto.entity_id;
        const isActive = auto.state === 'on';

        // Get target entity info (HA 2024+ uses 'actions', old uses 'action')
        const actions = this._getActions(auto);
        const action = actions[0] || {};
        const targetEntityId = action.target?.entity_id || action.entity_id || '';
        const targetState = this._hass?.states[targetEntityId];
        const targetName = targetState?.attributes?.friendly_name || targetEntityId;
        const domain = targetEntityId.split('.')[0];
        const domainIcon = { switch: 'mdi:power-socket', light: 'mdi:lightbulb-outline', fan: 'mdi:fan', climate: 'mdi:thermostat', scene: 'mdi:palette', script: 'mdi:script-text' }[domain] || 'mdi:timer-outline';

        const item = document.createElement('div');
        item.style.cssText = `
          display: flex;
          align-items: center;
          padding: 14px 16px;
          margin-bottom: 8px;
          border-radius: 12px;
          background: var(--ha-card-background, #f5f5f5);
          cursor: pointer;
          transition: background 0.2s;
        `;
        item.addEventListener('mouseenter', () => item.style.background = 'var(--state-icon-active-color, #e8e8e8)');
        item.addEventListener('mouseleave', () => item.style.background = 'var(--ha-card-background, #f5f5f5)');

        // Left: device icon
        const iconBox = document.createElement('div');
        iconBox.style.cssText = `
          width: 40px; height: 40px; border-radius: 10px;
          background: ${isActive ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'linear-gradient(135deg, #d1d5db, #9ca3af)'};
          display: flex; align-items: center; justify-content: center;
          color: white; margin-right: 12px; flex-shrink: 0;
        `;
        iconBox.innerHTML = `<ha-icon icon="${domainIcon}" style="font-size: 20px;"></ha-icon>`;

        // Middle: task info
        const info = document.createElement('div');
        info.style.cssText = 'flex: 1; min-width: 0;';
        info.innerHTML = `
          <div style="font-size: 15px; font-weight: 600; color: var(--primary-text-color, #333); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${friendlyName}</div>
          <div style="font-size: 12px; color: var(--secondary-text-color, #888); margin-top: 3px; line-height: 1.4;">${trigger}</div>
        `;

        // Right: toggle switch
        const toggleWrap = document.createElement('div');
        toggleWrap.style.cssText = 'flex-shrink: 0; margin-left: 8px;';

        const toggle = document.createElement('div');
        toggle.style.cssText = `
          width: 48px; height: 26px; border-radius: 13px; position: relative;
          background: ${isActive ? '#f59e0b' : '#d1d5db'};
          cursor: pointer; transition: background 0.2s;
        `;
        const knob = document.createElement('div');
        knob.style.cssText = `
          width: 22px; height: 22px; border-radius: 50%;
          background: white; position: absolute; top: 2px;
          left: ${isActive ? '24px' : '2px'};
          transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        `;
        toggle.appendChild(knob);

        toggleWrap.addEventListener('click', (e) => {
          e.stopPropagation();
          this._toggleAutomation(auto, toggle, knob);
        });

        toggleWrap.appendChild(toggle);

        item.appendChild(iconBox);
        item.appendChild(info);
        item.appendChild(toggleWrap);

        // Click item body to edit
        item.addEventListener('click', (e) => {
          if (e.target === toggle || e.target === knob) return;
          this._editAutomation(auto);
        });

        list.appendChild(item);
      });
    }
    this._content.appendChild(list);
  }

  async _toggleAutomation(auto, toggleEl, knobEl) {
    const newState = auto.state === 'on' ? 'off' : 'on';
    try {
      await this._hass.callService('automation', 'toggle', { entity_id: auto.entity_id });
      // Update UI immediately
      if (newState === 'on') {
        toggleEl.style.background = '#f59e0b';
        knobEl.style.left = '24px';
      } else {
        toggleEl.style.background = '#d1d5db';
        knobEl.style.left = '2px';
      }
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  }

  _getTriggers(auto) {
    // HA 2024+ uses 'triggers' (plural), older versions use 'trigger'
    return auto.attributes?.triggers || auto.attributes?.trigger || [];
  }

  _getActions(auto) {
    // HA 2024+ uses 'actions' (plural), older versions use 'action'
    return auto.attributes?.actions || auto.attributes?.action || [];
  }

  _getConditions(auto) {
    // HA 2024+ uses 'conditions' (plural), older versions use 'condition'
    return auto.attributes?.conditions || auto.attributes?.condition || [];
  }

  _getTimerAutomations() {
    if (!this._hass) return [];
    return Object.values(this._hass.states)
      .filter(s => s.entity_id.startsWith('automation.'))
      .filter(s => {
        // Show automations tagged by timer_editor, or those with time trigger
        if (s.attributes?.timer_editor === true) return true;
        const triggers = this._getTriggers(s);
        const hasTimeTrigger = triggers.some(t => t.platform === 'time' && t.at);
        if (hasTimeTrigger) return true;
        return false;
      });
  }

  _parseTrigger(auto) {
    const triggers = this._getTriggers(auto);
    const actions = this._getActions(auto);
    const action = actions[0] || {};

    if (triggers.length === 0) return '手动触发';
    const t = triggers[0];

    // Get action text
    const serviceMap = {
      'homeassistant.turn_on': '开启',
      'homeassistant.turn_off': '关闭',
      'homeassistant.toggle': '切换',
    };
    const actionText = serviceMap[action.service] || '执行';

    // Get target entity name
    const targetEntityId = action.target?.entity_id || action.entity_id || '';
    const targetState = this._hass?.states[targetEntityId];
    const targetName = targetState?.attributes?.friendly_name || '';

    if (t.platform === 'time' && t.at) {
      const parts = t.at.split(':');
      const h = parseInt(parts[0]);
      const m = parseInt(parts[1] || 0);
      const timeStr = `${h}点${m > 0 ? m + '分' : ''}`;

      const conditions = this._getConditions(auto);
      const weekdayCond = conditions.find(c => c.condition === 'time' && c.weekday);
      if (weekdayCond) {
        const dayMap = { mon: '1', tue: '2', wed: '3', thu: '4', fri: '5', sat: '6', sun: '7' };
        const days = weekdayCond.weekday.map(d => dayMap[d] || d).join('');
        const repeatText = `周${days}`;
        return `${repeatText}, ${timeStr}, ${actionText}${targetName ? ' ' + targetName : ''}`;
      }
      return `每天 ${timeStr}, ${actionText}${targetName ? ' ' + targetName : ''}`;
    }
    if (t.platform === 'time_pattern') {
      return `定时, ${actionText}`;
    }
    return '定时触发';
  }

  _openDialog() {
    this._resetForm();
    this._showDialog();
  }

  _editAutomation(auto) {
    const attrs = auto.attributes || {};
    const triggers = this._getTriggers(auto);
    const trigger = triggers[0] || {};
    const actions = this._getActions(auto);
    const action = actions[0] || {};

    let timeStr = '';
    if (typeof trigger.at === 'string') {
      timeStr = trigger.at;
    }
    const [h, m] = timeStr.split(':').map(Number);

    // Check for weekday conditions
    const conditions = this._getConditions(auto);
    const weekdayCond = conditions.find(c => c.condition === 'time' && c.weekday);
    let repeat = 'once';
    if (trigger.platform === 'time') {
      if (weekdayCond) {
        const wd = weekdayCond.weekday;
        if (wd.length === 5 && !wd.includes('sat') && !wd.includes('sun')) {
          repeat = 'weekdays';
        } else if (wd.length === 2 && wd.includes('sat') && wd.includes('sun')) {
          repeat = 'weekends';
        } else {
          repeat = 'daily';
        }
      } else {
        repeat = 'daily';
      }
    }

    this._formData = {
      entity_id: action.entity_id || action.target?.entity_id || '',
      display_name: attrs.friendly_name || '',
      action: action.service === 'homeassistant.turn_on' ? 'turn_on' : 'turn_off',
      repeat: repeat,
      hour: h || 19,
      minute: m || 30,
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
      hour: 19,
      minute: 30,
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

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) this._closeDialog();
    });

    this._bindDialogEvents(container);
    this._updateAutoName();
  }

  _buildDialogHTML() {
    const isEdit = !!this._editingEntityId;

    return `
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

        <div class="timer-form-group">
          <div class="timer-form-label">主实体名称</div>
          <input type="text" class="timer-form-input" id="timer-display-name"
                 placeholder="输入任务名称" value="${this._escapeHtml(this._formData.display_name)}">
        </div>

        <div class="timer-row">
          <div class="timer-form-group">
            <div class="timer-form-label">执行动作</div>
            <select class="timer-form-select" id="timer-action">
              <option value="turn_off" ${this._formData.action === 'turn_off' ? 'selected' : ''}>关闭</option>
              <option value="turn_on" ${this._formData.action === 'turn_on' ? 'selected' : ''}>开启</option>
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

        <div class="timer-row">
          <div class="timer-form-group">
            <div class="timer-form-label">小时 (0-23)</div>
            <input type="number" class="timer-form-input" id="timer-hour" min="0" max="23"
                   value="${this._formData.hour}">
          </div>
          <div class="timer-form-group">
            <div class="timer-form-label">分钟 (0-59)</div>
            <input type="number" class="timer-form-input" id="timer-minute" min="0" max="59"
                   value="${this._formData.minute}">
          </div>
        </div>

        <div class="timer-form-group">
          <div class="timer-form-label" style="display: flex; justify-content: space-between;">
            <span>自动化名称</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <input type="text" class="timer-form-input" id="timer-auto-name"
                   placeholder="留空自动生成" value="${this._escapeHtml(this._formData.automation_name)}"
                   style="flex: 1;">
            ${isEdit ? '<div style="width: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ef4444;" id="timer-delete-btn"><ha-icon icon="mdi:delete-outline"></ha-icon></div>' : ''}
          </div>
        </div>

        <div class="timer-form-group">
          <div class="timer-form-label">自动化实体ID</div>
          <input type="text" class="timer-form-input" id="timer-entity-id"
                 value="${this._editingEntityId || 'automation.' + this._generateEntityId()}"
                 readonly style="background: #f8f8f8; color: #888;">
        </div>
      </div>

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
    container.querySelector('#timer-close-btn')?.addEventListener('click', () => this._closeDialog());
    container.querySelector('#timer-cancel-btn')?.addEventListener('click', () => this._closeDialog());

    container.querySelector('#timer-entity-selector')?.addEventListener('click', () => {
      this._showEntityPicker();
    });

    container.querySelector('#timer-save-btn')?.addEventListener('click', () => this._saveAutomation());
    container.querySelector('#timer-delete-btn')?.addEventListener('click', () => this._deleteAutomation());

    const displayNameInput = container.querySelector('#timer-display-name');
    const actionSelect = container.querySelector('#timer-action');
    displayNameInput?.addEventListener('input', () => this._updateAutoName());
    actionSelect?.addEventListener('change', () => this._updateAutoName());

    if (this._formData.entity_id && this._hass) {
      const state = this._hass.states[this._formData.entity_id];
      if (state) {
        this._updateEntityDisplay(state);
      }
    }
  }

  _showEntityPicker() {
    if (!this._hass) return;

    const entities = Object.keys(this._hass.states)
      .filter(eid => eid.startsWith('switch.') || eid.startsWith('light.') || eid.startsWith('fan.') || eid.startsWith('climate.') || eid.startsWith('input_boolean.'));

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      padding: 16px; backdrop-filter: blur(4px);
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: #ffffff; border-radius: 16px; width: 100%; max-width: 420px;
      max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    `;

    box.innerHTML = `
      <div style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 17px; font-weight: 600; color: #1a1a1a;">选择设备</span>
        <span id="picker-close" style="cursor: pointer; color: #999; font-size: 20px;"><ha-icon icon="mdi:close"></ha-icon></span>
      </div>
      <div id="picker-list" style="padding: 8px;"></div>
    `;

    overlay.appendChild(box);
    this._dialog.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    box.querySelector('#picker-close').addEventListener('click', () => overlay.remove());

    const listEl = box.querySelector('#picker-list');
    entities.forEach(eid => {
      const s = this._hass.states[eid];
      const name = s.attributes?.friendly_name || eid;
      const domain = eid.split('.')[0];
      const icon = { switch: 'mdi:power-socket', light: 'mdi:lightbulb', fan: 'mdi:fan', climate: 'mdi:thermometer', input_boolean: 'mdi:toggle-switch' }[domain] || 'mdi:devices';
      const isOn = s.state === 'on';

      const item = document.createElement('div');
      item.style.cssText = `
        display: flex; align-items: center; padding: 12px 14px; margin-bottom: 6px;
        border-radius: 12px; cursor: pointer; transition: background 0.15s;
        background: ${isOn ? 'rgba(34,197,94,0.08)' : '#f8f8f8'};
      `;
      item.addEventListener('mouseenter', () => item.style.background = '#f0f0f0');
      item.addEventListener('mouseleave', () => item.style.background = isOn ? 'rgba(34,197,94,0.08)' : '#f8f8f8');

      item.innerHTML = `
        <div style="width: 36px; height: 36px; border-radius: 10px; background: ${isOn ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #9ca3af, #6b7280)'}; display: flex; align-items: center; justify-content: center; color: white; margin-right: 12px; flex-shrink: 0;">
          <ha-icon icon="${icon}" style="font-size: 18px;"></ha-icon>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 15px; font-weight: 500; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</div>
          <div style="font-size: 12px; color: #999; margin-top: 2px;">${eid}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        this._formData.entity_id = eid;
        this._updateEntityDisplay(s);
        this._updateAutoName();
        overlay.remove();
      });

      listEl.appendChild(item);
    });

    if (entities.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">没有找到可控设备</div>';
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
    const actionText = { turn_on: '开启', turn_off: '关闭' }[action] || '执行';

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

  async _saveAutomation() {
    if (!this._hass) return;

    const dialog = this._dialog;
    const entityId = this._formData.entity_id;
    const displayName = dialog?.querySelector('#timer-display-name')?.value || '';
    const action = dialog?.querySelector('#timer-action')?.value || 'turn_off';
    const repeat = dialog?.querySelector('#timer-repeat')?.value || 'once';
    const hour = parseInt(dialog?.querySelector('#timer-hour')?.value || '0');
    const minute = parseInt(dialog?.querySelector('#timer-minute')?.value || '0');
    const autoName = dialog?.querySelector('#timer-auto-name')?.value || displayName;

    if (!entityId) {
      alert('请选择设备');
      return;
    }

    // Show loading state on button
    const saveBtn = dialog?.querySelector('#timer-save-btn');
    if (saveBtn) {
      saveBtn.textContent = '保存中...';
      saveBtn.style.opacity = '0.7';
      saveBtn.disabled = true;
    }

    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const trigger = {
      platform: 'time',
      at: timeStr,
    };

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

    const serviceMap = {
      turn_on: 'homeassistant.turn_on',
      turn_off: 'homeassistant.turn_off',
    };

    const automationConfig = {
      alias: autoName || displayName,
      description: `定时${action === 'turn_on' ? '开启' : '关闭'} ${displayName}`,
      trigger: [trigger],
      condition: conditions.length > 0 ? conditions : [],
      action: [{
        service: serviceMap[action] || 'homeassistant.turn_off',
        target: { entity_id: entityId },
      }],
      mode: 'single',
    };

    const yamlText = this._toYaml(automationConfig);

    // Helper: fetch with timeout
    const fetchWithTimeout = (url, options, timeout = 3000) => {
      return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
      ]);
    };

    try {
      const autoId = this._editingEntityId ? this._editingEntityId.replace('automation.', '') : 'timer_' + Date.now().toString(36).slice(-6);
      let saved = false;

      // Method 1: fetchWithAuth with timeout
      if (this._hass.fetchWithAuth) {
        try {
          const resp = await fetchWithTimeout(
            `/api/config/automation/config/${autoId}`,
            { method: 'POST', body: JSON.stringify(automationConfig) },
            3000
          );
          if (resp.ok) saved = true;
        } catch (e) {
          console.log('fetchWithAuth failed:', e.message);
        }
      }

      // Method 2: standard fetch with token and timeout
      if (!saved) {
        const token = this._hass.auth?.accessToken || this._hass.auth?.data?.access_token;
        if (token) {
          try {
            const resp = await fetchWithTimeout(
              `/api/config/automation/config/${autoId}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(automationConfig),
              },
              3000
            );
            if (resp.ok) saved = true;
          } catch (e) {
            console.log('fetch failed:', e.message);
          }
        }
      }

      if (saved) {
        this._hass.callService('automation', 'reload');
        this._closeDialog();
        this._renderAutomationList();
        return;
      }

      // Fallback: show YAML copy dialog
      this._showYamlDialog(yamlText, autoName);

    } catch (err) {
      console.error('Save error:', err);
      this._showYamlDialog(yamlText, autoName);
    } finally {
      if (saveBtn) {
        saveBtn.textContent = '保存';
        saveBtn.style.opacity = '1';
        saveBtn.disabled = false;
      }
    }
  }

  _toYaml(config) {
    // Simple YAML generator
    let yaml = `- id: "${Date.now().toString().slice(-8)}"\n`;
    yaml += `  alias: "${config.alias}"\n`;
    yaml += `  description: "${config.description}"\n`;
    yaml += `  trigger:\n`;
    config.trigger.forEach(t => {
      yaml += `    - platform: ${t.platform}\n`;
      yaml += `      at: "${t.at}"\n`;
    });
    yaml += `  condition: []\n`;
    yaml += `  action:\n`;
    config.action.forEach(a => {
      yaml += `    - service: ${a.service}\n`;
      yaml += `      target:\n`;
      yaml += `        entity_id: ${a.target.entity_id}\n`;
    });
    yaml += `  mode: single\n`;
    return yaml;
  }

  _showYamlDialog(yamlText, autoName) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6); z-index: 10001;
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: #ffffff; border-radius: 16px; width: 100%; max-width: 420px;
      max-height: 80vh; overflow-y: auto;
    `;

    box.innerHTML = `
      <div style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0;">
        <div style="font-size: 17px; font-weight: 600;">保存方式</div>
        <div style="font-size: 13px; color: #888; margin-top: 4px;">API 保存失败，请手动添加以下 YAML</div>
      </div>
      <div style="padding: 16px;">
        <textarea id="yaml-output" readonly style="width: 100%; height: 200px; border: 1px solid #e0e0e0; border-radius: 10px; padding: 12px; font-family: monospace; font-size: 13px; resize: none; background: #f8f8f8;">${this._escapeHtml(yamlText)}</textarea>
        <button id="yaml-copy" style="width: 100%; margin-top: 12px; padding: 12px; border-radius: 12px; border: none; background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; font-size: 15px; font-weight: 600; cursor: pointer;">复制 YAML</button>
        <div style="font-size: 12px; color: #888; margin-top: 12px; line-height: 1.5;">
          复制后粘贴到 <b>automations.yaml</b> 文件中，然后重启 HA
        </div>
      </div>
      <div style="padding: 0 16px 16px;">
        <button id="yaml-close" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e0e0e0; background: #fff; color: #666; font-size: 15px; cursor: pointer;">关闭</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    box.querySelector('#yaml-close').addEventListener('click', () => overlay.remove());
    box.querySelector('#yaml-copy').addEventListener('click', () => {
      const textarea = box.querySelector('#yaml-output');
      textarea.select();
      document.execCommand('copy');
      alert('YAML 已复制到剪贴板');
    });
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
  '%c TIMER-EDITOR-CARD %c v1.3.1 ',
  'color: white; background: #f59e0b; font-weight: 700;',
  'color: #f59e0b; background: #fff; font-weight: 700;'
);
