import numpy as np
import pandas as pd

def load_data(path):
    data = pd.read_csv(path)
    
    return data

def prep_data(reco_group_df, prod_df, cw_df):
    # merge data
    merge_data = pd.merge(reco_group_df, prod_df, on='prod_id', how='left')
    merge_data = pd.merge(merge_data, cw_df, on='cw_id', how='left')
    
    return merge_data

def run_data_func(data_path1, data_path2, data_path3):
    # 홈쇼핑 추천 컨테이너 필요 요소
    # 카피라이팅, 채널번호, 채널이름, 상품 이미지, 상품제목, 상품가격
    
    # load data
    reco_group_df = load_data(data_path1)
    prod_df = load_data(data_path2)
    cw_df = load_data(data_path3)
    
    # prep_data
    merge_data = prep_data(reco_group_df, prod_df, cw_df)