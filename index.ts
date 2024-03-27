import { z } from "zod";
import { exit } from "process";

const args = Bun.argv.slice(2);
const locales: string[] = [];
let fileName = "";

const foundTranslations: Record<string, number> = {};

type NthMatch = {
  content: string;
  pattern: string;
  replaceWith: string;
  n: number;
};

const replaceNthMatch = ({ content, pattern, replaceWith, n }: NthMatch) => {
  let count = 0;

  return content.replace(pattern, (match) => {
    if (++count === n) {
      return replaceWith;
    }

    return match;
  });
};

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
        if (!stringVal.data.length) return;

        if (foundTranslations[stringVal.data]) {
          foundTranslations[stringVal.data]++;
        } else {
          foundTranslations[stringVal.data] = 1;
        }

        localeText = replaceNthMatch({
          content: localeText,
          pattern: stringVal.data,
          replaceWith: translatedContent[index],
          n: foundTranslations[stringVal.data] ?? 1,
        });

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
