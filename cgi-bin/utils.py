# utils.py
"""
Script for Project of WSE Spring 2016
by Youngsun Kim (youngsun.kim@nyu.edu) May 2016
"""

import numpy as np
from scipy.signal import fftconvolve
from scipy import misc, ndimage
# import matplotlib.pyplot as plt
import urllib2
import cStringIO
from PIL import Image

from morlet_wavelet import Morlet
import np_arraypad

import warnings
warnings.filterwarnings("ignore")


sigmas = np.array([3, 6])
sigmas_size = sigmas.size
max_phim = 4
phims = np.linspace(0, 1, max_phim, endpoint=False)
phims_size = len(phims)
xi = 4


def calc_dist(v1, v2):
    return np.linalg.norm(v1 - v2)


def generate_wavelets():
    mw = []
    for pi in range(0, phims_size):
        phim = phims[pi]
        phi = np.pi * phim
        for si in range(0, sigmas_size):
            sigma = sigmas[si]
            kernel_size = np.ceil(3 * sigma)
            mw.append(
                Morlet(kernel_size, phi, sigma, xi).wavelet()
            )
    return mw


def subsample(img, (rm, cm)):
    irmx, icmx = img.shape
    rwind = np.ceil(irmx / rm)
    cwind = np.ceil(icmx / cm)
    timg = np.zeros((rm, cm))
    for ridx in range(0, rm):
        for cidx in range(0, cm):
            roff = rwind * ridx
            coff = cwind * cidx
            rend = roff + rwind
            cend = coff + cwind
            if rend > irmx:
                rend = irmx
            if cend > icmx:
                cend = icmx
            timg[ridx, cidx] = img[roff:rend, coff:cend].sum() / float((rend - roff) * (cend - coff))
    return np.ravel(timg)


def get_network_vector_str(image, mw):
    vs = get_network_vector(image, mw)
    return ' '.join(map(str, vs))


def get_network_vector(image, mw):
    ss_shape = [3, 3]
    ss_len = ss_shape[0] * ss_shape[1]
    if len(image[0].shape) < 3:
        gray_img = image[0]
    else:
        gray_img = rgb2gray(image[0])

    this_nv = np.zeros(3 + ss_len + ss_len * (sigmas_size * phims_size))
    this_nv[0:ss_len] = subsample(gray_img, ss_shape)
    offset = ss_len
    for pi in range(0, phims_size):
        for si in range(0, sigmas_size):
            tw = mw[pi * sigmas_size + si]
            conv_img = abs(fft_convolve(gray_img, tw))
            this_nv[offset:offset + ss_len] = subsample(conv_img, ss_shape)
            offset += ss_len
    this_nv[offset:offset + 3] = image[1]
    return this_nv


def get_network_vectors(images, mw):
    vecs = []
    for image in images:
        this_nv = get_network_vector(image, mw)
        vecs.append(this_nv)
    return vecs


def reshape_arr(arr, new_len):
    new_arr = np.zeros(new_len)
    window = len(arr) / float(new_len)
    cidx = 0
    for idx in range(0, len(arr)):
        new_arr[cidx] += arr[idx]
        if idx % window == window - 1:
            new_arr[cidx] /= window
            cidx += 1
    return new_arr


def rgb2gray(rgb):
    return np.dot(rgb[..., :3], [0.299, 0.587, 0.114])


def read_image_from_link(link):
    img_src = cStringIO.StringIO(urllib2.urlopen(link).read())
    return misc.fromimage(Image.open(img_src))


def load_image_from_link(link):
    img = read_image_from_link(link)
    rgb_avg = calculate_rgb_avg(img)
    return resize_image(img), rgb_avg


def load_image(file_name):
    img = misc.imread(file_name)
    rgb_avg = calculate_rgb_avg(img)
    return resize_image(img), rgb_avg


def calculate_rgb_avg(img_arr):
    rgb_avg = np.zeros(3)
    if len(img_arr.shape) < 3:
        rgb_avg[:] = img_arr.sum() / (img_arr.shape[0] * img_arr.shape[1])
    else:
        div = img_arr.shape[0] * img_arr.shape[1]
        for idx in range(0, 3):
            rgb_avg[idx] = img_arr[:, :, idx].sum() / div
    return rgb_avg


def resize_image(img, size=0):
    if len(img.shape) < 3:
        img_width, img_height = img.shape
    else:
        img_width, img_height, _ = img.shape
    if size > 0:
        max_size = size
    else:
        max_size = 100.0
    img_height = int(np.round(img_height * (float(max_size) / img_width)))
    img_width = int(max_size)
    return misc.imresize(img, (img_width, img_height))


def median_filter(img, level=2):
    return ndimage.median_filter(img, level)


def fft_convolve(img, kernel):
    pad_row = int(kernel.shape[0] / 2)
    pad_col = int(kernel.shape[1] / 2)
    timg = np_arraypad.pad(img, ((pad_row, 0), (pad_col, 0)), mode='edge')
    rst = fftconvolve(timg, kernel, mode='same')
    return rst[pad_row:pad_row+img.shape[0], pad_col:pad_col+img.shape[1]]


# def imshow_in_subplot_with_labels(r, c, idx, img, xlabel, ylabel):
#     sp = plt.subplot(r, c, idx)
#     sp.set_xlabel(xlabel)
#     sp.set_ylabel(ylabel)
#     imshow_gray(img)


# def imshow_in_subplot_with_title(r, c, idx, img, title):
#     sp = plt.subplot(r, c, idx)
#     sp.set_title(title)
#     imshow_gray(img)


# def imshow_in_subplot(r, c, idx, img):
#     plt.subplot(r, c, idx)
#     imshow_gray(img)


# def imshow_gray(img):
#     plt.imshow(img, cmap='gray')


# def plot_in_subplot_with_title(r, c, idx, plot, title):
#     sp = plt.subplot(r, c, idx)
#     sp.set_title(title)
#     plot_with_margin(plot)


# def plot_in_subplot(r, c, idx, plot):
#     plt.subplot(r, c, idx)
#     plot_with_margin(plot)


# def plot_with_margin(plot):
#     plt.plot(plot)
#     margin = len(plot) * 0.1
#     plt.xlim(-margin, len(plot) + margin)


# def init_figure(fig_idx):
#     fig_idx += 1
#     this_fig = plt.figure(fig_idx)
#     this_fig.set_tight_layout(True)
#     return fig_idx


# def init_figure_with_idx(fig_idx):
#     this_fig = plt.figure(fig_idx)
#     this_fig.set_tight_layout(True)


# End of script
