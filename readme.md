# Подготовка к запуску

### Скачать репозиторий 

git clone https://github.com/darterss/wb-api-to-sheets.git

### Необходимо переименовать и изменнить файл:

example.env в .env и подставить значения вместо '***'

### Получить файл google-credentials.json в Google Sheets API и настроить доступ к таблицам

записать secrets/google-credentials.json вместо файла secrets/example.google-credentials.json

создать необходимое количество таблиц, предоставить им доступ для редактирования
(значение поля client_email в файле secrets/google-credentials.json)

в переменную SHEET_IDS в .env внести через запятую идентификаторы страниц вместо table1_id,table2_id...
(идентификатор - часть URL страницы таблицы, между /d/ и /edit)

# Запустить приложение

```bash
docker compose up --build
```








# Локальный запуск в режиме разработчика

установить postgreSQL сервер

в папке проекта выполнить:
```bash
npm i && npm run dev 
```