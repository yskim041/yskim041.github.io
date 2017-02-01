# db_manager.py
"""
Script for Project of WSE Spring 2016
by Youngsun Kim (youngsun.kim@nyu.edu) May 2016
"""

import os
import sqlite3
import numpy as np

import utils


class DBManager:
    def __init__(self, db_filename):
        self.db_filename = db_filename
        self.conn = None
        self.cursor = None

    def init_database(self):
        is_new = not os.path.isfile(self.db_filename)

        # print('init database')
        self.conn = sqlite3.connect('data.db')
        self.cursor = self.conn.cursor()

        if is_new:
            self.create_table()
        self.conn.create_function("get_rank", 2, self.get_rank)

    def print_rows(self):
        rows = self.get_rows()
        for row in rows:
            print row

    def get_rank(self, vec, target_vec):
        vec_arr = np.array(map(float, vec.split()))
        tv_arr = np.array(map(float, target_vec.split()))
        return utils.calc_dist(tv_arr, vec_arr)

    def get_rows_by_order(self, target_vec):
        return self.cursor.execute(
            'SELECT * FROM images ORDER BY get_rank(net_vector,(?))',
            (target_vec,)
        )

    def get_rows(self):
        return self.cursor.execute('SELECT * FROM images ORDER BY img_link')

    def get_random_rows(self):
        return self.cursor.execute('SELECT * FROM images ORDER BY RANDOM()')

    def insert_img_item(self, img_link, page_link, keywords, net_vector):
        vals = (img_link, page_link, keywords, net_vector)

        try:
            self.cursor.execute(
                'INSERT INTO images VALUES (?,?,?,?)', vals
            )
            self.conn.commit()
        except sqlite3.IntegrityError:
            print('duplicated item: %s' % img_link)

    def create_table(self):
        # print('create table')
        self.cursor.execute(
            '''CREATE TABLE if not exists images (
            img_link text UNIQUE,
            page_link text,
            keywords text,
            net_vector text)'''
        )
        self.conn.commit()

    def close(self):
        self.conn.close()


# End of script
