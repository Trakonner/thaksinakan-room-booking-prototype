/* Stable UI fallback for the prototype login screen. Loaded after script.js. */
(function () {
  'use strict';

  const profiles = {
    customer: { title: 'เข้าสู่ระบบลูกค้า', description: 'ค้นหา จองห้อง และติดตามประวัติการจอง', identity: 'demo@taksin.ac.th', name: 'Demo Customer' },
    staff: { title: 'เข้าสู่ระบบเจ้าหน้าที่', description: 'จัดการห้องพัก ห้องประชุม และรายการจอง', identity: 'staff', name: 'เจ้าหน้าที่' },
    approver: { title: 'เข้าสู่ระบบผู้อนุมัติ', description: 'ตรวจสอบและอนุมัติหนังสือ', identity: 'approver', name: 'ผู้อนุมัติ' },
    housekeeping: { title: 'เข้าสู่ระบบแม่บ้าน', description: 'อัปเดตสถานะความพร้อมของห้องพัก', identity: 'housekeeping', name: 'แม่บ้าน' }
  };

  function setRole(role) {
    const profile = profiles[role] || profiles.customer;
    const input = document.getElementById('loginRole');
    const identity = document.getElementById('loginIdentity');
    const label = document.getElementById('identityLabel');
    const hint = document.getElementById('roleHint');
    const submit = document.querySelector('.login-submit');
    if (!input || !identity || !hint || !submit) return;

    input.value = role;
    identity.value = profile.identity;
    if (label) label.textContent = role === 'customer' ? 'อีเมล / เบอร์โทร' : 'ชื่อผู้ใช้';
    hint.innerHTML = `<strong>${profile.title}</strong><br>${profile.description}`;
    submit.textContent = profile.title;
    document.querySelectorAll('.role-option').forEach((button) => {
      button.classList.toggle('active', button.dataset.role === role);
      button.setAttribute('aria-pressed', button.dataset.role === role ? 'true' : 'false');
    });
  }

  function login(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    const role = document.getElementById('loginRole')?.value || 'customer';
    const profile = profiles[role] || profiles.customer;
    const identity = document.getElementById('loginIdentity')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const valid = password === '123456' && (identity === profile.identity || (role === 'customer' && identity === 'demo@taksin.ac.th'));
    const status = document.getElementById('loginStatus');
    if (!valid) {
      if (status) { status.className = 'status-box error'; status.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'; }
      return false;
    }
    const user = { name: profile.name, email: profile.identity, role };
    localStorage.setItem('taksinaka_user', JSON.stringify(user));
    if (status) { status.className = 'status-box success'; status.textContent = 'เข้าสู่ระบบสำเร็จ'; }
    if (role === 'staff') window.location.href = 'staff.html';
    else if (role === 'approver') window.location.href = 'approver.html';
    else if (role === 'housekeeping') window.location.href = 'housekeeping.html';
    else if (typeof window.showView === 'function') window.showView('home');
    return false;
  }

  function init() {
    document.querySelectorAll('.role-option[data-role]').forEach((button) => {
      button.type = 'button';
      button.onclick = function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setRole(button.dataset.role);
        return false;
      };
    });

    const form = document.getElementById('loginForm');
    if (form) {
      form.onsubmit = login;
      form.addEventListener('submit', login, true);
    }
    setRole(document.getElementById('loginRole')?.value || 'customer');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
