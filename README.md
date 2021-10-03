# Service for replacing the background of images

Сервис для замены фона у изображений
- загрузка в сервис изображения в формате `jpeg`
- замена фона у заданного изображения на другой
  - размер фоновой картинки и изображения должен совпадать
  - у основной картинки задаем, какой цвет будем считать прозрачным


## API

- `POST /upload` — загрузка изображения (сохраняет его на диск и возвращает идентификатор сохраненного изображения)
- `GET /list` - получить список изображений в формате json (id, размер, дата загрузки)
- `GET /image/:id` — скачать изображение с заданным id
- `DELETE /image/:id` — удалить изображение
- `GET /merge?front=<id>&back=<id>&color=145,54,32&threshold=5` — замена фона у изображения [example](http://localhost:8080/merge?front=UnNeb71EaAEuqdq3a_YhX&back=WwQZ_phRtRxmf6tysAT54&color=200,50,52&threshold=5)

[коды ответов](https://developer.mozilla.org/ru/docs/Web/HTTP/Status)

Примечания:

- node version 14.18.0
- запуск `npm start`
- работает на порту `8080`
- картинки хранятся на диске в папке приложения
- id картинок генерируются через библиотеку [nanoid](https://www.npmjs.com/package/nanoid)
- для замены фона используется пакет [backrem](https://www.npmjs.com/package/backrem)
- картинки отдаются на клиент по частям через стримы, по мере готовности каждого чанка
- если размер изображения и размер фона не совпадает, генерируется ошибка
- картинки загружаются через `multipart/form-data`