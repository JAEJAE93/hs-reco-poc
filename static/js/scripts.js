document.addEventListener('DOMContentLoaded', (event) => {
    const focusableElements = document.querySelectorAll('.card, .video, .option, .banner-content, .logo, .menu a');
    const cardsContainer = document.querySelector('.cards');
    const nextButton = document.querySelector('.next');
    const prevButton = document.querySelector('.prev');
    let currentIndex = 0;
    
    // overlay
    const overlay = document.getElementById('overlay');
    const overlayContent = document.getElementById('overlay-content');
    let lastFocusedElement; // 콘텐츠 클릭 전의 포커스 저장

    function moveFocus(currentElement, direction) {
        let focusableElementsInContext;
        
        // 오버레이에 포커스가 되면, 방향키 포커스를 오버레이에 맞춤
        if (overlay.style.display === 'flex') {
            focusableElementsInContext = overlayContent.querySelectorAll('button, [tabindex="0"]');
        } 
        else {
            focusableElementsInContext = focusableElements;
        }

        const currentIndex = Array.from(focusableElementsInContext).indexOf(currentElement);
        let targetIndex;

        // 컬럼 계산
        const sectionElements = document.querySelectorAll('section');
        let columns = 1;
        sectionElements.forEach(section => {
            const items = section.querySelectorAll('.card, .video, .option').length;
            if (items > 0) {
                columns = Math.max(columns, Math.ceil(items / Math.floor(window.innerWidth / 300)));
            }
        });

        // 방향키 입력
        switch (direction) {
            case 'ArrowUp':
                targetIndex = currentIndex - columns;
                break;
            case 'ArrowDown':
                targetIndex = currentIndex + columns;
                break;
            case 'ArrowLeft':
                targetIndex = currentIndex - 1;
                break;
            case 'ArrowRight':
                targetIndex = currentIndex + 1;
                break;
            default:
                return;
        }

        if (targetIndex >= 0 && targetIndex < focusableElementsInContext.length) {
            focusableElementsInContext[targetIndex].focus();
        }
    }

    // 오버레이 표시
    function showOverlay(url) {
        lastFocusedElement = document.activeElement; // 마지막 포커스 위치 저장
        fetch(url)
            .then(response => response.text())
            .then(html => {
                overlayContent.innerHTML = html;
                overlay.style.display = 'flex';

                // 이벤트 리스너 추가
                const overlayFocusableElements = overlayContent.querySelectorAll('button, [tabindex="0"]');
                overlayFocusableElements.forEach(element => {
                    element.addEventListener('keydown', (event) => {
                        const direction = event.key;
                        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(direction)) {
                            event.preventDefault();
                            moveFocus(event.target, direction);
                        }
                    });
                });

                document.querySelector('.close-button').addEventListener('click', hideOverlay);
            })
            .catch(error => {
                console.error('Error loading page:', error);
            });
    }

    // 오버레이 숨기기
    function hideOverlay() {
        overlay.style.display = 'none';
        document.body.classList.remove('translucent-background');
        if (lastFocusedElement) {
            lastFocusedElement.focus(); // 마지막 포커스 위치 복구
        }
    }

    focusableElements.forEach(element => {
        // 키보드 입력에 따른 moveFocus 호출
        element.addEventListener('keydown', (event) => {
            const direction = event.key;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(direction)) {
                event.preventDefault();
                moveFocus(event.target, direction);
            }
        });

        // keyboard enter 상세 페이지 open
        element.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const url = element.getAttribute('data-url');
                if (url) {
                    showOverlay(url);
                }
            }
        });

        // // mouse click event 접근
        // element.addEventListener('click', function () {
        //     const url = element.getAttribute('data-url');
        //     if (url) {
        //         showOverlay(url);
        //     }
        // });
        
    });
});