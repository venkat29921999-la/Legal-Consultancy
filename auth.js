/* =========================================================================
   AUTH + DASHBOARD ENGINE — login.html, signup.html, admin-dashboard.html,
   user-dashboard.html. No alert()/confirm() anywhere; all feedback is
   inline UI. Every block no-ops safely when its markup isn't present.
========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const hasGsapAuth = !!window.gsap;
  const reduceMotionAuth = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const StackAuth = {
    getUsers() { try { return JSON.parse(localStorage.getItem('stackly_users')) || []; } catch (e) { return []; } },
    saveUser(user) {
      const users = this.getUsers();
      users.push(user);
      localStorage.setItem('stackly_users', JSON.stringify(users));
    },
    findUser(email, role) {
      return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    },
    setSession(user) { localStorage.setItem('stackly_current_user', JSON.stringify(user)); },
    getSession() { try { return JSON.parse(localStorage.getItem('stackly_current_user')); } catch (e) { return null; } },
    clearSession() { localStorage.removeItem('stackly_current_user'); }
  };
  window.StackAuth = StackAuth;

  function showMsg(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = 'auth-msg ' + type;
    el.style.display = 'flex';
    if (hasGsapAuth && type === 'error' && !reduceMotionAuth) {
      gsap.fromTo(el, { x: 0 }, { x: 0, duration: 0.01 }); // reset so CSS shake keyframes retrigger
      el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    }
  }
  function emailValid(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  /* ---------- entrance animation shared by both auth pages ---------- */
  if (document.body.classList.contains('auth-page') && hasGsapAuth && !reduceMotionAuth) {
    gsap.from('.auth-card > *', { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out', stagger: 0.07, delay: 0.15 });
    gsap.to('.auth-blob', {}); // blobs already animate via CSS keyframes
  }

  /* ---------- rotating quote carousel on the auth brand panel ---------- */
  (function quoteCarousel() {
    const quotes = document.querySelectorAll('.auth-quote');
    const dots = document.querySelectorAll('.auth-dots i');
    if (!quotes.length) return;
    let i = 0;
    setInterval(() => {
      quotes[i].classList.remove('active');
      dots[i] && dots[i].classList.remove('active');
      i = (i + 1) % quotes.length;
      quotes[i].classList.add('active');
      dots[i] && dots[i].classList.add('active');
    }, 4200);
  })();

  /* ---------- password show/hide toggle ---------- */
  document.querySelectorAll('.fld-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      btn.innerHTML = isPwd ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });
  });

  /* ---------- password strength meter (signup) ---------- */
  const pwdField = document.getElementById('signupPassword');
  const pwdStrength = document.getElementById('pwStrength');
  if (pwdField && pwdStrength) {
    pwdField.addEventListener('input', () => {
      const v = pwdField.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      pwdStrength.className = 'pw-strength' + (v.length ? ' s' + Math.max(1, score) : '');
    });
  }

  /* ---------- LOGIN form ---------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const msg = document.getElementById('loginMsg');
    const btn = loginForm.querySelector('.btn-primary');
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const role = loginForm.querySelector('input[name="loginRole"]:checked').value;

      if (!emailValid(email)) { showMsg(msg, 'Please enter a valid email address.', 'error'); return; }
      if (password.length < 6) { showMsg(msg, 'Password must be at least 6 characters.', 'error'); return; }

      btn.classList.add('loading');
      const existing = StackAuth.findUser(email, role);
      const name = existing ? existing.name : email.split('@')[0].replace(/[._]/g, ' ');

      setTimeout(() => {
        StackAuth.setSession({ name, email, role });
        showMsg(msg, 'Signed in — redirecting to your dashboard…', 'success');
        setTimeout(() => {
          window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
        }, 500);
      }, 700);
    });
  }

  /* ---------- SIGNUP form ---------- */
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    const msg = document.getElementById('signupMsg');
    const btn = signupForm.querySelector('.btn-primary');
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirm = document.getElementById('signupConfirm').value;
      const role = signupForm.querySelector('input[name="signupRole"]:checked').value;
      const terms = document.getElementById('signupTerms');

      if (name.length < 2) { showMsg(msg, 'Please enter your full name.', 'error'); return; }
      if (!emailValid(email)) { showMsg(msg, 'Please enter a valid email address.', 'error'); return; }
      if (password.length < 6) { showMsg(msg, 'Password must be at least 6 characters.', 'error'); return; }
      if (password !== confirm) { showMsg(msg, 'Passwords do not match.', 'error'); return; }
      if (terms && !terms.checked) { showMsg(msg, 'Please accept the Terms to continue.', 'error'); return; }

      btn.classList.add('loading');
      setTimeout(() => {
        StackAuth.saveUser({ name, email, password, role });
        signupForm.style.display = 'none';
        const successBox = document.getElementById('signupSuccess');
        if (successBox) successBox.style.display = 'block';
        if (hasGsapAuth && !reduceMotionAuth && successBox) {
          gsap.from(successBox, { opacity: 0, y: 10, duration: 0.5 });
        }
        setTimeout(() => { window.location.href = 'login.html'; }, 1400);
      }, 700);
    });
  }

  /* ---------- role pill toggle — keep tab focus + click on label working ---------- */
  document.querySelectorAll('.role-toggle input').forEach(input => {
    input.addEventListener('change', () => {}); // CSS handles the sliding pill via :checked
  });

  /* ================= DASHBOARDS ================= */
  if (!document.body.classList.contains('dash-page')) return;

  const session = StackAuth.getSession();
  const requiredRole = document.body.getAttribute('data-role');
  if (!session || (requiredRole && session.role !== requiredRole)) {
    window.location.href = 'login.html';
    return;
  }

  /* ---------- populate the dynamic user chrome ---------- */
  const initials = session.name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  document.querySelectorAll('.js-user-name').forEach(el => el.textContent = session.name);
  document.querySelectorAll('.js-user-email').forEach(el => el.textContent = session.email);
  document.querySelectorAll('.js-user-initials').forEach(el => el.textContent = initials);
  document.querySelectorAll('.js-user-role').forEach(el => el.textContent = session.role === 'admin' ? 'Administrator' : 'Client');
  const now = new Date();
  document.querySelectorAll('.js-today').forEach(el => el.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));

  /* ---------- sidebar drawer (hamburger) ---------- */
  const sidebar = document.querySelector('.dash-sidebar');
  const overlay = document.querySelector('.dash-overlay');
  const hamburgerBtn = document.querySelector('.dash-hamburger');
  function closeSidebar() { sidebar && sidebar.classList.remove('open'); overlay && overlay.classList.remove('show'); }
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open'); overlay.classList.toggle('show');
  });
  if (overlay) overlay.addEventListener('click', closeSidebar);

  /* ---------- avatar dropdown ---------- */
  const userMenu = document.querySelector('.dash-user');
  if (userMenu) {
    userMenu.addEventListener('click', (e) => { e.stopPropagation(); userMenu.classList.toggle('open'); });
    document.addEventListener('click', () => userMenu.classList.remove('open'));
  }

  /* ---------- logout — no confirm(), just clear + redirect ---------- */
  document.querySelectorAll('.js-logout').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      StackAuth.clearSession();
      window.location.href = 'login.html';
    });
  });

  /* ---------- animated stat cards ---------- */
  document.querySelectorAll('.dash-stat-card').forEach((card, i) => {
    const numEl = card.querySelector('.num');
    const target = parseFloat(card.getAttribute('data-target')) || 0;
    const suffix = card.getAttribute('data-suffix') || '';
    const reveal = () => {
      if (hasGsapAuth && !reduceMotionAuth) {
        gsap.to(card, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: i * 0.08 });
        gsap.to({ v: 0 }, {
          v: target, duration: 1.1, delay: i * 0.08, ease: 'power2.out',
          onUpdate: function () { if (numEl) numEl.textContent = Math.round(this.targets()[0].v) + suffix; }
        });
      } else {
        card.style.opacity = 1; card.style.transform = 'none';
        if (numEl) numEl.textContent = target + suffix;
      }
    };
    reveal();
  });

  /* ---------- animated bar chart ---------- */
  document.querySelectorAll('.dash-bar').forEach((bar, i) => {
    const pct = parseInt(bar.getAttribute('data-h'), 10) || 0;
    setTimeout(() => { bar.style.height = pct + '%'; }, 200 + i * 90);
  });

  const isAdmin = session.role === 'admin';

  /* ---------- notification bell — opens a dropdown, never navigates ---------- */
  (function notificationBell() {
    const bell = document.querySelector('.dash-bell');
    if (!bell) return;

    const notesAdmin = [
      { icon: 'fa-user-plus', title: 'New client intake', text: 'Halvorsen LLC submitted an intake form.', time: '9 min ago', unread: true },
      { icon: 'fa-file-invoice-dollar', title: 'Invoice #4471 paid', text: 'Kessler Group paid $2,400.', time: '1 hr ago', unread: true },
      { icon: 'fa-gavel', title: 'Deposition prep', text: 'Marcus Delaine wants to sync before Thursday.', time: 'Yesterday', unread: true },
      { icon: 'fa-shield-halved', title: 'ISO 27001 review due', text: 'Annual document-handling review is due in 14 days.', time: 'Mon', unread: false }
    ];
    const notesUser = [
      { icon: 'fa-gavel', title: 'Case update filed', text: 'Andrea Kessler filed the amended documents on your behalf.', time: '10 min ago', unread: true },
      { icon: 'fa-file-invoice-dollar', title: 'Invoice #4471 available', text: 'Your latest invoice is ready to view.', time: '1 hr ago', unread: true },
      { icon: 'fa-calendar-check', title: 'Meeting confirmed', text: 'Thu 2:00 PM with Marcus Delaine.', time: 'Yesterday', unread: false },
      { icon: 'fa-folder-open', title: 'New document shared', text: 'Retainer Agreement was added to your matter.', time: 'Yesterday', unread: false }
    ];
    const notes = (isAdmin ? notesAdmin : notesUser).map(n => Object.assign({}, n));

    const dot = bell.querySelector('.dash-bell-dot');
    const panel = document.createElement('div');
    panel.className = 'dash-bell-panel';
    bell.appendChild(panel);

    function render() {
      const unread = notes.filter(n => n.unread).length;
      if (dot) dot.style.display = unread ? '' : 'none';
      panel.innerHTML = `
        <div class="dash-bell-head">
          <strong>Notifications${unread ? ` <span class="dash-bell-count">${unread}</span>` : ''}</strong>
          <button type="button" class="dash-bell-markall" ${unread ? '' : 'disabled'}>Mark all read</button>
        </div>
        <div class="dash-bell-list">
          ${notes.map((n, i) => `<div class="dash-bell-item ${n.unread ? 'unread' : ''}" data-i="${i}">
            <div class="dash-bell-ico"><i class="fa-solid ${n.icon}"></i></div>
            <div class="dash-bell-txt"><strong>${n.title}</strong><span>${n.text}</span><time>${n.time}</time></div>
          </div>`).join('')}
        </div>
        <button type="button" class="dash-bell-all">View all messages</button>`;
    }
    render();

    function setOpen(open) {
      bell.classList.toggle('open', open);
      bell.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    /* capture phase on window: runs before any other click handler, so nothing
       else (e.g. a generic link/redirect handler in script.js) can send the bell to another page */
    window.addEventListener('click', (e) => {
      const inBell = e.target.closest('.dash-bell');
      if (!inBell) { setOpen(false); return; }          // click elsewhere closes the panel
      e.preventDefault();
      e.stopPropagation();
      const um = document.querySelector('.dash-user'); if (um) um.classList.remove('open');

      if (e.target.closest('.dash-bell-markall')) { notes.forEach(n => n.unread = false); render(); return; }
      if (e.target.closest('.dash-bell-all')) { setOpen(false); switchDashPage('inbox'); return; }
      const item = e.target.closest('.dash-bell-item');
      if (item) { notes[+item.getAttribute('data-i')].unread = false; render(); return; }
      if (e.target.closest('.dash-bell-panel')) return;  // clicks on empty panel space stay open
      setOpen(!bell.classList.contains('open'));         // the bell icon itself toggles
    }, true);

    bell.addEventListener('keydown', (e) => {
      if (e.target !== bell) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!bell.classList.contains('open')); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  })();

  /* ---------- shared datasets (drive both the overview widgets and the full inline pages) ---------- */
  const emailsAdmin = [
    { name: 'Priya Sharma', subject: 'Signed retainer — Whitmore Estate', snippet: 'Client countersigned this morning, filing next steps now...', time: '9:12 AM', unread: true },
    { name: 'New client intake', subject: 'Intake form: Halvorsen LLC', snippet: 'New corporate formation request submitted via the site...', time: '8:47 AM', unread: true },
    { name: 'Marcus Delaine', subject: 'Deposition prep — Reyes matter', snippet: 'Can we sync before Thursday\'s deposition, want to align...', time: 'Yesterday', unread: true },
    { name: 'Billing system', subject: 'Invoice #4471 paid', snippet: 'Payment of $2,400 received from Kessler Group...', time: 'Yesterday', unread: false },
    { name: 'Julian Ortiz', subject: 'Trademark office action', snippet: 'USPTO responded on the Northline filing, review needed...', time: 'Mon', unread: false },
    { name: 'Andrea Kessler', subject: 'Partner meeting notes', snippet: 'Attached the notes from Monday\'s partner sync...', time: 'Mon', unread: false },
    { name: 'Document Center', subject: 'New upload: Reyes v. Anderson', snippet: 'Discovery documents uploaded to the shared folder...', time: 'Last week', unread: false },
    { name: 'Compliance bot', subject: 'ISO 27001 review due', snippet: 'Annual document-handling review is due in 14 days...', time: 'Last week', unread: false }
  ];
  const emailsUser = [
    { name: 'Andrea Kessler', subject: 'Your case update is ready', snippet: 'We\'ve filed the amended documents on your behalf...', time: '10:05 AM', unread: true },
    { name: 'Stackly Billing', subject: 'Invoice #4471 available', snippet: 'Your latest invoice is ready to view in the portal...', time: 'Yesterday', unread: true },
    { name: 'Document Center', subject: 'New file shared: Retainer Agreement', snippet: 'A new document has been added to your matter...', time: 'Yesterday', unread: false },
    { name: 'Marcus Delaine', subject: 'Meeting confirmed — Thu 2:00 PM', snippet: 'Looking forward to discussing next steps on your case...', time: 'Mon', unread: false },
    { name: 'Stackly Legal', subject: 'Welcome to your client portal', snippet: 'Here\'s how to track your matter, message your team...', time: 'Last week', unread: false },
    { name: 'Priya Sharma', subject: 'Documents ready for signature', snippet: 'Please review and countersign the attached agreement...', time: 'Last week', unread: false },
    { name: 'Stackly Billing', subject: 'Payment received — thank you', snippet: 'We\'ve received your payment of $1,200 toward...', time: '2 weeks ago', unread: false }
  ];
  const emails = isAdmin ? emailsAdmin : emailsUser;

  /* full message text shown in the reader (falls back to the snippet if a subject isn't listed) */
  const mailBodies = {
    'Signed retainer — Whitmore Estate': ['Hi team,', 'The Whitmore Estate client countersigned the retainer this morning. I have uploaded the signed copy to the shared folder.', 'Next steps: file the engagement notice, open the matter in the system, and schedule the kickoff call for later this week.', 'Thanks,\nPriya'],
    'Intake form: Halvorsen LLC': ['A new corporate formation request was submitted through the website.', 'Company: Halvorsen LLC\nService: Corporate formation\nPreferred contact: Email', 'Please assign a lead attorney and reply to the client within one business day.'],
    'Deposition prep — Reyes matter': ['Hi,', 'Can we sync before Thursday\'s deposition? I want to align on the exhibit order and the questions we expect from opposing counsel.', 'I am free tomorrow after 2 PM or first thing Wednesday. Let me know what works.', 'Marcus'],
    'Invoice #4471 paid': ['Payment received.', 'Invoice #4471 for $2,400 was paid in full by Kessler Group. The receipt has been attached to the client record and the matter ledger has been updated.'],
    'Trademark office action': ['Hi,', 'The USPTO has responded on the Northline filing with an office action. The examiner has raised a likelihood-of-confusion objection.', 'We have until the response deadline to reply. Please review the attached letter so we can decide on the strategy.', 'Julian'],
    'Partner meeting notes': ['Hi all,', 'Attached are the notes from Monday\'s partner sync. Key items: Q4 hiring plan, the fee schedule update, and the new client intake process.', 'Please flag any corrections by end of week.', 'Andrea'],
    'New upload: Reyes v. Anderson': ['New discovery documents were uploaded to the shared folder for Reyes v. Anderson.', 'The upload includes 14 files. Please review and tag anything that needs privilege screening.'],
    'ISO 27001 review due': ['Reminder: the annual document-handling review is due in 14 days.', 'Please confirm access controls, retention schedules and the audit log export before the deadline.'],
    'Your case update is ready': ['Hello,', 'We have filed the amended documents on your behalf. The court has acknowledged receipt and we will let you know as soon as the next step is confirmed.', 'You can view the filing confirmation in the Documents section of your portal. If you have questions, just reply to this message.', 'Andrea Kessler'],
    'Invoice #4471 available': ['Hello,', 'Your latest invoice #4471 for $2,400 is ready to view in the portal.', 'You can review the details under Billing. Payment is due within 30 days of the invoice date.', 'Stackly Billing'],
    'New file shared: Retainer Agreement': ['A new document has been added to your matter: Retainer Agreement (PDF, 2.1 MB).', 'You can find it in the Documents section of your portal and download it at any time.'],
    'Meeting confirmed — Thu 2:00 PM': ['Hello,', 'Your meeting is confirmed for Thursday at 2:00 PM. We will discuss next steps on your case and answer any questions.', 'Please bring any documents you would like us to review.', 'Marcus Delaine'],
    'Welcome to your client portal': ['Welcome to Stackly Legal.', 'Here is how to get started: track your matters under My Matters, download shared files in Documents, view invoices in Billing, and message your legal team from the Inbox.'],
    'Documents ready for signature': ['Hello,', 'Please review and countersign the attached agreement at your earliest convenience.', 'Once signed, we will file it and confirm by message. Let us know if you would like to go through it together first.', 'Priya Sharma'],
    'Payment received — thank you': ['Thank you.', 'We have received your payment of $1,200 toward invoice #4402. A receipt is available in the Documents section of your portal.']
  };

  const clientsAdmin = [
    { name: 'Halvorsen LLC', sub: 'contact@halvorsen.co', tag: 'Corporate', status: 'active' },
    { name: 'Reyes, Maria', sub: 'maria.reyes@gmail.com', tag: 'Litigation', status: 'pending' },
    { name: 'Whitmore Estate', sub: 'admin@whitmoreestate.com', tag: 'Estates', status: 'active' },
    { name: 'Kessler Group', sub: 'ops@kesslergroup.com', tag: 'Corporate', status: 'closed' },
    { name: 'Northline Studio', sub: 'legal@northline.studio', tag: 'IP', status: 'active' },
    { name: 'Anderson, Rick', sub: 'r.anderson@outlook.com', tag: 'Litigation', status: 'pending' },
    { name: 'Blue Harbor Realty', sub: 'contracts@blueharbor.com', tag: 'Real Estate', status: 'active' },
    { name: 'Ferris & Co.', sub: 'admin@ferrisco.com', tag: 'Tax', status: 'closed' }
  ];
  const mattersAdmin = [
    { name: 'Reyes v. Anderson', sub: 'Marcus Delaine, Lead', tag: 'Litigation', status: 'active' },
    { name: 'Halvorsen LLC Formation', sub: 'Andrea Kessler, Lead', tag: 'Corporate', status: 'pending' },
    { name: 'Whitmore Estate Planning', sub: 'Priya Sharma, Lead', tag: 'Estates', status: 'active' },
    { name: 'Northline Trademark Filing', sub: 'Julian Ortiz, Lead', tag: 'IP', status: 'active' },
    { name: 'Kessler Group Merger', sub: 'Andrea Kessler, Lead', tag: 'Corporate', status: 'closed' },
    { name: 'Blue Harbor Lease Review', sub: 'Marcus Delaine, Lead', tag: 'Real Estate', status: 'pending' }
  ];
  const mattersUser = [
    { name: 'Retainer Agreement', sub: 'Corporate & M&A', attorney: 'Andrea Kessler', status: 'active', progress: 90, next: 'Countersign amended retainer', due: 'Sep 30, 2026' },
    { name: 'Trademark Filing — Northline', sub: 'Intellectual Property', attorney: 'Julian Ortiz', status: 'pending', progress: 45, next: 'Respond to USPTO office action', due: 'Oct 8, 2026' },
    { name: 'Estate Planning Review', sub: 'Family & Estates', attorney: 'Priya Sharma', status: 'active', progress: 65, next: 'Review revised trust documents', due: 'Oct 3, 2026' },
    { name: 'Prior Consultation', sub: 'General Counsel', attorney: 'Marcus Delaine', status: 'closed', progress: 100, next: 'Matter closed — no action needed', due: '' },
    { name: 'Office Lease Review — Blue Harbor', sub: 'Real Estate', attorney: 'Marcus Delaine', status: 'active', progress: 55, next: 'Approve negotiated lease terms', due: 'Oct 12, 2026' },
    { name: 'Employment Contract Review', sub: 'Employment Law', attorney: 'Priya Sharma', status: 'pending', progress: 30, next: 'Provide signed employee handbook', due: 'Oct 15, 2026' },
    { name: 'Business Licence Renewal', sub: 'Regulatory & Compliance', attorney: 'Julian Ortiz', status: 'active', progress: 75, next: 'Submit renewal fee payment', due: 'Oct 5, 2026' },
    { name: 'Shareholder Agreement Draft', sub: 'Corporate & M&A', attorney: 'Andrea Kessler', status: 'closed', progress: 100, next: 'Matter closed — final copy filed', due: '' }
  ];

  const invoicesAdmin = [
    { id: '#4471', client: 'Kessler Group', amount: '$2,400', date: 'Sep 20, 2026', status: 'active' },
    { id: '#4470', client: 'Whitmore Estate', amount: '$1,850', date: 'Sep 14, 2026', status: 'active' },
    { id: '#4469', client: 'Halvorsen LLC', amount: '$3,200', date: 'Sep 9, 2026', status: 'pending' },
    { id: '#4468', client: 'Northline Studio', amount: '$980', date: 'Aug 30, 2026', status: 'active' },
    { id: '#4467', client: 'Reyes, Maria', amount: '$1,150', date: 'Aug 22, 2026', status: 'pending' },
    { id: '#4466', client: 'Ferris & Co.', amount: '$2,600', date: 'Aug 12, 2026', status: 'closed' }
  ];
  const invoicesUser = [
    { id: '#4471', client: 'Retainer — Corporate & M&A', amount: '$2,400', date: 'Sep 20, 2026', status: 'pending' },
    { id: '#4438', client: 'Trademark Filing — Northline', amount: '$980', date: 'Aug 12, 2026', status: 'active' },
    { id: '#4402', client: 'Estate Planning Review', amount: '$1,200', date: 'Jul 3, 2026', status: 'active' },
    { id: '#4370', client: 'General Consultation', amount: '$450', date: 'Jun 18, 2026', status: 'active' }
  ];
  const invoices = isAdmin ? invoicesAdmin : invoicesUser;

  function initialsOf(str) { return str.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase(); }
  function statusLabel(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function buildMailHTML(list) {
    return list.map(m => `<div class="dash-mail-item ${m.unread ? 'unread' : 'read'}">
        <div class="dash-mail-avatar">${initialsOf(m.name)}</div>
        <div class="dash-mail-body">
          <div class="dash-mail-top"><strong>${m.name}</strong><time>${m.time}</time></div>
          <div class="dash-mail-subject">${m.subject}</div>
          <div class="dash-mail-snippet">${m.snippet}</div>
        </div>
      </div>`).join('');
  }
  function mountMail(el, list) {
    if (!el) return;
    el.innerHTML = buildMailHTML(list);
    el.querySelectorAll('.dash-mail-item').forEach((item, i) => {
      if (hasGsapAuth && !reduceMotionAuth) gsap.to(item, { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out', delay: 0.1 + i * 0.05 });
      else { item.style.opacity = 1; item.style.transform = 'none'; }
      item.addEventListener('click', () => openMail(list[i]));
    });
  }
  mountMail(document.getElementById('dashInboxList'), emails.slice(0, 4));
  mountMail(document.getElementById('dashInboxFull'), emails);

  /* ---------- message reader (opens when a message is clicked) ---------- */
  function escHTML(t) { return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function syncMail() {
    const pairs = [[document.getElementById('dashInboxList'), emails.slice(0, 4)], [document.getElementById('dashInboxFull'), emails]];
    pairs.forEach(([el, list]) => {
      if (!el) return;
      el.querySelectorAll('.dash-mail-item').forEach((item, i) => {
        if (!list[i]) return;
        item.classList.toggle('unread', !!list[i].unread);
        item.classList.toggle('read', !list[i].unread);
      });
    });
    const unread = emails.filter(m => m.unread).length;
    document.querySelectorAll('.dash-nav a[data-page="inbox"] .dash-badge').forEach(b => {
      b.textContent = unread; b.style.display = unread ? '' : 'none';
    });
  }

  let mailModal = null, mailIndex = -1, mailLastFocus = null;
  function buildMailModal() {
    mailModal = document.createElement('div');
    mailModal.className = 'dash-mailview';
    mailModal.setAttribute('role', 'dialog');
    mailModal.setAttribute('aria-modal', 'true');
    mailModal.setAttribute('aria-label', 'Message');
    mailModal.innerHTML = `
      <div class="dash-mailview-card">
        <div class="dash-mailview-bar">
          <button type="button" class="dash-mv-btn" data-act="prev" aria-label="Previous message"><i class="fa-solid fa-chevron-up"></i></button>
          <button type="button" class="dash-mv-btn" data-act="next" aria-label="Next message"><i class="fa-solid fa-chevron-down"></i></button>
          <span class="dash-mv-count"></span>
          <button type="button" class="dash-mv-btn dash-mv-text" data-act="unread"><i class="fa-solid fa-envelope"></i> <span>Mark unread</span></button>
          <button type="button" class="dash-mv-btn" data-act="close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="dash-mailview-scroll">
          <h3 class="dash-mv-subject"></h3>
          <div class="dash-mv-from">
            <div class="dash-mail-avatar dash-mv-avatar"></div>
            <div><strong class="dash-mv-name"></strong><span class="dash-mv-time"></span></div>
          </div>
          <div class="dash-mv-body"></div>
          <div class="dash-mv-thread"></div>
          <div class="dash-mv-reply">
            <label for="dashMvReply">Reply</label>
            <textarea id="dashMvReply" rows="3" placeholder="Write your reply…"></textarea>
            <div class="dash-mv-replybar">
              <span class="dash-mv-note" aria-live="polite"></span>
              <button type="button" class="dash-mv-send" data-act="send"><i class="fa-solid fa-paper-plane"></i> Send reply</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(mailModal);

    /* window + capture phase = runs before every other click handler on the page,
       so nothing else (e.g. a redirect-to-404 rule in script.js) can hijack clicks inside the reader */
    window.addEventListener('click', (e) => {
      if (!mailModal.contains(e.target)) return;
      e.preventDefault(); e.stopPropagation();
      if (e.target === mailModal) { closeMail(); return; }        // click on the dark backdrop
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      if (act === 'close') closeMail();
      else if (act === 'prev') showMail(mailIndex - 1);
      else if (act === 'next') showMail(mailIndex + 1);
      else if (act === 'unread') { emails[mailIndex].unread = true; syncMail(); closeMail(); }
      else if (act === 'send') sendReply();
    }, true);
    document.addEventListener('keydown', (e) => {
      if (!mailModal || !mailModal.classList.contains('open')) return;
      if (e.key === 'Escape') closeMail();
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.id === 'dashMvReply') { e.preventDefault(); sendReply(); }
      else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault(); showMail(mailIndex + (e.key === 'ArrowDown' ? 1 : -1));
      }
    });
  }

  /* replies are kept per message (and saved in this browser so they survive a refresh) */
  const replyKey = 'stackly_replies_' + (isAdmin ? 'admin' : 'user');
  let savedReplies = {};
  try { savedReplies = JSON.parse(localStorage.getItem(replyKey)) || {}; } catch (e) { savedReplies = {}; }
  function persistReplies() { try { localStorage.setItem(replyKey, JSON.stringify(savedReplies)); } catch (e) {} }

  function renderThread(scrollToEnd) {
    const box = mailModal.querySelector('.dash-mv-thread');
    const list = savedReplies[emails[mailIndex].subject] || [];
    box.innerHTML = list.map(r => `<div class="dash-mv-sent">
        <div class="dash-mv-sent-head"><strong>You</strong><span>${escHTML(r.time)}</span></div>
        <p>${escHTML(r.text).replace(/\n/g, '<br>')}</p>
      </div>`).join('');
    if (scrollToEnd && list.length) {
      const last = box.lastElementChild;
      last.classList.add('fresh');
      last.scrollIntoView({ behavior: reduceMotionAuth ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  let sendingReply = false;
  function sendReply() {
    if (sendingReply) return;
    const ta = mailModal.querySelector('#dashMvReply');
    const note = mailModal.querySelector('.dash-mv-note');
    const sendBtn = mailModal.querySelector('[data-act="send"]');
    const text = ta.value.trim();
    if (!text) { note.textContent = 'Please write a reply first.'; note.className = 'dash-mv-note err'; ta.focus(); return; }

    sendingReply = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending…';
    note.textContent = ''; note.className = 'dash-mv-note';
    const idx = mailIndex;

    setTimeout(() => {
      const m = emails[idx];
      const t = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      (savedReplies[m.subject] = savedReplies[m.subject] || []).push({ text, time: 'Just now · ' + t });
      persistReplies();
      sendingReply = false;
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send reply';
      if (mailIndex !== idx) return;                       // reader moved to another message meanwhile
      ta.value = '';
      renderThread(true);
      note.innerHTML = '<i class="fa-solid fa-circle-check"></i> Reply sent to ' + escHTML(m.name) + '.';
      note.className = 'dash-mv-note ok';
    }, 600);
  }

  function showMail(i) {
    if (i < 0 || i >= emails.length) return;
    mailIndex = i;
    const m = emails[i];
    m.unread = false; syncMail();
    const paras = (mailBodies[m.subject] || [m.snippet.replace(/\.\.\.$/, '') + '.']);
    mailModal.querySelector('.dash-mv-subject').textContent = m.subject;
    mailModal.querySelector('.dash-mv-avatar').textContent = initialsOf(m.name);
    mailModal.querySelector('.dash-mv-name').textContent = m.name;
    mailModal.querySelector('.dash-mv-time').textContent = m.time;
    mailModal.querySelector('.dash-mv-body').innerHTML = paras.map(p => '<p>' + escHTML(p).replace(/\n/g, '<br>') + '</p>').join('');
    renderThread();
    mailModal.querySelector('.dash-mv-count').textContent = (i + 1) + ' of ' + emails.length;
    mailModal.querySelector('[data-act="prev"]').disabled = i === 0;
    mailModal.querySelector('[data-act="next"]').disabled = i === emails.length - 1;
    const note = mailModal.querySelector('.dash-mv-note'); note.textContent = ''; note.className = 'dash-mv-note';
    mailModal.querySelector('#dashMvReply').value = '';
    mailModal.querySelector('.dash-mailview-scroll').scrollTop = 0;
  }

  function openMail(m) {
    if (!mailModal) buildMailModal();
    mailLastFocus = document.activeElement;
    showMail(emails.indexOf(m));
    mailModal.classList.add('open');
    document.body.classList.add('dash-mv-lock');
    const closeBtn = mailModal.querySelector('[data-act="close"]'); if (closeBtn) closeBtn.focus();
  }
  function closeMail() {
    if (!mailModal) return;
    mailModal.classList.remove('open');
    document.body.classList.remove('dash-mv-lock');
    if (mailLastFocus && mailLastFocus.focus) mailLastFocus.focus();
  }

  function buildRowsHTML(list) {
    return list.map(r => `<tr>
        <td><div class="dash-table-user"><div class="dash-avatar">${initialsOf(r.name)}</div>${r.name}</div></td>
        <td>${r.sub}</td>
        <td>${r.tag || r.attorney || ''}</td>
        <td><span class="dash-status ${r.status}">${statusLabel(r.status)}</span></td>
      </tr>`).join('');
  }
  function mountRows(tbody, list) {
    if (!tbody) return;
    tbody.innerHTML = buildRowsHTML(list);
    tbody.querySelectorAll('tr').forEach((tr, i) => {
      if (hasGsapAuth && !reduceMotionAuth) gsap.to(tr, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.08 + i * 0.05 });
      else { tr.style.opacity = 1; tr.style.transform = 'none'; }
    });
  }
  mountRows(document.getElementById('dashTableBody'), isAdmin ? clientsAdmin.slice(0, 4) : mattersUser.slice(0, 4));
  mountRows(document.getElementById('dashClientsFull'), clientsAdmin);
  mountRows(document.getElementById('dashMattersAdminFull'), mattersAdmin);

  /* ---------- matter cards with a progress bar (user "My Matters" full page) ---------- */
  const mattersFullEl = document.getElementById('dashMattersFull');
  if (mattersFullEl) {
    mattersFullEl.innerHTML = mattersUser.map(m => `<div class="dash-matter-card">
        <div class="dash-matter-icon"><i class="fa-solid fa-briefcase"></i></div>
        <div class="dash-matter-info">
          <h4>${m.name}</h4>
          <span>${m.sub} &middot; ${m.attorney}</span>
          ${m.next ? `<p class="dash-matter-next"><i class="fa-solid fa-flag"></i> ${m.next}${m.due ? ' &middot; Due ' + m.due : ''}</p>` : ''}
        </div>
        <span class="dash-status ${m.status}">${statusLabel(m.status)}</span>
        <div class="dash-matter-progress">
          <div class="dash-progress-track"><div class="dash-progress-fill" data-p="${m.progress}"></div></div>
          <div class="dash-progress-label">${m.progress}% complete</div>
        </div>
      </div>`).join('');
    mattersFullEl.querySelectorAll('.dash-matter-card').forEach((card, i) => {
      if (hasGsapAuth && !reduceMotionAuth) gsap.to(card, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.08 + i * 0.07 });
      else { card.style.opacity = 1; card.style.transform = 'none'; }
    });
    mattersFullEl.querySelectorAll('.dash-progress-fill').forEach((fill, i) => {
      setTimeout(() => { fill.style.width = fill.getAttribute('data-p') + '%'; }, 300 + i * 100);
    });
  }

  /* ---------- invoice list (Billing page, both dashboards) ---------- */
  const invoiceList = document.getElementById('dashInvoiceList');
  if (invoiceList) {
    invoiceList.innerHTML = invoices.map(inv => `<tr>
        <td>${inv.id}</td>
        <td>${inv.client}</td>
        <td>${inv.amount}</td>
        <td>${inv.date}</td>
        <td><span class="dash-status ${inv.status === 'active' ? 'pending' : inv.status}">${inv.status === 'active' ? 'Due' : statusLabel(inv.status)}</span></td>
      </tr>`).join('');
    invoiceList.querySelectorAll('tr').forEach((tr, i) => {
      if (hasGsapAuth && !reduceMotionAuth) gsap.to(tr, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.08 + i * 0.05 });
      else { tr.style.opacity = 1; tr.style.transform = 'none'; }
    });
  }

  /* ---------- filter pills — generic: works on the Inbox list AND the
     Clients / Matters tables, driven by each group's data-target selector ---------- */
  document.querySelectorAll('.dash-filter-pills[data-target]').forEach(group => {
    const targetSel = group.getAttribute('data-target');
    group.querySelectorAll('.dash-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        group.querySelectorAll('.dash-filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-filter');
        const container = document.querySelector(targetSel);
        if (!container) return;
        Array.from(container.children).forEach(item => {
          let show = filter === 'all';
          if (!show) {
            if (item.classList.contains('unread') || item.classList.contains('read')) {
              show = item.classList.contains(filter);
            } else {
              const statusEl = item.querySelector('.dash-status');
              show = !!(statusEl && statusEl.classList.contains(filter));
            }
          }
          item.style.display = show ? '' : 'none';
        });
      });
    });
  });

  /* ---------- settings toggle switches (purely visual, no backend) ---------- */
  document.querySelectorAll('.switch input').forEach(input => {
    input.addEventListener('change', () => {}); // CSS handles the sliding knob via :checked
  });

  /* ---------- inline page switching — any [data-page] link swaps content in
     place (sidebar items AND "view all" links inside panels), no page reload ---------- */
  let revealObserver = null; // declared before first use (fixes hidden Documents cards)
  const dashSections = document.querySelectorAll('.dash-page-section');
  function switchDashPage(id) {
    if (!document.querySelector(`.dash-page-section[data-page="${id}"]`)) return;
    dashSections.forEach(sec => {
      const match = sec.getAttribute('data-page') === id;
      sec.classList.toggle('active', match);
      if (match && hasGsapAuth && !reduceMotionAuth) {
        gsap.fromTo(sec, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      }
    });
    document.querySelectorAll('.dash-nav a[data-page]').forEach(a => a.classList.toggle('active', a.getAttribute('data-page') === id));
    closeSidebar();
    window.scrollTo({ top: 0, behavior: reduceMotionAuth ? 'auto' : 'smooth' });
    initRevealObserver(); // pick up any newly-visible reveal-up elements in this section
  }
  if (dashSections.length) {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-page]:not(.dash-page-section)'); // ignore the page sections themselves, so normal links inside a page (e.g. Download) still work
      if (!trigger) return;
      e.preventDefault();
      switchDashPage(trigger.getAttribute('data-page'));
    });
    switchDashPage('dashboard');
  }

  /* ---------- documents grid (Documents page) — rendered from a JS data array ---------- */
  const docGrid = document.getElementById('dashDocGrid');
  if (docGrid) {
    const docs = [
      { name: 'Retainer Agreement.pdf', meta: '1.2 MB · Sep 20', icon: 'fa-file-pdf' },
      { name: 'Invoice_4471.pdf', meta: '188 KB · Sep 20', icon: 'fa-file-invoice-dollar' },
      { name: 'Case Brief — Reyes.docx', meta: '640 KB · Sep 18', icon: 'fa-file-word' },
      { name: 'Trademark_Filing.pdf', meta: '2.1 MB · Sep 12', icon: 'fa-file-pdf' },
      { name: 'Estate Plan Draft.docx', meta: '410 KB · Sep 8', icon: 'fa-file-word' },
      { name: 'Meeting Notes.pdf', meta: '95 KB · Sep 2', icon: 'fa-file-lines' },
      { name: 'Signed NDA.pdf', meta: '310 KB · Aug 27', icon: 'fa-file-signature' },
      { name: 'Fee Schedule.xlsx', meta: '58 KB · Aug 19', icon: 'fa-file-excel' },
      { name: 'Lease Agreement — Blue Harbor.pdf', meta: '3.4 MB · Aug 14', icon: 'fa-file-pdf' },
      { name: 'Employment Contract.docx', meta: '520 KB · Aug 9', icon: 'fa-file-word' },
      { name: 'Licence Renewal Form.pdf', meta: '260 KB · Aug 5', icon: 'fa-file-pdf' },
      { name: 'Filing Confirmation.pdf', meta: '220 KB · Jul 28', icon: 'fa-file-circle-check' },
      { name: 'Invoice_4438.pdf', meta: '180 KB · Aug 12', icon: 'fa-file-invoice-dollar' },
      { name: 'Invoice_4402.pdf', meta: '175 KB · Jul 3', icon: 'fa-file-invoice-dollar' },
      { name: 'Shareholder Agreement.docx', meta: '780 KB · Jun 30', icon: 'fa-file-word' },
      { name: 'Consultation Notes.docx', meta: '95 KB · Jun 18', icon: 'fa-file-lines' }
    ];
    docGrid.innerHTML = docs.map(d => `<div class="dash-doc-card reveal-up">
        <div class="dash-doc-icon"><i class="fa-solid ${d.icon}"></i></div>
        <h5>${d.name}</h5>
        <span>${d.meta}</span>
        <a href="404.html" class="dash-doc-dl"><i class="fa-solid fa-arrow-down"></i> Download</a>
      </div>`).join('');
  }

  /* ---------- settings form — prefill from session, "save" shows inline success ---------- */
  const settingsName = document.getElementById('settingsName');
  const settingsEmail = document.getElementById('settingsEmail');
  const settingsRole = document.getElementById('settingsRole');
  if (settingsName) settingsName.value = session.name;
  if (settingsEmail) settingsEmail.value = session.email;
  if (settingsRole) settingsRole.value = session.role === 'admin' ? 'Administrator' : 'Client';

  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (settingsName && settingsName.value.trim()) {
        session.name = settingsName.value.trim();
        StackAuth.setSession(session);
        document.querySelectorAll('.js-user-name').forEach(el => el.textContent = session.name);
      }
      const msg = document.getElementById('settingsMsg');
      if (msg) {
        msg.textContent = 'Your changes have been saved.';
        msg.className = 'auth-msg success';
        msg.style.display = 'flex';
        setTimeout(() => { msg.style.display = 'none'; }, 2600);
      }
    });
  }
  document.querySelectorAll('.switch input').forEach(input => {
    input.addEventListener('change', () => {}); // CSS handles the sliding knob via :checked
  });

  /* ---------- scroll-reveal for .reveal-up items (documents, cards, rows) ---------- */
  function initRevealObserver() {
    const targets = document.querySelectorAll('.reveal-up:not(.in)');
    if (!targets.length) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
    }
    targets.forEach(t => revealObserver.observe(t));
  }
  initRevealObserver();
});