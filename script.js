document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const messageContent = document.getElementById('message');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const replayBtn = document.getElementById('replayBtn');
    const progressBar = document.getElementById('progressBar');
    const status = document.getElementById('status');
    const speedSelect = document.getElementById('speedSelect');
    const muteBtn = document.getElementById('muteBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    const bgMusic = new Audio('bg.mp3');
    bgMusic.loop = false;
    bgMusic.volume = 1; // Start at full volume

    // Animation variables
    let animationId = null;
    let isPlaying = false;
    let isFinished = false;
    let startTime = null;
    let elapsedTime = 0;
    let isMuted = false;

    // Speed settings (in milliseconds for full scroll)
    const speedSettings = {
        slow: 280000,      // 100 seconds
        normal: 90000,     // 90 seconds
        fast: 40000,       // 40 seconds
        veryfast: 25000    // 25 seconds
    };

    let duration = speedSettings.slow; // Default duration

    const containerHeight = document.querySelector('.message-container').offsetHeight;
    const messageHeight = messageContent.offsetHeight;
    const maxScroll = messageHeight - containerHeight;

    // Initialize the message position
    messageContent.style.top = '0px';

    // Update duration based on selected speed
    function updateDuration() {
        const speed = speedSelect.value;
        duration = speedSettings[speed];

        // If currently playing, restart with new speed
        if (isPlaying) {
            pauseAnimation();
            setTimeout(playAnimation, 50);
        }
    }

    // Play function
    function playAnimation() {
        if (isFinished) {
            resetAnimation();
        }

        isPlaying = true;
        startTime = Date.now() - elapsedTime;

        // Update buttons
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        replayBtn.style.display = 'none';
        status.textContent = 'Playing';

        // Play music if not muted
        if (!isMuted) {
            bgMusic.volume = 1;
        }
        bgMusic.play().catch(e => {
            console.log("Audio play failed:", e);
            // Some browsers require user interaction first
        });

        // Start animation
        function animate() {
            if (!isPlaying) return;

            elapsedTime = Date.now() - startTime;
            let progress = Math.min(elapsedTime / duration, 1);

            // Update scroll position
            const scrollDistance = maxScroll * progress;
            messageContent.style.top = `-${scrollDistance}px`;

            // Update progress bar
            progressBar.style.width = `${progress * 100}%`;

            // Check if finished
            if (progress >= 1) {
                isFinished = true;
                isPlaying = false;

                // Update buttons
                pauseBtn.style.display = 'none';
                replayBtn.style.display = 'flex';
                status.textContent = 'Finished';

                return;
            }

            animationId = requestAnimationFrame(animate);
        }

        animationId = requestAnimationFrame(animate);
    }

    // Pause function
    function pauseAnimation() {
        isPlaying = false;

        // Update buttons
        playBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
        status.textContent = 'Paused';

        // Only pause the music (don't change mute state)
        bgMusic.pause();

        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    // Reset function
    function resetAnimation() {
        isPlaying = false;
        isFinished = false;
        elapsedTime = 0;

        // Reset position
        messageContent.style.top = '0px';
        progressBar.style.width = '0%';

        // Update buttons
        playBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
        replayBtn.style.display = 'none';
        status.textContent = 'Paused';

        // Pause and reset music
        bgMusic.pause();
        bgMusic.currentTime = 0;

        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    // Mute/Unmute function
    function toggleMute() {
        isMuted = !isMuted;

        if (isMuted) {
            bgMusic.volume = 0;
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            muteBtn.style.backgroundColor = 'rgba(100, 100, 100, 0.7)';
            muteBtn.title = 'Sound muted - click to unmute';
        } else {
            bgMusic.volume = 1;
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            muteBtn.style.backgroundColor = '';
            muteBtn.title = 'Sound on - click to mute';
        }
    }

    // Download function
    function downloadMessage() {
        // Get all the message text
        const messageText = document.getElementById('message').innerText;

        // Create a blob with the text
        const blob = new Blob([messageText], { type: 'text/plain' });

        // Create a download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Message_for_you.txt';

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show confirmation
        const originalText = downloadBtn.innerHTML;
        const originalBg = downloadBtn.style.backgroundColor;
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        downloadBtn.style.backgroundColor = '#4CAF50';

        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.style.backgroundColor = originalBg;
        }, 1500);
    }

    // Event listeners
    playBtn.addEventListener('click', playAnimation);
    pauseBtn.addEventListener('click', pauseAnimation);
    replayBtn.addEventListener('click', function () {
        resetAnimation();
        setTimeout(playAnimation, 100);
    });
    speedSelect.addEventListener('change', updateDuration);
    muteBtn.addEventListener('click', toggleMute);
    downloadBtn.addEventListener('click', downloadMessage);

    // Manual scroll control (for touch devices)
    let isDragging = false;
    let startY = 0;
    let startTop = 0;

    messageContent.addEventListener('mousedown', startDrag);
    messageContent.addEventListener('touchstart', startDrag);

    function startDrag(e) {
        isDragging = true;
        startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        startTop = parseFloat(messageContent.style.top) || 0;

        // Pause animation if dragging
        if (isPlaying) {
            pauseAnimation();
        }

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('touchmove', doDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function doDrag(e) {
        if (!isDragging) return;

        e.preventDefault();
        const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        const diff = startY - currentY;
        let newTop = startTop - diff;

        // Constrain scrolling within bounds
        newTop = Math.max(-maxScroll, Math.min(0, newTop));

        // Update position
        messageContent.style.top = `${newTop}px`;

        // Update progress bar based on scroll position
        const progress = Math.abs(newTop) / maxScroll;
        progressBar.style.width = `${progress * 100}%`;
        elapsedTime = progress * duration;
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('touchmove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    }

    // Initialize
    pauseBtn.style.display = 'none';
    replayBtn.style.display = 'none';
});
