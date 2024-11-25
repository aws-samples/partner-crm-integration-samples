from setuptools import find_packages, setup


def read_requirements(file):
    with open(file) as f:
        return f.read().splitlines()


requirements = read_requirements("requirements.txt")

setup(
    include_package_data=True,
    name="utils",
    version="0.0.1",
    description="Helper utilities",
    packages=["utils"],
    package_dir={"": "./src"},
    install_requires=requirements,
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ],
)
