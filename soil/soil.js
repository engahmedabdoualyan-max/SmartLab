function switchTab(tabName, event) {
    document.querySelectorAll('.vhalf').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    document.querySelectorAll('.section-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeSection = document.getElementById('panel-' + tabName);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.style.display = 'block';
    }
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const activeTab = document.querySelector('.section-tab.active');
    const activePanel = document.querySelector('.vhalf.active');
    if (activeTab && activePanel) {
        activePanel.style.display = 'block';
    }
});