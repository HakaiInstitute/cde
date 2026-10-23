FROM python:3.10-slim-bookworm

# for shapely, pdf creation
RUN apt-get -y -qq update
# libqt5gui5 needed by wkhtmltopdf
RUN apt-get -y -qq install gcc libc-dev libgeos-dev python3-dev wkhtmltopdf libqt5gui5

# See https://github.com/wkhtmltopdf/wkhtmltopdf/issues/4497. exit 0 so it doesnt fail on ARM

# NOTE: THIS MUST STAY AS A SINGLE LINE
RUN strip --remove-section=.note.ABI-tag /usr/lib/x86_64-linux-gnu/libQt5Core.so.5;exit 0

WORKDIR /usr/src/app

COPY . .

RUN python -m pip install --no-cache-dir "pip @ https://files.pythonhosted.org/packages/3f/06/3e4420302363fbb71be3c7f35ce042f54bfca330e3e66b3a2e3c4cca579f/pip-26.2.2-py3-none-any.whl#sha256=fd7f4dfa8190e014013b9f08f3e973f4e4c26ffd179a204895533a7254813a70"

RUN pip install -q ./downloader ./download_scheduler ./harvester

# -u seems to be needed to get it to print to stdout
CMD [ "python", "-u","-m","download_scheduler" ]
