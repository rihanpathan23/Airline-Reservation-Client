function Loading({ text = "Loading...", fullPage = false }) {
  return (
    <div
      className={`ld-wrap${fullPage ? " ld-fullpage" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="ld-spinner" aria-hidden="true" />
      {text ? <span className="ld-text">{text}</span> : null}
    </div>
  );
}

export default Loading;