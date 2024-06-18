import numpy as np
import pandas as pd
import requests
import json
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# pci3024 data 호출
with open("data/pci3024.txt", "r") as f:
    pci3024_data = json.load(f)

# read_csv string으로 불러오기
dict_dtype = {'ch_no' : str}
reco_container_df = pd.read_csv('data/merge_df.dat', dtype=dict_dtype)

# Initial user setup
cur_user_idx = 1
users = reco_container_df['p_id'].unique()

# p_id로 데이터 호출
def get_user_data(user_id):
    user_df = reco_container_df[reco_container_df['p_id'] == user_id]
    mod_columns = ['sa_id', 'p_id', 'brad_date', 'ch_svc_id', 'ch_no', 'ch_nm',
                   'prod_id', 'bom_st_dt', 'bom_fns_dt', 'bom_prod_nm', 'price', 'originPrice',
                   'productImgUrl', 'mUrl']
    cards = user_df[mod_columns].to_dict('records')
    reco_cw = user_df['카피라이팅'].tolist()[0] if '카피라이팅' in user_df.columns else '고객님께서 최근에 관심 있으시던 상품들이에요.'
    return reco_cw, cards

# Initial user data
reco_cw, cards = get_user_data(users[cur_user_idx])

# main page
@app.route('/')
def index():
    # 홈쇼핑 추천 컨테이너 필요 요소
    # 카피라이팅, 채널번호, 채널이름, 상품 이미지, 상품제목, 상품가격
    return render_template('index.html',
                           reco_cw=reco_cw,
                           cards=cards,
                           # p_id_flag = 'p_id'
                           )
    
@app.route('/product/<int:product_id>')
def product_detail(product_id):
    # 상품 상세 페이지 필요 요소
    # 방송시간, 상품이미지주소, 상품명, 가격, QR코드 이미지
    
    # find product id
    product = next((card for card in cards if card['prod_id'] == product_id), None)
    
    if product is None:
        # Handle the case where the product is not found
        return "Product not found", 404
    
    return render_template('product_detail.html',
                           product=product)

# PCI 체크인 확인 함수
def get_pci_check_in(pci_data):
    url_data = pci_data['url']
    headers = pci_data['headers'][-1]
    json_data = pci_data['data'][-1]
    
    # post 요청
    response = requests.post(url_data, headers=headers, json=json_data)

    # 요청 성공
    if response.status_code == 200:
        result = response.json()
        if result['res_code'] == 200:
            return result
        
        # 요청 성공해도 res_code보고 결정할 것
        else:
            print('POST 요청 실패:', result['res_code'])
            return 'fail'
    
    # 요청 실패
    else:
        print('POST 요청 실패:', result['res_code'])
        result = 'fail'
        
    return result
        

# p_id 여기서 데이터를 불러와서 웹페이지
@app.route('/update_data')
def update_data():
    # pci3024로 pci data 조회
    pci_result = get_pci_check_in(pci3024_data)
    
    # checkin 성공
    pci_id_list = pci_result['data']['pidlist']
    print('#' * 30)
    
    if len(pci_id_list) > 0:
        # 체크인 시간이 가장 늦는 p_id 선택
        checkintime_list = []
        
        for item in pci_id_list:
            checkin_time = item['d']
            checkintime_list.append(int(checkin_time))
        
        max_idx = np.argmax(checkintime_list)
        pci_id = pci_id_list[max_idx]['p_id']
        reco_cw, cards = get_user_data(pci_id)
        print('pci_id: ', pci_id)
        print('#' * 30)
        
        return jsonify(reco_cw=reco_cw, cards=cards)
    
    else:
        print('Not checkin: ', pci_result)
        print('#' * 30)
        
        return jsonify('Not checkin!!!')

# def update_data():
#     global cur_user_idx, reco_cw, cards
#     cur_user_idx = (cur_user_idx + 1) % len(users)
#     reco_cw, cards = get_user_data(users[cur_user_idx])
#     print(jsonify(reco_cw=reco_cw, cards=cards))
    
#     return jsonify(reco_cw=reco_cw, cards=cards)

if __name__ == '__main__':
    app.run(debug=True)
    
    

    