const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost");

const URLS = {
  FRONT: isLocal
    ? "http://127.0.0.1:3000"
    : "https://web-server-281506025529.asia-northeast3.run.app",

  MODEL: isLocal
    ? "http://127.0.0.1:8000"
    : "https://model-server-281506025529.asia-northeast3.run.app",

  BACK: isLocal
    ? "http://127.0.0.1:8080"
    : "https://my-backend-281506025529.asia-northeast3.run.app",
};

export default URLS;