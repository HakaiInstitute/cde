# Run `docker build .` from this folder to test
FROM nickgryg/alpine-pandas

# for shapely
RUN sh -c "apk add --no-cache \
            gcc \
            libc-dev \
            geos-dev && \
            pip install shapely"

COPY . .
# for pdf creation
RUN apk add wkhtmltopdf
RUN apk add zip
RUN sh -c "pip install -e downloader && \
    pip install -e scraper && \
    python -m erddap_downloader downloader/test/test_query.json && \
    unzip *zip"

# TODO get this line working and add after the unzip line
RUN python -c "import pandas,glob; zip_file=glob.glob('*zip')[0].replace('.zip','');df=pandas.read_csv(glob.glob(zip_file+'/'+'*csv')[0])"