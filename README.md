# nostra

## Overview

Web application, that allows users to view loan statistics and assess the credit risk of a particular loan. Based on the provided information, the investors will be able to make more conscious decisions and manage their portfolios in an efficient and profitable way. The scalability, environment isolation and cloud-compatibility issues were addressed by incorporating the application containers technology into the project.

## Requirements

* Docker
* MongoDB

## Data pre-processing

Application is compatible with data provided by [Lending Club](https://www.lendingclub.com/info/download-data.action). Download csv files to **data_scripts/Data** folder, and run **process_lc_data.sh** script.

## MongoDB setup

The recommended way of running MongoDB server is to use [the official Docker image](https://hub.docker.com/_/mongo/). After starting the server you can import the pre-processed loan data by running **import_to_mongo.sh** script. If the server is run in a different way than a Docker container, it should be available under IP **mongodb://172.17.0.2/**

## Running the application

1. Start MongoDB server.
2. Build Docker image (optional - applicable if you want to create the image locally, otherwise the image will be pulled from DockerHub). Run from root directory level:
`docker build -t kjlis/nostra .`
3. Start application. Run:
`docker run --name nostra -p 8000:3000 --link nostra-lc-db:mongo -d kjlis/nostra`

Steps 2. and 3. can be performed by running **re-docker.sh** script.

To view application go to http://localhost:8000/ in your web browser (the recommended and supported browser is Chrome)