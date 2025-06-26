# Transcendence
### 基本コマンド
* `make` production環境 (docker compose up --build -d)
* `make dev` 開発環境 (docker compose up --build)
* `make down` docker compose down --remote-oprhans
* `make clean` down + `--rmi all` to remote images
* `make fclean` clean + `--volumes` *データベースを消すので要注意！*
* `make manage` django manage.py (`make manage CMD=<ur_cmd>`)
* `make createsuperuser` アドミ権限のユーザーを作成
* `make nginx` || `make django` それぞれのコンテナ内に移動

### Access Point
`https://localhost:8443`

### 初回やること
* `.env`を`./backend`に移す or create some like below.
```.env
DB_HOST=db
POSTGRES_DB=transcendencedb
POSTGRES_USER=transcendence_user
POSTGRES_PASSWORD=42Tokyo_Transcendence
SECRET_KEY='ojeoqwur8pwquejhdshfgiusdhforu2309r852340-t7ueroisjaidfhiewrhjasd;ilJ:OJDflkewrhgielruqwaruiojefio;waejf;oisdhjafoiu;fhasdkljfh3p9428q5743t27-uq4woeihfj;ks'
JWT_SECRET_KEY='jlfasjdflkjwlhlalkcu09eirtu09i209rsoidjflds;kcmn'
REDIS_KEY='Joewuoidsfjksdnkfdjslfjsdj983'
```
* `./backend/nginx/certs`の`gen-certificate.sh`を実行
- 作成した`cert.pem`を[browser](chrome://certificate-manager/localcerts/usercerts)

### 対応したポイント
* API (`django rest framework`)
* Single Page Application (`Type Script without any framework`)
* backend framework -> `django`
* bootstrap
* postgres db
* remote play by using websocket `django channels`
* multiplayer
* JWT(`django simple jwt`)
* 3D (`Three JS`)
* AI player
* nginx reverse proxy with WAF`(modsecurity)`

### フロントエンドの画像ファイルなどの場所
* `./frontend/public`内に配置
たとえば、`./frontend/public/images/abc.jpg`は`/images/abc.jpg`で指定
