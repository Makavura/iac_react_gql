import { useState } from "react";

// @custom
import styles from "./App.module.css";
import Reader from "./components/Reader";
import BookList from "./components/Book-List";
import Container from "./components/Container";
import TokenModal from "./components/Token-Modal";

function App() {
  const [token, setToken] = useState("");
  const [title, setTitle] = useState("");

  const showList = title.length < 1;
  const highlightToken = !showList && token.length > 1;

  const onClickBookItem = (_event, param) => {
    const bookTitle = param;
    setTitle(bookTitle);
  };


  const clearToken = () => setToken("");

  return (
    <Container>
      {showList && <BookList onClickBookItem={onClickBookItem} />}
      {!showList && !highlightToken && (
        <div className={highlightToken ? styles.blur : ""}>
          <Reader title={title} setToken={setToken} />
        </div>
      )}
      {highlightToken && <TokenModal token={token} clearToken={clearToken} />}
    </Container>
  );
}

export default App;
