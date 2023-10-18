import { useEffect } from "react";
import { useSnackbar } from "notistack";
// @local
import Illustration from "./Illustration";
import styles from "./Token-Modal.module.css";

export default function TokenModal({ token = "", clearToken }) {
  const snackbarOptions = {
    style: {
      fontFamily: "Cutive Mono, monospace",
    },
  };

  const { enqueueSnackbar, closeSnackbar } = useSnackbar(snackbarOptions);
  useEffect(() => {
    enqueueSnackbar("Press Esc to navigate back", 10000);

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        clearToken();
        closeSnackbar();
      }
    };
    
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <Illustration className={styles.Illustration} token={token} />
    </div>
  );
}
