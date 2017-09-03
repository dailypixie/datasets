const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');
const datasetPath = 'datasets/csv/small';
const splitPath = 'datasets/csv/split/max';
const maxLine = 500;
(async function () {
  if(! await fs.exists(splitPath))
    await fs.mkdir(splitPath);
  const dirs = await fs.readdir(datasetPath);
  
  for(var dir of dirs) {
    const files = await fs.readdir(path.join(datasetPath, dir));
    for (file of files) {
      var rd = readline.createInterface({
        input: fs.createReadStream(path.join(datasetPath, dir, file)),
        output: process.stdout,
        console: false
      });
      const wfile = path.join(splitPath, dir, file);
      if(! await fs.exists(wfile))
        await fs.createFile(wfile);
      const ws = fs.createWriteStream(path.join(splitPath, dir, file))
      rd.on('line', function (line) {
        if (!this.count)
          this.count = 0;
        if (this.count >= maxLine)
          return;
        ws.write(line + '\n')
        this.count++;
      });
    }
  }
})()