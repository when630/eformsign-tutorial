console.log('[TutorialApp] content.js loaded');

window.TutorialApp = (() => {
    let currentStepIndex = 0;
    const steps = [
        'showWelcomeStep',
        'showMyFilesMenuStep',
        'showDocumentTabsStep',
        'showTemplateDocsStep'
    ];

    function loadTutorialStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('style.css');
        document.head.appendChild(link);
    }

    function disableScroll() {
        document.body.style.overflow = 'hidden';
    }
    function enableScroll() {
        document.body.style.overflow = '';
    }

    function addHighlightBox(target) {
        const rect = target.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = 'efsg-highlight-area';
        highlight.style.top = `${rect.top + window.scrollY}px`;
        highlight.style.left = `${rect.left + window.scrollX}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        document.body.appendChild(highlight);
        return highlight;
    }

    function setOverlayHole(element) {
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
    }

    function createStepIndicator(currentIndex) {
        const dots = steps.map((_, idx) => {
            return `<span class="efsg-step-dot${idx === currentIndex ? ' active' : ''}"></span>`;
        }).join('');
        return `<div class="efsg-step-indicator">${dots}</div>`;
    }

    function createTutorialTooltip(htmlContent, onClose, highlightTarget = null, showPrev = false, showNav = true) {
        disableScroll();

        const tooltip = document.createElement('div');
        tooltip.className = highlightTarget
            ? 'efsg-explanation-tooltip'
            : 'efsg-center-tooltip';

        const prevBtn = showPrev ? `<button class="efsg-btn efsg-prev-btn">이전</button>` : '';
        const nextBtn = `<button class="efsg-btn efsg-next-btn">${currentStepIndex === steps.length - 1 ? '튜토리얼 종료' : '다음'}</button>`;
        const indicator = createStepIndicator(currentStepIndex);

        tooltip.innerHTML = `
            <button class="efsg-close-btn">×</button>
            ${htmlContent}
            ${showNav ? `<div class="efsg-btn-group">${prevBtn}${nextBtn}</div>${indicator}` : ''}
        `;
        document.body.appendChild(tooltip);

        tooltip.querySelector('.efsg-close-btn').onclick = () => {
            tooltip.remove();
            document.querySelector('.efsg-highlight-area')?.remove();
            document.querySelector('.efsg-highlight-overlay')?.remove();
            enableScroll();
            if (onClose) onClose();
        };

        return { tooltip };
    }

    function positionTooltip(tooltip, target, offset = 20) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let top = 0, left = 0;

        if (rect.right + offset + tooltipRect.width < vw) {
            top = rect.top + window.scrollY;
            left = rect.right + offset + window.scrollX;
        } else if (rect.bottom + offset + tooltipRect.height < vh) {
            top = rect.bottom + offset + window.scrollY;
            left = rect.left + window.scrollX;
        } else {
            top = rect.top - tooltipRect.height - offset + window.scrollY;
            left = rect.left + window.scrollX;
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    function goToStep(index) {
        const stepName = steps[index];
        if (TutorialApp[stepName]) {
            currentStepIndex = index;
            TutorialApp[stepName]();
        }
    }

    function showTutorialStartPrompt() {
        const overlay = document.createElement('div');
        overlay.className = 'efsg-overlay';
        document.body.appendChild(overlay);

        const promptBox = document.createElement('div');
        promptBox.className = 'efsg-center-tooltip';
        promptBox.innerHTML = `
            <div class="efsg-speech-area" style="width: 100%; text-align: center;">
                <div class="efsg-title" style="margin-top: 50px;">도움이 필요하신가요? 🤔</div>
                <div class="efsg-desc" style="text-align: center;">사이드 메뉴 사용법을 안내해 드릴게요.<br>간단한 튜토리얼을 시작하시겠어요?</div>
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
            goToStep(0);
        };

        document.getElementById('tutorialCancelBtn').onclick = () => {
            overlay.remove();
            promptBox.remove();
        };
    }

    function showWelcomeStep() {
        const html = `
            <div class="efsg-character-area">
                <img src="https://i.imgur.com/LndyQkm.png" alt="eformsign 캐릭터" />
            </div>
            <div class="efsg-speech-area" style="overflow: visible;">
                <div class="efsg-title">안녕하세요! 👋</div>
                <div class="efsg-desc">
                    <b>이폼사인</b>에 오신 걸 환영합니다.<br>
                    저는 여러분을 도와드릴 <b>직딩이</b>예요😄<br><br>
                    지금부터 저와 함께 <b>사용법을 배워볼까요?</b>
                </div>
                <div class="efsg-btn-group">
                    <button class="efsg-btn efsg-next-btn">다음</button>
                </div>
                ${createStepIndicator(currentStepIndex)}
            </div>
        `;

        const { tooltip } = createTutorialTooltip(html, null, null, false, false);

        tooltip.querySelector('.efsg-next-btn').onclick = () => {
            tooltip.remove();
            enableScroll();
            goToStep(1);
        };
    }

    function showMyFilesMenuStep() {
        const target = document.querySelector('article.major_area');
        if (!target) return;

        const html = `
            <div>
                <div class="efsg-title">📊 문서 상태를 확인하세요!</div>
                <div class="efsg-desc">
                    • 처리할 문서<br>
                    • 진행 중 문서<br>
                    • 완료 문서<br>
                    • 내 문서<br><br>
                    클릭해서 상태별 문서를 확인할 수 있어요!
                </div>
            </div>
        `;

        const mask = document.createElement('div');
        mask.className = 'efsg-highlight-overlay';
        document.body.appendChild(mask);

        setOverlayHole(target);
        const highlight = addHighlightBox(target);

        const { tooltip } = createTutorialTooltip(html, () => {
            highlight.remove();
            mask.remove();
        }, target, true);

        requestAnimationFrame(() => {
            positionTooltip(tooltip, target);
        });

        tooltip.querySelector('.efsg-next-btn').onclick = () => {
            tooltip.remove();
            highlight.remove();
            mask.remove();
            enableScroll();
            goToStep(currentStepIndex + 1);
        };
        const prevBtn = tooltip.querySelector('.efsg-prev-btn');
        if (prevBtn) {
            prevBtn.onclick = () => {
                tooltip.remove();
                highlight.remove();
                mask.remove();
                enableScroll();
                goToStep(currentStepIndex - 1);
            };
        }
    }

    function showDocumentTabsStep() {
        const target = document.querySelector('.createuform_wrap');
        if (!target) return;

        const html = `
            <div>
                <div class="efsg-title">내 파일로 문서 작성</div>
                <div class="efsg-desc">
                    파일을 업로드해서 전자문서를 쉽게 만들 수 있어요!
                </div>
            </div>
        `;

        const mask = document.createElement('div');
        mask.className = 'efsg-highlight-overlay';
        document.body.appendChild(mask);

        setOverlayHole(target);
        const highlight = addHighlightBox(target);

        const { tooltip } = createTutorialTooltip(html, () => {
            highlight.remove();
            mask.remove();
        }, target, true);

        requestAnimationFrame(() => {
            positionTooltip(tooltip, target);
        });

        tooltip.querySelector('.efsg-next-btn').onclick = () => {
            tooltip.remove();
            highlight.remove();
            mask.remove();
            enableScroll();
            goToStep(currentStepIndex + 1);
        };
        const prevBtn = tooltip.querySelector('.efsg-prev-btn');
        if (prevBtn) {
            prevBtn.onclick = () => {
                tooltip.remove();
                highlight.remove();
                mask.remove();
                enableScroll();
                goToStep(currentStepIndex - 1);
            };
        }
    }

    function showTemplateDocsStep() {
        const target = document.querySelector('.createform_wrap');
        if (!target) return;

        const html = `
            <div>
                <div class="efsg-title">📄 템플릿으로 문서 작성</div>
                <div class="efsg-desc">
                    자주 사용하는 문서는 템플릿으로 저장해두고<br>
                    바로 불러와서 전자문서를 작성할 수 있어요.
                </div>
            </div>
        `;

        const mask = document.createElement('div');
        mask.className = 'efsg-highlight-overlay';
        document.body.appendChild(mask);

        setOverlayHole(target);
        const highlight = addHighlightBox(target);

        const { tooltip } = createTutorialTooltip(html, () => {
            highlight.remove();
            mask.remove();
        }, target, true);

        requestAnimationFrame(() => {
            positionTooltip(tooltip, target);
        });

        tooltip.querySelector('.efsg-next-btn').onclick = () => {
            tooltip.remove();
            highlight.remove();
            mask.remove();
            enableScroll();
            alert('모든 튜토리얼이 완료됐어요! 🎉');
        };
        const prevBtn = tooltip.querySelector('.efsg-prev-btn');
        if (prevBtn) {
            prevBtn.onclick = () => {
                tooltip.remove();
                highlight.remove();
                mask.remove();
                enableScroll();
                goToStep(currentStepIndex - 1);
            };
        }
    }

    function init() {
        loadTutorialStyles();
        showTutorialStartPrompt();
    }

    return {
        init,
        showWelcomeStep,
        showMyFilesMenuStep,
        showDocumentTabsStep,
        showTemplateDocsStep
    };
})();

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', TutorialApp.init);
} else {
    TutorialApp.init();
}