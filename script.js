const state = {
  user: JSON.parse(localStorage.getItem('taksinakan_user') || 'null'),
  bookings: JSON.parse(localStorage.getItem('taksinakan_bookings') || '[]'),
  selectedRoom: null,
};

const rooms = [
  { id: 'P101', name: 'ห้องพักเดี่ยว P101', category: 'room', type: 'ธรรมดา', price: 1200, detail: 'พักได้ 1-2 คน พร้อมเครื่องปรับอากาศ' },
  { id: 'P102', name: 'ห้องพักพรีเมียม P102', category: 'room', type: 'พรีเมียม', price: 1800, detail: 'ห้องพักพรีเมียม พร้อมอาหารเช้า' },
  { id: 'M101', name: 'ห้องประชุม M101', category: 'meeting', type: 'ห้องประชุมเล็ก', price: 1500, detail: 'รองรับ 10 คน พร้อมจอแสดงผลและ Wi-Fi' },
  { id: 'M201', name: 'ห้องประชุม M201', category: 'meeting', type: 'ห้องประชุมกลาง', price: 2800, detail: 'รองรับ 25 คน พร้อมอุปกรณ์ประชุม' },
  { id: 'H01', name: 'หอประชุมใหญ่ H01', category: 'hall', type: 'หอประชุมใหญ่', price: 30000, detail: 'เหมาะสำหรับงานประชุม งานแต่ง และงานพิธี' },
];

const $ = (id) => document.getElementById(id);

function save() {
  localStorage.setItem('taksinakan_user', JSON.stringify(state.user));
  localStorage.setItem('taksinakan_bookings', JSON.stringify(state.bookings));
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

function setStatus(id, message, type = 'info') {
  const box = $(id);
  if (box) {
    box.className = `status-box ${type}`;
    box.textContent = message;
  }
}

function updateUser() {
  $('userBadge').textContent = state.user ? `ผู้ใช้: ${state.user.name}` : 'ยังไม่ได้เข้าสู่ระบบ';
  $('loginButton').style.display = state.user ? 'none' : 'inline-block';
  $('logoutButton').style.display = state.user ? 'inline-block' : 'none';
}

function renderRooms() {
  const type = $('searchType')?.value || 'all';
  const list = rooms.filter((room) => type === 'all' || room.category === type);
  $('roomResults').innerHTML = list.map((room) => `
    <article class="room-card">
      <div class="room-header"><h3>${room.name}</h3><span class="room-type">${label(room.category)}</span></div>
      <div class="room-price">฿${room.price.toLocaleString()} / ${room.category === 'room' ? 'คืน' : 'วัน'}</div>
      <div class="room-meta"><div>ประเภท: ${room.type}</div><div>${room.detail}</div></div>
      <div class="card-actions"><button class="primary-btn choose-room" data-id="${room.id}">เลือกห้อง</button></div>
    </article>
  `).join('');
  document.querySelectorAll('.choose-room').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedRoom = rooms.find((room) => room.id === button.dataset.id);
      showView('booking');
    });
  });
}

function renderBooking() {
  const container = $('bookingFormContainer');
  const room = state.selectedRoom;
  if (!room) {
    container.innerHTML = '<p>กรุณาเลือกห้องจากหน้าค้นหาห้องว่างก่อน</p><button class="primary-btn" id="goSearch">ค้นหาห้องว่าง</button>';
    $('invoiceContainer').innerHTML = '';
    $('goSearch').onclick = () => showView('search');
    return;
  }
  const user = state.user || {};
  container.innerHTML = `
    <div class="booking-section"><h3>ห้องที่เลือก: ${room.name}</h3><p>${room.detail}</p></div>
    <div class="booking-section"><h3>ข้อมูลการจอง</h3>
      <div class="form-row"><label>วันที่ต้องการ</label><input id="bookingDate" type="date" value="${new Date().toISOString().slice(0, 10)}"></div>
      <div class="form-row"><label>ชื่อ-นามสกุล</label><input id="bookingName" value="${user.name || ''}"></div>
      <div class="form-row"><label>เบอร์โทรศัพท์</label><input id="bookingPhone" value="${user.phone || ''}"></div>
      ${room.category === 'meeting' ? '<div class="form-row"><label>รายละเอียดงาน</label><textarea id="bookingDetail" rows="3" placeholder="เช่น ประชุมโครงการ"></textarea></div>' : ''}
    </div>
    <button class="primary-btn full-width" id="createBooking">สร้างใบเสนอราคาและมัดจำ 30%</button>`;
  const deposit = Math.round(room.price * 0.3);
  $('invoiceContainer').innerHTML = `<div class="invoice-box"><p>เลือกห้องแล้ว: <strong>${room.name}</strong></p><div class="invoice-row"><span>ราคาเต็ม</span><span>฿${room.price.toLocaleString()}</span></div><div class="invoice-row total"><span>มัดจำ 30%</span><span>฿${deposit.toLocaleString()}</span></div></div>`;
  $('createBooking').onclick = createBooking;
}

function createBooking() {
  if (!state.user) {
    alert('กรุณาเข้าสู่ระบบก่อนทำการจอง');
    showView('auth');
    return;
  }
  const room = state.selectedRoom;
  const amount = room.price;
  const booking = {
    id: `BK-${Date.now().toString().slice(-6)}`,
    roomName: room.name,
    category: room.category,
    date: $('bookingDate').value,
    name: $('bookingName').value || state.user.name,
    amount,
    deposit: Math.round(amount * 0.3),
    status: 'รอชำระมัดจำ',
  };
  state.bookings.unshift(booking);
  save();
  renderInvoice(booking);
  alert(`สร้างรายการจอง ${booking.id} เรียบร้อยแล้ว`);
}

function renderInvoice(booking) {
  $('invoiceContainer').innerHTML = `<div class="invoice-box"><h3>ใบแจ้งมัดจำ</h3><div class="invoice-row"><span>รหัสการจอง</span><strong>${booking.id}</strong></div><div class="invoice-row"><span>ห้อง</span><span>${booking.roomName}</span></div><div class="invoice-row total"><span>ยอดมัดจำ 30%</span><span>฿${booking.deposit.toLocaleString()}</span></div><div class="payment-box"><h4>ช่องทางชำระเงิน</h4><div class="bank-box">ธนาคารกสิกรไทย<br>เลขบัญชี 123-4-56789-0</div><div class="qr-box">QR CODE</div><button class="primary-btn full-width" id="paidButton">แจ้งชำระเงิน</button></div></div>`;
  $('paidButton').onclick = () => {
    booking.status = 'รอตรวจสอบการชำระเงิน';
    save();
    alert('แจ้งชำระเงินแล้ว เจ้าหน้าที่จะตรวจสอบสลิป');
    showView('history');
  };
}

function renderHistory() {
  if (!state.user) {
    $('historyList').innerHTML = '<p>กรุณาเข้าสู่ระบบเพื่อดูประวัติการจอง</p>';
    return;
  }
  if (!state.bookings.length) {
    $('historyList').innerHTML = '<p>ยังไม่มีรายการจอง</p>';
    return;
  }
  $('historyList').innerHTML = state.bookings.map((booking) => `<article class="history-item"><div class="history-top"><strong>${booking.roomName}</strong><span class="badge pending">${booking.status}</span></div><div class="meta-grid"><div>รหัส: ${booking.id}</div><div>วันที่: ${booking.date}</div><div>ยอดเต็ม: ฿${booking.amount.toLocaleString()}</div><div>มัดจำ: ฿${booking.deposit.toLocaleString()}</div></div><div class="card-actions"><button class="secondary-btn notify-payment" data-id="${booking.id}">แจ้งชำระเงิน</button><button class="ghost-btn cancel-booking" data-id="${booking.id}">ยกเลิก</button></div></article>`).join('');
  document.querySelectorAll('.notify-payment').forEach((button) => button.onclick = () => { const booking = state.bookings.find((item) => item.id === button.dataset.id); booking.status = 'รอตรวจสอบการชำระเงิน'; save(); renderHistory(); });
  document.querySelectorAll('.cancel-booking').forEach((button) => button.onclick = () => { const booking = state.bookings.find((item) => item.id === button.dataset.id); booking.status = 'ยกเลิกแล้ว'; save(); renderHistory(); });
}

function label(category) {
  return category === 'room' ? 'ห้องพัก' : category === 'meeting' ? 'ห้องประชุม' : 'หอประชุมใหญ่';
}

$('loginButton').onclick = () => showView('auth');
$('logoutButton').onclick = () => { state.user = null; save(); updateUser(); showView('home'); };
document.querySelectorAll('[data-view]').forEach((button) => button.onclick = () => showView(button.dataset.view));
document.querySelectorAll('[data-target]').forEach((button) => button.onclick = () => showView(button.dataset.target === 'registerPanel' ? 'auth' : button.dataset.target === 'searchPanel' ? 'search' : 'history'));
$('searchForm').onsubmit = (event) => { event.preventDefault(); renderRooms(); };
$('registerForm').onsubmit = (event) => { event.preventDefault(); const user = { name: $('registerName').value, email: $('registerEmail').value, phone: $('registerPhone').value, password: $('registerPassword').value }; state.user = user; save(); updateUser(); setStatus('registerStatus', 'สมัครสมาชิกสำเร็จ กรุณากรอก OTP 123456 เพื่อยืนยันตัวตน', 'success'); };
$('loginForm').onsubmit = (event) => { event.preventDefault(); const identity = $('loginIdentity').value; const password = $('loginPassword').value; if ((identity === 'demo@taksin.ac.th' || identity === '0999999999') && password === '123456') { state.user = { name: 'สมชาย ใจดี', email: 'demo@taksin.ac.th', phone: '0999999999' }; save(); updateUser(); setStatus('loginStatus', 'เข้าสู่ระบบสำเร็จ', 'success'); showView('search'); } else setStatus('loginStatus', 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง', 'error'); };
$('verifyOtpButton').onclick = () => $('otpInput').value === '123456' ? setStatus('loginStatus', 'ยืนยัน OTP สำเร็จ', 'success') : setStatus('loginStatus', 'OTP ไม่ถูกต้อง', 'error');

updateUser();
showView('home');
