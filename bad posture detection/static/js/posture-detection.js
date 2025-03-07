/**
 * Posture Detection Module
 * Uses TensorFlow.js and PoseNet to detect and analyze posture
 */

class PostureDetector {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('output');
        this.ctx = this.canvas.getContext('2d');
        this.loading = document.getElementById('loading');
        
        // Posture detection parameters
        this.calibratedPose = null;
        this.isMonitoring = false;
        this.poseNet = null;
        this.currentPose = null;
        
        // Thresholds for bad posture detection
        this.shoulderAngleThreshold = 15; // degrees
        this.headPositionThreshold = 0.15; // ratio
        this.confidenceThreshold = 0.5;
        
        // Statistics
        this.postureScore = 100;
        this.goodPostureStartTime = null;
        this.totalGoodPostureTime = 0;
        this.correctionCount = 0;
        
        // Initialize
        this.init();
    }
    
    async init() {
        try {
            // Set up camera
            const stream = await navigator.mediaDevices.getUserMedia({
                'audio': false,
                'video': {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            this.video.srcObject = stream;
            
            // Wait for video to be ready
            await new Promise(resolve => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
            });
            
            // Set canvas dimensions to match video
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            // Load PoseNet model
            this.loading.style.display = 'block';
            this.poseNet = await posenet.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                inputResolution: { width: 640, height: 480 },
                multiplier: 0.75
            });
            this.loading.style.display = 'none';
            
            // Start pose detection loop
            this.detectPose();
            
            console.log('Posture detection initialized successfully');
        } catch (error) {
            console.error('Error initializing posture detection:', error);
            this.loading.textContent = 'Error: Could not access camera. Please check permissions.';
        }
    }
    
    async detectPose() {
        try {
            // Detect poses
            const poses = await this.poseNet.estimateMultiplePoses(this.video, {
                flipHorizontal: true,
                maxDetections: 1,
                scoreThreshold: 0.5,
                nmsRadius: 20
            });
            
            // Get the first pose (assuming single person)
            if (poses.length > 0) {
                this.currentPose = poses[0];
                
                // Draw skeleton
                this.drawPose(this.currentPose);
                
                // Analyze posture if monitoring is active
                if (this.isMonitoring && this.calibratedPose) {
                    this.analyzePose(this.currentPose);
                }
            }
        } catch (error) {
            console.error('Error detecting pose:', error);
        }
        
        // Continue detection loop
        requestAnimationFrame(() => this.detectPose());
    }
    
    drawPose(pose) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw keypoints
        pose.keypoints.forEach(keypoint => {
            if (keypoint.score > this.confidenceThreshold) {
                const { x, y } = keypoint.position;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
                this.ctx.fillStyle = 'aqua';
                this.ctx.fill();
            }
        });
        
        // Draw skeleton
        const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
            pose.keypoints, this.confidenceThreshold);
            
        adjacentKeyPoints.forEach(keypoints => {
            this.ctx.beginPath();
            this.ctx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
            this.ctx.lineTo(keypoints[1].position.x, keypoints[1].position.y);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'aqua';
            this.ctx.stroke();
        });
    }
    
    calibrate() {
        if (this.currentPose) {
            this.calibratedPose = JSON.parse(JSON.stringify(this.currentPose));
            console.log('Posture calibrated:', this.calibratedPose);
            return true;
        }
        return false;
    }
    
    startMonitoring() {
        if (this.calibratedPose) {
            this.isMonitoring = true;
            this.goodPostureStartTime = Date.now();
            this.updateStatus('Monitoring posture...', 'status-good');
            return true;
        }
        return false;
    }
    
    stopMonitoring() {
        this.isMonitoring = false;
        this.updateStatus('Monitoring stopped', 'status-good');
        return true;
    }
    
    analyzePose(currentPose) {
        if (!currentPose || !this.calibratedPose) return;
        
        // Get key points for posture analysis
        const leftShoulder = this.getKeypoint(currentPose, 'leftShoulder');
        const rightShoulder = this.getKeypoint(currentPose, 'rightShoulder');
        const leftEar = this.getKeypoint(currentPose, 'leftEar');
        const rightEar = this.getKeypoint(currentPose, 'rightEar');
        const nose = this.getKeypoint(currentPose, 'nose');
        
        // Get calibrated key points
        const calibLeftShoulder = this.getKeypoint(this.calibratedPose, 'leftShoulder');
        const calibRightShoulder = this.getKeypoint(this.calibratedPose, 'rightShoulder');
        const calibLeftEar = this.getKeypoint(this.calibratedPose, 'leftEar');
        const calibRightEar = this.getKeypoint(this.calibratedPose, 'rightEar');
        const calibNose = this.getKeypoint(this.calibratedPose, 'nose');
        
        // Skip analysis if key points are not detected with high confidence
        if (!leftShoulder || !rightShoulder || !leftEar || !rightEar || !nose ||
            !calibLeftShoulder || !calibRightShoulder || !calibLeftEar || !calibRightEar || !calibNose) {
            return;
        }
        
        // Calculate shoulder angle change
        const currentShoulderAngle = this.calculateAngle(leftShoulder, rightShoulder);
        const calibratedShoulderAngle = this.calculateAngle(calibLeftShoulder, calibRightShoulder);
        const shoulderAngleDiff = Math.abs(currentShoulderAngle - calibratedShoulderAngle);
        
        // Calculate head position change
        const currentHeadPos = {
            x: (leftEar.x + rightEar.x) / 2,
            y: (leftEar.y + rightEar.y) / 2
        };
        
        const calibHeadPos = {
            x: (calibLeftEar.x + calibRightEar.x) / 2,
            y: (calibLeftEar.y + calibRightEar.y) / 2
        };
        
        // Calculate normalized head position difference
        const headPosDiffX = Math.abs(currentHeadPos.x - calibHeadPos.x) / this.canvas.width;
        const headPosDiffY = Math.abs(currentHeadPos.y - calibHeadPos.y) / this.canvas.height;
        const headPosDiff = Math.sqrt(headPosDiffX * headPosDiffX + headPosDiffY * headPosDiffY);
        
        // Calculate posture score (0-100)
        const shoulderScore = Math.max(0, 100 - (shoulderAngleDiff * 3));
        const headScore = Math.max(0, 100 - (headPosDiff * 300));
        this.postureScore = Math.round((shoulderScore + headScore) / 2);
        
        // Update UI with posture score
        document.getElementById('posture-score').textContent = this.postureScore;
        
        // Determine if posture is bad
        const isBadPosture = shoulderAngleDiff > this.shoulderAngleThreshold || 
                            headPosDiff > this.headPositionThreshold;
        
        if (isBadPosture) {
            // Bad posture detected
            this.handleBadPosture();
        } else {
            // Good posture
            this.handleGoodPosture();
        }
    }
    
    getKeypoint(pose, name) {
        const keypoint = pose.keypoints.find(kp => kp.part === name);
        if (keypoint && keypoint.score > this.confidenceThreshold) {
            return keypoint.position;
        }
        return null;
    }
    
    calculateAngle(point1, point2) {
        return Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI;
    }
    
    handleGoodPosture() {
        // Update status indicator
        this.updateStatus('Good posture', 'status-good');
        
        // Update good posture time
        if (this.goodPostureStartTime === null) {
            this.goodPostureStartTime = Date.now();
        }
        
        // Calculate and display total good posture time
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - this.goodPostureStartTime) / 1000);
        this.totalGoodPostureTime = elapsedSeconds;
        
        // Format and display time
        const hours = Math.floor(this.totalGoodPostureTime / 3600);
        const minutes = Math.floor((this.totalGoodPostureTime % 3600) / 60);
        const seconds = this.totalGoodPostureTime % 60;
        
        const timeString = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
        
        document.getElementById('good-posture-time').textContent = timeString;
    }
    
    handleBadPosture() {
        // Update status indicator
        this.updateStatus('Bad posture detected!', 'status-bad');
        
        // Reset good posture timer
        this.goodPostureStartTime = null;
        
        // Increment correction count
        this.correctionCount++;
        document.getElementById('correction-count').textContent = this.correctionCount;
        
        // Show notification
        this.showNotification();
    }
    
    updateStatus(message, className) {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        statusText.textContent = message;
        
        // Remove all status classes
        statusIndicator.classList.remove('status-good', 'status-warning', 'status-bad');
        
        // Add the appropriate class
        statusIndicator.classList.add(className);
    }
    
    showNotification() {
        const notification = document.getElementById('notification');
        notification.classList.remove('hidden');
        
        // Play alert sound
        const audio = new Audio('/static/sounds/alert.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }
}

// Export the PostureDetector class
window.PostureDetector = PostureDetector; 