import "./avatar-corporal.css";

function crearSvgElemento(nombre) {
  return document.createElementNS("http://www.w3.org/2000/svg", nombre);
}

function setAttrs(elemento, attrs) {
  Object.entries(attrs).forEach(([clave, valor]) => elemento.setAttribute(clave, String(valor)));
  return elemento;
}

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

export function crearAvatarCorporal(avatar = {}) {
  const wrapper = crearElemento("div", `avatar-corporal avatar-corporal--${avatar.estado || "pending"}`);
  const svg = setAttrs(crearSvgElemento("svg"), {
    viewBox: "0 0 260 300",
    role: "img",
    "aria-label": "Avatar corporal orientativo"
  });

  svg.appendChild(setAttrs(crearSvgElemento("rect"), {
    x: 14,
    y: 14,
    width: 232,
    height: 272,
    rx: 28,
    class: "avatar-corporal__bg"
  }));
  svg.appendChild(setAttrs(crearSvgElemento("circle"), {
    cx: 130,
    cy: 52,
    r: 24,
    class: "avatar-corporal__body"
  }));
  svg.appendChild(setAttrs(crearSvgElemento("path"), {
    d: "M96 92 C106 78 154 78 164 92 C176 116 176 160 162 190 C154 206 106 206 98 190 C84 160 84 116 96 92 Z",
    class: "avatar-corporal__body"
  }));
  svg.appendChild(setAttrs(crearSvgElemento("path"), {
    d: "M95 101 C70 120 62 146 58 170",
    class: "avatar-corporal__limb"
  }));
  svg.appendChild(setAttrs(crearSvgElemento("path"), {
    d: "M165 101 C190 120 198 146 202 170",
    class: "avatar-corporal__limb"
  }));
  svg.appendChild(setAttrs(crearSvgElemento("path"), {
    d: "M116 202 C110 226 104 248 100 272",
    class: "avatar-corporal__limb"
  }));
  svg.appendChild(setAttrs(crearSvgElemento("path"), {
    d: "M144 202 C150 226 156 248 160 272",
    class: "avatar-corporal__limb"
  }));
  svg.appendChild(setAttrs(crearSvgElemento("line"), {
    x1: 76,
    y1: 142,
    x2: 184,
    y2: 142,
    class: `avatar-corporal__marker avatar-corporal__marker--${avatar.cinturaNivel || "sin-dato"}`
  }));
  svg.appendChild(setAttrs(crearSvgElemento("line"), {
    x1: 92,
    y1: 92,
    x2: 168,
    y2: 92,
    class: `avatar-corporal__marker avatar-corporal__marker--${avatar.imcNivel || "sin-dato"}`
  }));

  wrapper.appendChild(svg);
  wrapper.appendChild(crearElemento("span", "avatar-corporal__caption", avatar.muscular ? "IMC con contexto muscular" : "Lectura con medidas"));
  return wrapper;
}
