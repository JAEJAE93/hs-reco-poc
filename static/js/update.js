// 데이터 업데이트 js
document.addEventListener('DOMContentLoaded', function() {
    function fetchData() {
        fetch('/update_data')
            .then(response => response.json())
            .then(data => { 
                console.log('document: ', document)
                document.getElementById('reco_cw').innerText = data.reco_cw;
                const cardsContainer = document.getElementById('cards-container');
                cardsContainer.innerHTML = '';
                data.cards.forEach(card => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'card';
                    cardElement.innerHTML = `
                        <h2>${card.bom_prod_nm}</h2>
                        <img src="${card.productImgUrl}" alt="${card.bom_prod_nm}">
                        <p>Price: ${card.price}</p>
                        <a href="/product/${card.prod_id}">Details</a>
                    `;
                    cardsContainer.appendChild(cardElement);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // 초기 데이터 가져오기
    fetchData();

    // 5초마다 데이터 업데이트
    setInterval(fetchData, 10000);
});