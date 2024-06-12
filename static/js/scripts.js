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
        const currentIndex = Array.from(focusableElements).indexOf(currentElement);
        let targetIndex;
        let focusableElementsInContext;
        
        // 오버레이에 포커스가 되면, 방향키 포커스를 오버레이에 맞춤
        if (overlay.style.display === 'flex') {
            focusableElementsInContext = overlayContent.querySelectorAll('button, [tabindex="0"]');
        } else {
            focusableElementsInContext = focusableElements;
        }

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

        if (targetIndex >= 0 && targetIndex < focusableElements.length) {
            focusableElements[targetIndex].focus();
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
        element.addEventListener('keydown', (event) => {
            const direction = event.key;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(direction)) {
                event.preventDefault();
                moveFocus(event.target, direction);
            }
        });

        element.addEventListener('click', function () {
            const url = element.getAttribute('data-url');
            if (url) {
                showOverlay(url);
            }
        });

        element.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const url = element.getAttribute('data-url');
                if (url) {
                    showOverlay(url);
                }
            }
        });
    });

    // function updateCardsWidth() {
    //     const cardCount = document.querySelectorAll('.cards .card').length;
    //     const cardWidth = document.querySelector('.cards-wrapper').clientWidth / 4; // Display 4 cards at a time
    //     document.querySelectorAll('.cards .card').forEach(card => {
    //         card.style.width = `${cardWidth}px`;
    //     });
    //     cardsContainer.style.width = `${cardWidth * cardCount}px`;
    // }


    // function updateSlidePosition() {
    //     const cardWidth = document.querySelector('.cards-wrapper').clientWidth / 4;
    //     cardsContainer.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    // }

    // nextButton.addEventListener('click', () => {
    //     const cardCount = document.querySelectorAll('.cards .card').length;
    //     if (currentIndex < cardCount - 4) {
    //         currentIndex++;
    //         updateSlidePosition();
    //     }
    // });

    // prevButton.addEventListener('click', () => {
    //     if (currentIndex > 0) {
    //         currentIndex--;
    //         updateSlidePosition();
    //     }
    // });

    // window.addEventListener('resize', updateCardsWidth);
    // updateCardsWidth();

    // focusableElements.forEach(element => {
    //     element.addEventListener('keydown', (event) => {
    //         const direction = event.key;
    //         if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(direction)) {
    //             event.preventDefault();
    //             moveFocus(event.target, direction);
    //         }
    //     });
    // });
});