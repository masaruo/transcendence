# 自己署名証明書をChromeに追加
1. 始めての時はin `./nginx/gen-certificate.sh`を実行 add `cert.pem`
2. @chrome `chrome://certificate-manager/localcerts/usercerts`
3. import `cert.pem`

## start
docker compose up --build

## django db super user
docker compose exec django bash -> cd /app/app -> python manage.py createsuperuser

## pip
pip install -r requirements.txt
