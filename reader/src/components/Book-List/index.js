// @custom
import { bookTitles } from "../../utils/books-titles";
// @local
import styles from "./Book-List.module.css";

export default function BookList({ onClickBookItem }) {
  return (
    <ul className={styles.list}>
      {bookTitles.map((book) => (
        <li
          className={styles.book}
          onClick={(event) => onClickBookItem(event, book.title)}
          key={book.title.toLocaleLowerCase()}
        >
          <strong>{book.title}</strong>
          <p className={styles.author}>{book.author}</p>
        </li>
      ))}
    </ul>
  );
}
