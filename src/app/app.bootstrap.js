import "./app.css";
import { crearRouterFitJeff } from "./app-router.js";

const raiz = document.getElementById("app");
const perfilInicialCompletado = localStorage.getItem("fitjeff:onboarding-completed") === "true";

const router = crearRouterFitJeff({ raiz, perfilInicialCompletado });
router.iniciar();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}
