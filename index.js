const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');

const app = express();
const writeFileAsync = promisify(fs.writeFile);

const importantSourceUrl = 'http://slowpoke.desigens.com/json/1/7000';
const unimportantSourceUrl = 'http://slowpoke.desigens.com/json/2/3000';

app.get('/', async (req, res) => {
  try {
    const importantDataPromise = fetchData(importantSourceUrl, 10000); // Увеличенный таймаут
    const unimportantDataPromise = fetchData(unimportantSourceUrl, 6000);

    const [importantData, unimportantData] = await Promise.all([
      importantDataPromise,
      unimportantDataPromise,
    ]);

    res.send(`
      <div>
        <h1>Важные данные:</h1>
        <p>${importantData}</p>
      </div>
      <div>
        <h1>Не важные данные:</h1>
        <p>${unimportantData}</p>
      </div>
    `);
  } catch (error) {
    const errorMessage = `Ошибка: ${error.message}\n`;
    console.error(errorMessage);
    await writeToLogFile(errorMessage);
    res.send('Произошла ошибка. Пожалуйста, проверьте журналы сервера.');
  }
});

const fetchData = async (url, timeout) => {
  const response = await axios.get(url, { timeout });
  return response.data;
};

const writeToLogFile = async (message) => {
  try {
    await writeFileAsync('error.log', message, { flag: 'a' });
  } catch (error) {
    console.error(`Ошибка при записи в лог-файл: ${error.message}`);
  }
};

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
});
