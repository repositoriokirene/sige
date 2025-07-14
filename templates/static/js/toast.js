function showToast(msg, duration=4000) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    toastMsg.textContent = msg;
    toast.classList.remove('hidden', 'hide');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, duration);
}

document.getElementById('toast-close').onclick = function() {
    const toast = document.getElementById('toast');
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.classList.add('hidden'), 300);
};
