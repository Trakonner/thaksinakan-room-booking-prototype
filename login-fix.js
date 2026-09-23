/* Login role switch fix: delegated events make all four role buttons clickable even if another prototype script fails. */
(function () {
  'use strict';

  function initRoleSwitch() {
    const buttons = document.querySelectorAll('.role-option[data-role]');
    const roleInput = document.getElementById('loginRole');
    const hint = document.getElementById('roleHint');
    const identity = document.getElementById('loginIdentity');
    const identityLabel = document.getElementById('identityLabel');
    const submit = document.querySelector('.login-submit');

    if (!buttons.length || !roleInput || !hint || !identity || !submit) return;

    const roles = {
      customer: {
        label: 'อีเมล / เบอร์โทร',
        value: 'demo@taksin.ac.th',
        button: 'เข้าสู่ระบบลูกค้า',
        title: 'เข้าสู่ระบบลูกค้า',
        description: 'ค้นหา จองห้อง และติดตามประวัติการจอง',
      },
      staff: {
        label: 'ชื่อผู้ใช้',
        value: 'staff',
        button: 'เข้าสู่ระบบเจ้าหน้าที่',
        title: 'เข้าสู่ระบบเจ้าหน้าที่',
        description: 'จัดการการจอง สลิป ลูกค้า ห้องพัก รายงาน และการแจ้งเตือน',
      },
      approver: {
        label: 'ชื่อผู้ใช้',
        value: 'approver',
        button: 'เข้าสู่ระบบผู้อนุมัติ',
        title: 'เข้าสู่ระบบผู้อนุมัติ',
        description: 'ตรวจสอบ ลงนาม และส่งต่อหนังสือขออนุมัติ',
      },
      housekeeping: {
        label: 'ชื่อผู้ใช้',
        value: 'housekeeping',
        button: 'เข้าสู่ระบบแม่บ้าน',
        title: 'เข้าสู่ระบบแม่บ้าน',
        description: 'รับงานเตรียมห้องและอัปเดตสถานะความพร้อม',
      },
    };

    function selectRole(role) {
      const info = roles[role] || roles.customer;
      roleInput.value = role;
      buttons.forEach((button) => {
        button.classList.toggle('active', button.dataset.role === role);
        button.setAttribute('aria-pressed', button.dataset.role === role ? 'true' : 'false');
      });
      identityLabel.textContent = info.label;
      identity.value = info.value;
      submit.textContent = info.button;
      hint.innerHTML = `<strong>${info.title}</strong><br>${info.description}`;
    }

    buttons.forEach((button) => {
      button.type = 'button';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        selectRole(button.dataset.role);
      });
    });

    selectRole(roleInput.value || 'customer');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoleSwitch);
  } else {
    initRoleSwitch();
  }
})();
