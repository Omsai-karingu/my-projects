/**
 * Main Application JavaScript
 * Handles UI interactions and initializes the posture detector
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize posture detector
    const postureDetector = new PostureDetector();
    
    // Get UI elements
    const calibrateBtn = document.getElementById('calibrate');
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const dismissBtn = document.getElementById('dismiss-notification');
    const notification = document.getElementById('notification');
    
    // Calibrate button click handler
    calibrateBtn.addEventListener('click', () => {
        const success = postureDetector.calibrate();
        
        if (success) {
            showToast('Posture calibrated successfully!');
            startBtn.disabled = false;
        } else {
            showToast('Calibration failed. Please make sure you are visible in the camera.', 'error');
        }
    });
    
    // Start monitoring button click handler
    startBtn.addEventListener('click', () => {
        const success = postureDetector.startMonitoring();
        
        if (success) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            showToast('Posture monitoring started');
        } else {
            showToast('Please calibrate your posture first', 'error');
        }
    });
    
    // Stop monitoring button click handler
    stopBtn.addEventListener('click', () => {
        const success = postureDetector.stopMonitoring();
        
        if (success) {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            showToast('Posture monitoring stopped');
        }
    });
    
    // Dismiss notification button click handler
    dismissBtn.addEventListener('click', () => {
        notification.classList.add('hidden');
    });
    
    // Helper function to show toast messages
    function showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Add toast styles
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background-color: #333;
            color: white;
            border-radius: 4px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .toast-info {
            background-color: #3498db;
        }
        
        .toast-success {
            background-color: #2ecc71;
        }
        
        .toast-error {
            background-color: #e74c3c;
        }
    `;
    document.head.appendChild(style);
}); 