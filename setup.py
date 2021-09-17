from pathlib import Path

from setuptools import find_packages, setup

from tessellation import __title__

setup(
    name='tessellation',
    version='0.5.0',
    description=__title__,
    long_description=(Path(__file__).parent / 'README.md').read_text(),
    url='https://github.com/jakubvalenta/tessellation',
    author='Jakub Valenta',
    author_email='jakub@jakubvalenta.cz',
    license='GNU General Public License v3 or later (GPLv3+)',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Framework :: Django :: 3.1',
        'Framework :: Django :: 3.2',
        'Intended Audience :: End Users/Desktop',
        'Topic :: Artistic Software',
        'License :: OSI Approved :: GNU General Public License v3 or later (GPLv3+)',  # noqa: E501
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
    ],
    packages=find_packages(),
    install_requires=[
        'Django',
        'Pillow',
        'cairosvg',
        'django-cleanup',
        'django-debug-toolbar',
        'django-extensions',
        'django-unused-media',
        'django-webpack-loader',
        'djangorestframework',
        'drf-base64',
        'psycopg2',
    ],
)
