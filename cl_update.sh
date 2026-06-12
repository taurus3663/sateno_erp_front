#!/bin/bash

# Употреба: ./deploy_frontend.sh root@62.138.14.35 -p 2022 -n sakai-ng
if [ -z "$1" ]; then
  echo "Употреба: ./deploy_frontend.sh user@host -p port -n project_name"
  exit 1
fi

RAW_TARGET="$1"
SERVER_PORT="22"
PROJECT_NAME=""

# Обработка на аргументите
shift
while [ "$#" -gt 0 ]; do
  case "$1" in
    -p) SERVER_PORT="$2"; shift 2 ;;
    -n) PROJECT_NAME="$2"; shift 2 ;;
    *) shift ;;
  esac
done

if [ -z "$PROJECT_NAME" ]; then
  echo "Грешка: Трябва да укажеш име на проекта с -n (напр. -n sakai-ng)"
  exit 1
fi

SERVER_USER=$(echo "$RAW_TARGET" | cut -d@ -f1)
SERVER_HOST=$(echo "$RAW_TARGET" | cut -d@ -f2)
SERVER_DIR="/home/erp-f-sateno"

echo ">>> Деплой на проект: $PROJECT_NAME към $SERVER_HOST (порт $SERVER_PORT)"

# 1. BUILD
echo ">>> 1) Билдване с Nx..."
npx nx build $PROJECT_NAME --configuration=production || exit 1

# 2. АВТОМАТИЧНО НАМИРАНЕ НА ПЪТЯ
if [ -d "dist/apps/$PROJECT_NAME/browser" ]; then
    LOCAL_DIST_DIR="dist/apps/$PROJECT_NAME/browser/*"
elif [ -d "dist/$PROJECT_NAME/browser" ]; then
    LOCAL_DIST_DIR="dist/$PROJECT_NAME/browser/*"
elif [ -d "dist/apps/$PROJECT_NAME" ]; then
    LOCAL_DIST_DIR="dist/apps/$PROJECT_NAME/*"
else
    LOCAL_DIST_DIR="dist/$PROJECT_NAME/*"
fi

echo ">>> Намерен локален път: $LOCAL_DIST_DIR"

# 3. UPLOAD във временна папка (старото работи)
echo ">>> 2) Качване в ${SERVER_DIR}.new..."
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "mkdir -p ${SERVER_DIR}.new && rm -rf ${SERVER_DIR}.new/*"
scp -P "$SERVER_PORT" -r $LOCAL_DIST_DIR "$SERVER_USER@$SERVER_HOST:${SERVER_DIR}.new/" || exit 1

# 4. АТОМАРНА ЗАМЯНА
echo ">>> 3) Атомарна замяна на папките..."
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "
  mv $SERVER_DIR ${SERVER_DIR}.old && \
  mv ${SERVER_DIR}.new $SERVER_DIR && \
  rm -rf ${SERVER_DIR}.old
"

echo ">>> Готово! Фронтендът на $PROJECT_NAME е обновен. ✅"
