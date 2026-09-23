const STORAGE_KEYS = { user: 'taksinaka_user', bookings: 'taksinaka_bookings' };

const rooms = [
  { id: 'P101', name: 'ห้องพัก 101', category: 'room', type: 'ห้องพัก', price: 1200, detail: 'ห้องพักคู่ 1-2 คน' },
  { id: 'P102', name: 'ห้องพัก 102', category: 'room', type: 'ห้องพัก', price: 1800, detail: 'ห้องพักเดี่ยว 1-2 คน' },
  { id: 'M101', name: 'ห้องประชุม M101', category: 'meeting', type: 'ห้องประชุม', price: 1500, detail: 'ห้องประชุมขนาดเล็ก 10-12 คน' },
  { id: 'M201', name: 'ห้องประชุม M201', category: 'meeting', type: 'ห้องประชุม', price: 2200, detail: 'ห้องประชุมขนาดกลาง 20-25 คน' },
  { id: 'H01', name: 'หอประชุมใหญ่', category: 'hall', type: 'หอประชุมใหญ่', price: 3500, detail: 'หอประชุมสำหรับการจัดงานใหญ่' }
];

const roles = {
  customer: { label: 'ลูกค้า', identity: 'demo@taksin.ac.th', title: 'เข้าสู่ระบบลูกค้า', description: 'ค้นหา จองห้อง และติดตามประวัติการจอง', target: null },
  staff: { label: 'เจ้าหน้าที่', identity: 'staff', title: 'เข้าสู่ระบบเจ้าหน้าที่', description: 'จัดการรายการจองและการชำระเงิน', target: 'staff.html' },
  approver: { label: 'ผู้อนุมัติ', identity: 'approver', title: 'เข้าสู่ระบบผู้อนุมัติ', description: 'ตรวจสอบและอนุมัติคำขอจอง', target: 'approver.html' },
  housekeeping: { label: 'แม่บ้าน', identity: 'housekeeping', title: 'เข้าสู่ระบบแม่บ้าน', description: 'ดูงานเตรียมห้องและสถานะห้อง', target: 'housekeeping.html' }
};

const state = {
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null'),
  bookings: JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings) || '[]'),
  selectedRoom: rooms[0],
  selectedPayment: 'deposit',
  pendingBooking: null
};

const $ = (id) => document.getElementById(id);
const money = (value) => `${Number(value || 0).toLocaleString()} บาท`;

function save() {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(state.bookings));
}

function showView(view) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.toggle('active', screen.id === `screen-${view}`));
  document.querySelectorAll('.nav-btn').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  if (view === 'search') renderRooms();
  if (view === 'history') renderHistory();
}

function setStatus(id, message, type) {
  const element = $(id);
  if (!element) return;
  element.className = `status-box ${type || 'info'}`;
  element.textContent = message;
}

function updateUser() {
  if (!$('userBadge')) return;
  $('userBadge').textContent = state.user ? `${state.user.name} (${state.user.role})` : 'ยังไม่ได้เข้าสู่ระบบ';
  $('loginButton').style.display = state.user ? 'none' : 'inline-flex';
  $('logoutButton').style.display = state.user ? 'inline-flex' : 'none';
}

function setRole(role) {
  const profile = roles[role] || roles.customer;
  $('loginRole').value = role;
  $('loginIdentity').value = profile.identity;
  $('identityLabel').textContent = role === 'customer' ? 'อีเมล / เบอร์โทร' : 'ชื่อผู้ใช้';
  $('roleHint').innerHTML = `<strong>${profile.title}</strong><br>${profile.description}`;
  document.querySelector('.login-submit').textContent = profile.title;
  document.querySelectorAll('.role-option').forEach((button) => {
    button.classList.toggle('active', button.dataset.role === role);
    button.setAttribute('aria-pressed', button.dataset.role === role ? 'true' : 'false');
  });
}

function paymentOptions(room) {
  const total = Number(room.price);
  const options = [
    { value: 'deposit', label: 'ชำระมัดจำ 30%', amount: Math.round(total * 0.3), status: 'รอชำระมัดจำ' },
    { value: 'full', label: 'ชำระเต็ม 100%', amount: total, status: 'รอชำระเต็มจำนวน' }
  ];
  if (room.category === 'room') options.push({ value: 'counter', label: 'ชำระที่เคาน์เตอร์', amount: total, status: 'รอชำระที่เคาน์เตอร์' });
  return options;
}

function renderInvoice(booking) {
  const option = paymentOptions(state.selectedRoom).find((item) => item.value === booking.paymentMethod);
  $('invoiceContainer').innerHTML = `
    <div class="invoice-box">
      <h3>ใบแจ้งชำระเงิน</h3>
      <div class="invoice-line"><span>รายการ</span><strong>${booking.roomName}</strong></div>
      <div class="invoice-line"><span>วิธีชำระ</span><strong>${option.label}</strong></div>
      <div class="invoice-line"><span>ยอดที่ต้องชำระ</span><strong>${money(option.amount)}</strong></div>
      <div class="invoice-line"><span>สถานะ</span><strong>${option.status}</strong></div>
      ${booking.paymentMethod === 'counter' ? '<p class="payment-note">เลือกชำระที่เคาน์เตอร์ในวันเข้าพัก ไม่ต้องอัปโหลดสลิป</p>' : `
        <div class="payment-box">
          <p>โอนเข้าบัญชีตัวอย่างหรือสแกน QR Code แล้วกดปุ่มด้านล่าง</p>
          <div class="bank-box">ธนาคารตัวอย่าง เลขที่บัญชี 123-4-56789-0</div>
          <div class="qr-box">QR CODE</div>
          <label class="upload-label">แนบสลิป (สำหรับการสาธิต)<input id="slipFile" type="file" accept="image/*" /></label>
          <button type="button" class="primary-btn full-width" id="payNowButton">แจ้งชำระเงิน</button>
        </div>`}
    </div>`;

  $('payNowButton')?.addEventListener('click', () => {
    const file = $('slipFile');
    if (!file || !file.files.length) {
      setStatus('loginStatus', 'กรุณาแนบสลิปก่อนแจ้งชำระเงิน', 'error');
      return;
    }
    booking.paymentStatus = 'รอตรวจสอบการชำระเงิน';
    booking.status = 'ส่งหลักฐานการชำระเงินแล้ว';
    save();
    alert('แจ้งชำระเงินแล้ว เจ้าหน้าที่จะตรวจสอบสลิป');
    showView('history');
  });
}

function renderBooking(room = state.selectedRoom) {
  state.selectedRoom = room || rooms[0];
  const options = paymentOptions(state.selectedRoom);
  if (!options.some((item) => item.value === state.selectedPayment)) state.selectedPayment = 'deposit';
  $('bookingFormContainer').innerHTML = `
    <form id="bookingForm">
      <div class="form-row"><label>ห้องที่เลือก</label><input value="${state.selectedRoom.name}" readonly></div>
      <div class="form-row"><label>วันที่เข้าพัก / ใช้ห้อง</label><input id="bookingDate" type="date" value="${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}" required></div>
      <div class="form-row"><label>จำนวนคืน / วัน</label><input id="bookingDuration" type="number" min="1" value="1" required></div>
      <div class="payment-wrap"><label>เลือกวิธีชำระเงิน</label><div class="payment-options">${options.map((option) => `<button type="button" class="payment-option ${state.selectedPayment === option.value ? 'selected' : ''}" data-payment="${option.value}"><span>${option.label}</span><strong>${money(option.amount)}</strong></button>`).join('')}</div></div>
      <button class="primary-btn full-width" type="submit">ส่งคำขอจอง</button>
    </form>`;

  document.querySelectorAll('.payment-option').forEach((button) => button.addEventListener('click', () => {
    state.selectedPayment = button.dataset.payment;
    renderBooking(state.selectedRoom);
  }));
  $('bookingForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!state.user) { alert('กรุณาเข้าสู่ระบบลูกค้าก่อนจอง'); showView('auth'); return; }
    const option = options.find((item) => item.value === state.selectedPayment);
    state.pendingBooking = {
      id: `BK-${Date.now()}`, roomId: state.selectedRoom.id, roomName: state.selectedRoom.name,
      type: state.selectedRoom.type, date: $('bookingDate').value, duration: Number($('bookingDuration').value),
      paymentMethod: option.value, amount: option.amount, paymentStatus: option.status, status: 'รอการชำระเงิน'
    };
    renderInvoice(state.pendingBooking);
    alert('สร้างใบแจ้งชำระเงินแล้ว กรุณาชำระเงินตามวิธีที่เลือก');
  });
  renderInvoice(state.pendingBooking || { roomName: state.selectedRoom.name, paymentMethod: state.selectedPayment });
}

function renderRooms() {
  const type = $('searchType')?.value || 'all';
  $('roomResults').innerHTML = rooms.filter((room) => type === 'all' || room.category === type).map((room) => `
    <article class="room-card"><div class="room-card-header"><h4>${room.name}</h4><span class="tag">${room.type}</span></div><p>${room.detail}</p><div class="room-meta"><strong>${money(room.price)}</strong><span>ว่าง</span></div><button class="primary-btn" type="button" data-room-id="${room.id}">เลือกห้อง</button></article>`).join('');
  document.querySelectorAll('[data-room-id]').forEach((button) => button.addEventListener('click', () => {
    state.selectedPayment = 'deposit';
    renderBooking(rooms.find((room) => room.id === button.dataset.roomId));
    showView('booking');
  }));
}

function renderHistory() {
  if (!$('historyList')) return;
  $('historyList').innerHTML = state.bookings.length ? state.bookings.map((booking) => `<div class="history-item"><div><strong>${booking.roomName}</strong><small>${booking.date || ''}</small></div><div class="history-meta"><span>${booking.paymentStatus || booking.status}</span><strong>${money(booking.amount)}</strong></div></div>`).join('') : '<div class="empty-state">ยังไม่มีประวัติการจอง</div>';
}

function init() {
  document.querySelectorAll('.role-option').forEach((button) => button.addEventListener('click', () => setRole(button.dataset.role)));
  $('loginForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const role = $('loginRole').value;
    const profile = roles[role];
    const identity = $('loginIdentity').value.trim();
    if (!profile || identity !== profile.identity || $('loginPassword').value !== '123456') {
      setStatus('loginStatus', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error'); return;
    }
    state.user = { name: profile.label, email: profile.identity, role };
    save(); updateUser(); setStatus('loginStatus', 'เข้าสู่ระบบสำเร็จ', 'success');
    if (profile.target) window.location.assign(profile.target); else showView('home');
  });
  $('loginButton')?.addEventListener('click', () => showView('auth'));
  $('logoutButton')?.addEventListener('click', () => { state.user = null; save(); updateUser(); showView('home'); });
  $('searchForm')?.addEventListener('submit', (event) => { event.preventDefault(); renderRooms(); });
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => { if (button.dataset.view === 'booking') renderBooking(); showView(button.dataset.view); }));
  document.querySelectorAll('[data-target]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.target === 'searchPanel' ? 'search' : button.dataset.target === 'historyPanel' ? 'history' : 'auth')));
  setRole('customer'); renderRooms(); renderBooking(); renderHistory(); updateUser(); showView('home');
}

document.addEventListener('DOMContentLoaded', init);
