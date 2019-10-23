from pathlib import Path

from setuptools import find_packages, setup

from tiles import __title__

setup(
    name='tiles',
    version='0.1.3',
    description=__title__,
    long_description=(Path(__file__).parent / 'README.md').read_text(),
    url='https://lab.saloun.cz/jakub/tiles2',
    author='Jakub Valenta',
    author_email='jakub@jakubvalenta.cz',
    license='Apache Software License',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Framework :: Django :: 2.2',
        'Intended Audience :: End Users/Desktop',
        'Topic :: Artistic Software',
        'License :: OSI Approved :: GNU General Public License v3 or later (GPLv3+)',  # noqa: E501
        'Programming Language :: Python :: 3.7',
    ],
    packages=find_packages(),
    install_requires=[
        'Django',
        'djangorestframework',
        'psycopg2',
        'django-extensions',
        'drf-base64',
        'django-debug-toolbar',
        'libsass',
        'django-compressor',
        'django-sass-processor',
        'Pillow',
        'django-cleanup',
        'django-unused-media',
    ],
)
