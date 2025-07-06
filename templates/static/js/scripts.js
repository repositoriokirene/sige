document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    document.getElementById('sidebar-toggle').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('-translate-x-full');
    });

    // Toggle notification dropdown
    document.getElementById('notification-btn').addEventListener('click', function() {
        document.getElementById('notification-dropdown').classList.toggle('hidden');
        document.getElementById('user-menu-dropdown').classList.add('hidden');
    });

    // Toggle user menu dropdown
    document.getElementById('user-menu-btn').addEventListener('click', function() {
        document.getElementById('user-menu-dropdown').classList.toggle('hidden');
        document.getElementById('notification-dropdown').classList.add('hidden');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#notification-btn')) {
            document.getElementById('notification-dropdown').classList.add('hidden');
        }
        if (!e.target.closest('#user-menu-btn')) {
            document.getElementById('user-menu-dropdown').classList.add('hidden');
        }
    });
});
