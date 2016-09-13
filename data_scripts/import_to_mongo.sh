#!/bin/bash

mongoimport --db loans --collection all --type csv --headerline --ignoreBlanks --file lc_data_processed.csv