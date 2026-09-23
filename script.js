const STORAGE_KEYS = {
  user: 'taksinaka_user',
  bookings: 'taksinaka_bookings'
};

const rooms = [
  { id: 'P101', name: 'ห้องพักเดี่ยว P101', category: 'room', type: 'ธรรมดา', price: 1200, detail: 'พักได้ 1-2 คน พร้อมเครื่องใช้พื้นฐาน' },
  { id: 'P102', name: 'ห้องพักพรีเมียม P102', category: 'room', type: 'พรีเมียม', price: 1800, detail: 'ห้องพักพร้อมสิ่งอำนวยความสะดวก' },
  { id: 'M101', name: 'ห้องประชุม M101', category: 'meeting', type: 'ห้องประชุมเล็ก', price: 1500, detail: 'รองรับ 10-12 คน' },
  { id: 'M201', name: 'ห้องประชุม M201', category: 'meeting', type: 'ห้องประชุมกลาง', price: 2800, detail: 'รองรับ 20-25 คน' },
  { id: 'H01', name: 'หอประชุมใหญ่ H01', category: 'hall', type: 'หอประชุมใหญ่', price: 30000, detail: 'เหมาะสำหรับงานสัมมนา' }
];

const roles = {
  customer: { label: 'ลูกค้า', identity: 'demo@taksin.ac.th', title: 'เข้าสู่ระบบลูกค้า', description: 'ค้นหา จองห้อง และติดตามประวัติการจอง', password: '123456' },
  staff: { label: 'เจ้าหน้าที่', identity: 'staff', title: 'เข้าสู่ระบบเจ้าหน้าที่', description: 'จัดการรายการจองและการชำระเงิน', password: '123456', target: 'staff.html' },
  approver: { label: 'ผู้อนุมัติ', identity: 'approver', title: 'เข้าสู่ระบบผู้อนุมัติ', description: 'ตรวจสอบและอนุมัติคำขอจอง', password: '123456', target: 'approver.html' },
  housekeeping: { label: 'แม่บ้าน', identity: 'housekeeping', title: 'เข้าสู่ระบบแม่บ้าน', description: 'ดูงานเตรียมห้องและสถานะห้อง', password: '123456', target: 'housekeeping.html' }
};

const state = {
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null'),
  bookings: JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings) || '[]'),
  selectedRoom: rooms[0],
  selectedPayment: 'deposit'
};

const $ = (id) => document.getElementById(id);
const money = (value) => `${Number(value || 0).toLocaleString()} บาท`;

function save() {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(state.bookings));
}

function setStatus(id, message, type = 'info') {
  const el = $(id);
  if (!el) return;
  el.className = `status-box ${type}`;
  el.textContent = message;
}

function showView(view) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('active', screen.id === `screen-${view}`);
  });
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  if (view === 'search') renderRooms();
  if (view === 'history') renderHistory();
  if (view === 'booking') renderBooking();
}

function updateUser() {
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

function setRole(role) {
  const profile = roles[role] || roles.customer;
  const input = $('loginRole');
  const identity = $('loginIdentity');
  const label = $('identityLabel');
  const hint = $('roleHint');
  const submit = document.querySelector('.login-submit');
  if (!input || !identity || !hint || !submit) return;

  input.value = role;
  identity.value = profile.identity;
  label.textContent = role === 'customer' ? 'อีเมล / เบอร์โทร' : 'ชื่อผู้ใช้';
  hint.innerHTML = `<strong>${profile.title}</strong><br>${profile.description}`;
  submit.textContent = profile.title;

  document.querySelectorAll('.role-option').forEach((button) => {
    const isActive = button.dataset.role === role;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function paymentOptions(room) {
  const total = Number(room.price || 0);
  const options = [
    { value: 'deposit', label: 'ชำระมัดจำ 30%', amount: Math.round(total * 0.3), status: 'รอชำระมัดจำ' },
    { value: 'full', label: 'ชำระเต็ม 100%', amount: total, status: 'รอชำระเต็มจำนวน' }
  ];

  if (room.category === 'room') {
    options.push({ value: 'counter', label: 'ชำระที่เคาน์เตอร์', amount: total, status: 'รอชำระที่เคาน์เตอร์' });
  }

  return options;
}

function renderInvoice(booking) {
  const room = state.selectedRoom || rooms[0];
  const selected = paymentOptions(room).find((item) => item.value === (booking.paymentMethod || state.selectedPayment)) || paymentOptions(room)[0];
  const invoice = $('invoiceContainer');
  if (!invoice) return;

  invoice.innerHTML = `
    <div class="invoice-box">
      <h3>ใบแจ้งชำระเงิน</h3>
      <div class="invoice-line"><span>รายการ</span><strong>${room.name}</strong></div>
      <div class="invoice-line"><span>วิธีชำระ</span><strong>${selected.label}</strong></div>
      <div class="invoice-line"><span>ยอดที่ต้องชำระ</span><strong>${money(selected.amount)}</strong></div>
      <div class="invoice-line"><span>สถานะ</span><strong>${booking.paymentStatus || selected.status}</strong></div>
      ${booking.paymentMethod === 'counter' ? '<p class="payment-note">ชำระที่เคาน์เตอร์ได้ในวันเข้าพัก</p>' : `
        <div class="payment-box">
          <p>โอนเข้าบัญชีตัวอย่าง หรือสแกน QR Code แล้วกดปุ่มด้านล่าง</p>
          <div class="bank-box">ธนาคารตัวอย่าง 123-4-56789-0</div>
          <div class="qr-box">QR</div>
          <label class="upload-label">แนบสลิป <input id="slipFile" type="file" accept="image/*" /></label>
          <button type="button" class="primary-btn full-width" id="payNowButton">แจ้งชำระเงิน</button>
        </div>
      `}
    </div>
  `;

  const payNowButton = $('payNowButton');
  if (payNowButton) {
    payNowButton.addEventListener('click', () => {
      const slip = $('slipFile');
      if (!slip || !slip.files.length) {
        setStatus('loginStatus', 'กรุณาแนบสลิปก่อนแจ้งชำระเงิน', 'error');
        return;
      }

      const target = state.bookings.find((item) => item.id === booking.id);
      if (target) {
        target.paymentStatus = 'รอตรวจสอบการชำระเงิน';
        target.status = 'ส่งหลักฐานการชำระเงินแล้ว';
      }

      save();
      renderHistory();
      showView('history');
      alert('แจ้งชำระเงินแล้ว เจ้าหน้าที่จะตรวจสอบสลิป');
    });
  }
}

function renderBooking() {
  const room = state.selectedRoom || rooms[0];
  const container = $('bookingFormContainer');
  if (!container) return;

  const options = paymentOptions(room);
  if (!options.some((item) => item.value === state.selectedPayment)) {
    state.selectedPayment = 'deposit';
  }

  container.innerHTML = `
    <form id="bookingForm">
      <div class="form-row"><label>ห้องที่เลือก</label><input value="${room.name}" readonly /></div>
      <div class="form-row"><label>วันที่เข้าพัก / ใช้ห้อง</label><input id="bookingDate" type="date" value="${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}" required /></div>
      <div class="form-row"><label>จำนวนคืน / วัน</label><input id="bookingDuration" type="number" min="1" value="1" required /></div>
      <div class="payment-wrap">
        <label>เลือกวิธีชำระเงิน</label>
        <div class="payment-options">
          ${options.map((option) => `
            <button type="button" class="payment-option ${state.selectedPayment === option.value ? 'selected' : ''}" data-payment="${option.value}">
              <span>${option.label}</span>
              <strong>${money(option.amount)}</strong>
            </button>
          `).join('')}
        </div>
      </div>
      <button type="submit" class="primary-btn full-width">ส่งคำขอจอง</button>
    </form>
  `;

  document.querySelectorAll('.payment-option').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedPayment = button.dataset.payment;
      renderBooking();
    });
  });

  $('bookingForm').addEventListener('submit', (event) => {
    event.preventDefault();

    if (!state.user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการจอง');
      showView('auth');
      return;
    }

    const selected = options.find((item) => item.value === state.selectedPayment) || options[0];
    const booking = {
      id: `BK-${Date.now().toString().slice(-6)}`,
      roomId: room.id,
      roomName: room.name,
      type: room.type,
      date: $('bookingDate').value,
      duration: Number($('bookingDuration').value || 1),
      paymentMethod: selected.value,
      amount: selected.amount,
      paymentStatus: selected.status,
      status: 'รอการชำระเงิน',
      customer: state.user.email
    };

    state.bookings.unshift(booking);
    save();
    renderHistory();
    showView('history');
    alert(`สร้างรายการจอง ${booking.id} แล้ว`);
  });

  renderInvoice({
    roomName: room.name,
    paymentMethod: state.selectedPayment,
    paymentStatus: 'เลือกวิธีชำระเงินและกดส่งคำขอจอง'
  });
}

function renderRooms() {
  const type = $('searchType')?.value || 'all';
  const results = $('roomResults');
  if (!results) return;

  results.innerHTML = rooms
    .filter((room) => type === 'all' || room.category === type)
    .map((room) => `
      <article class="room-card">
        <div class="room-card-header"><h4>${room.name}</h4><span class="tag">${room.type}</span></div>
        <p>${room.detail}</p>
        <div class="room-meta"><strong>${money(room.price)}</strong><span>ว่าง</span></div>
        <button class="primary-btn" type="button" data-room-id="${room.id}">เลือกห้อง</button>
      </article>
    `).join('');

  document.querySelectorAll('[data-room-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const chosenRoom = rooms.find((room) => room.id === button.dataset.roomId) || rooms[0];
      state.selectedRoom = chosenRoom;
      state.selectedPayment = 'deposit';
      showView('booking');
    });
  });
}

function renderHistory() {
  const list = $('historyList');
  if (!list) return;

  const items = state.user
    ? state.bookings.filter((booking) => !booking.customer || booking.customer === state.user.email)
    : [];

  list.innerHTML = items.length
    ? items.map((booking) => `
        <div class="history-item">
          <div>
            <strong>${booking.roomName}</strong>
            <small>${booking.date || ''}</small>
          </div>
          <div class="history-meta">
            <span>${booking.paymentStatus || booking.status}</span>
            <strong>${money(booking.amount)}</strong>
          </div>
        </div>
      `).join('')
    : '<div class="empty-state">ยังไม่มีประวัติการจอง</div>';
}

function init() {
  document.querySelectorAll('.role-option').forEach((button) => {
    button.addEventListener('click', () => setRole(button.dataset.role));
  });

  $('loginButton')?.addEventListener('click', () => showView('auth'));
  $('logoutButton')?.addEventListener('click', () => {
    state.user = null;
    save();
    updateUser();
    showView('home');
  });

  $('loginForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const role = $('loginRole').value;
    const profile = roles[role] || roles.customer;
    const identity = $('loginIdentity').value.trim();
    const password = $('loginPassword').value.trim();

    if (identity === profile.identity && password === profile.password) {
      state.user = {
        name: profile.label,
        email: profile.identity,
        role
      };
      save();
      updateUser();
      setStatus('loginStatus', 'เข้าสู่ระบบสำเร็จ', 'success');

      if (profile.target) {
        window.location.assign(profile.target);
      } else {
        showView('home');
      }
    } else {
      setStatus('loginStatus', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
    }
  });

  $('registerForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.user = {
      name: $('registerName').value,
      email: $('registerEmail').value,
      phone: $('registerPhone').value,
      role: 'customer'
    };
    save();
    updateUser();
    setStatus('registerStatus', 'สมัครสมาชิกสำเร็จ', 'success');
    showView('auth');
  });

  $('searchForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    renderRooms();
  });

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.view === 'booking') renderBooking();
      showView(button.dataset.view);
    });
  });

  document.querySelectorAll('[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      if (target === 'registerPanel') showView('auth');
      if (target === 'searchPanel') showView('search');
      if (target === 'historyPanel') showView('history');
    });
  });

  setRole('customer');
  renderRooms();
  renderBooking();
  renderHistory();
  updateUser();
  showView('home');
}

document.addEventListener('DOMContentLoaded', init);
