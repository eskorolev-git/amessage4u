document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const messageContent = document.getElementById('message');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const replayBtn = document.getElementById('replayBtn');
    const progressBar = document.getElementById('progressBar');
    const status = document.getElementById('status');
    const speedSelect = document.getElementById('speedSelect');
    const downloadBtn = document.getElementById('downloadBtn');

    const bgMusic = new Audio('bgmusic.mp3');
    bgMusic.loop = false;
    bgMusic.volume = 1;

    // Animation variables
    let animationId = null;
    let isPlaying = false;
    let isFinished = false;
    let startTime = null;
    let elapsedTime = 0;

    // Speed settings (in milliseconds for full scroll)
    const speedSettings = {
        slow: 350000,
        normal: 90000,
        fast: 40000,
        veryfast: 25000
    };

    let duration = speedSettings.slow;
    let maxScroll = 0;
    let containerHeight = 0;
    let messageHeight = 0;

    messageContent.style.top = '0px';

    function calculateHeights() {
        // Recalculate heights to ensure accuracy, especially on mobile
        containerHeight = document.querySelector('.message-container').offsetHeight;
        messageHeight = messageContent.offsetHeight;
        
        // Add extra padding (50px) to ensure the full message scrolls
        maxScroll = Math.max(0, messageHeight - containerHeight + 50);
    }

    function updateDuration() {
        const speed = speedSelect.value;
        duration = speedSettings[speed];

        if (isPlaying) {
            pauseAnimation();
            setTimeout(playAnimation, 50);
        }
    }

    // ▶ PLAY
    function playAnimation() {
        if (isFinished) {
            resetAnimation();
        }

        // Recalculate heights before starting animation
        calculateHeights();
        
        isPlaying = true;
        startTime = Date.now() - elapsedTime;

        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        replayBtn.style.display = 'none';
        status.textContent = 'Playing';

        bgMusic.play().catch(e => {
            console.log("Audio play failed:", e);
        });

        function animate() {
            if (!isPlaying) return;

            elapsedTime = Date.now() - startTime;
            let progress = Math.min(elapsedTime / duration, 1);

            const scrollDistance = maxScroll * progress;
            messageContent.style.top = `-${scrollDistance}px`;
            progressBar.style.width = `${progress * 100}%`;

            if (progress >= 1) {
                isFinished = true;
                isPlaying = false;

                pauseBtn.style.display = 'none';
                replayBtn.style.display = 'flex';
                status.textContent = 'Finished';
                return;
            }

            animationId = requestAnimationFrame(animate);
        }

        animationId = requestAnimationFrame(animate);
    }

    // ⏸ PAUSE
    function pauseAnimation() {
        isPlaying = false;

        playBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
        status.textContent = 'Paused';

        bgMusic.pause();

        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    // 🔄 RESET
    function resetAnimation() {
        isPlaying = false;
        isFinished = false;
        elapsedTime = 0;

        messageContent.style.top = '0px';
        progressBar.style.width = '0%';

        playBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
        replayBtn.style.display = 'none';
        status.textContent = 'Paused';

        bgMusic.pause();
        bgMusic.currentTime = 0;

        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    function downloadMessage() {
        // Create a link element
        const link = document.createElement('a');
        
        // Set the href to point to the PDF file
        link.href = 'message4u.pdf';
        
        // Set the download attribute with the desired filename
        link.download = 'message4u.pdf';
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Visual feedback for download button
        const originalText = downloadBtn.innerHTML;
        const originalBg = downloadBtn.style.backgroundColor;
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        downloadBtn.style.backgroundColor = '#4CAF50';

        // Reset button after 1.5 seconds
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.style.backgroundColor = originalBg;
        }, 1500);
    }

    playBtn.addEventListener('click', playAnimation);
    pauseBtn.addEventListener('click', pauseAnimation);
    replayBtn.addEventListener('click', function () {
        resetAnimation();
        setTimeout(playAnimation, 100);
    });
    speedSelect.addEventListener('change', updateDuration);
    downloadBtn.addEventListener('click', downloadMessage);

    // Initial calculation on load
    setTimeout(calculateHeights, 100);
    
    // Recalculate on window resize (important for mobile orientation changes)
    window.addEventListener('resize', calculateHeights);

    pauseBtn.style.display = 'none';
    replayBtn.style.display = 'none';
});
