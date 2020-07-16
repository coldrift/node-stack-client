# node Stack client

This is a node.js client for [TransIP Stack cloud storage](https://www.transip.nl/stack/)

## Installation

```
$ npm install --save stack-client
```

### Example

```javascript
const fs = require('fs');
const zlib = require('zlib');

const StackClient = require('stack-client');

const client = new StackClient('https://example.stackstorage.com', 'user', 'pass');

const outputStream = client.createWriteStream('test.txt.gz', (err, res) => {
  console.log('done writing!')
})

const inputStream = fs.createReadStream('test.txt');

const gzip = zlib.createGzip({level: 3});

gzip.pipe(outputStream)
inputStream.pipe(gzip)

```

## API

### Instantiating

Instantiate the stack client by passing the base URL of your Stack, the username,
the password:

```javascript
const StackClient = require('stack-client');

const client = new StackClient('https://example.stackstorage.com', 'user', 'pass');
```

### Writing files

Use *createWriteStream(path, [cb])* to create a writiable stream into a file under specified *path*:

```javascript
const fs = require('fs');
const zlib = require('zlib');


[...]

const outputStream = client.createWriteStream('test.txt.gz')
const inputStream = fs.createReadStream('test.txt');

const gzip = zlib.createGzip({level: 3});

gzip.pipe(outputStream)
inputStream.pipe(gzip)

```

### Creating folders

Use *mkdir(path)* to create a folder within your Stack:

```javascript
await client.mkdir('test')
await client.mkdir('test/test')
```

### Removing files and folders

Use *delete(path)* to remove files and folders:

```javascript
await client.delete('test/test')
await client.delete('test')
```

## License

Licensed under MIT License. Copyright (C) 2019 Coldrift Technologies B.V. All rights reserved.

## Maintenance and support
[Visit the company's website](https://coldrift.com/)
