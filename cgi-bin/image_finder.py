# image_finder.py
"""
Script for Project of WSE Spring 2016
by Youngsun Kim (youngsun.kim@nyu.edu) May 2016
"""

import sys
import urllib2

from db_manager import DBManager
import utils


def script_main():
    is_valid, img_link = handle_arguments()

    # result options

    # good
    # https://pixabay.com/static/uploads/photo/2016/05/01/20/47/sunset-1365884_960_720.jpg
    # https://pixabay.com/static/uploads/photo/2015/05/26/19/40/chair-in-field-785232_960_720.jpg
    # https://pixabay.com/static/uploads/photo/2013/08/26/09/24/field-175959_960_720.jpg
    # https://pixabay.com/static/uploads/photo/2013/08/22/19/18/rose-174817_960_720.jpg
    # https://upload.wikimedia.org/wikipedia/commons/6/69/Seagull_flying_(4).jpg

    # existing images
    # https://pixabay.com/static/uploads/photo/2016/04/29/12/52/girl-1360843_960_720.jpg
    # https://pixabay.com/static/uploads/photo/2016/04/29/12/54/girl-1360872_960_720.jpg

    # not good
    # https://pixabay.com/static/uploads/photo/2015/02/04/08/03/baby-623417_960_720.jpg

    if not is_valid:
        target_link = 'https://static.pexels.com/photos/3948/field-meadow-flower-pink.jpg'
        print('Invalid arguments: show an example with a sample link %s' % target_link)
        # return
    else:
        target_link = img_link

    results = find_images(target_link)
    for rst in results:
        print(rst)


def get_random_rows():
    db = DBManager('images.db')
    db.init_database()
    rows = db.get_random_rows().fetchall()
    db.close()
    return len(rows), rows


def find_images(target_link):
    try:
        img = utils.load_image_from_link(target_link)
    except urllib2.URLError:
        # print('URL Error: %s' % target_link)
        return
    except urllib2.HTTPError:
        # print('Connection Error: %s' % target_link)
        return
    except:
        # print('Unexpected connection error: %s' % target_link)
        return

    nv_str = utils.get_network_vector_str(img, utils.generate_wavelets())

    rst_imgs = []
    rst_imgs.append(img[0])

    # print('find images')
    db = DBManager('images.db')
    db.init_database()
    rows_in_order = db.get_rows_by_order(nv_str)

    results = []
    counter = 0
    for row in rows_in_order:
        results.append((counter, row[0], row[1], row[2]))
        # rst_imgs.append(utils.read_image_from_link(row[0]))
        counter += 1
        if counter >= 100:
            break
    db.close()
    # show_final_results(rst_imgs)

    return results


def show_final_results(rst_imgs):
    import matplotlib.pyplot as plt
    utils.init_figure_with_idx(0)
    max_col = 6
    max_row = int(len(rst_imgs) / max_col)
    if len(rst_imgs) % max_col != 0:
        max_row += 1
    max_row = 5
    p_idx = 1
    for ri in rst_imgs:
        utils.imshow_in_subplot(max_row, max_col, p_idx, ri)
        p_idx += 1
        if p_idx > max_col * max_row:
            break
    plt.show()


def handle_arguments():
    img_link = ''
    is_valid = True
    if len(sys.argv) == 2:
        img_link = sys.argv[1]
        if len(img_link) == 0:
            is_valid = False
        else:
            if img_link.endswith('jpg') or img_link.endswith('jpeg') or img_link.endswith('png'):
                is_valid = True
            else:
                is_valid = False
    else:
        is_valid = False

    return is_valid, img_link


if __name__ == '__main__':
    script_main()

# End of script
