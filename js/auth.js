// ================================================================
// AUTH
// ================================================================
function showAuthError(msg) { var el = document.getElementById('auth-error'); el.style.display = 'block'; el.textContent = msg; }
function hideAuthError() { document.getElementById('auth-error').style.display = 'none'; }
function switchAuthTab(tab, btn) {
    document.querySelectorAll('.auth-tab').forEach(function(t){t.classList.remove('active');});
    if (btn) btn.classList.add('active');
    else { var tabs = document.querySelectorAll('.auth-tab'); tabs.forEach(function(t){ if((tab==='login'&&t.textContent.trim()===(I18N[currentLang]||I18N.en).tab_login)||(tab==='register'&&t.textContent.trim()===(I18N[currentLang]||I18N.en).tab_register)) t.classList.add('active'); }); }
    document.getElementById('auth-form-login').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('auth-form-register').style.display = tab === 'register' ? 'block' : 'none';
    hideAuthError();
}
function togglePw(inputId, btn) {
    var inp = document.getElementById(inputId);
    if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🔒'; }
    else { inp.type = 'password'; btn.textContent = '👁'; }
}
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function setAuthLoading(btnId, loading) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    if (loading) {
        btn.classList.add('loading');
        var orig = btn.getAttribute('data-i18n');
        btn.setAttribute('data-original-text', btn.textContent);
        var lbl = (I18N[currentLang] || I18N.en);
        if (btnId === 'btn-login') btn.innerHTML = '<span class="btn-spinner"></span> ' + (lbl.logging_in || 'Logging in...');
        else if (btnId === 'btn-register') btn.innerHTML = '<span class="btn-spinner"></span> ' + (lbl.creating || 'Creating...');
    } else {
        btn.classList.remove('loading');
        var origText = btn.getAttribute('data-original-text');
        if (origText) btn.textContent = origText;
    }
}
async function doForgotPassword() {
    hideAuthError();
    var email = document.getElementById('auth-email').value;
    if (!email) { showAuthError(currentLang === 'ar' ? 'أدخل بريدك الإلكتروني أولاً' : 'Enter your email first'); return; }
    if (!validateEmail(email)) { showAuthError(currentLang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format'); return; }
    try {
        await auth.sendPasswordResetEmail(email);
        showAuthError((currentLang === 'ar' ? '✅ تم إرسال رابط إعادة التعيين إلى ' : '✅ Reset link sent to ') + email);
        document.getElementById('auth-error').style.borderColor = 'rgba(16,185,129,0.3)';
        document.getElementById('auth-error').style.background = 'rgba(16,185,129,0.1)';
        document.getElementById('auth-error').style.color = '#6ee7b7';
    } catch(e) { showAuthError(e.message); }
}

async function doLogin() {
    hideAuthError();
    document.getElementById('auth-error').style.borderColor = '';
    document.getElementById('auth-error').style.background = '';
    document.getElementById('auth-error').style.color = '';
    var email = document.getElementById('auth-email').value.trim();
    var pass = document.getElementById('auth-password').value;
    if (!email || !pass) { showAuthError(currentLang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'); return; }
    if (!validateEmail(email)) { showAuthError(currentLang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format'); return; }
    setAuthLoading('btn-login', true);
    try { await auth.signInWithEmailAndPassword(email, pass); } catch(e) {
        var msg = e.message;
        if (e.code === 'auth/user-not-found') msg = currentLang === 'ar' ? 'الحساب غير موجود' : 'No account found with this email';
        else if (e.code === 'auth/wrong-password') msg = currentLang === 'ar' ? 'كلمة المرور غير صحيحة' : 'Incorrect password';
        else if (e.code === 'auth/invalid-email') msg = currentLang === 'ar' ? 'البريد الإلكتروني غير صالح' : 'Invalid email address';
        else if (e.code === 'auth/too-many-requests') msg = currentLang === 'ar' ? 'محاولات كثيرة جداً، حاول لاحقاً' : 'Too many attempts. Try again later';
        else if (e.code === 'auth/invalid-credential') msg = currentLang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid email or password';
        showAuthError(msg);
    } finally { setAuthLoading('btn-login', false); }
}
async function doRegister() {
    hideAuthError();
    document.getElementById('auth-error').style.borderColor = '';
    document.getElementById('auth-error').style.background = '';
    document.getElementById('auth-error').style.color = '';
    var name = document.getElementById('reg-name').value.trim();
    var email = document.getElementById('reg-email').value.trim();
    var pass = document.getElementById('reg-password').value;
    if (!name || !email || !pass) { showAuthError(currentLang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'); return; }
    if (!validateEmail(email)) { showAuthError(currentLang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format'); return; }
    if (pass.length < 6) { showAuthError(currentLang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'); return; }
    setAuthLoading('btn-register', true);
    try {
        var cred = await auth.createUserWithEmailAndPassword(email, pass);
        await cred.user.updateProfile({ displayName: name });
        await db.collection('users').doc(cred.user.uid).set({ name:name, email:email, role:'engineer', createdAt:firebase.firestore.FieldValue.serverTimestamp() });
    } catch(e) {
        var msg = e.message;
        if (e.code === 'auth/email-already-in-use') msg = currentLang === 'ar' ? 'هذا البريد مسجل بالفعل' : 'This email is already registered';
        else if (e.code === 'auth/weak-password') msg = currentLang === 'ar' ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak';
        else if (e.code === 'auth/invalid-email') msg = currentLang === 'ar' ? 'البريد الإلكتروني غير صالح' : 'Invalid email address';
        showAuthError(msg);
    } finally { setAuthLoading('btn-register', false); }
}
async function doGoogleLogin() {
    hideAuthError();
    document.getElementById('btn-google-login').classList.add('loading');
    try {
        var provider = new firebase.auth.GoogleAuthProvider();
        var result = await auth.signInWithPopup(provider);
        await db.collection('users').doc(result.user.uid).set({
            name:result.user.displayName, email:result.user.email, role:'engineer',
            createdAt:firebase.firestore.FieldValue.serverTimestamp()
        }, { merge:true });
    } catch(e) {
        var msg = e.message;
        if (e.code === 'auth/popup-closed-by-user') msg = currentLang === 'ar' ? 'تم إلغاء الدخول' : 'Sign-in cancelled';
        showAuthError(msg);
    } finally { document.getElementById('btn-google-login').classList.remove('loading'); }
}
async function doGuestLogin() {
    hideAuthError();
    try { await auth.signInAnonymously(); } catch(e) {
        var msg;
        if (e.code === 'auth/admin-restricted-operation' || e.code === 'auth/operation-not-allowed') {
            msg = currentLang === 'ar'
                ? '⚠️ الدخول كزائر غير مفعّل. يرجى تفعيل Anonymous في Firebase Console:\n\n1. افتح Firebase Console\n2. Authentication → Sign-in method\n3. فعّل "Anonymous"\n\nأو استخدم البريد الإلكتروني للدخول'
                : '⚠️ Guest login is not enabled. Enable it in Firebase Console:\n\n1. Open Firebase Console\n2. Authentication → Sign-in method\n3. Enable "Anonymous"\n\nOr use email sign-in instead';
        } else { msg = e.message; }
        showAuthError(msg);
    }
}

function doSignOut() {
    document.querySelectorAll('.user-dropdown').forEach(function(d){d.classList.remove('show');});
    auth.signOut();
}

function toggleUserDropdown(e) {
    e.stopPropagation();
    var badge = e.currentTarget;
    var dd = badge.querySelector('.user-dropdown');
    var wasOpen = dd.classList.contains('show');
    document.querySelectorAll('.user-dropdown').forEach(function(d){d.classList.remove('show');});
    if (!wasOpen) dd.classList.add('show');
}
document.addEventListener('click', function() { document.querySelectorAll('.user-dropdown').forEach(function(d){d.classList.remove('show');}); });

function updateUserUI(user) {
    var name = user ? (user.displayName || user.email || (user.isAnonymous ? 'Guest' : 'User')) : '';
    var email = user ? (user.email || (user.isAnonymous ? 'Anonymous' : '')) : '';
    var initial = name.charAt(0).toUpperCase();
    var ids = ['user-name-display','dd-user-name','dd-user-email','user-icon-el',
               'chat-dd-name','chat-dd-email','chat-user-icon',
               'dash-dd-name','dash-dd-email','dash-user-icon',
               'test-dd-name','test-dd-email','test-user-icon',
               'se-dd-name','se-dd-email','se-user-icon',
               'slump-dd-name','slump-dd-email','slump-user-icon',
               'mat-dd-name','mat-dd-email','mat-user-icon',
               'mar-dd-name','mar-dd-email','mar-user-icon',
               'bit-dd-name','bit-dd-email','bit-user-icon',
               'pen-dd-name','pen-dd-email','pen-user-icon'];
    ids.forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (id === 'user-name-display') el.textContent = name;
        else if (id.indexOf('-dd-name') !== -1) el.textContent = name;
        else if (id.indexOf('-dd-email') !== -1) el.textContent = email;
        else if (id.indexOf('user-icon') !== -1 || id.indexOf('-icon') !== -1) el.textContent = initial;
    });
}

auth.onAuthStateChanged(function(user) {
    currentUser = user;
    if (user) {
        updateUserUI(user);
        showScreen('domains');
        loadDomains();
    } else {
        showScreen('auth');
    }
});
