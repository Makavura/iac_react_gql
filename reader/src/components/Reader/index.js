import { useState } from "react";
import { useQuery } from "urql";
import { FallingLines } from "react-loader-spinner";
import { X, SkipBackCircle, SkipForwardCircle } from "@phosphor-icons/react";

// @custom
import styles from "./Reader.module.css";
import { BOOK_QUERY } from "../../api/queries";
import { ReactComponent as ErrorIllustration } from "../../assets/qa.svg";

export default function Reader({ title = "", setToken }) {
  const [result] = useQuery({ query: BOOK_QUERY, variables: { title } });
  const { data, fetching, error } = result;
  const pagesFinishIndex = data?.book?.pages?.length || 0;
  const [pagesStartIndex, setPagesStartIndex] = useState(0);
  const canNavigateForward = pagesFinishIndex + 1 !== pagesFinishIndex;
  const canNavigateBack = pagesStartIndex <= 1;

  const findMatchingToken = (word, pageIndex) => {
    const content = data.book.pages[pageIndex].content;
    const tokens = data.book.pages[pageIndex].tokens;
    const firstIndexOfWord = content.indexOf(word);
    let initialValue = "";
    tokens.reduce((_accumulator, currentToken) => {
      if (currentToken.position[0] == firstIndexOfWord)
        return (initialValue = currentToken.value);
    }, initialValue);
    return initialValue;
  };

  const onClickWord = (event, index) => {
    event.preventDefault();
    // https://developer.mozilla.org/en-US/docs/Web/API/Selection
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const node = selection.anchorNode;

    while (range.toString().indexOf(" ") != 0) {
      range.setStart(node, range.startOffset - 1);
    }
    range.setStart(node, range.startOffset + 1);

    do {
      range.setEnd(node, range.endOffset + 1);
    } while (
      range.toString().indexOf(" ") == -1 &&
      range.toString().trim() != ""
    );

    const word = range.toString().trim();
    const pageIndex = event.target.getAttribute("data-index");

    const matchingToken = findMatchingToken(word, pageIndex);
    setToken(matchingToken);
  };

  const onNavigateForward = () => setPagesStartIndex(pagesStartIndex + 2);
  const onNavigateBack = () => setPagesStartIndex(pagesStartIndex - 2);

  if (fetching)
    <FallingLines
      color="#ffc300"
      width="100"
      visible={true}
      ariaLabel="falling-lines-loading"
    />;

  if (error) <ErrorIllustration />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBar}>
        <p className={styles.title}>{data?.book?.title}</p>
        <X size={24} weight="bold" className={styles.close} />
      </div>
      <div className={styles.pages} onClick={onClickWord}>
        <div className={styles.page}>
          <p data-index={pagesStartIndex}>
            {` ${data?.book?.pages[pagesStartIndex]?.content} ` || ""}
          </p>
        </div>
        <div className={styles.page}>
          <p data-index={pagesStartIndex + 1}>
            {` ${data?.book?.pages[pagesStartIndex + 1]?.content} ` || ""}
          </p>
        </div>
      </div>
      <div className={styles.footer}>
        <SkipBackCircle
          size={32}
          onClick={onNavigateBack}
          className={canNavigateBack ? styles.back : styles.disabled}
        />
        <p>{data?.book?.author}</p>
        <SkipForwardCircle
          size={32}
          onClick={onNavigateForward}
          className={canNavigateForward ? styles.forward : styles.disabled}
        />
      </div>
    </div>
  );
}
