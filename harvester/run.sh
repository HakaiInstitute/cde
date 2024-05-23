#!/bin/sh
python -m cde_harvester -f ${HARVEST_CONFIG_FILE:-harvest_config.yaml} && python -m cde_db_loader
