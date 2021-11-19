
-- This takes the data in temporary tables- ckan_data_loader,datasets_data_loader, and profiles_data_loader
-- and inserts records into tables datasets,profiles,points

CREATE OR REPLACE FUNCTION remove_all_data() RETURNS VOID AS $$
BEGIN

DELETE FROM cioos_api.profiles;
DELETE FROM cioos_api.profiles_data_loader;
DELETE FROM cioos_api.ckan_data_loader;
DELETE FROM cioos_api.erddap_variables;
DELETE FROM cioos_api.datasets;
DELETE FROM cioos_api.datasets_data_loader;
DELETE FROM cioos_api.hexes_zoom_0;
DELETE FROM cioos_api.hexes_zoom_1;
DELETE FROM cioos_api.organizations;
DELETE FROM cioos_api.points;

END;
$$ LANGUAGE plpgsql;



