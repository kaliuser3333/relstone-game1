<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>Relstone</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
:root {
  --bg: #0a0e17;
  --glass: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --accent: #6366f1;
  --accent-2: #8b5cf6;
  --green: #10b981;
  --red: #ef4444;
  --gold: #f59e0b;
  --text: #ffffff;
  --hint: #8b92a8;
}
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding: 16px 16px 100px 16px;
  overflow-x: hidden;
}
body::before {
  content: '';
  position: fixed;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background:
    radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
  z-index: -1;
  animation: bgFloat 20s ease-in-out infinite;
}
@keyframes bgFloat { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-3%, -3%); } }

.screen { width: 100%; max-width: 420px; margin: 0 auto; display: none; }
.screen.active { display: block; animation: fadeIn 0.3s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.logo {
  text-align: center;
  font-size: 38px;
  font-weight: 900;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 50%, var(--green) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
  margin: 20px 0 6px;
}
.logo-sub { text-align: center; color: var(--hint); font-size: 12px; letter-spacing: 4px; margin-bottom: 24px; text-transform: uppercase; }

.balance-card {
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 24px;
  text-align: center;
  margin-bottom: 16px;
}
.balance-label { font-size: 12px; color: var(--hint); letter-spacing: 2px; text-transform: uppercase; }
.balance {
  font-size: 42px;
  font-weight: 900;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 8px;
}
.balance-anim { animation: balancePop 0.5s; }
@keyframes balancePop { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }

.menu-btns { display: flex; gap: 10px; margin-bottom: 24px; }
.menu-btn {
  flex: 1;
  padding: 16px;
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  color: var(--text);
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
.menu-btn:active { transform: scale(0.96); }
.menu-btn.primary { background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%); border-color: transparent; }

.section-title { color: var(--hint); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin: 24px 0 12px; padding-left: 8px; }

.game-card {
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}
.game-card:active { transform: scale(0.98); }
.game-icon {
  font-size: 36px;
  width: 60px; height: 60px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
  border-radius: 16px;
}
.game-info { flex: 1; }
.game-name { font-size: 17px; font-weight: 800; }
.game-desc { font-size: 13px; color: var(--hint); margin-top: 3px; }

.top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.back-btn {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  color: var(--text);
  padding: 10px 18px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.top-balance {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.panel {
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 16px;
}
.input-row { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.input-row label { color: var(--hint); font-size: 13px; min-width: 70px; font-weight: 600; }
.input-field {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px;
  color: var(--text);
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;
  text-align: center;
}
.input-field:focus { outline: none; border-color: var(--accent); }

.slider { width: 100%; -webkit-appearance: none; height: 6px; background: rgba(0, 0, 0, 0.4); border-radius: 3px; outline: none; margin: 12px 0; }
.slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; background: linear-gradient(135deg, var(--accent), var(--accent-2)); border-radius: 50%; cursor: pointer; }
.slider-info { display: flex; justify-content: space-between; font-size: 12px; color: var(--hint); margin-top: 8px; }

.btn {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 16px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  color: white;
}
.btn:active { transform: scale(0.98); }
.btn.green { background: linear-gradient(135deg, var(--green) 0%, #059669 100%); }
.btn.red { background: linear-gradient(135deg, var(--red) 0%, #b91c1c 100%); }
.btn.small { padding: 10px 14px; font-size: 13px; width: auto; }

.status { text-align: center; margin: 14px 0; font-size: 14px; min-height: 20px; font-weight: 600; color: #a5b4fc; }

.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px; }
.tile {
  aspect-ratio: 1;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
}
.tile:active { transform: scale(0.92); }
.tile.mine { background: linear-gradient(135deg, rgba(239,68,68,0.3), rgba(220,38,38,0.5)); border-color: rgba(239,68,68,0.6); }
.tile.diamond { background: linear-gradient(135deg, rgba(59,130,246,0.3), rgba(99,102,241,0.5)); border-color: rgba(59,130,246,0.6); }
.tile.revealed-mine { opacity: 0.7; }
.tile.dimmed { opacity: 0.3; }

.card-display {
  background: var(--glass);
  border: 2px solid var(--glass-border);
  border-radius: 24px;
  padding: 50px;
  text-align: center;
  font-size: 80px;
  font-weight: 900;
  background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
}
.choice-row { display: flex; gap: 10px; margin-bottom: 16px; }
.choice {
  flex: 1;
  padding: 22px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  text-align: center;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
}
.choice:active { transform: scale(0.96); border-color: var(--accent); }

.bottom-nav {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 420px;
  background: rgba(19, 24, 38, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 8px;
  display: flex;
  z-index: 1000;
}
.nav-item {
  flex: 1;
  padding: 12px 4px;
  text-align: center;
  border-radius: 16px;
  cursor: pointer;
  color: var(--hint);
  font-size: 11px;
  font-weight: 600;
}
.nav-item .nav-icon { font-size: 22px; display: block; margin-bottom: 2px; }
.nav-item.active { background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3)); color: white; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: none;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
}
.modal-overlay.active { display: flex; }
.modal {
  background: #131826;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  width: 100%;
  max-width: 420px;
  padding: 24px 20px 32px;
  border: 1px solid var(--glass-border);
  border-bottom: none;
  animation: slideUp 0.3s;
  max-height: 90vh;
  overflow-y: auto;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-handle { width: 40px; height: 4px; background: var(--glass-border); border-radius: 2px; margin: 0 auto 20px; }
.modal-title { font-size: 22px; font-weight: 800; margin-bottom: 20px; text-align: center; }

.amount-display {
  text-align: center;
  font-size: 42px;
  font-weight: 900;
  background: linear-gradient(135deg, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 16px 0 20px;
}
.quick-amounts { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.quick-amount {
  flex: 1;
  min-width: 70px;
  padding: 12px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  text-align: center;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
}
.quick-amount:active { background: rgba(99, 102, 241, 0.2); }

.method-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.method {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--glass);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  cursor: pointer;
}
.method.active { border-color: var(--accent); background: rgba(99, 102, 241, 0.15); }
.method-icon { font-size: 28px; }
.method-info { flex: 1; }
.method-name { font-weight: 800; font-size: 15px; }
.method-desc { font-size: 12px; color: var(--hint); margin-top: 2px; }

.bank-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
.bank {
  padding: 16px;
  background: var(--glass);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
}
.bank.active { border-color: var(--accent); background: rgba(99, 102, 241, 0.15); }
.bank-logo { font-size: 24px; margin-bottom: 4px; }
.bank-name { font-size: 12px; font-weight: 700; }

.form-group { margin-bottom: 14px; }
.form-label { font-size: 12px; color: var(--hint); margin-bottom: 6px; font-weight: 600; padding-left: 4px; }
.form-input {
  width: 100%;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  color: var(--text);
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
}
.form-input:focus { outline: none; border-color: var(--accent); }
.form-input::placeholder { color: var(--hint); font-weight: 400; }

.history-list { display: flex; flex-direction: column; gap: 10px; }
.history-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}
.history-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 20px; }
.history-icon.in { background: rgba(16, 185, 129, 0.2); }
.history-icon.out { background: rgba(239, 68, 68, 0.2); }
.history-info { flex: 1; }
.history-title { font-weight: 700; font-size: 14px; }
.history-date { font-size: 12px; color: var(--hint); margin-top: 2px; }
.history-amount { font-weight: 800; font-size: 15px; }
.history-amount.plus { color: var(--green); }
.history-amount.minus { color: var(--red); }

.profile-header { text-align: center; padding: 20px 0; }
.profile-avatar {
  width: 90px; height: 90px;
  border-radius: 50%;
  margin: 0 auto 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  display: flex; align-items: center; justify-content: center;
  font-size: 40px;
  font-weight: 900;
}
.profile-name { font-size: 22px; font-weight: 800; }
.profile-id { font-size: 13px; color: var(--hint); margin-top: 4px; }
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
.stat-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}
.stat-value { font-size: 22px; font-weight: 900; color: #a5b4fc; }
.stat-label { font-size: 12px; color: var(--hint); margin-top: 4px; }

/* ===== АДМИНКА ===== */
.admin-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--gold), #d97706);
  color: #000;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1px;
  margin-left: 8px;
}
.admin-stat {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 10px;
}
.admin-stat-label { font-size: 12px; color: var(--hint); }
.admin-stat-value { font-size: 24px; font-weight: 900; color: #a5b4fc; margin-top: 4px; }
.tabs-row {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.tab-btn {
  padding: 10px 16px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.tab-btn.active { background: linear-gradient(135deg, var(--accent), var(--accent-2)); border-color: transparent; }

.withdrawal-item {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 10px;
}
.withdrawal-item.pending { border-color: var(--gold); }
.withdrawal-item.done { opacity: 0.6; }
.withdrawal-item.rejected { opacity: 0.5; border-color: var(--red); }
.withdrawal-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
.withdrawal-row b { color: #a5b4fc; }
.withdrawal-actions { display: flex; gap: 8px; margin-top: 10px; }

.setting-row {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
}
.setting-label { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
.setting-desc { font-size: 11px; color: var(--hint); margin-bottom: 8px; }
.setting-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text);
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
}
.setting-input:focus { outline: none; border-color: var(--accent); }

/* Эффекты */
@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); } 20%, 40%, 60%, 80% { transform: translateX(8px); } }
.shake { animation: shake 0.5s; }
@keyframes flashRed { 0% { background-color: var(--bg); } 50% { background-color: #3a0f0f; } 100% { background-color: var(--bg); } }
.flash-red { animation: flashRed 0.4s; }
@keyframes flashGreen { 0% { background-color: var(--bg); } 50% { background-color: #0a2e1f; } 100% { background-color: var(--bg); } }
.flash-green { animation: flashGreen 0.4s; }
.flying-emoji { position: fixed; font-size: 32px; pointer-events: none; z-index: 9999; animation: flyUp 1.2s ease-out forwards; }
@keyframes flyUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-200px) scale(1.5); opacity: 0; } }
@keyframes dangerPulse { 0%, 100% { box-shadow: inset 0 0 100px rgba(239,68,68,0.2); } 50% { box-shadow: inset 0 0 200px rgba(239,68,68,0.5); } }
.danger-mode { animation: dangerPulse 1.5s infinite; }
.streak {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 900;
  font-size: 18px;
  color: white;
  z-index: 10000;
  animation: streakPop 0.3s;
}
@keyframes streakPop { 0% { transform: translateX(-50%) scale(0.5); opacity: 0; } 100% { transform: translateX(-50%) scale(1); opacity: 1; } }
.success-check { text-align: center; font-size: 70px; margin: 20px 0; animation: checkPop 0.5s; }
@keyframes checkPop { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
</style>
</head>
<body>

<!-- ГЛАВНАЯ -->
<div class="screen active" id="screen-menu">
  <div class="logo">RELSTONE <span id="admin-badge-slot"></span></div>
  <div class="logo-sub">casino</div>
  <div class="balance-card">
    <div class="balance-label">Баланс</div>
    <div class="balance" id="menu-balance">0 ₽</div>
  </div>
  <div class="menu-btns">
    <button class="menu-btn primary" onclick="openDeposit()">💵 Пополнить</button>
    <button class="menu-btn" onclick="openWithdraw()">🏦 Вывести</button>
  </div>
  <div class="section-title">Игры</div>
  <div class="game-card" onclick="openGame('mines')">
    <div class="game-icon">💣</div>
    <div class="game-info">
      <div class="game-name">МИНЫ</div>
      <div class="game-desc">Открывай клетки, избегай мин</div>
    </div>
  </div>
  <div class="game-card" onclick="openGame('hl')">
    <div class="game-icon">🎴</div>
    <div class="game-info">
      <div class="game-name">БОЛЬШЕ / МЕНЬШЕ</div>
      <div class="game-desc">Угадай карту — забери всё</div>
    </div>
  </div>
</div>

<!-- ИСТОРИЯ -->
<div class="screen" id="screen-history">
  <div class="logo" style="font-size:28px; margin-top:10px;">История</div>
  <div class="logo-sub" style="margin-bottom:20px;">Транзакции</div>
  <div class="history-list" id="history-list">
    <div style="text-align:center; color:var(--hint); padding:40px 0;">Пока нет операций</div>
  </div>
</div>

<!-- ПРОФИЛЬ -->
<div class="screen" id="screen-profile">
  <div class="profile-header">
    <div class="profile-avatar" id="profile-avatar">?</div>
    <div class="profile-name" id="profile-name">Игрок</div>
    <div class="profile-id" id="profile-id">ID: —</div>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value" id="stat-games">0</div><div class="stat-label">Игр сыграно</div></div>
    <div class="stat-card"><div class="stat-value" id="stat-wins">0</div><div class="stat-label">Побед</div></div>
  </div>
</div>

<!-- АДМИНКА -->
<div class="screen" id="screen-admin">
  <div class="logo" style="font-size:28px; margin-top:10px;">Админ-панель <span class="admin-badge">ADMIN</span></div>
  <div class="logo-sub" style="margin-bottom:20px;">Управление</div>

  <div class="tabs-row">
    <div class="tab-btn active" data-atab="dashboard" onclick="switchAdminTab('dashboard')">📊 Дашборд</div>
    <div class="tab-btn" data-atab="withdrawals" onclick="switchAdminTab('withdrawals')">📤 Выводы</div>
    <div class="tab-btn" data-atab="settings" onclick="switchAdminTab('settings')">⚙️ Настройки</div>
    <div class="tab-btn" data-atab="users" onclick="switchAdminTab('users')">👤 Игроки</div>
  </div>

  <div id="admin-dashboard">
    <div class="admin-stat"><div class="admin-stat-label">Всего игроков</div><div class="admin-stat-value" id="ad-users">—</div></div>
    <div class="admin-stat"><div class="admin-stat-label">Общий баланс</div><div class="admin-stat-value" id="ad-balance">—</div></div>
    <div class="admin-stat"><div class="admin-stat-label">Пополнено всего</div><div class="admin-stat-value" id="ad-deposited">—</div></div>
    <div class="admin-stat"><div class="admin-stat-label">Выведено всего</div><div class="admin-stat-value" id="ad-withdrawn">—</div></div>
    <div class="admin-stat"><div class="admin-stat-label">Заявок в ожидании</div><div class="admin-stat-value" id="ad-pending">—</div></div>
  </div>

  <div id="admin-withdrawals" style="display:none;">
    <button class="btn small" onclick="loadAdminWithdrawals()" style="margin-bottom:12px;">🔄 Обновить</button>
    <div id="withdrawals-list"></div>
  </div>

  <div id="admin-settings" style="display:none;">
    <button class="btn small green" onclick="saveAdminSettings()" style="margin-bottom:12px;">💾 Сохранить всё</button>
    <div id="settings-list"></div>
  </div>

  <div id="admin-users" style="display:none;">
    <div class="form-group">
      <div class="form-label">Найти игрока по Telegram ID</div>
      <input type="number" class="form-input" id="admin-search-id" placeholder="Например: 123456789">
    </div>
    <button class="btn" onclick="searchUser()">Найти</button>
    <div id="user-result" style="margin-top:16px;"></div>
  </div>
</div>

<!-- МИНЫ -->
<div class="screen" id="screen-mines">
  <div class="top-bar">
    <button class="back-btn" onclick="goMenu()">‹ Назад</button>
    <div class="top-balance" id="mines-balance">0 ₽</div>
  </div>
  <div class="panel">
    <div class="input-row"><label>Ставка</label><input type="number" class="input-field" id="mines-bet-input" value="100" min="10"></div>
    <div class="input-row"><label>Мины</label><input type="number" class="input-field" id="mines-count-input" value="3" min="1" max="24"></div>
  </div>
  <div class="grid" id="grid"></div>
  <div class="status" id="mines-status"></div>
  <button class="btn" id="mines-action" onclick="minesAction()">НАЧАТЬ ИГРУ</button>
</div>

<!-- БОЛЬШЕ/МЕНЬШЕ -->
<div class="screen" id="screen-hl">
  <div class="top-bar">
    <button class="back-btn" onclick="goMenu()">‹ Назад</button>
    <div class="top-balance" id="hl-balance">0 ₽</div>
  </div>
  <div class="panel">
    <div class="input-row"><label>Ставка</label><input type="number" class="input-field" id="hl-bet-input" value="100" min="10"></div>
    <div style="color:var(--hint); font-size:13px; margin-bottom:6px; font-weight:600;">Шанс угадать: <b id="hl-chance-label" style="color:#a5b4fc;">50%</b></div>
    <input type="range" class="slider" id="hl-chance" min="10" max="90" value="50" oninput="updateChance()">
    <div class="slider-info"><span>x1.1 (безопасно)</span><span>x10 (риск)</span></div>
  </div>
  <div class="card-display" id="hl-card">?</div>
  <div class="choice-row">
    <div class="choice" onclick="hlGuess('less')">⬇️ МЕНЬШЕ</div>
    <div class="choice" onclick="hlGuess('more')">⬆️ БОЛЬШЕ</div>
  </div>
  <div class="status" id="hl-status"></div>
</div>

<!-- НИЖНЯЯ НАВИГАЦИЯ -->
<div class="bottom-nav" id="bottom-nav">
  <div class="nav-item active" data-nav="menu" onclick="switchNav('menu')"><span class="nav-icon">🏠</span>Главная</div>
  <div class="nav-item" data-nav="history" onclick="switchNav('history')"><span class="nav-icon">📋</span>История</div>
  <div class="nav-item" data-nav="profile" onclick="switchNav('profile')"><span class="nav-icon">👤</span>Профиль</div>
  <div class="nav-item" data-nav="admin" onclick="switchNav('admin')" id="nav-admin" style="display:none;"><span class="nav-icon">👑</span>Админ</div>
</div>

<!-- МОДАЛКА ПОПОЛНЕНИЯ -->
<div class="modal-overlay" id="modal-deposit">
  <div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">💵 Пополнение</div>
    <div class="amount-display" id="deposit-amount">500 ₽</div>
    <div class="quick-amounts">
      <div class="quick-amount" onclick="setDepositAmount(100)">100 ₽</div>
      <div class="quick-amount" onclick="setDepositAmount(500)">500 ₽</div>
      <div class="quick-amount" onclick="setDepositAmount(1000)">1 000 ₽</div>
      <div class="quick-amount" onclick="setDepositAmount(5000)">5 000 ₽</div>
    </div>
    <div class="form-group">
      <div class="form-label">Сумма пополнения</div>
      <input type="number" class="form-input" id="deposit-manual" placeholder="Введите сумму" oninput="syncDepositAmount(this.value)">
    </div>
    <div class="form-label" style="margin-bottom:10px; padding-left:4px;">Способ оплаты</div>
    <div class="method-list">
      <div class="method active" data-method="crypto" onclick="selectDepositMethod('crypto')">
        <div class="method-icon">₿</div>
        <div class="method-info"><div class="method-name">Криптовалюта</div><div class="method-desc">USDT, TON, BTC</div></div>
      </div>
      <div class="method" data-method="card" onclick="selectDepositMethod('card')">
        <div class="method-icon">💳</div>
        <div class="method-info"><div class="method-name">Банковская карта</div><div class="method-desc">Через P2P</div></div>
      </div>
    </div>
    <button class="btn green" onclick="confirmDeposit()">ПОПОЛНИТЬ</button>
  </div>
</div>

<!-- МОДАЛКА ВЫВОДА -->
<div class="modal-overlay" id="modal-withdraw">
  <div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">🏦 Вывод средств</div>
    <div class="amount-display" id="withdraw-amount">500 ₽</div>
    <div class="quick-amounts">
      <div class="quick-amount" onclick="setWithdrawAmount(500)">500 ₽</div>
      <div class="quick-amount" onclick="setWithdrawAmount(1000)">1 000 ₽</div>
      <div class="quick-amount" onclick="setWithdrawAmount(5000)">5 000 ₽</div>
      <div class="quick-amount" onclick="setWithdrawAmount(balance)">Всё</div>
    </div>
    <div class="form-group">
      <div class="form-label">Сумма вывода</div>
      <input type="number" class="form-input" id="withdraw-manual" placeholder="Введите сумму" oninput="syncWithdrawAmount(this.value)">
    </div>
    <div class="form-label" style="margin-bottom:10px; padding-left:4px;">Банк</div>
    <div class="bank-grid">
      <div class="bank active" data-bank="sber" onclick="selectBank('sber')"><div class="bank-logo">🟢</div><div class="bank-name">Сбербанк</div></div>
      <div class="bank" data-bank="tinkoff" onclick="selectBank('tinkoff')"><div class="bank-logo">🟡</div><div class="bank-name">Тинькофф</div></div>
      <div class="bank" data-bank="alfa" onclick="selectBank('alfa')"><div class="bank-logo">🔴</div><div class="bank-name">Альфа</div></div>
      <div class="bank" data-bank="vtb" onclick="selectBank('vtb')"><div class="bank-logo">🔵</div><div class="bank-name">ВТБ</div></div>
      <div class="bank" data-bank="sbp" onclick="selectBank('sbp')"><div class="bank-logo">⚡</div><div class="bank-name">СБП</div></div>
      <div class="bank" data-bank="other" onclick="selectBank('other')"><div class="bank-logo">🏦</div><div class="bank-name">Другой</div></div>
    </div>
    <div class="form-group"><div class="form-label">Номер карты или телефона</div><input type="text" class="form-input" id="withdraw-card" placeholder="0000 0000 0000 0000"></div>
    <div class="form-group"><div class="form-label">ФИО получателя</div><input type="text" class="form-input" id="withdraw-name" placeholder="Иванов Иван Иванович"></div>
    <button class="btn green" onclick="confirmWithdraw()">ВЫВЕСТИ</button>
  </div>
</div>

<!-- МОДАЛКА УСПЕХА -->
<div class="modal-overlay" id="modal-success">
  <div class="modal">
    <div class="modal-handle"></div>
    <div class="success-check">✅</div>
    <div class="modal-title" id="success-title">Успешно!</div>
    <div style="text-align:center; color:var(--hint); margin-bottom:24px;" id="success-text"></div>
    <button class="btn" onclick="closeModal('modal-success')">ОК</button>
  </div>
</div>

<script>
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = 'https://relstone-game1.onrender.com';
const userId = tg.initDataUnsafe?.user?.id || 0;
const userName = tg.initDataUnsafe?.user?.first_name || 'Игрок';

let balance = 0;
let isAdmin = false;
let settings = {};
let history = JSON.parse(localStorage.getItem('history') || '[]');
let stats = JSON.parse(localStorage.getItem('stats') || '{"games":0,"wins":0}');

function fmt(n) { return Number(n).toLocaleString('ru-RU') + ' ₽'; }

function updateBalance() {
  document.getElementById('menu-balance').textContent = fmt(balance);
  document.getElementById('mines-balance').textContent = fmt(balance);
  document.getElementById('hl-balance').textContent = fmt(balance);
}

function animateBalance() {
  const el = document.getElementById('menu-balance');
  el.classList.add('balance-anim');
  setTimeout(() => el.classList.remove('balance-anim'), 500);
}

async function loadBalance() {
  if (!userId) { balance = 10000; updateBalance(); return; }
  try {
    const res = await fetch(`${API_URL}/api/balance/${userId}`);
    const data = await res.json();
    balance = data.balance || 0;
    updateBalance();
  } catch (e) { console.error(e); }
}

async function loadSettings() {
  try {
    const res = await fetch(`${API_URL}/api/settings`);
    settings = await res.json();
  } catch (e) { settings = {}; }
}

async function checkAdmin() {
  if (!userId) return;
  try {
    const res = await fetch(`${API_URL}/api/admin/check/${userId}`);
    const data = await res.json();
    isAdmin = data.isAdmin;
    if (isAdmin) {
      document.getElementById('nav-admin').style.display = 'block';
      document.getElementById('admin-badge-slot').innerHTML = '<span class="admin-badge">ADMIN</span>';
    }
  } catch (e) {}
}

async function apiBet(amount) {
  const res = await fetch(`${API_URL}/api/bet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount })
  });
  const data = await res.json();
  if (data.success) { balance = data.balance; updateBalance(); return true; }
  return false;
}

async function apiWin(amount) {
  const res = await fetch(`${API_URL}/api/win`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount })
  });
  const data = await res.json();
  if (data.success) { balance = data.balance; updateBalance(); animateBalance(); }
}

// ===== ИСТОРИЯ =====
function addHistory(type, title, amount) {
  history.unshift({ type, title, amount, date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) });
  if (history.length > 50) history.pop();
  localStorage.setItem('history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (history.length === 0) {
    list.innerHTML = '<div style="text-align:center; color:var(--hint); padding:40px 0;">Пока нет операций</div>';
    return;
  }
  list.innerHTML = history.map(h => `
    <div class="history-item">
      <div class="history-icon ${h.type === 'in' ? 'in' : 'out'}">${h.type === 'in' ? '↓' : '↑'}</div>
      <div class="history-info"><div class="history-title">${h.title}</div><div class="history-date">${h.date}</div></div>
      <div class="history-amount ${h.type === 'in' ? 'plus' : 'minus'}">${h.type === 'in' ? '+' : '-'}${fmt(h.amount)}</div>
    </div>
  `).join('');
}

// ===== НАВИГАЦИЯ =====
function switchNav(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  document.querySelector(`.nav-item[data-nav="${name}"]`).classList.add('active');
  if (name === 'history') renderHistory();
  if (name === 'profile') renderProfile();
  if (name === 'menu') loadBalance();
  if (name === 'admin') loadAdminDashboard();
}

function renderProfile() {
  document.getElementById('profile-avatar').textContent = userName.charAt(0).toUpperCase();
  document.getElementById('profile-name').textContent = userName;
  document.getElementById('profile-id').textContent = 'ID: ' + userId;
  document.getElementById('stat-games').textContent = stats.games;
  document.getElementById('stat-wins').textContent = stats.wins;
}

function saveStats() { localStorage.setItem('stats', JSON.stringify(stats)); }

// ===== МОДАЛКИ =====
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
});

// ===== ПОПОЛНЕНИЕ =====
let depositAmount = 500;
let depositMethod = 'crypto';

function openDeposit() { depositAmount = 500; updateDepositUI(); openModal('modal-deposit'); }
function setDepositAmount(v) { depositAmount = v; updateDepositUI(); }
function syncDepositAmount(v) { const n = parseInt(v); if (!isNaN(n)) depositAmount = n; document.getElementById('deposit-amount').textContent = fmt(depositAmount); }
function updateDepositUI() {
  document.getElementById('deposit-amount').textContent = fmt(depositAmount);
  document.getElementById('deposit-manual').value = '';
}
function selectDepositMethod(m) {
  depositMethod = m;
  document.querySelectorAll('#modal-deposit .method').forEach(el => el.classList.toggle('active', el.dataset.method === m));
}

async function confirmDeposit() {
  if (depositAmount < 100) { tg.showAlert('Минимум 100 ₽'); return; }
  try {
    const res = await fetch(`${API_URL}/api/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amountRub: depositAmount })
    });
    const data = await res.json();
    if (data.payUrl) {
      addHistory('out', 'Пополнение (в процессе)', depositAmount);
      closeModal('modal-deposit');
      tg.openLink(data.payUrl);
    } else tg.showAlert('Ошибка: ' + (data.error || 'неизвестно'));
  } catch (e) { tg.showAlert('Сервер не отвечает'); }
}

// ===== ВЫВОД =====
let withdrawAmount = 500;
let withdrawBank = 'sber';

function openWithdraw() { withdrawAmount = 500; updateWithdrawUI(); openModal('modal-withdraw'); }
function setWithdrawAmount(v) { withdrawAmount = Math.min(v, balance); updateWithdrawUI(); }
function syncWithdrawAmount(v) { const n = parseInt(v); if (!isNaN(n)) withdrawAmount = n; document.getElementById('withdraw-amount').textContent = fmt(withdrawAmount); }
function updateWithdrawUI() {
  document.getElementById('withdraw-amount').textContent = fmt(withdrawAmount);
  document.getElementById('withdraw-manual').value = '';
}
function selectBank(b) {
  withdrawBank = b;
  document.querySelectorAll('#modal-withdraw .bank').forEach(el => el.classList.toggle('active', el.dataset.bank === b));
}

async function confirmWithdraw() {
  if (withdrawAmount < 100) { tg.showAlert('Минимум 100 ₽'); return; }
  if (withdrawAmount > balance) { tg.showAlert('Недостаточно средств'); return; }
  const card = document.getElementById('withdraw-card').value.trim();
  const name = document.getElementById('withdraw-name').value.trim();
  if (!card) { tg.showAlert('Введите номер карты'); return; }
  if (!name) { tg.showAlert('Введите ФИО'); return; }
  try {
    const res = await fetch(`${API_URL}/api/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amountRub: withdrawAmount, bank: withdrawBank, card, name })
    });
    const data = await res.json();
    if (data.success) {
      addHistory('out', `Вывод (${withdrawBank})`, withdrawAmount);
      balance -= withdrawAmount;
      updateBalance();
      closeModal('modal-withdraw');
      document.getElementById('success-title').textContent = 'Заявка создана!';
      document.getElementById('success-text').textContent = `Вывод ${fmt(withdrawAmount)} будет обработан в течение 24 часов`;
      openModal('modal-success');
    } else tg.showAlert(data.error || 'Ошибка');
  } catch (e) { tg.showAlert('Сервер не отвечает'); }
}

// ===== ЭФФЕКТЫ =====
function shakeScreen() { document.body.classList.add('shake'); setTimeout(() => document.body.classList.remove('shake'), 500); }
function flash(color) {
  const cls = color === 'red' ? 'flash-red' : 'flash-green';
  document.body.classList.add(cls);
  setTimeout(() => document.body.classList.remove(cls), 400);
}
function emojiBurst(emoji, count = 5, x = null, y = null) {
  const startX = x || window.innerWidth / 2;
  const startY = y || window.innerHeight / 2;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'flying-emoji';
    el.textContent = emoji;
    el.style.left = (startX + (Math.random() - 0.5) * 200) + 'px';
    el.style.top = startY + 'px';
    el.style.animationDelay = (i * 0.08) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}
function showStreak(count) {
  const old = document.querySelector('.streak');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'streak';
  el.textContent = `🔥 СЕРИЯ x${count}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}
function setDanger(on) {
  if (on) document.body.classList.add('danger-mode');
  else document.body.classList.remove('danger-mode');
}

function openGame(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  updateBalance();
  if (name === 'mines') buildGrid();
}

function goMenu() { switchNav('menu'); }
function setStatus(game, text) { document.getElementById(game + '-status').textContent = text; }

// ===== МИНЫ =====
let minesActive = false;
let minesList = [];
let minesRevealed = [];
let minesCurrentWin = 0;
let minesBetAmount = 0;
let minesTotal = 0;

function buildGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.index = i;
    tile.onclick = () => clickTile(i);
    grid.appendChild(tile);
  }
}

function minesAction() { if (!minesActive) startMines(); else cashoutMines(); }

async function startMines() {
  minesBetAmount = parseInt(document.getElementById('mines-bet-input').value);
  minesTotal = parseInt(document.getElementById('mines-count-input').value);

  const maxMines = parseInt(settings['mines.max_mines'] || 24);
  const minBet = parseInt(settings['mines.min_bet'] || 10);

  if (isNaN(minesBetAmount) || minesBetAmount < minBet) { setStatus('mines', `❌ Мин. ${minBet} ₽`); return; }
  if (minesBetAmount > balance) { setStatus('mines', '❌ Недостаточно'); return; }
  if (isNaN(minesTotal) || minesTotal < 1 || minesTotal > maxMines) { setStatus('mines', `❌ 1–${maxMines} мины`); return; }

  const ok = await apiBet(minesBetAmount);
  if (!ok) { setStatus('mines', '❌ Ошибка ставки'); return; }

  stats.games++;
  saveStats();

  minesActive = true;
  minesRevealed = [];
  minesCurrentWin = minesBetAmount;
  minesList = [];
  while (minesList.length < minesTotal) {
    const r = Math.floor(Math.random() * 25);
    if (!minesList.includes(r)) minesList.push(r);
  }
  buildGrid();
  setStatus('mines', '');
  const btn = document.getElementById('mines-action');
  btn.textContent = '💰 ЗАБРАТЬ ' + fmt(minesCurrentWin);
  btn.classList.add('green');
}

function clickTile(i) {
  if (!minesActive || minesRevealed.includes(i)) return;
  minesRevealed.push(i);
  const tile = document.querySelector(`.tile[data-index="${i}"]`);

  // Модификатор шанса выигрыша (админский)
  const winModifier = parseInt(settings['mines.win_chance_modifier'] || 100);
  const isRigged = Math.random() * 100 > winModifier;

  const realMine = minesList.includes(i);
  const treatAsMine = isRigged ? !realMine : realMine;

  if (treatAsMine) {
    tile.classList.add('mine');
    tile.textContent = '💣';
    minesActive = false;
    minesList.forEach(m => {
      const t = document.querySelector(`.tile[data-index="${m}"]`);
      if (t) { t.classList.add('mine'); t.textContent = '💣'; }
    });
    shakeScreen();
    flash('red');
    emojiBurst('💥', 8);
    setDanger(false);
    setStatus('mines', `💥 Проигрыш ${fmt(minesBetAmount)}`);
    addHistory('out', 'Мины — проигрыш', minesBetAmount);
    const btn = document.getElementById('mines-action');
    btn.textContent = 'НАЧАТЬ ИГРУ';
    btn.classList.remove('green');
    tg.HapticFeedback.impactOccurred('heavy');
  } else {
    tile.classList.add('diamond');
    tile.textContent = '💎';
    const rect = tile.getBoundingClientRect();
    emojiBurst('💎', 3, rect.left + rect.width / 2, rect.top);
    flash('green');
    tg.HapticFeedback.impactOccurred('light');
    const baseMult = parseFloat(settings['mines.multiplier_base'] || 1.1);
    const multiplier = baseMult + (minesTotal * 0.05);
    minesCurrentWin = Math.floor(minesCurrentWin * multiplier);
    document.getElementById('mines-action').textContent = '💰 ЗАБРАТЬ ' + fmt(minesCurrentWin);
    const revealedCount = minesRevealed.length;
    if (revealedCount >= 5) setDanger(true);
    if (revealedCount >= 3) setStatus('mines', `⚠️ Открыто: ${revealedCount} | Мин на поле: ${minesTotal}`);
  }
}

async function cashoutMines() {
  if (!minesActive) return;
  for (let i = 0; i < 25; i++) {
    if (!minesRevealed.includes(i) && !minesList.includes(i)) {
      const t = document.querySelector(`.tile[data-index="${i}"]`);
      if (t) t.classList.add('dimmed');
    }
  }
  minesList.forEach((m, idx) => {
    setTimeout(() => {
      const t = document.querySelector(`.tile[data-index="${m}"]`);
      if (t && !minesRevealed.includes(m)) {
        t.classList.add('mine', 'revealed-mine');
        t.textContent = '💣';
        tg.HapticFeedback.impactOccurred('light');
      }
    }, idx * 150);
  });
  await new Promise(r => setTimeout(r, minesList.length * 150 + 400));
  await apiWin(minesCurrentWin);
  emojiBurst('🎉', 10);
  emojiBurst('💰', 5);
  flash('green');
  setDanger(false);
  stats.wins++;
  saveStats();
  setStatus('mines', `✅ Выигрыш ${fmt(minesCurrentWin)} | Мин было: ${minesTotal}`);
  addHistory('in', 'Мины — выигрыш', minesCurrentWin);
  minesActive = false;
  const btn = document.getElementById('mines-action');
  btn.textContent = 'НАЧАТЬ ИГРУ';
  btn.classList.remove('green');
  tg.HapticFeedback.notificationOccurred('success');
}

// ===== БОЛЬШЕ / МЕНЬШЕ =====
let hlActive = false;
let hlCurrent = 0;
let hlBetAmount = 0;
let hlStreak = 0;

function updateChance() {
  const val = parseInt(document.getElementById('hl-chance').value);
  document.getElementById('hl-chance-label').textContent = val + '%';
}

function getHlMultiplier() {
  const chance = parseInt(document.getElementById('hl-chance').value) / 100;
  return (1 / chance).toFixed(2);
}

async function hlGuess(choice) {
  if (!hlActive) {
    hlBetAmount = parseInt(document.getElementById('hl-bet-input').value);
    const minBet = parseInt(settings['hl.min_bet'] || 10);
    if (isNaN(hlBetAmount) || hlBetAmount < minBet) { setStatus('hl', `❌ Мин. ${minBet} ₽`); return; }
    if (hlBetAmount > balance) { setStatus('hl', '❌ Недостаточно'); return; }

    const ok = await apiBet(hlBetAmount);
    if (!ok) { setStatus('hl', '❌ Ошибка ставки'); return; }

    stats.games++;
    saveStats();

    hlActive = true;
    hlStreak = 0;
    hlCurrent = Math.floor(Math.random() * 10) + 1;
    document.getElementById('hl-card').textContent = hlCurrent;
    setStatus('hl', `Ставка ${fmt(hlBetAmount)}. Коэф x${getHlMultiplier()}`);
    return;
  }

  const next = Math.floor(Math.random() * 10) + 1;
  document.getElementById('hl-card').textContent = next;

  const isMore = next > hlCurrent;
  const isLess = next < hlCurrent;
  let won = (choice === 'more' && isMore) || (choice === 'less' && isLess);

  // Модификатор шанса (админский)
  const winModifier = parseInt(settings['hl.win_chance_modifier'] || 100);
  if (won && Math.random() * 100 > winModifier) won = false;

  if (won) {
    hlStreak++;
    const baseMult = parseFloat(getHlMultiplier());
    const streakBonus = 1 + (hlStreak - 1) * 0.2;
    const totalMult = baseMult * streakBonus;
    const win = Math.floor(hlBetAmount * totalMult);

    await apiWin(win);
    emojiBurst('🎯', 5);
    emojiBurst('🔥', 3);
    flash('green');
    if (hlStreak >= 2) showStreak(hlStreak);
    if (hlStreak >= 3) setDanger(true);

    setStatus('hl', `🎉 x${hlStreak} подряд! +${fmt(win - hlBetAmount)} (коэф x${totalMult.toFixed(2)})`);
    tg.HapticFeedback.notificationOccurred('success');

    hlCurrent = next;
    hlBetAmount = win;
    setTimeout(() => { document.getElementById('hl-card').textContent = '?'; }, 1200);
  } else {
    hlStreak = 0;
    setDanger(false);
    shakeScreen();
    flash('red');
    emojiBurst('💀', 5);
    setStatus('hl', `💀 Не угадал! -${fmt(hlBetAmount)}`);
    addHistory('out', 'Больше/Меньше — проигрыш', hlBetAmount);
    tg.HapticFeedback.notificationOccurred('error');
    hlActive = false;
    hlCurrent = 0;
    hlBetAmount = 0;
    setTimeout(() => { document.getElementById('hl-card').textContent = '?'; }, 1500);
  }
}

// =========================================================
// ===== АДМИНКА ===========================================
// =========================================================
function switchAdminTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.toggle('active', t.dataset.atab === tab));
  document.getElementById('admin-dashboard').style.display = tab === 'dashboard' ? 'block' : 'none';
  document.getElementById('admin-withdrawals').style.display = tab === 'withdrawals' ? 'block' : 'none';
  document.getElementById('admin-settings').style.display = tab === 'settings' ? 'block' : 'none';
  document.getElementById('admin-users').style.display = tab === 'users' ? 'block' : 'none';

  if (tab === 'dashboard') loadAdminDashboard();
  if (tab === 'withdrawals') loadAdminWithdrawals();
  if (tab === 'settings') loadAdminSettings();
}

async function loadAdminDashboard() {
  try {
    const res = await fetch(`${API_URL}/api/admin/dashboard/${userId}`);
    const data = await res.json();
    if (data.error) return;
    document.getElementById('ad-users').textContent = data.users;
    document.getElementById('ad-balance').textContent = fmt(data.totalBalance);
    document.getElementById('ad-deposited').textContent = fmt(data.totalDeposited);
    document.getElementById('ad-withdrawn').textContent = fmt(data.totalWithdrawn);
    document.getElementById('ad-pending').textContent = data.pendingWithdrawals;
  } catch (e) {}
}

async function loadAdminWithdrawals() {
  const list = document.getElementById('withdrawals-list');
  list.innerHTML = '<div style="text-align:center; color:var(--hint); padding:20px;">Загрузка...</div>';
  try {
    const res = await fetch(`${API_URL}/api/admin/withdrawals/${userId}`);
    const data = await res.json();
    if (!data.withdrawals || data.withdrawals.length === 0) {
      list.innerHTML = '<div style="text-align:center; color:var(--hint); padding:40px 0;">Заявок нет</div>';
      return;
    }
    list.innerHTML = data.withdrawals.map(w => `
      <div class="withdrawal-item ${w.status}">
        <div class="withdrawal-row"><span>ID заявки:</span><b>#${w.id}</b></div>
        <div class="withdrawal-row"><span>Игрок:</span><b>${w.telegram_id}</b></div>
        <div class="withdrawal-row"><span>Сумма:</span><b>${fmt(w.amount_rub)}</b></div>
        <div class="withdrawal-row"><span>Банк:</span><b>${w.bank || '—'}</b></div>
        <div class="withdrawal-row"><span>Реквизиты:</span><b>${w.card || '—'}</b></div>
        <div class="withdrawal-row"><span>ФИО:</span><b>${w.name || '—'}</b></div>
        <div class="withdrawal-row"><span>Статус:</span><b>${w.status}</b></div>
        ${w.status === 'pending' ? `
          <div class="withdrawal-actions">
            <button class="btn small green" onclick="setWithdrawalStatus(${w.id}, 'done')">✅ Выполнено</button>
            <button class="btn small red" onclick="setWithdrawalStatus(${w.id}, 'rejected')">❌ Отклонить</button>
          </div>
        ` : ''}
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<div style="text-align:center; color:var(--red); padding:20px;">Ошибка загрузки</div>';
  }
}

async function setWithdrawalStatus(id, status) {
  try {
    const res = await fetch(`${API_URL}/api/admin/withdrawal-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: userId, withdrawalId: id, status })
    });
    const data = await res.json();
    if (data.success) {
      tg.showAlert(status === 'done' ? 'Отмечено выполненным' : 'Отклонено, баланс возвращён');
      loadAdminWithdrawals();
    }
  } catch (e) { tg.showAlert('Ошибка'); }
}

async function loadAdminSettings() {
  const list = document.getElementById('settings-list');
  list.innerHTML = 'Загрузка...';
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/${userId}`);
    const data = await res.json();
    const s = data.settings || {};
    
    const schema = [
      { key: 'mines.multiplier_base', label: 'Множитель Мины (базовый)', desc: 'Прибавка за каждую открытую клетку' },
      { key: 'mines.win_chance_modifier', label: 'Шанс выигрыша Мины (%)', desc: '100 = честно, 50 = в 2 раза реже выигрыш' },
      { key: 'mines.max_mines', label: 'Макс. мин на поле', desc: 'Ограничение для игрока' },
      { key: 'mines.min_bet', label: 'Мин. ставка Мины', desc: 'В рублях' },
      { key: 'hl.win_chance_modifier', label: 'Шанс выигрыша Больше/Меньше (%)', desc: '100 = честно' },
      { key: 'hl.min_bet', label: 'Мин. ставка Больше/Меньше', desc: 'В рублях' },
      { key: 'global.min_deposit', label: 'Мин. пополнение', desc: 'В рублях' },
      { key: 'global.min_withdraw', label: 'Мин. вывод', desc: 'В рублях' },
    ];

    list.innerHTML = schema.map(item => `
      <div class="setting-row">
        <div class="setting-label">${item.label}</div>
        <div class="setting-desc">${item.desc}</div>
        <input class="setting-input" data-key="${item.key}" value="${s[item.key] || ''}">
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = 'Ошибка загрузки';
  }
}

async function saveAdminSettings() {
  const inputs = document.querySelectorAll('#settings-list .setting-input');
  const newSettings = {};
  inputs.forEach(inp => newSettings[inp.dataset.key] = inp.value);
  try {
    const res = await fetch(`${API_URL}/api/admin/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: userId, settings: newSettings })
    });
    const data = await res.json();
    if (data.success) {
      tg.showAlert('✅ Настройки сохранены');
      await loadSettings();
    }
  } catch (e) { tg.showAlert('Ошибка'); }
}

async function searchUser() {
  const targetId = document.getElementById('admin-search-id').value.trim();
  if (!targetId) return;
  const result = document.getElementById('user-result');
  result.innerHTML = 'Поиск...';
  try {
    const res = await fetch(`${API_URL}/api/admin/user/${userId}/${targetId}`);
    const data = await res.json();
    if (data.error) { result.innerHTML = '<div style="color:var(--red);">Не найден</div>'; return; }
    const u = data.user;
    result.innerHTML = `
      <div class="withdrawal-item">
        <div class="withdrawal-row"><span>ID:</span><b>${u.telegram_id}</b></div>
        <div class="withdrawal-row"><span>Баланс:</span><b>${fmt(u.balance)}</b></div>
        <div class="withdrawal-row"><span>Забанен:</span><b>${u.banned ? 'Да' : 'Нет'}</b></div>
      </div>
      <div class="form-group">
        <div class="form-label">Изменить баланс</div>
        <input type="number" class="form-input" id="admin-new-balance" value="${u.balance}">
      </div>
      <button class="btn green" onclick="updateUserBalance(${u.telegram_id})" style="margin-bottom:8px;">💾 Сохранить баланс</button>
      <button class="btn ${u.banned ? 'green' : 'red'}" onclick="toggleBan(${u.telegram_id}, ${!u.banned})">${u.banned ? '✅ Разбанить' : '🚫 Забанить'}</button>
    `;
  } catch (e) { result.innerHTML = 'Ошибка'; }
}

async function updateUserBalance(targetId) {
  const newBalance = parseInt(document.getElementById('admin-new-balance').value);
  try {
    const res = await fetch(`${API_URL}/api/admin/user-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: userId, targetId, balance: newBalance })
    });
    const data = await res.json();
    if (data.success) tg.showAlert('✅ Баланс обновлён');
  } catch (e) { tg.showAlert('Ошибка'); }
}

async function toggleBan(targetId, banned) {
  try {
    const res = await fetch(`${API_URL}/api/admin/user-ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: userId, targetId, banned })
    });
    const data = await res.json();
    if (data.success) { tg.showAlert(banned ? 'Забанен' : 'Разбанен'); searchUser(); }
  } catch (e) { tg.showAlert('Ошибка'); }
}

// ===== СТАРТ =====
(async () => {
  await loadSettings();
  await loadBalance();
  await checkAdmin();
  buildGrid();
  updateChance();
  renderHistory();
})();
</script>
</body>
</html>
