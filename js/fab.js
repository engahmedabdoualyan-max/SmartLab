// ================================================================
// FAB MENU
// ================================================================
var fabOpen = false;
function toggleFab() {
    fabOpen = !fabOpen;
    document.getElementById('fab-menu').classList.toggle('open', fabOpen);
    document.getElementById('fab-toggle').classList.toggle('active', fabOpen);
}
function openFabModal(id) {
    fabOpen = false;
    document.getElementById('fab-menu').classList.remove('open');
    document.getElementById('fab-toggle').classList.remove('active');
    document.getElementById(id).classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeFabModal(id) {
    document.getElementById(id).classList.remove('show');
    document.body.style.overflow = '';
}
function closeFabOverlay(e) {
    if (e.target === e.currentTarget) {
        e.target.classList.remove('show');
        document.body.style.overflow = '';
    }
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.fab-modal-overlay.show').forEach(function(m) {
            m.classList.remove('show');
        });
        document.body.style.overflow = '';
        if (fabOpen) toggleFab();
    }
});
