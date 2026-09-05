// =========================================================
// SERVICES LIST (Bilingual Arabic / English)
// =========================================================
const SERVICES = [
    {
        id: 'full-color',
        name: 'صبغة شعر كاملة (Full Hair Color)',
        duration: 'ساعتان ونصف - 3 ساعات',
        durationMinutes: 180,
        icon: 'fa-paint-brush',
        desc: 'صبغ وتلوين الشعر بالكامل من الجذور حتى الأطراف بأحدث الألوان والتقنيات.'
    },
    {
        id: 'root-touchup',
        name: 'صبغة جذور (Root Touch-Up)',
        duration: 'ساعة ونصف',
        durationMinutes: 90,
        icon: 'fa-magic',
        desc: 'تغطية الشيب وتجديد لون الجذور المتنامية ومطابقتها مع بقية الشعر.'
    },
    {
        id: 'highlights-balayage',
        name: 'خصل وميش / بالياج (Highlights & Balayage)',
        duration: '3 إلى 4 ساعات',
        durationMinutes: 240,
        icon: 'fa-wand-magic-sparkles',
        desc: 'سحب لون وخصل متدرجة (بلوند، كراميل، عسلي) لإطلالة عصرية مشرقة.'
    },
    {
        id: 'blowdry-styling',
        name: 'استشوار وتسريحة (Blow-Dry & Hair Styling)',
        duration: 'ساعة واحدة',
        durationMinutes: 60,
        icon: 'fa-wind',
        desc: 'سشوار احترافي ويفي، كيرلي، ليس، أو تسريحات خاصة بالمناسبات.'
    },
    {
        id: 'haircut-styling',
        name: 'قص أطراف وتدريج واستشوار (Haircut & Style)',
        duration: 'ساعة ونصف',
        durationMinutes: 90,
        icon: 'fa-scissors',
        desc: 'قص أطراف الشعر المتقصفة أو قصة مدرجة جديدة مع سشوار نهائي.'
    },
    {
        id: 'deep-treatment',
        name: 'جلسة ترطيب وماسك علاجي (Deep Hair Treatment)',
        duration: 'ساعة واحدة',
        durationMinutes: 60,
        icon: 'fa-heart-pulse',
        desc: 'ترطيب عميق بالبروتين والزيوت المغذية لحماية الشعر المصبوغ واستعادة لمعانه.'
    }
];

// =========================================================
// LOCAL STORAGE KEYS & DEFAULT SETTINGS
// =========================================================
const STORAGE_KEYS = {
    APPOINTMENTS: 'home_salon_appointments_v2',
    SETTINGS: 'home_salon_settings_v2',
    BLOCKED_DATES: 'home_salon_blocked_dates_v2'
};

const DEFAULT_SETTINGS = {
    workStart: '10:00',
    workEnd: '21:00',
    slotInterval: 60, // in minutes
    momPhone: '' // Mom's WhatsApp phone number (e.g. 966501234567)
};

// Global State
let settings = { ...DEFAULT_SETTINGS };
let appointments = [];
let blockedDates = [];

let selectedService = null;
let selectedDate = '';
let selectedTime = '';

// =========================================================
// INITIALIZATION ON DOM READY
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    loadStoredData();
    renderServicesGrid();
    initDatePicker();
    initEventListeners();
    renderAppointmentsTable();
    renderBlockedDatesList();

    // Check if URL has service or date pre-set
    autoSelectFirstService();
});

// =========================================================
// DATA PERSISTENCE (LocalStorage)
// =========================================================
function loadStoredData() {
    try {
        const storedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
        if (storedAppointments) {
            appointments = JSON.parse(storedAppointments);
        }

        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (storedSettings) {
            settings = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(storedSettings));
        } else {
            settings = { ...DEFAULT_SETTINGS };
        }

        // Validate settings values
        if (!settings.workStart) settings.workStart = DEFAULT_SETTINGS.workStart;
        if (!settings.workEnd) settings.workEnd = DEFAULT_SETTINGS.workEnd;
        if (!settings.slotInterval) settings.slotInterval = DEFAULT_SETTINGS.slotInterval;

        const storedBlocked = localStorage.getItem(STORAGE_KEYS.BLOCKED_DATES);
        if (storedBlocked) {
            blockedDates = JSON.parse(storedBlocked);
        }

        // Populate admin inputs (defer if they don't exist yet)
        setTimeout(() => {
            const startInput = document.getElementById('setWorkStart');
            const endInput = document.getElementById('setWorkEnd');
            const intervalInput = document.getElementById('setSlotInterval');
            const phoneInput = document.getElementById('setMomPhone');

            if (startInput) startInput.value = settings.workStart;
            if (endInput) endInput.value = settings.workEnd;
            if (intervalInput) intervalInput.value = settings.slotInterval;
            if (phoneInput) phoneInput.value = settings.momPhone || '';
        }, 0);
    } catch (e) {
        console.error('Error reading localStorage:', e);
        settings = { ...DEFAULT_SETTINGS };
        appointments = [];
        blockedDates = [];
    }
}

function persistData() {
    try {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        localStorage.setItem(STORAGE_KEYS.BLOCKED_DATES, JSON.stringify(blockedDates));
    } catch (e) {
        console.error('Error writing to localStorage:', e);
    }
}

// =========================================================
// RENDER SERVICES (Grid & Dropdown)
// =========================================================
function renderServicesGrid() {
    const grid = document.getElementById('servicesGrid');
    const select = document.getElementById('serviceSelect');

    grid.innerHTML = '';
    select.innerHTML = '<option value="">-- اضغطي هنا لاختيار الخدمة --</option>';

    SERVICES.forEach(service => {
        // 1. Grid Card
        const card = document.createElement('div');
        card.className = 'service-card';
        card.dataset.id = service.id;
        card.innerHTML = `
            <div class="service-card-header">
                <div class="service-icon-box">
                    <i class="fas ${service.icon}"></i>
                </div>
                <div>
                    <h3>${service.name}</h3>
                </div>
            </div>
            <span class="service-duration-badge"><i class="far fa-clock"></i> ${service.duration}</span>
            <p>${service.desc}</p>
        `;

        card.addEventListener('click', () => {
            selectService(service.id, true);
        });

        grid.appendChild(card);

        // 2. Dropdown Option
        const opt = document.createElement('option');
        opt.value = service.id;
        opt.textContent = `${service.name} (${service.duration})`;
        select.appendChild(opt);
    });
}

function selectService(serviceId, scrollToBooking = false) {
    selectedService = SERVICES.find(s => s.id === serviceId) || null;

    // Highlight selected card
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.id === serviceId);
    });

    // Update Dropdown
    document.getElementById('serviceSelect').value = serviceId || '';

    updateSummary();
    renderTimeSlots();

    if (scrollToBooking && selectedService) {
        document.getElementById('bookingSection').scrollIntoView({ behavior: 'smooth' });
    }
}

function autoSelectFirstService() {
    // Optionally pre-select first service if desired
    // selectService(SERVICES[0].id, false);
}

// =========================================================
// DATE PICKER INITIALIZATION & HANDLING
// =========================================================
function initDatePicker() {
    const datePicker = document.getElementById('datePicker');
    const blockDateInput = document.getElementById('blockDateInput');

    // Minimum date is today (YYYY-MM-DD)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    datePicker.min = todayStr;
    if (blockDateInput) blockDateInput.min = todayStr;

    // Handle date change across all browser events
    const onDateChange = (e) => {
        selectedDate = e.target.value;
        selectedTime = ''; // reset slot when date changes
        updateSummary();
        renderTimeSlots();
    };

    datePicker.addEventListener('change', onDateChange);
    datePicker.addEventListener('input', onDateChange);
    datePicker.addEventListener('blur', onDateChange);
}

// =========================================================
// TIME SLOTS GENERATION & RENDERING
// =========================================================
function renderTimeSlots() {
    const grid = document.getElementById('slotsGrid');
    const statusMsg = document.getElementById('slotStatusMsg');

    // 1. Check if Service is selected
    if (!selectedService) {
        statusMsg.style.display = 'block';
        statusMsg.innerHTML = '<i class="fas fa-hand-pointer"></i> يرجى اختيار الخدمة أولاً (الخطوة 1).';
        grid.innerHTML = '';
        hideStep4();
        return;
    }

    // 2. Check if Date is selected
    if (!selectedDate) {
        statusMsg.style.display = 'block';
        statusMsg.innerHTML = '<i class="fas fa-calendar-day"></i> يرجى اختيار التاريخ المناسب من التقويم (الخطوة 2).';
        grid.innerHTML = '';
        hideStep4();
        return;
    }

    // 3. Check if Date is Blocked by Mom (Day off)
    if (blockedDates.includes(selectedDate)) {
        statusMsg.style.display = 'block';
        statusMsg.innerHTML = '<i class="fas fa-calendar-times" style="color:#d9455f;"></i> عذراً، هذا اليوم محجوز أو إجازة في الصالون. يرجى اختيار يوم آخر.';
        grid.innerHTML = '';
        hideStep4();
        return;
    }

    // 4. Generate Slots
    const slots = generateTimeSlots();

    if (slots.length === 0) {
        statusMsg.style.display = 'block';
        statusMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> لا توجد ساعات عمل محددة لهذا اليوم. يرجى مراجعة إعدادات الأوقات.';
        grid.innerHTML = '';
        hideStep4();
        return;
    }

    // Hide status message and render slots
    statusMsg.style.display = 'none';
    grid.innerHTML = '';

    // Find all already booked appointments for that date
    const bookedTimes = appointments
        .filter(app => app.date === selectedDate && app.status === 'confirmed')
        .map(app => app.time);

    // Check if selected date is today to disable past hours
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const isToday = (selectedDate === todayStr);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    slots.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot-btn';
        btn.dataset.time = slot.time24;

        // Check booked
        const isBooked = bookedTimes.includes(slot.time24);

        // Check if past hour today
        const slotMinutes = slot.hour * 60 + slot.minute;
        const isPast = isToday && (slotMinutes <= currentMinutes);

        if (isBooked) {
            btn.classList.add('booked');
            btn.disabled = true;
            btn.innerHTML = `
                <span>${slot.time12}</span>
                <small><i class="fas fa-lock"></i> محجوز</small>
            `;
        } else if (isPast) {
            btn.classList.add('disabled');
            btn.disabled = true;
            btn.innerHTML = `
                <span>${slot.time12}</span>
                <small>انتهى وقته</small>
            `;
        } else {
            if (selectedTime === slot.time24) {
                btn.classList.add('selected');
            }
            btn.innerHTML = `
                <span>${slot.time12}</span>
                <small>${slot.periodAr}</small>
            `;
            btn.addEventListener('click', () => {
                selectTimeSlot(slot.time24, slot.time12, btn);
            });
        }

        grid.appendChild(btn);
    });
}

function generateTimeSlots() {
    const list = [];

    // Ensure we have valid settings with fallbacks
    const workStart = settings.workStart || DEFAULT_SETTINGS.workStart;
    const workEnd = settings.workEnd || DEFAULT_SETTINGS.workEnd;
    const interval = parseInt(settings.slotInterval || DEFAULT_SETTINGS.slotInterval, 10);

    // Parse times safely
    const startParts = workStart.split(':');
    const endParts = workEnd.split(':');

    const startH = parseInt(startParts[0], 10) || 10;
    const startM = parseInt(startParts[1], 10) || 0;
    const endH = parseInt(endParts[0], 10) || 21;
    const endM = parseInt(endParts[1], 10) || 0;

    let curr = (startH * 60) + startM;
    const end = (endH * 60) + endM;

    // Safety check
    if (curr >= end || interval <= 0) {
        console.error('Invalid time settings:', { workStart, workEnd, interval });
        return [];
    }

    while (curr < end) {
        const h = Math.floor(curr / 60);
        const m = curr % 60;
        const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        const periodEn = h >= 12 ? 'PM' : 'AM';
        const periodAr = h >= 12 ? 'مساءً' : 'صباحاً';
        const h12 = h % 12 || 12;
        const time12 = `${h12}:${String(m).padStart(2, '0')} ${periodEn}`;

        list.push({
            time24,
            time12,
            periodAr,
            hour: h,
            minute: m
        });

        curr += interval;
    }

    return list;
}

function selectTimeSlot(time24, time12, buttonEl) {
    selectedTime = time24;

    // Highlight button
    document.querySelectorAll('.slot-btn').forEach(btn => btn.classList.remove('selected'));
    if (buttonEl) buttonEl.classList.add('selected');

    updateSummary();

    // Reveal Step 4
    const step4 = document.getElementById('step4Box');
    step4.style.display = 'block';
    step4.scrollIntoView({ behavior: 'smooth' });
}

function hideStep4() {
    const step4 = document.getElementById('step4Box');
    if (step4) step4.style.display = 'none';
}

// =========================================================
// SUMMARY UPDATE
// =========================================================
function updateSummary() {
    const sumService = document.getElementById('sumService');
    const sumDate = document.getElementById('sumDate');
    const sumTime = document.getElementById('sumTime');
    const sumDuration = document.getElementById('sumDuration');

    sumService.textContent = selectedService ? selectedService.name : '—';
    sumDate.textContent = selectedDate || '—';
    sumTime.textContent = selectedTime ? formatTime12(selectedTime) : '—';
    sumDuration.textContent = selectedService ? selectedService.duration : '—';
}

function formatTime12(time24) {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'مساءً (PM)' : 'صباحاً (AM)';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

// =========================================================
// EVENT LISTENERS & FORM SUBMISSIONS
// =========================================================
function initEventListeners() {
    // Dropdown Service selection
    document.getElementById('serviceSelect').addEventListener('change', (e) => {
        selectService(e.target.value, false);
    });

    // Form Submit
    document.getElementById('bookingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleBookingSubmission();
    });

    // WhatsApp Button Click
    document.getElementById('whatsappBtn').addEventListener('click', () => {
        handleWhatsAppDirectBooking();
    });

    // Admin Toggle
    document.getElementById('toggleAdminBtn').addEventListener('click', () => {
        const body = document.getElementById('adminBody');
        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? 'block' : 'none';
        document.getElementById('toggleAdminBtn').innerHTML = isHidden
            ? '<i class="fas fa-eye-slash"></i> إخفاء لوحة المواعيد'
            : '<i class="fas fa-eye"></i> فتح لوحة المواعيد';
    });

    // Admin Tabs
    document.querySelectorAll('.admin-tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');

            tabBtn.classList.add('active');
            const target = tabBtn.dataset.tab;
            document.getElementById(target).style.display = 'block';
        });
    });

    // Save Admin Schedule Settings
    document.getElementById('saveScheduleBtn').addEventListener('click', () => {
        const workStart = document.getElementById('setWorkStart').value || '10:00';
        const workEnd = document.getElementById('setWorkEnd').value || '21:00';
        const slotInterval = parseInt(document.getElementById('setSlotInterval').value || 60, 10);
        const momPhone = document.getElementById('setMomPhone').value.trim();

        // Validate that end time is after start time
        const [startH, startM] = workStart.split(':').map(Number);
        const [endH, endM] = workEnd.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        if (endMinutes <= startMinutes) {
            alert('❌ وقت الانتهاء يجب أن يكون بعد وقت البدء! يرجى التحقق من الأوقات المدخلة.');
            return;
        }

        settings.workStart = workStart;
        settings.workEnd = workEnd;
        settings.slotInterval = slotInterval;
        settings.momPhone = momPhone;

        persistData();
        alert('✅ تم حفظ إعدادات ساعات العمل ورقم الواتساب بنجاح!');
        renderTimeSlots();
    });

    // Add Blocked Date
    document.getElementById('addBlockedDateBtn').addEventListener('click', () => {
        const dateInput = document.getElementById('blockDateInput');
        const val = dateInput.value;
        if (val && !blockedDates.includes(val)) {
            blockedDates.push(val);
            persistData();
            renderBlockedDatesList();
            dateInput.value = '';
            if (selectedDate === val) renderTimeSlots();
        }
    });

    // Modal Close
    document.getElementById('modalCloseBtn').addEventListener('click', () => {
        document.getElementById('successModal').classList.remove('active');
    });

    // Modal WhatsApp Redirect
    document.getElementById('modalSendWhatsappBtn').addEventListener('click', () => {
        sendLatestBookingToWhatsApp();
    });

    // Admin Search
    document.getElementById('adminSearchInput').addEventListener('input', (e) => {
        renderAppointmentsTable(e.target.value);
    });

    // Clear Cancelled/Old
    document.getElementById('clearCancelledBtn').addEventListener('click', () => {
        if (confirm('هل ترغبين في حذف المواعيد الملغاة أو القديمة لتنظيم الجدول؟')) {
            appointments = appointments.filter(a => a.status === 'confirmed');
            persistData();
            renderAppointmentsTable();
        }
    });
}

// =========================================================
// BOOKING SUBMISSION & MODAL
// =========================================================
let latestBooking = null;

function handleBookingSubmission() {
    if (!selectedService || !selectedDate || !selectedTime) {
        alert('يرجى التأكد من اختيار الخدمة والتاريخ والوقت المناسب.');
        return;
    }

    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const notes = document.getElementById('clientNotes').value.trim();

    if (!name || !phone) {
        alert('يرجى إدخال الاسم ورقم الجوال لتأكيد الحجز.');
        return;
    }

    // Check if slot was booked just now
    const isAlreadyBooked = appointments.some(a => a.date === selectedDate && a.time === selectedTime && a.status === 'confirmed');
    if (isAlreadyBooked) {
        alert('عذراً، هذا الوقت تم حجزه للتو. يرجى اختيار وقت آخر.');
        renderTimeSlots();
        return;
    }

    const booking = {
        id: 'HAIR-' + Date.now().toString().slice(-6),
        clientName: name,
        clientPhone: phone,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        duration: selectedService.duration,
        date: selectedDate,
        time: selectedTime,
        notes: notes,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };

    appointments.push(booking);
    latestBooking = booking;
    persistData();

    // Show Confirmation Modal
    showReceiptModal(booking);

    // Reset Form & Re-render
    document.getElementById('bookingForm').reset();
    selectedTime = '';
    renderTimeSlots();
    renderAppointmentsTable();
}

function showReceiptModal(booking) {
    const receiptBox = document.getElementById('modalReceiptDetails');
    receiptBox.innerHTML = `
        <p><strong>رقم الحجز:</strong> <span style="color:#b8627d; font-weight:800;">${booking.id}</span></p>
        <p><strong>اسم العميلة:</strong> ${booking.clientName}</p>
        <p><strong>الخدمة:</strong> ${booking.serviceName}</p>
        <p><strong>التاريخ:</strong> ${booking.date}</p>
        <p><strong>الوقت:</strong> ${formatTime12(booking.time)}</p>
        <p><strong>المدة المتوقعة:</strong> ${booking.duration}</p>
        ${booking.notes ? `<p><strong>ملاحظات:</strong> ${booking.notes}</p>` : ''}
    `;

    document.getElementById('successModal').classList.add('active');
}

function handleWhatsAppDirectBooking() {
    if (!selectedService || !selectedDate || !selectedTime) {
        alert('يرجى اختيار الخدمة والتاريخ والوقت أولاً!');
        return;
    }

    const name = document.getElementById('clientName').value.trim() || 'عميلة جديدة';
    const notes = document.getElementById('clientNotes').value.trim();

    const msg = `مرحباً! أود حجز موعد في صالون الشعر المنزلي:%0A%0A` +
        `👤 *الاسم:* ${encodeURIComponent(name)}%0A` +
        `💇‍♀️ *الخدمة:* ${encodeURIComponent(selectedService.name)}%0A` +
        `📅 *التاريخ:* ${selectedDate}%0A` +
        `⏰ *الوقت:* ${encodeURIComponent(formatTime12(selectedTime))}%0A` +
        `⏳ *المدة:* ${encodeURIComponent(selectedService.duration)}%0A` +
        (notes ? `📝 *ملاحظات الشعر:* ${encodeURIComponent(notes)}%0A` : '') +
        `%0Aيرجى تأكيد توفر الموعد. شكراً جزيلاً!`;

    const targetPhone = settings.momPhone ? settings.momPhone.replace(/[^0-9]/g, '') : '';
    const url = targetPhone
        ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${msg}`
        : `https://api.whatsapp.com/send?text=${msg}`;

    window.open(url, '_blank');
}

function sendLatestBookingToWhatsApp() {
    if (!latestBooking) return;

    const msg = `مرحباً! تم تأكيد حجزي عبر الموقع برقم (${latestBooking.id}):%0A%0A` +
        `👤 *الاسم:* ${encodeURIComponent(latestBooking.clientName)}%0A` +
        `💇‍♀️ *الخدمة:* ${encodeURIComponent(latestBooking.serviceName)}%0A` +
        `📅 *التاريخ:* ${latestBooking.date}%0A` +
        `⏰ *الوقت:* ${encodeURIComponent(formatTime12(latestBooking.time))}%0A` +
        `⏳ *المدة:* ${encodeURIComponent(latestBooking.duration)}%0A` +
        (latestBooking.notes ? `📝 *ملاحظات:* ${encodeURIComponent(latestBooking.notes)}%0A` : '');

    const targetPhone = settings.momPhone ? settings.momPhone.replace(/[^0-9]/g, '') : '';
    const url = targetPhone
        ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${msg}`
        : `https://api.whatsapp.com/send?text=${msg}`;

    window.open(url, '_blank');
}

// =========================================================
// ADMIN TABLE & BLOCKED DATES
// =========================================================
function renderAppointmentsTable(searchQuery = '') {
    const tbody = document.getElementById('appointmentsListBody');
    tbody.innerHTML = '';

    let filtered = [...appointments];

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(a =>
            a.clientName.toLowerCase().includes(q) ||
            a.clientPhone.includes(q) ||
            a.serviceName.toLowerCase().includes(q) ||
            a.id.toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #888; padding: 25px;">لا توجد مواعيد مسجلة حالياً.</td></tr>`;
        return;
    }

    // Sort ascending by date and time
    filtered.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    filtered.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${app.clientName}</strong><br><small style="color:#999;">${app.id}</small></td>
            <td><a href="tel:${app.clientPhone}" style="color: #b8627d; font-weight:700; text-decoration:none;"><i class="fas fa-phone"></i> ${app.clientPhone}</a></td>
            <td>${app.serviceName}</td>
            <td>${app.date}</td>
            <td><strong>${formatTime12(app.time)}</strong></td>
            <td><small>${app.notes || '—'}</small></td>
            <td><span class="status-tag ${app.status}">${app.status === 'confirmed' ? 'مؤكد' : app.status}</span></td>
            <td>
                <button class="btn-table-del" title="إلغاء وحذف الموعد" onclick="cancelAppointment('${app.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.cancelAppointment = function(id) {
    if (confirm('هل أنتِ متأكدة من إلغاء وحذف هذا الموعد؟')) {
        appointments = appointments.filter(a => a.id !== id);
        persistData();
        renderAppointmentsTable();
        renderTimeSlots();
    }
};

function renderBlockedDatesList() {
    const ul = document.getElementById('blockedDatesUl');
    if (!ul) return;
    ul.innerHTML = '';

    if (blockedDates.length === 0) {
        ul.innerHTML = `<li style="color: #999; font-weight: normal;">لا توجد أيام محظورة حالياً</li>`;
        return;
    }

    blockedDates.forEach((dateStr, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><i class="fas fa-ban" style="color:#d9455f;"></i> ${dateStr}</span>
            <button style="background:none; border:none; color:#d9455f; cursor:pointer; font-size:1rem;" title="إلغاء الحظر" onclick="removeBlockedDate(${idx})">
                <i class="fas fa-times"></i>
            </button>
        `;
        ul.appendChild(li);
    });
}

window.removeBlockedDate = function(idx) {
    blockedDates.splice(idx, 1);
    persistData();
    renderBlockedDatesList();
    renderTimeSlots();
};
