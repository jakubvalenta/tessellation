from pathlib import Path

from setuptools import find_packages, setup

from tessellation import __title__

setup(
    name='tessellation',
    version='0.4.0',
    description=__title__,
    long_description=(Path(__file__).parent / 'README.md').read_text(),
    url='https://www.github.com/jakubvalenta/tessellation',
    author='Jakub Valenta',
    author_email='jakub@jakubvalenta.cz',
    license='GNU General Public License v3 or later (GPLv3+)',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Framework :: Django :: 3.1',
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
        'djangorestframework',
        'psycopg2',
        'django-extensions',
        'drf-base64',
        'django-debug-toolbar',
        'Pillow',
        'django-cleanup',
        'django-unused-media',
        'django-webpack-loader',
    ],
)
