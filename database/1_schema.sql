-- We are using features from PostGIS 3
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE schema cioos_api;

-- ERDDAP Datasets
-- data comes via cioos_api.datasets_data_loader
DROP TABLE IF EXISTS cioos_api.datasets;
CREATE TABLE cioos_api.datasets (
    pk serial PRIMARY KEY,
    dataset_id text,
    erddap_url text,
    cdm_data_type text,
    ckan_record jsonb,
    profile_variable text,
    ckan_url text,
    eovs text[],
    ckan_id text,
    parties text[],
    organization_pks INTEGER[],
    UNIQUE(dataset_id, erddap_url)
);

-- List of organizations to show in CEDA, from CKAN, can be many per dataset
DROP TABLE IF EXISTS cioos_api.organizations;
CREATE TABLE cioos_api.organizations (
    pk SERIAL PRIMARY KEY,
    name text,
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
    time_min timestamptz,
    time_max timestamptz,
    latitude_min double precision,
    latitude_max double precision,
    longitude_min double precision,
    longitude_max double precision,
    depth_min double precision,
    depth_max double precision,
    -- hex polygon that this point is in for zoom 0 (zoomed out)
    hex_zoom_0 geometry(polygon,3857),
    hex_zoom_1 geometry(polygon,3857),
    point_pk INTEGER,
    profile_id text,
    UNIQUE(erddap_url,dataset_id,profile_id)
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

-- this probably only works for TimeSeriesProfile
-- DROP TABLE cioos_api.cdm_data_type_override;
-- CREATE TABLE cioos_api.cdm_data_type_override (
--     pk SERIAL PRIMARY KEY,
--     erddap_url text,
--     dataset_id text,
--     cdm_data_type text
-- );  

-- users that can download in the beta version
DROP TABLE IF EXISTS cioos_api.allowed_users;
CREATE TABLE cioos_api.allowed_users (
    pk SERIAL PRIMARY KEY,
    email text UNIQUE
);

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
    erddap_report text,
    time_start timestamptz
);



-- 3 more tables are created by the scrapers
-- cioos_api.ckan_data_loader
-- cioos_api.datasets_data_loader
-- cioos_api.profiles_data_loader
DROP TABLE IF EXISTS cioos_api.ckan_data_loader;
CREATE TABLE cioos_api.ckan_data_loader (
    erddap_url text,
    dataset_id text,
    eovs text[],
    ckan_id text,
    parties text[],
    ckan_record jsonb,
    CONSTRAINT ckan_loader_unique UNIQUE(erddap_url,dataset_id)
);

DROP TABLE IF EXISTS cioos_api.datasets_data_loader;
CREATE TABLE cioos_api.datasets_data_loader (
    erddap_url text,
    dataset_id text,
    cdm_data_type text,
    CONSTRAINT dataset_loader_unique UNIQUE(erddap_url,dataset_id)
);

DROP TABLE IF EXISTS cioos_api.profiles_data_loader;
CREATE TABLE cioos_api.profiles_data_loader (
    erddap_url text,
    dataset_id text,
    profile_id text,
    time_min timestamp with time zone,
    time_max timestamp with time zone,
    latitude_min double,
    latitude_max double,
    longitude_min double,
    longitude_max double,
    depth_min double,
    depth_max double,
    CONSTRAINT profile_loader_unique UNIQUE(erddap_url,dataset_id,profile_id)
);

DROP TABLE IF EXISTS cioos_api.metadata;
CREATE TABLE cioos_api.metadata (
    erddap_url text NOT NULL,
    dataset_id text NOT NULL,
    row_type text NOT NULL,
    variable_name text NOT NULL,
    attribute_name text,
    data_type text NOT NULL,
    value text
);