import numpy as np
import pandas as pd
from flask import Flask, render_template

app = Flask(__name__)

# read_csv string으로 불러오기 
dict_dtype = {'ch_no' : str}
reco_container_df = pd.read_csv('data/merge_df.dat', dtype=dict_dtype)

# personal_data 분리 -> 나중에 pci 체크인 됐을 때, 바꿔야 함
user1 = reco_container_df['p_id'].unique()[1]
user_df = reco_container_df[reco_container_df['p_id'] == user1]
mod_columns = ['sa_id', 'p_id', 'brad_date', 'ch_svc_id', 'ch_no', 'ch_nm',
               'prod_id', 'bom_st_dt', 'bom_fns_dt', 'bom_prod_nm', 'price', 'originPrice',
               'productImgUrl', 'mUrl']

cards = user_df[mod_columns].to_dict('records')

# pci 불러와서
# log 찍기

@app.route('/')
def index():
    # 홈쇼핑 추천 컨테이너 필요 요소
    # 카피라이팅, 채널번호, 채널이름, 상품 이미지, 상품제목, 상품가격
    return render_template('index.html',
                           reco_cw=user_df['카피라이팅'].tolist()[0],
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
    
if __name__ == '__main__':
    app.run(debug=True)
    
    

    