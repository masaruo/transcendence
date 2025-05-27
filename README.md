##　基本コマンド
* `make` production環境
* `make dev` 開発環境
* `make re` `make clean`もあり
* `https://localhost`にアクセス

##　初回やること
* `.env`を`./backend`に移す
* `./backend/nginx/certs`の`gen-certificate.sh`を実行
- 作成した`cert.pem`を[クロームに登録](chrome://certificate-manager/localcerts/usercerts)

## フロントエンドの画像ファイルなどの場所
* `./frontend/public`内に配置
たとえば、`./frontend/public/images/abc.jpg`は`/images/abc.jpg`でコーディング
