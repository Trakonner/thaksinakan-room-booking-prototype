const STORAGE_KEYS = {
  user: 'taksinaka_user',
  bookings: 'taksinaka_bookings'
};

const rooms = [
  { id: 'P101', name: 'ห้องพัก 101', category: 'room', type: 'ห้องพัก', price: 1200, detail: 'ห้องพักคู่ 1-2 คน' },
  { id: 'P102', name: 'ห้องพัก 102', category: 'room', type: 'ห้องพัก', price: 1800, detail: 'ห้องพักเดี่ยว 1-2 คน' },
  { id: 'M101', name: 'ห้องประชุม M101', category: 'meeting', type: 'ห้องประชุม', price: 1500, detail: 'ห้องประชุมขนาดเล็ก 10-12 คน' },
  { id: 'M201', name: 'ห้องประชุม M201', category: 'meeting', type: 'ห้องประชุม', price: 2200, detail: 'ห้องประชุมขนาดกลาง 20-25 คน' },
  { id: 'H01', name: 'หอประชุมใหญ่', category: 'hall', type: 'หอประชุมใหญ่', price: 3500, detail: 'หอประชุมสำหรับการจัดงานใหญ่' }
];

const state = {
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null'),
  bookings: JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings) || '[]'),
  selectedRoom: rooms[0],
  selectedPayment: 'deposit'
};

const $ = (id) => document.getElementById(id);

function saveState() {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(state.bookings));
}

function setStatus(id, message, type = 'info') {
  const el = $(id);
  if (!el) return;
  el.className = 'status-box';
  if (type === 'success') el.classList.add('success');
  if (type === 'error') el.classList.add('error');
  if (type === 'info') el.classList.add('info');
  el.textContent = message;
}

function updateUserBadge() {
  const badge = $('userBadge');
  const loginButton = $('loginButton');
  const logoutButton = $('logoutButton');

  if (!badge || !loginButton || !logoutButton) return;

  if (state.user) {
    badge.textContent = `${state.user.name} (${state.user.role})`;
    loginButton.style.display = 'none';
    logoutButton.style.display = 'inline-flex';
  } else {
    badge.textContent = 'ยังไม่ได้เข้าสู่ระบบ';
    loginButton.style.display = 'inline-flex';
    logoutButton.style.display = 'none';
  }
}

function showView(view) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('active', screen.id === `screen-${view}`);
  });

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
}

function getRoleMeta(role) {
  const map = {
    customer: {
      title: 'เข้าสู่ระบบลูกค้า',
      label: 'ลูกค้า',
      description: 'ค้นหา จองห้อง และติดตามประวัติการจอง',
      email: 'demo@taksin.ac.th'
    },
    staff: {
      title: 'เข้าสู่ระบบเจ้าหน้าที่',
      label: 'เจ้าหน้าที่',
      description: 'จัดการห้องพักและห้องประชุม',
      email: 'staff@taksin.ac.th'
    },
    approver: {
      title: 'เข้าสู่ระบบผู้อนุมัติ',
      label: 'ผู้อนุมัติ',
      description: 'ตรวจสอบและอนุมัติการจอง',
      email: 'approver@taksin.ac.th'
    },
    housekeeping: {
      title: 'เข้าสู่ระบบแม่บ้าน',
      label: 'แม่บ้าน',
      description: 'ดูความพร้อมและทำความสะอาดห้อง',
      email: 'housekeeping@taksin.ac.th'
    }
  };

  return map[role] || map.customer;
}

function bindRoleSwitch() {
  const roleButtons = document.querySelectorAll('.role-option');
  const roleInput = $('loginRole');
  const hint = $('roleHint');
  const loginSubmit = document.querySelector('.login-submit');

  if (!roleButtons.length || !roleInput || !hint || !loginSubmit) return;

  const applyRole = (role) => {
    const meta = getRoleMeta(role);
    roleButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.role === role);
    });

    roleInput.value = role;
    hint.innerHTML = `<strong>${meta.title}</strong><br />${meta.description}`;
    const label = `เข้าสู่ระบบ${meta.label}`;
    loginSubmit.textContent = label;
    $('identityLabel').textContent = role === 'customer' ? 'อีเมล / เบอร์โทร' : 'ชื่อผู้ใช้ / อีเมล';
    if (role === 'customer') {
      $('loginIdentity').value = meta.email;
    } else {
      $('loginIdentity').value = meta.email;
    }
  };

  roleButtons.forEach((button) => {
    button.addEventListener('click', () => applyRole(button.dataset.role));
  });

  applyRole('customer');
}

function getPaymentOptions(room) {
  const base = Number(room.price || 0);
  if (room.category === 'room' || room.category === 'meeting') {
    return [
      { value: 'deposit', label: 'ชำระมัดจำ 30%', amount: base * 0.3, status: 'รอชำระมัดจำ' },
      { value: 'full', label: 'ชำระเต็ม 100%', amount: base, status: 'ชำระเต็มแล้ว' },
      { value: 'counter', label: 'ชำระที่เคาน์เตอร์', amount: base, status: 'รอชำระที่เคาน์เตอร์' }
    ];
  }

  return [
    { value: 'deposit', label: 'ชำระมัดจำ 30%', amount: base * 0.3, status: 'รอชำระมัดจำ' },
    { value: 'full', label: 'ชำระเต็ม 100%', amount: base, status: 'ชำระเต็มแล้ว' }
  ];
}

function renderInvoice(room, paymentMethod = 'deposit') {
  const invoice = $('invoiceContainer');
  if (!invoice) return;

  const options = getPaymentOptions(room);
  const selected = options.find((item) => item.value === paymentMethod) || options[0];
  const total = Number(room.price || 0);

  invoice.innerHTML = `
    <div class="invoice-box">
      <div class="invoice-header">
        <strong>${room.name}</strong>
        <span>${room.type}</span>
      </div>
      <div class="invoice-line"><span>ราคาห้อง</span><strong>${total.toLocaleString()} บาท</strong></div>
      <div class="invoice-line"><span>วิธีชำระ</span><strong>${selected.label}</strong></div>
      <div class="invoice-line"><span>ยอดที่ต้องชำระ</span><strong>${selected.amount.toLocaleString()} บาท</strong></div>
      <div class="invoice-line"><span>สถานะ</span><strong class="status-pill">${selected.status}</strong></div>
    </div>
  `;
}

function renderBookingForm() {
  const container = $('bookingFormContainer');
  if (!container) return;

  const room = state.selectedRoom || rooms[0];
  const options = getPaymentOptions(room);
  const paymentMarkup = options.map((option) => `
    <button type="button"
      class="payment-option ${state.selectedPayment === option.value ? 'selected' : ''}"
      data-payment="${option.value}">
      <span>${option.label}</span>
      <strong>${option.amount.toLocaleString()} บาท</strong>
    </button>
  `).join('');

  container.innerHTML = `
    <form id="bookingForm">
      <div class="form-row">
        <label>ห้องที่เลือก</label>
        <input value="${room.name}" readonly />
      </div>
      <div class="form-row">
        <label>วันที่เข้าพัก / ใช้ห้อง</label>
        <input type="date" id="bookingDate" value="${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}" />
      </div>
      <div class="form-row">
        <label>จำนวนคืน / ชั่วโมง</label>
        <input type="number" id="bookingDuration" min="1" value="1" />
      </div>
      <div class="payment-wrap">
        <label>วิธีชำระเงิน</label>
        <div class="payment-options">${paymentMarkup}</div>
      </div>
      <button class="primary-btn full-width" type="submit">ยืนยันการจอง</button>
    </form>
  `;

  container.querySelectorAll('.payment-option').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedPayment = button.dataset.payment;
      renderBookingForm();
      renderInvoice(room, state.selectedPayment);
    });
  });

  const form = $('bookingForm');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const booking = {
        id: `BK-${Date.now()}`,
        roomId: room.id,
        roomName: room.name,
        type: room.type,
        date: $('bookingDate').value,
        duration: Number($('bookingDuration').value || 1),
        paymentMethod: state.selectedPayment,
        paymentStatus: getPaymentOptions(room).find((item) => item.value === state.selectedPayment)?.status || 'รอชำระมัดจำ',
        amount: getPaymentOptions(room).find((item) => item.value === state.selectedPayment)?.amount || room.price,
        status: 'รอดำเนินการ'
      };

      state.bookings.unshift(booking);
      saveState();
      renderHistory();
      showView('history');
      setStatus('loginStatus', 'จองห้องสำเร็จแล้ว', 'success');
    });
  }

  renderInvoice(room, state.selectedPayment);
}

function renderRooms() {
  const results = $('roomResults');
  if (!results) return;

  const type = $('searchType') ? $('searchType').value : 'all';
  const start = $('searchStartDate') ? $('searchStartDate').value : '';
  const end = $('searchEndDate') ? $('searchEndDate').value : '';

  const filtered = rooms.filter((room) => {
    const matchesType = type === 'all' || room.category === type;
    const matchesDate = !start || !end || true;
    return matchesType && matchesDate;
  });

  results.innerHTML = filtered.map((room) => `
    <div class="room-card">
      <div class="room-card-header">
        <h4>${room.name}</h4>
        <span class="tag">${room.type}</span>
      </div>
      <p>${room.detail}</p>
      <div class="room-meta">
        <strong>${room.price.toLocaleString()} บาท</strong>
        <span>ว่าง</span>
      </div>
      <button class="primary-btn" type="button" data-room-id="${room.id}">เลือกห้อง</button>
    </div>
  `).join('');

  results.querySelectorAll('[data-room-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const room = rooms.find((item) => item.id === button.dataset.roomId) || rooms[0];
      state.selectedRoom = room;
      renderBookingForm();
      showView('booking');
    });
  });
}

function renderHistory() {
  const historyList = $('historyList');
  if (!historyList) return;

  if (!state.bookings.length) {
    historyList.innerHTML = '<div class="empty-state">ยังไม่มีประวัติการจอง</div>';
    return;
  }

  historyList.innerHTML = state.bookings.map((booking) => `
    <div class="history-item">
      <div>
        <strong>${booking.roomName}</strong>
        <small>${booking.type}</small>
      </div>
      <div class="history-meta">
        <span>${booking.paymentStatus}</span>
        <strong>${booking.amount.toLocaleString()} บาท</strong>
      </div>
    </div>
  `).join('');
}

function bindAuthentication() {
  $('loginButton')?.addEventListener('click', () => showView('auth'));
  $('logoutButton')?.addEventListener('click', () => {
    state.user = null;
    saveState();
    updateUserBadge();
    showView('home');
  });

  $('registerForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const user = {
      name: $('registerName').value,
      email: $('registerEmail').value,
      phone: $('registerPhone').value,
      password: $('registerPassword').value,
      role: 'customer'
    };

    state.user = user;
    saveState();
    updateUserBadge();
    setStatus('registerStatus', 'สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบต่อ', 'success');
    showView('auth');
  });

  $('loginForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const role = $('loginRole').value;
    const identity = $('loginIdentity').value.trim();
    const password = $('loginPassword').value.trim();
    const validEmail = getRoleMeta(role).email;

    if (identity === validEmail && password === '123456') {
      state.user = {
        name: role === 'customer' ? 'Demo Customer' : getRoleMeta(role).label,
        email: validEmail,
        role
      };
      saveState();
      updateUserBadge();
      setStatus('loginStatus', 'เข้าสู่ระบบสำเร็จ', 'success');
      showView('home');
    } else {
      setStatus('loginStatus', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error');
    }
  });

  $('searchForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    renderRooms();
  });

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.view));
  });

  document.querySelectorAll('[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      if (target === 'registerPanel') showView('auth');
      if (target === 'searchPanel') showView('search');
      if (target === 'historyPanel') showView('history');
    });
  });
}

function init() {
  bindRoleSwitch();
  bindAuthentication();
  renderRooms();
  renderBookingForm();
  renderHistory();
  updateUserBadge();
  showView('home');
}

document.addEventListener('DOMContentLoaded', init);
