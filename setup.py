from pathlib import Path

from setuptools import find_packages, setup

from tiles import __title__

setup(
    name='tiles',
    version='0.1.2',
    description=__title__,
    long_description=(Path(__file__).parent / 'README.md').read_text(),
    url='https://lab.saloun.cz/jakub/tiles2',
    author='Jakub Valenta',
    author_email='jakub@jakubvalenta.cz',
    license='Apache Software License',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Topic :: Utilities',
        'License :: OSI Approved :: Apache Software License',
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
    ],
)
