import fs from "fs";
import path from "path";

const getBook = ( title ) => {
  const booksDir = path.join(process.cwd(), "resources");
  let book = {};
  try {
    fs.readdirSync(booksDir, { withFileTypes: true }).map((bookPath) => {
      const parsedBook = JSON.parse(
        fs.readFileSync(path.join(booksDir, bookPath.name)).toString()
      );

      if (parsedBook['title'].toLowerCase() === title.toLowerCase()) {
        book = parsedBook;
      }
    });
  } catch (e) {
    console.warn(e);
    return e;
  }
  return book;
};

export default getBook;
