# applicationarize
This is a simple CLI application that helps you to create a electron application from a website with a single command. You can provide the name, icon and the URL of the website you want to convert to an application. The application will be created in the desktop directory with the name and icon you provided.

## Installation
```bash
npm install -g applicationarize
```

or 

```bash
yarn global add applicationarize
```

## Usage
```bash
applicationarize
```

You will be asked to provide the following information:

**Name:** Name of the application\
**Icon:** Icon path or url for the application\
**URL:** URL of the website which you want to convert to application\
**Platform:** Platform for the application (windows, mac, linux) - Optional (default: set to your current platform)

After running the command, the application will be created in the desktop directory.

Terminal will automatically open the directory where the application is created.

This application will be created with the name you provided and the icon you provided.

This application is single instance application, which means you can only run one instance of the application at a time. If you try to open the application again, it will focus on the already opened application.

---

This package is using [nativefier](https://www.npmjs.com/package/nativefier) package to create the application.

## Dependencies
- [nativefier](https://www.npmjs.com/package/nativefier)
- [axios](https://www.npmjs.com/package/axios)
- [child_process](https://nodejs.org/api/child_process.html)
- [commander](https://www.npmjs.com/package/commander)
- [electron](https://www.npmjs.com/package/electron)
- [fs](https://nodejs.org/api/fs.html)
- [open](https://www.npmjs.com/package/open)
- [ora](https://www.npmjs.com/package/ora)
- [os](https://nodejs.org/api/os.html)
- [path](https://nodejs.org/api/path.html)
- [readline](https://nodejs.org/api/readline.html)
- [url](https://nodejs.org/api/url.html)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Author
[Can Gökçeaslan](https://www.cangokceaslan.com)

## License
MIT