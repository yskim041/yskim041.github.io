# morlet_wavelet.py
"""
Morlet Wavelet
by Youngsun Kim Jan 2016
"""

import numpy as np


class Morlet(object):
    def __init__(self, kernel_size=9., phi=0., sigma=3., xi=4.):
        self.kernel_size = kernel_size
        self.phi = phi
        self.sigma = sigma
        self.xi = xi
        self.wavelets = []

    def wavelet(self, **kwargs):
        if kwargs:
            for k, v in kwargs.items():
                if k == 'kernel_size':
                    self.kernel_size = v
                elif k == 'phi':
                    self.phi = v
                elif k == 'sigma':
                    self.sigma = v
                elif k == 'xi':
                    self.xi = v
            self.wavelets = []

        if len(self.wavelets) == 0:
            x, y = np.meshgrid(
                np.arange(-self.kernel_size, self.kernel_size+1),
                np.arange(-self.kernel_size, self.kernel_size+1))
            x, y = x.astype(np.float), y.astype(np.float)
            u_dot_e = (x * np.cos(self.phi)) + (y * np.sin(self.phi))
            u2 = (x ** 2) + (y ** 2)

            wave = np.exp(1j / self.sigma * u_dot_e)
            phaser = np.exp(-u2 / self.sigma ** 2)

            # Calculate c2 such that sum of all entries = 0
            c2 = np.sum(wave * phaser) / np.sum(phaser)
            psi = (wave - c2) * phaser

            # Calculate c1 such that sum of all entries of psi * conj(psi) = 1
            c1 = 1 / np.sqrt(np.sum(psi * np.conj(psi)))
            self.wavelets = (c1 / self.sigma) * psi

        return self.wavelets

# End of script
