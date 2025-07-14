console.log('[TutorialApp] content.js loaded');

window.TutorialApp = (() => {
    // 스텝 설정
    let currentStepIndex = 0;
    const steps = [
        'showWelcomeStep',
        'showMyFilesMenuStep',
        'showDocumentTabsStep',
        'showTemplateDocsStep'
    ];
    // 메뉴 스텝 설정
    const menuItems = [
        {
            id: '#create_doc_bundle',
            label: '새 문서 작성',
            desc: '여러 개의 문서를 하나의 묶음으로 생성할 수 있어요. 서명 요청이 필요한 경우에 유용해요.'
        },
        {
            id: '#create_uform',
            label: '내 파일로 문서 작성',
            desc: 'PDF나 한글, 워드 등 파일을 업로드해 전자문서를 만들 수 있어요.'
        },
        {
            id: '#create_doc',
            label: '템플릿으로 문서 작성',
            desc: '자주 사용하는 양식을 템플릿으로 저장해두고, 간편하게 문서를 작성할 수 있어요.'
        },
        {
            id: '#list_temp_uform',
            label: '내 파일 보관함',
            desc: '업로드한 원본 파일을 저장해두는 곳이에요. 필요할 때 다시 사용할 수 있어요.'
        },
        {
            id: '#list_doc_bundle',
            label: '문서함',
            desc: '내가 생성하거나 받은 모든 문서를 한 곳에서 확인할 수 있어요.'
        },
        {
            id: '#document_list_ri',
            label: '처리할 문서함',
            desc: '내가 서명하거나 확인해야 하는 문서들이 여기에 모여 있어요.'
        },
        {
            id: '#document_list_ip',
            label: '진행 중 문서함',
            desc: '아직 모든 서명이 끝나지 않은 문서들을 확인할 수 있어요.'
        },
        {
            id: '#document_list_ai',
            label: '완료 문서함',
            desc: '서명과 처리가 완료된 문서들을 보관하는 공간이에요.'
        },
        {
            id: '#document_list_mass',
            label: '일괄 작성 문서함',
            desc: '한 번에 여러 명에게 문서를 보낼 때 사용한 일괄 작성 문서를 모아둔 공간이에요.'
        },
        {
            id: '#share_document_list',
            label: '공유 문서함',
            desc: '다른 사용자와 공유한 문서들을 이곳에서 확인할 수 있어요.'
        },
        {
            id: '#trash_document',
            label: '휴지통',
            desc: '삭제한 문서들이 임시 보관되는 곳이에요. 일정 기간이 지나면 완전히 삭제돼요.'
        },
        {
            id: '#manage_signature',
            label: '내 서명',
            desc: '내 서명, 도장, 이니셜 등을 관리하고 등록할 수 있어요.'
        },
        {
            id: '#external_address',
            label: '연락처',
            desc: '자주 문서를 보내는 외부 수신자의 정보를 등록하고 관리할 수 있어요.'
        },
        {
            id: '#list_form',
            label: '템플릿 관리',
            desc: '내가 만든 문서 템플릿을 수정하거나 삭제할 수 있어요.'
        },
        {
            id: '#manage_company',
            label: '회사 관리',
            desc: '회사 계정에 소속된 사용자, 부서 등을 관리할 수 있어요.'
        },
        {
            id: '#usage',
            label: '이용 현황',
            desc: '최근 문서 작성 현황, 사용 건수 등을 확인할 수 있어요.'
        }
    ];

    /*====== 공통 유틸 ======*/
    // style.css 연결
    function loadTutorialStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('style.css');
        document.head.appendChild(link);
    }

    // 스크롤 잠금 메서드
    function disableScroll() {
        document.body.style.overflow = 'hidden';
    }
    function enableScroll() {
        document.body.style.overflow = '';
    }

    // 강조 효과 추가
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

    // 강조 부분 구멍 뚫기
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

    // 스텝 진행 사항 표시
    function createStepIndicator(currentIndex) {
        const dots = steps.map((_, idx) => {
            return `<span class="efsg-step-dot${idx === currentIndex ? ' active' : ''}"></span>`;
        }).join('');
        return `<div class="efsg-step-indicator">${dots}</div>`;
    }

    // 툴팁 생성
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

    // 툴팁 위치 선정 (타겟으로부터 offset만큼 떨어짐)
    function positionTooltip(tooltip, target, offset = 20) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let top = 0;
        let left = 0;

        const prefersRight = rect.right + offset + tooltipRect.width < vw;
        const prefersBottom = rect.bottom + offset + tooltipRect.height < vh;

        if (prefersRight) {
            // 오른쪽에 배치, 단 툴팁이 하단을 넘어가지 않도록 보정
            top = rect.top + window.scrollY - tooltipRect.height / 2 + rect.height / 2;
            top = Math.max(window.scrollY + 10, top); // 너무 위로 가지 않도록 보정
            left = rect.right + offset + window.scrollX;
        } else if (prefersBottom) {
            top = rect.bottom + offset + window.scrollY;
            left = rect.left + window.scrollX;
        } else {
            top = rect.top - tooltipRect.height - offset + window.scrollY;
            left = rect.left + window.scrollX;
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    // 이전, 다음
    function goToStep(index) {
        const stepName = steps[index];
        if (TutorialApp[stepName]) {
            currentStepIndex = index;
            TutorialApp[stepName]();
        }
    }

    // 튜토 시작 프롬프트
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

    // 환영 스텝
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

    // 문서 상태 확인 스텝
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

    // 내 파일로 문서 작성 스텝
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
        };
    }

    // 템플릿으로 문서 작성 스텝
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

            // 메뉴 열기
            const menuToggleBtn = document.getElementById('lnbOpen');
            if (menuToggleBtn && typeof menuToggleBtn.click === 'function') {
                menuToggleBtn.click(); // 메뉴 강제 열기
            }

            // 약간의 시간 차를 두고 다음 스텝 실행 (메뉴 DOM이 그려지는 시간 확보)
            setTimeout(() => {
                goToStep(currentStepIndex + 1);
            }, 300); // 300ms 정도 지연
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
        };
    }

    // 메뉴 탭 스텝
    function createMenuStep(id, label, desc) {
        return function () {
            const target = document.querySelector(id);
            if (!target) return;

            // 메뉴 열기 시도
            const menuBtn = document.getElementById('lnbOpen');
            if (menuBtn && !document.body.classList.contains('lnb_open')) {
                menuBtn.click();
            }

            // 스크롤 위치 조정
            // 설명 칸이 중앙에 오도록 함
            const scrollEl = document.querySelector('#mCSB_1');
            if (scrollEl) scrollEl.scrollTop = target.offsetTop - 100;

            const html = `
                <div>
                    <div class="efsg-title">📌 ${label}</div>
                    <div class="efsg-desc">
                        ${desc}
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
            }, target, true, true);

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
            tooltip.querySelector('.efsg-prev-btn').onclick = () => {
                tooltip.remove();
                highlight.remove();
                mask.remove();
                enableScroll();
                goToStep(currentStepIndex - 1);
            };
        };
    }

    // 메뉴 스텝을 'showMenuStep_${i}'로 현재 스텝에 추가
    function extendWithMenuSteps() {
        menuItems.forEach((item, i) => {
            const methodName = `showMenuStep_${i}`;
            steps.push(methodName);
            TutorialApp[methodName] = createMenuStep(item.id, item.label, item.desc);
        });
    }

    function init() {
        loadTutorialStyles();
        extendWithMenuSteps();
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

// DOM이 호출되거나 이미 호출되어 있으면 TutorialApp 실행
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', TutorialApp.init);
} else {
    TutorialApp.init();
}