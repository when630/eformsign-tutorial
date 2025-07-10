(function () {
    // 스타일 로드
    const loadTutorialStyles = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('style.css');
        document.head.appendChild(link);
    };

    // 요소 생성 유틸
    const createElement = (tag, className = '', html = '') => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (html) el.innerHTML = html;
        return el;
    };

    // 오버레이 마스크 설정
    const setOverlayHole = (element) => {
        const rect = element.getBoundingClientRect();
        const maskSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
            <mask id="hole-mask" x="0" y="0" width="100%" height="100%">
                <rect width="100%" height="100%" fill="white"/>
                <rect x="${rect.left}" y="${rect.top}" width="${rect.width}" height="${rect.height}" fill="black" rx="12" ry="12"/>
            </mask>
            </defs>
            <rect width="100%" height="100%" fill="black" mask="url(#hole-mask)" />
        </svg>
        `.trim();
        const encoded = encodeURIComponent(maskSVG)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');

        const overlay = document.querySelector('.efsg-highlight-overlay');
        if (!overlay) return;
        overlay.style.maskImage = `url("data:image/svg+xml,${encoded}")`;
        overlay.style.webkitMaskImage = `url("data:image/svg+xml,${encoded}")`;
    };

    // 튜토리얼 시작 프롬프트
    const showTutorialStartPrompt = () => {
        const overlay = createElement('div', 'efsg-overlay');
        document.body.appendChild(overlay);

        const promptBox = createElement('div', 'efsg-center-tooltip');
        promptBox.style.alignItems = 'center';
        promptBox.innerHTML = `
        <div class="efsg-speech-area" style="width: 100%; text-align: center;">
            <div class="efsg-title">도움이 필요하신가요? 🤔</div>
            <div class="efsg-desc">사이드 메뉴 사용법을 안내해 드릴게요.<br>간단한 튜토리얼을 시작하시겠어요?</div>
            <div style="display: flex; gap: 20px; justify-content: center;">
                <button id="tutorialStartBtn" class="efsg-btn">튜토리얼 시작</button>
                <button id="tutorialCancelBtn" class="efsg-btn" style="background: #ccc; color: #333;">나중에 보기</button>
            </div>
        </div>
        `;
        document.body.appendChild(promptBox);

        document.getElementById('tutorialStartBtn').onclick = () => {
        overlay.remove();
        promptBox.remove();
        console.log('튜토리얼 시작!');
        // 여기에 showWelcomeStep() 등 추가 단계 호출
        };
        document.getElementById('tutorialCancelBtn').onclick = () => {
        overlay.remove();
        promptBox.remove();
        };
    };

    // 초기 실행
    window.addEventListener('DOMContentLoaded', () => {
        loadTutorialStyles();
        showTutorialStartPrompt();
        console.log('실행 완료!')
    });
})();