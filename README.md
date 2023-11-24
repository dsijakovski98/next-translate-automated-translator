# Translate script

## A script that translates [next-translate](https://github.com/aralroca/next-translate) type `.json` files

### Usage

#### 1. Create a `json` file to translate

Ex. `my_file.json`

```zsh
touch my_file.json
```

#### 2. Populate the file with content according to the [next-translate syntax](https://github.com/aralroca/next-translate#create-your-namespaces-files)

#### 3. Create folders inside the `locales` directory

Each created folder should contain a `\n` separated `translated.txt` file containing the translated content

**Example**

```
locales
    |_ fr
    |   ↳ translated.txt
    |
    |_ es
        ↳ translated.txt
```

#### 4. Run the script providing the following flags

- `<name_of_json_file>.json` (Ex. my_file.json - the above created file)
- `<space separated list of locales>` (Ex. `fr es` - the above created locales folders)

```zsh
npm start -- my_file.json fr es
```

#### 5. Thats it!

The new translated `.json` files will be inside the `locales/fr/` and `locales/es/` folders, respectively
