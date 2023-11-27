import { z } from "zod";
import { exit } from "process";

const args = Bun.argv.slice(2);
const locales: string[] = [];
let fileName = "";

args.forEach((arg) => {
  if (arg.endsWith(".json")) {
    fileName = arg;
  } else {
    locales.push(arg);
  }
});

if (fileName === "") {
  console.log("Please provide a target file to translate");
  exit();
}

if (locales.length === 0) {
  console.log("Please provide a list of locales to translate to");
  exit();
}

const parseContent = async (fileName: string) => {
  const content = await Bun.file(fileName).text();
  return content
    .trim()
    .split("\n")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
};

locales.forEach(async (locale) => {
  const basePath = `locales/${locale}`;

  try {
    const translatedContent = await parseContent(`${basePath}/translated.txt`);
    const localeFile = Bun.file(fileName);
    const localeJson = await localeFile.json();
    let localeText = await localeFile.text();

    let index = 0;
    const translate = (blob: any) => {
      const stringVal = z.string().safeParse(blob);
      if (stringVal.success) {
        localeText = localeText.replaceAll(
          stringVal.data,
          translatedContent[index]
        );
        index++;
        return;
      }
      const listVal = z.array(z.any()).safeParse(blob);
      if (listVal.success) {
        listVal.data.forEach((val) => translate(val));
        return;
      }
      const objectVal = z.record(z.string(), z.any()).safeParse(blob);
      if (objectVal.success) {
        Object.values(objectVal.data).forEach((val) => translate(val));
      }
    };

    translate(localeJson);
    Bun.write(`${basePath}/${fileName}`, localeText);
  } catch (err) {
    console.log("Error!");
    console.log(err);
  }
});
