const STORAGE_KEY = 'taksinakan-prototype-v1';

const defaultUsers = [
  {
    id: 1,
    name: 'สมชาย ใจดี',
    email: 'demo@taksin.ac.th',
    phone: '0999999999',
    idCard: '1234567890123',
    password: '123456',
    otpVerified: true,
  },
];

const defaultRooms = [
  {
    id: 'P101',
    name: 'ห้องพักเดี่ยว P101',
    category: 'room',
    subtype: 'ธรรมดา',
    meal: 'ไม่รวมอาหารเช้า',
    price: 1200,
    description: 'ห้องพักสำหรับ 1-2 คน เหมาะสำหรับพักค้างคืน',
    available: true,
  },
  {
    id: 'P102',
    name: 'ห้องพักเดี่ยว P102',
    category: 'room',
    subtype: 'พรีเมียม',
    meal: 'รวมอาหารเช้า',
    price: 1800,
    description: 'ห้องพักระดับพรีเมียม พร้อมสิ่งอำนวยความสะดวกครบ',
    available: true,
  },
  {
    id: 'P201',
    name: 'ห้องพักคู่ P201',
    category: 'room',
    subtype: 'ธรรมดา',
    meal: 'รวมอาหารเช้า',
    price: 2200,
    description: 'ห้องพักคู่ พร้อมเฟอร์นิเจอร์และแอร์',
    available: true,
  },
  {
    id: 'M101',
    name: 'ห้องประชุม M101',
    category: 'meeting',
    subtype: 'ห้องประชุมเล็ก',
    meal: 'ไม่รวม',
    price: 1500,
    description: 'ความจุ 8-10 คน พร้อมจอ LED และ Wi-Fi',
    available: true,
  },
  {
    id: 'M201',
    name: 'ห้องประชุม M201',
    category: 'meeting',
    subtype: 'ห้องประชุมกลาง',
    meal: 'ไม่รวม',
    price: 2800,
    description: 'ความจุ 20-25 คน เหมาะสำหรับประชุมและสัมมนา',
    available: true,
  },
  {
    id: 'H01',
    name: 'หอประชุมใหญ่ H01',
    category: 'hall',
    subtype: 'หอประชุมใหญ่',
    meal: 'ไม่รวม',
    price: 30000,
    description: 'หอประชุมขนาดใหญ่ เหมาะสำหรับงานใหญ่และพิธีสำคัญ',
    available: true,
  },
];

const defaultBookings = [
  {
    id: 'BK-1001',
    customerId: 1,
    roomId: 'P101',
    roomName: 'ห้องพักเดี่ยว P101',
    category: 'room',
    bookingType: 'room',
    date: '2026-09-27',
    nights: 2,
    guestType: 'บุคคลภายนอก',
    status: 'รอชำระมัดจำ',
    amount: 2400,
    deposit: 720,
    depositPaid: false,
    slipFile: '',
    details: 'ห้องพักเดี่ยว ปรับปรุงชุดพัก 2 คืน',
  },
  {
    id: 'BK-1002',
    customerId: 1,
    roomId: 'M201',
    roomName: 'ห้องประชุม M201',
    category: 'meeting',
    bookingType: 'meeting',
    date: '2026-09-30',
    hours: 6,
    guestType: 'ภายใน',
    status: 'ชำระเงินแล้ว',
    amount: 2800,
    deposit: 840,
    depositPaid: true,
    slipFile: 'slip_meeting_1.pdf',
    details: 'ประชุมทีมโครงการ',
  },
];

const defaultEquipment = [
  {
    id: 'EQ-01',
    bookingId: 'BK-1002',
    item: 'อุปกรณ์ไลฟ์สด, โต๊ะเพิ่ม 4 ตัว',
    approved: true,
    status: 'อนุมัติแล้ว',
  },
];

const state = loadState();

const app = {
  activeView: 'home',
  selectedRoom: null,
  currentUser: null,
  otpCode: '123456',
};

function bootstrap() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view) showView(view);
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

  document.getElementById('loginButton').addEventListener('click', () => showView('auth'));
  document.getElementById('logoutButton').addEventListener('click', handleLogout);

  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('verifyOtpButton').addEventListener('click', handleVerifyOtp);
  document.getElementById('searchForm').addEventListener('submit', handleSearch);

  document.getElementById('searchStartDate').value = getDateOffset(0);
  document.getElementById('searchEndDate').value = getDateOffset(2);

  renderUserState();
  renderRoomResults();
  renderHistory();
  renderBookingForm();
  showView('home');
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const initial = {
      users: defaultUsers,
      rooms: defaultRooms,
      bookings: defaultBookings,
      equipment: defaultEquipment,
      currentUserId: 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return {
      users: defaultUsers,
      rooms: defaultRooms,
      bookings: defaultBookings,
      equipment: defaultEquipment,
      currentUserId: null,
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getDateOffset(days) {
  const today = new Date();
  today.setDate(today.getDate() + days);
  return today.toISOString().split('T')[0];
}

function showView(viewName) {
  app.activeView = viewName;
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('active', screen.id === `screen-${viewName}` || (viewName === 'auth' && screen.id === 'screen-auth'));
  });

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  if (viewName === 'history') renderHistory();
  if (viewName === 'search') renderRoomResults();
  if (viewName === 'home') {
    const totalRoomCount = state.rooms.filter((r) => r.category === 'room').length;
    document.getElementById('statsRooms').textContent = `${totalRoomCount} ห้อง`;
    document.getElementById('statsMeetings').textContent = `${state.rooms.filter((r) => r.category === 'meeting').length} ห้อง`;
    document.getElementById('statsHall').textContent = `${state.rooms.filter((r) => r.category === 'hall').length} ห้อง`;
  }
}

function renderUserState() {
  const user = getCurrentUser();
  app.currentUser = user;
  const badge = document.getElementById('userBadge');
  const loginBtn = document.getElementById('loginButton');
  const logoutBtn = document.getElementById('logoutButton');

  if (user) {
    badge.textContent = `ผู้ใช้: ${user.name}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    badge.textContent = 'ยังไม่ได้เข้าสู่ระบบ';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }
}

function getCurrentUser() {
  return state.users.find((u) => u.id === state.currentUserId) || null;
}

function handleRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const idCard = document.getElementById('registerIdCard').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  const status = document.getElementById('registerStatus');

  if (!name || !email || !phone || !idCard || !password) {
    status.className = 'status-box error';
    status.textContent = 'กรุณากรอกข้อมูลให้ครบถ้วน';
    return;
  }

  const emailExists = state.users.some((user) => user.email.toLowerCase() === email.toLowerCase());
  const phoneExists = state.users.some((user) => user.phone === phone);

  if (emailExists || phoneExists) {
    status.className = 'status-box error';
    status.textContent = 'อีเมลหรือเบอร์โทรนี้มีผู้ใช้แล้ว กรุณาใช้ข้อมูลอื่น';
    return;
  }

  status.className = 'status-box info';
  status.textContent = `ส่งรหัสยืนยัน OTP ไปยังอีเมล ${email} หรือเบอร์ ${phone}`;

  app.otpCode = '123456';
  const tempUser = {
    id: Date.now(),
    name,
    email,
    phone,
    idCard,
    password,
    otpVerified: false,
  };

  state.users.push(tempUser);
  state.currentUserId = tempUser.id;
  saveState();
  renderUserState();
  document.getElementById('otpInput').focus();
}

function handleVerifyOtp() {
  const otp = document.getElementById('otpInput').value.trim();
  const status = document.getElementById('loginStatus');
  const user = getCurrentUser();

  if (!user) {
    status.className = 'status-box error';
    status.textContent = 'กรุณาสมัครสมาชิกก่อน';
    return;
  }

  if (otp === app.otpCode) {
    user.otpVerified = true;
    state.currentUserId = user.id;
    saveState();
    status.className = 'status-box success';
    status.textContent = 'ยืนยันตัวตนสำเร็จ ระบบสร้างบัญชีผู้ใช้เรียบร้อยแล้ว';
    showView('search');
  } else {
    status.className = 'status-box error';
    status.textContent = 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
  }
}

function handleLogin(event) {
  event.preventDefault();
  const identity = document.getElementById('loginIdentity').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const status = document.getElementById('loginStatus');

  const match = state.users.find(
    (user) =>
      (user.email.toLowerCase() === identity.toLowerCase() || user.phone === identity) &&
      user.password === password
  );

  if (!match) {
    status.className = 'status-box error';
    status.textContent = 'อีเมล/เบอร์โทร หรือรหัสผ่านไม่ถูกต้อง';
    return;
  }

  state.currentUserId = match.id;
  saveState();
  renderUserState();
  status.className = 'status-box success';
  status.textContent = 'เข้าสู่ระบบสำเร็จ';
  showView('search');
}

function handleLogout() {
  state.currentUserId = null;
  saveState();
  renderUserState();
  showView('home');
}

function handleSearch(event) {
  event.preventDefault();
  const type = document.getElementById('searchType').value;
  const startDate = document.getElementById('searchStartDate').value;
  const endDate = document.getElementById('searchEndDate').value;

  const filtered = state.rooms.filter((room) => {
    if (type !== 'all' && room.category !== type) return false;
    if (!startDate || !endDate) return true;
    return true;
  });

  state.searchResults = filtered;
  renderRoomResults();
}

function renderRoomResults() {
  const container = document.getElementById('roomResults');
  const rooms = state.searchResults && state.searchResults.length ? state.searchResults : state.rooms;

  container.innerHTML = '';

  rooms.forEach((room) => {
    const card = document.createElement('div');
    card.className = 'room-card';

    const priceText = room.category === 'hall' ? '฿30,000 / วัน' : `฿${room.price.toLocaleString()} / ${room.category === 'room' ? 'คืน' : 'วัน'}`;

    card.innerHTML = `
      <div class="room-header">
        <h3>${room.name}</h3>
        <span class="room-type">${room.category === 'room' ? 'ห้องพัก' : room.category === 'meeting' ? 'ห้องประชุม' : 'หอประชุมใหญ่'}</span>
      </div>
      <div class="room-price">${priceText}</div>
      <div class="room-meta">
        <div>ประเภท: ${room.subtype}</div>
        <div>รูปแบบ: ${room.meal}</div>
        <div>${room.description}</div>
      </div>
      <div class="card-actions">
        <button class="primary-btn" data-room-id="${room.id}">เลือกห้อง</button>
      </div>
    `;

    const button = card.querySelector('button');
    button.addEventListener('click', () => {
      const target = state.rooms.find((item) => item.id === room.id);
      app.selectedRoom = target;
      renderBookingForm();
      showView('booking');
    });

    container.appendChild(card);
  });
}

function renderBookingForm() {
  const container = document.getElementById('bookingFormContainer');
  if (!app.selectedRoom) {
    container.innerHTML = `
      <p>กรุณาเลือกห้องจากรายการค้นหาห้องว่างก่อน</p>
      <button class="primary-btn" data-view="search">ค้นหาห้อง</button>
    `;
    return;
  }

  const room = app.selectedRoom;
  const customer = getCurrentUser();

  const bookingType = room.category;
  let formHtml = '';

  if (bookingType === 'room') {
    formHtml = `
      <div class="booking-section">
        <h3>1. เลือกประเภทห้อง</h3>
        <div class="booking-options">
          <label class="option-box">
            <input type="radio" name="roomType" value="ธรรมดา" checked />
            <div>ธรรมดา</div>
          </label>
          <label class="option-box">
            <input type="radio" name="roomType" value="พรีเมียม" />
            <div>พรีเมียม</div>
          </label>
        </div>
      </div>
      <div class="booking-section">
        <h3>2. เลือกรูปแบบ</h3>
        <div class="booking-options">
          <label class="option-box">
            <input type="radio" name="mealType" value="รวมอาหารเช้า" checked />
            <div>รวมอาหารเช้า</div>
          </label>
          <label class="option-box">
            <input type="radio" name="mealType" value="ไม่รวมอาหารเช้า" />
            <div>ไม่รวมอาหารเช้า</div>
          </label>
        </div>
      </div>
      <div class="booking-section">
        <h3>3. ประเภทลูกค้า</h3>
        <select id="customerTypeRoom">
          <option value="บุคคลภายนอก">บุคคลภายนอก</option>
          <option value="นิสิต">นิสิต</option>
          <option value="หน่วยงานภายใน">หน่วยงานภายใน</option>
        </select>
      </div>
      <div class="booking-section">
        <h3>4. ข้อมูลส่วนตัว</h3>
        <div class="form-row">
          <label>ชื่อ-นามสกุล</label>
          <input type="text" id="roomCustomerName" value="${customer ? customer.name : ''}" />
        </div>
        <div class="form-row">
          <label>เบอร์โทร</label>
          <input type="text" id="roomCustomerPhone" value="${customer ? customer.phone : ''}" />
        </div>
        <div class="form-row">
          <label>เลขบัตรประชาชน</label>
          <input type="text" id="roomCustomerId" value="${customer ? customer.idCard : ''}" />
        </div>
      </div>
      <button class="primary-btn full-width" id="createRoomBooking">สร้างใบเสนอราคา / มัดจำ 30%</button>
    `;
  } else if (bookingType === 'meeting') {
    formHtml = `
      <div class="booking-section">
        <h3>1. ป���ะเภทงาน</h3>
        <select id="meetingType">
          <option value="งานประชุม">งานประชุม</option>
          <option value="งานแต่ง">งานแต่ง</option>
          <option value="งานสัมมนา">งานสัมมนา</option>
        </select>
      </div>
      <div class="booking-section">
        <h3>2. ช่วงเวลา</h3>
        <div class="booking-options">
          <label class="option-box">
            <input type="radio" name="timeRange" value="เต็มวัน" checked />
            <div>เต็มวัน</div>
          </label>
          <label class="option-box">
            <input type="radio" name="timeRange" value="ครึ่งวัน" />
            <div>ครึ่งวัน</div>
          </label>
        </div>
      </div>
      <div class="booking-section">
        <h3>3. ประเภทลูกค้า</h3>
        <select id="customerTypeMeeting">
          <option value="ภายใน">ภายใน</option>
          <option value="ภายนอก">ภายนอก</option>
        </select>
      </div>
      <div class="booking-section">
        <h3>4. ข้อมูลส่วนตัว</h3>
        <div class="form-row">
          <label>ชื่อ-นามสกุล</label>
          <input type="text" id="meetingCustomerName" value="${customer ? customer.name : ''}" />
        </div>
        <div class="form-row">
          <label>เบอร์โทร</label>
          <input type="text" id="meetingCustomerPhone" value="${customer ? customer.phone : ''}" />
        </div>
      </div>
      <button class="primary-btn full-width" id="createMeetingBooking">สร้างใบเสนอราคา / มัดจำ 30%</button>
    `;
  } else {
    formHtml = `
      <div class="booking-section">
        <h3>1. วันที่และรายละเอียดงาน</h3>
        <div class="form-row">
          <label>วันที่</label>
          <input type="date" id="hallDate" value="${getDateOffset(3)}" />
        </div>
        <div class="form-row">
          <label>รายละเอียดงาน</label>
          <textarea id="hallDetail" rows="4">งานสัมมนา/พิธีสำคัญ</textarea>
        </div>
      </div>
      <div class="booking-section">
        <h3>2. ราคา</h3>
        <p>ราคาคงที่ทุกประเภทลูกค้า: ฿30,000 หรือ ฿25,000</p>
        <select id="hallPricePlan">
          <option value="30000">30,000 บาท</option>
          <option value="25000">25,000 บาท</option>
        </select>
      </div>
      <button class="primary-btn full-width" id="createHallBooking">ยืนยันการจอง</button>
    `;
  }

  container.innerHTML = formHtml;

  const invoice = document.getElementById('invoiceContainer');
  invoice.innerHTML = `
    <div class="invoice-box">
      <h3>ข้อมูลห้องที่เลือก</h3>
      <p><strong>${room.name}</strong></p>
      <div class="invoice-row"><span>ประเภท</span><span>${room.category === 'room' ? 'ห้องพัก' : room.category === 'meeting' ? 'ห้องประชุม' : 'หอประชุมใหญ่'}</span></div>
      <div class="invoice-row"><span>ราคา</span><span>฿${room.price.toLocaleString()}</span></div>
      <div class="invoice-row"><span>ค่ามัดจำ 30%</span><span>฿${Math.round(room.price * 0.3).toLocaleString()}</span></div>
      <div class="invoice-row total"><span>รวม</span><span>฿${Math.round(room.price * 0.3).toLocaleString()}</span></div>
    </div>
  `;

  setTimeout(() => {
    const createButton = document.getElementById('createRoomBooking') || document.getElementById('createMeetingBooking') || document.getElementById('createHallBooking');
    if (createButton) {
      createButton.addEventListener('click', handleCreateBooking);
    }
  }, 0);
}

function handleCreateBooking() {
  const room = app.selectedRoom;
  if (!room) return;

  const customer = getCurrentUser();
  if (!customer) {
    alert('กรุณาเข้าสู่ระบบก่อนทำการจอง');
    showView('auth');
    return;
  }

  const bookingId = `BK-${Date.now().toString().slice(-4)}`;
  const amount = room.category === 'hall' ? Number(document.getElementById('hallPricePlan')?.value || room.price) : room.price;
  const deposit = Math.round(amount * 0.3);

  const newBooking = {
    id: bookingId,
    customerId: customer.id,
    roomId: room.id,
    roomName: room.name,
    category: room.category,
    bookingType: room.category,
    date: room.category === 'hall' ? document.getElementById('hallDate').value || getDateOffset(3) : getDateOffset(1),
    nights: room.category === 'room' ? 2 : 1,
    hours: room.category === 'meeting' ? 6 : 0,
    guestType: room.category === 'room' ? document.getElementById('customerTypeRoom').value : document.getElementById('customerTypeMeeting').value || 'ภายใน',
    status: 'รอชำระมัดจำ',
    amount,
    deposit,
    depositPaid: false,
    slipFile: '',
    details: room.category === 'hall' ? document.getElementById('hallDetail').value : `จอง${room.name}`,
  };

  state.bookings.unshift(newBooking);
  saveState();
  renderHistory();
  renderInvoice(newBooking);
  showView('booking');
}

function renderInvoice(booking) {
  const invoice = document.getElementById('invoiceContainer');
  invoice.innerHTML = `
    <div class="invoice-box">
      <h3>ใบเสนอราคา / ใบแจ้งมัดจำ</h3>
      <div class="invoice-row"><span>รหัสการจอง</span><span>${booking.id}</span></div>
      <div class="invoice-row"><span>ห้อง</span><span>${booking.roomName}</span></div>
      <div class="invoice-row"><span>ยอดที่ต้องชำระ</span><span>฿${booking.deposit.toLocaleString()}</span></div>
      <div class="invoice-row"><span>ช่องทางชำระ</span><span>โอนบัญชี / QR Code</span></div>
      <div class="payment-box">
        <h4>ช่องทางการชำระเงิน</h4>
        <div class="bank-list">
          <div class="bank-box">
            <strong>บัญชีค่าห้องพัก</strong>
            <div>ธนาคารกสิกรไทย</div>
            <div>123-4-56789-0</div>
          </div>
          <div class="bank-box">
            <strong>บัญชีค่าอาหาร</strong>
            <div>ธนาคารไทยพาณิชย์</div>
            <div>987-0-12345-6</div>
          </div>
        </div>
        <div class="qr-box">QR</div>
      </div>
      <div class="card-actions">
        <button class="primary-btn full-width" id="paymentConfirmButton">ยืนยันการชำระเงิน</button>
      </div>
    </div>
  `;

  document.getElementById('paymentConfirmButton').addEventListener('click', () => {
    booking.depositPaid = true;
    booking.status = 'รอตรวจสอบการชำระเงิน';
    saveState();
    renderHistory();
    invoice.innerHTML = `
      <div class="invoice-box">
        <h3>แจ้งชำระเงินสำเร็จ</h3>
        <p>ระบบเปลี่ยนสถานะการจองเป็น <strong>รอตรวจสอบการชำระเงิน</strong></p>
        <p>ลูกค้าสามารถอัปโหลดสลิปยืนยันได้จากประวัติการจอง</p>
      </div>
    `;
  });
}

function renderHistory() {
  const historyList = document.getElementById('historyList');
  const currentUser = getCurrentUser();

  if (!currentUser) {
    historyList.innerHTML = '<p>กรุณาเข้าสู่ระบบเพื่อดูประวัติการจอง</p>';
    return;
  }

  const bookings = state.bookings.filter((booking) => booking.customerId === currentUser.id);

  if (!bookings.length) {
    historyList.innerHTML = '<p>ยังไม่มีประวัติการจอง</p>';
    return;
  }

  historyList.innerHTML = bookings
    .map((booking) => {
      const statusClass =
        booking.status === 'ชำระเงินแล้ว' ? 'confirmed' : booking.status === 'ยกเลิกแล้ว' ? 'cancelled' : 'pending';

      return `
        <div class="history-item">
          <div class="history-top">
            <div>
              <strong>${booking.roomName}</strong>
              <div>${booking.date}</div>
            </div>
            <span class="badge ${statusClass}">${booking.status}</span>
          </div>
          <div class="meta-grid">
            <div>รหัส: ${booking.id}</div>
            <div>ประเภท: ${booking.category === 'room' ? 'ห้องพัก' : booking.category === 'meeting' ? 'ห้องประชุม' : 'หอประชุมใหญ่'}</div>
            <div>ยอดชำระ: ฿${booking.amount.toLocaleString()}</div>
            <div>มัดจำ: ฿${booking.deposit.toLocaleString()}</div>
          </div>
          <div>${booking.details}</div>
          <div class="card-actions">
            <button class="secondary-btn" data-action="upload" data-id="${booking.id}">แจ้งชำระเงิน</button>
            <button class="ghost-btn" data-action="cancel" data-id="${booking.id}">ยกเลิก</button>
            <button class="ghost-btn" data-action="change" data-id="${booking.id}">เลื่อนวัน / เปลี่ยนห้อง</button>
          </div>
        </div>
      `;
    })
    .join('');

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      const action = button.dataset.action;
      const booking = state.bookings.find((item) => item.id === id);

      if (!booking) return;

      if (action === 'cancel') {
        booking.status = 'ยกเลิกแล้ว';
        saveState();
        renderHistory();
      }

      if (action === 'change') {
        booking.status = 'เปลี่ยนแปลงแล้ว';
        saveState();
        renderHistory();
      }

      if (action === 'upload') {
        booking.status = 'รอตรวจสอบการชำระเงิน';
        booking.slipFile = 'slip-confirm.png';
        saveState();
        renderHistory();
      }
    });
  });
}

bootstrap();
