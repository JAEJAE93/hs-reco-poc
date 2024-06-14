import numpy as np
import pandas as pd
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# read_csv string으로 불러오기 
dict_dtype = {'ch_no' : str}
reco_container_df = pd.read_csv('data/merge_df.dat', dtype=dict_dtype)

# Initial user setup
cur_user_idx = 1
users = reco_container_df['p_id'].unique()

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

# pci 불러와서
# log 찍기

# 5초마다 pci 불러와서 / p_id 있으면 컨테이너 업데이트
# 5초마다 컨테이너 업데이트 해보기

@app.route('/')
def index():
    # 홈쇼핑 추천 컨테이너 필요 요소
    # 카피라이팅, 채널번호, 채널이름, 상품 이미지, 상품제목, 상품가격
    return render_template('index.html',
                           reco_cw=reco_cw,
                           cards=cards
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

@app.route('/update_data')
def update_data():
    global cur_user_idx, reco_cw, cards
    cur_user_idx = (cur_user_idx + 1) % len(users)
    reco_cw, cards = get_user_data(users[cur_user_idx])
    print(jsonify(reco_cw=reco_cw, cards=cards))
    
    return jsonify(reco_cw=reco_cw, cards=cards)

if __name__ == '__main__':
    app.run(debug=True)
    
    

    