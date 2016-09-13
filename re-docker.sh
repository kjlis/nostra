docker stop nostra && docker rm nostra && docker build -t kjlis/nostra . && docker run --name nostra -p 8000:3000 --link nostra-lc-db:mongo -d kjlis/nostra
