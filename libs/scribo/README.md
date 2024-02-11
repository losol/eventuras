# Scribo markdown editor

Markdown editor built on [Lexical framework](https://lexical.dev/). Intended to be used as part of eventuras, but also packed as a standalone component.

Scribo is a WYSIWYG markdown editor, which means that it shows the markdown text as it will be rendered.

The editor should provide simple and intuitive editing of markdown text, with a focus on the most common use cases.

## Develop

To start developing Scribo, run the following commands:

```bash
npm install
vite dev
```

## Publish

To publish a new version of the package:

1. Update version number in package.json
1. `npm run build`
1. `npm login --scope @eventuras --auth-type web`
1. `npm publish --access public`

## Credits

Scribo is built on the [Lexical framework](https://lexical.dev/), and most of the code in the repo is done by [Meta under MIT license](https://github.com/facebook/lexical).

## Learn More

- [Lexical](https://lexical.dev/)
