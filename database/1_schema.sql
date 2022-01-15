-- We are using features from PostGIS 3
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE schema cioos_api;

-- The scraper will skip datasets in this table
DROP TABLE IF EXISTS cioos_api.skip_datasets;
CREATE TABLE cioos_api.skip_datasets (
    pk serial PRIMARY KEY,
    dataset_id text,
    erddap_url text
);

-- ERDDAP Datasets
DROP TABLE IF EXISTS cioos_api.datasets;
CREATE TABLE cioos_api.datasets (
    pk serial PRIMARY KEY,
    dataset_id text,
    erddap_url text,
    title TEXT,
    title_fr TEXT,
    summary TEXT,
    summary_fr TEXT,
    cdm_data_type text,
    organizations text[],
    ckan_record jsonb,
    profile_variable text,
    ckan_url text,
    eovs text[],
    ckan_id text,
    organization_pks INTEGER[],
    UNIQUE(dataset_id, erddap_url)
);

-- List of organizations to show in CEDA, from CKAN, can be many per dataset
DROP TABLE IF EXISTS cioos_api.organizations;
CREATE TABLE cioos_api.organizations (
    pk SERIAL PRIMARY KEY,
    name text UNIQUE,
    color text
);

-- profiles/timeseries per dataset
-- data comes via cioos_api.profiles_data_loader
DROP TABLE IF EXISTS cioos_api.profiles;
CREATE TABLE cioos_api.profiles (
    pk serial PRIMARY KEY,
    geom geometry(Point,3857),
    dataset_pk integer REFERENCES cioos_api.datasets(pk),
    erddap_url text,
    dataset_id text,
    timeseries_profile_id text,
    timeseries_id text,
    profile_id text,
    time_min timestamptz,
    time_max timestamptz,
    latitude_min double precision,
    latitude_max double precision,
    longitude_min double precision,
    longitude_max double precision,
    depth_min double precision,
    depth_max double precision,
    n_records integer,
    n_profiles integer,
    -- hex polygon that this point is in for zoom 0 (zoomed out)
    hex_zoom_0 geometry(polygon,3857),
    hex_zoom_1 geometry(polygon,3857),
    point_pk INTEGER,
    UNIQUE(erddap_url,dataset_id,timeseries_id,profile_id)
);

CREATE INDEX
  ON cioos_api.profiles
  USING GIST (geom);

CREATE INDEX
  ON cioos_api.profiles
  USING GIST (hex_zoom_0);

CREATE INDEX
  ON cioos_api.profiles
  USING GIST (hex_zoom_1);


-- One record per unique lat/long
DROP TABLE IF EXISTS cioos_api.points;
CREATE TABLE cioos_api.points (
    pk serial PRIMARY KEY,
    geom geometry(Point,3857),
    -- these values are copied back into cioos_api.profiles
    hex_zoom_0 geometry(Polygon,3857),
    hex_zoom_1 geometry(Polygon,3857)
);

CREATE INDEX
  ON cioos_api.points
  USING GIST (geom);


-- DDL generated by Postico 1.5.17
-- Not all database features are supported. Do not use for backup.

CREATE TABLE cioos_api.download_jobs (
    pk SERIAL PRIMARY KEY,
    downloader_input text,
    downloader_output text,
    status text DEFAULT 'open'::text,
    time timestamptz DEFAULT now(),
    time_complete timestamptz,
    time_total interval GENERATED ALWAYS AS (time_complete - time) STORED,
    email text,
    download_size numeric,
    download_size_estimated text,
    erddap_report text,
    time_start timestamptz
);


DROP TABLE IF EXISTS cioos_api.erddap_variables;
CREATE TABLE cioos_api.erddap_variables (
    erddap_url text NOT NULL,
    dataset_id text NOT NULL,
    "name" text NOT NULL,
    "type" text NOT NULL,
    actual_range text,
    cf_role text,
    standard_name text
);

