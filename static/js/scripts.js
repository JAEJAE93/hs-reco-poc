document.addEventListener('DOMContentLoaded', (event) => {
    const focusableElementsSelector = '.header-element, .card, .video, .option, .banner-content, .logo, .menu a';
    let focusableElements = document.querySelectorAll(focusableElementsSelector);
    var updateFlag = true;
    const nextButton = document.querySelector('.next');
    const prevButton = document.querySelector('.prev');
    
    // overlay
    const overlay = document.getElementById('overlay');
    const overlayContent = document.getElementById('overlay-content');
    let lastFocusedElement; // 콘텐츠 클릭 전의 포커스 저장

    // pci data check
    function fetchCheckin() {
        fetch('/update_data')
            .then(response => response.text())
            .then(data => {
                // 특정 단어가 있는지 check 있으면 체크인 실패
                if (data.includes('Not update!!!')) {
                    console.log('func Not checkin!!!')
                    updateFlag = false;
                }
                else{
                    console.log('func checkin!!!')
                    updateFlag = true;
                }
            })
            .catch(error => {
                console.error('Error fetch checkin:', error);
            });
    }

    // 추천리스트 update
    function fetchData() {
        fetch('/update_data')
            .then(response => response.json())
            .then(data => {
                // copywriting
                const recoCwElement = document.getElementById('reco_cw');
                if (recoCwElement) {
                    // console.log('data.reco_cw: ', data.reco_cw);
                    recoCwElement.innerText = data.reco_cw;
                }
                else {
                    console.error('#reco_cw not found.');
                }

                // reco product list
                const cardsElement = document.querySelectorAll('.card');
                
                // reco product 구역 확인
                if (cardsElement) {
                    const minLength = Math.min(cardsElement.length, data.cards.length);
                    // 각 카드 업데이트 또는 새 카드 추가
                    for (let i = 0; i < minLength; i++) {
                        let cardElement = cardsElement[i];
                        let card = data.cards[i];

                        if (cardElement) {
                            // 기존 카드 업데이트
                            cardElement.dataset.url = `/product/${card.prod_id}`;
                            cardElement.querySelector('.channel-number').innerText = card.ch_no;
                            cardElement.querySelector('.channel-name').innerText = card.ch_nm;
                            cardElement.querySelector('.product-image').src = card.productImgUrl;
                            cardElement.querySelector('.product-name').innerText = card.bom_prod_nm;
                            cardElement.querySelector('.product-price').innerText = `${card.price}원`;
                        }
                        else {
                            console.log('새 카드 추가')
                            // 새 카드 추가
                            cardElement = document.createElement('div');
                            cardElement.className = 'card';
                            cardElement.id = `card-${card.prod_id}`;
                            cardElement.setAttribute('tabindex', '0');
                            cardElement.dataset.url = `/product/${card.prod_id}`;
                            cardElement.innerHTML = `
                                <div class='channel-number'>${card.ch_no}</div>
                                <div class="channel-name">${card.ch_nm}</div>
                                <img src="${card.productImgUrl}" alt="Product Image" class="product-image">
                                <div class="product-details">
                                    <div class="product-name">${card.bom_prod_nm}</div>
                                    <div class="product-price">${card.price}원</div>
                                </div>
                            `;
                            cardsContainer.appendChild(cardElement);
                        }
                    }

                    // 새로 추가된 요소에 대해 포커스 및 클릭 이벤트 등록
                    focusableElements = document.querySelectorAll(focusableElementsSelector);
                    focusableElements.forEach(element => {
                        element.addEventListener('keydown', (event) => {
                            const direction = event.key;
                            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(direction)) {
                                event.preventDefault();
                                moveFocus(event.target, direction);
                            }
                        });

                        element.addEventListener('keydown', function(event) {
                            if (event.key === 'Enter') {
                                const url = element.getAttribute('data-url');
                                if (url) {
                                    showOverlay(url);
                                }
                            }
                        });

                        // element.addEventListener('click', function() {
                        //     const url = element.getAttribute('data-url');
                        //     if (url) {
                        //         showOverlay(url);
                        //     }
                        // });
                    });
                }
                else {

                    console.error('.cards not found.');
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // checkinflag에 따른 카피라이팅, 추천상품군 update
    function updateRecolist(){
        if (updateFlag) {
            console.log('func update true updateFlag: ', updateFlag)
            fetchData();
        }
        else {
            //pass
            // console.log('func update false updateFlag: ', updateFlag)s
        }
    }

    // 초기 PCI 데이터 확인
    fetchCheckin();

    // 10초마다 pcicheckin 확인
    setInterval(fetchCheckin, 5000);

    // 10초마다 pcicheckin 확인하여 카피라이팅, 추천상품군 update
    setInterval(updateRecolist, 5000);
    
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
        let columns = calculateColumns(currentElement);

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

    // 주어진 요소의 부모 section 내에서 컬럼 수를 계산
    function calculateColumns(element) {
        const parentSection = element.closest('section');
        if (!parentSection) return 1;

        const items = parentSection.querySelectorAll('.card, .video, .option');
        if (items.length > 0) {
            const itemsArray = Array.from(items);
            const itemWidth = itemsArray[0].offsetWidth;
            const sectionWidth = parentSection.offsetWidth;
            return Math.floor(sectionWidth / itemWidth);
        }
        return 1;
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