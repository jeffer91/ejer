const SVG_NS = "http://www.w3.org/2000/svg";

function crearSvgElemento(nombre) {
  return document.createElementNS(SVG_NS, nombre);
}

function setAttrs(elemento, attrs = {}) {
  Object.entries(attrs).forEach(([clave, valor]) => elemento.setAttribute(clave, String(valor)));
  return elemento;
}

function agregar(parent, ...children) {
  children.filter(Boolean).forEach((child) => parent.appendChild(child));
  return parent;
}

function crearGrupo(clase = "") {
  return setAttrs(crearSvgElemento("g"), clase ? { class: clase } : {});
}

function crearTextoLineas(lineas, x, y, attrs = {}, salto = 13) {
  const texto = setAttrs(crearSvgElemento("text"), attrs);
  lineas.forEach((linea, index) => {
    const tspan = setAttrs(crearSvgElemento("tspan"), {
      x,
      dy: index === 0 ? 0 : salto
    });
    tspan.textContent = linea;
    texto.appendChild(tspan);
  });
  texto.setAttribute("x", String(x));
  texto.setAttribute("y", String(y));
  return texto;
}

function crearPildora({ x, y, width, height, lineas, className = "medidas-figura__callout" }) {
  const grupo = crearGrupo();
  agregar(
    grupo,
    setAttrs(crearSvgElemento("rect"), {
      x,
      y,
      width,
      height,
      rx: 12,
      class: className
    }),
    crearTextoLineas(lineas, x + width / 2, y + 17, {
      class: "medidas-figura__callout-text",
      "text-anchor": "middle"
    }, 13)
  );
  return grupo;
}

function crearLineaGuia(x1, y1, x2, y2) {
  return setAttrs(crearSvgElemento("line"), {
    x1,
    y1,
    x2,
    y2,
    class: "medidas-figura__guide"
  });
}

function crearPunto(x, y, clase = "medidas-figura__marker") {
  return setAttrs(crearSvgElemento("circle"), {
    cx: x,
    cy: y,
    r: 5,
    class: clase
  });
}

function crearTapeRect(x, y, width, height = 12) {
  const grupo = crearGrupo("medidas-figura__tape-group");
  agregar(grupo, setAttrs(crearSvgElemento("rect"), {
    x,
    y,
    width,
    height,
    rx: height / 2,
    class: "medidas-figura__tape"
  }));

  const inicio = x + 8;
  const fin = x + width - 8;
  for (let tickX = inicio; tickX <= fin; tickX += 8) {
    const alto = Math.round((tickX - inicio) / 8) % 3 === 0 ? 8 : 5;
    agregar(grupo, setAttrs(crearSvgElemento("line"), {
      x1: tickX,
      y1: y + 2,
      x2: tickX,
      y2: y + alto,
      class: "medidas-figura__tick"
    }));
  }

  agregar(grupo, setAttrs(crearSvgElemento("rect"), {
    x: x + width / 2 - 6,
    y: y + 1,
    width: 12,
    height: height - 2,
    rx: 3,
    class: "medidas-figura__buckle"
  }));
  return grupo;
}

function crearMarco() {
  return setAttrs(crearSvgElemento("rect"), {
    x: 10,
    y: 10,
    width: 340,
    height: 300,
    rx: 28,
    class: "medidas-figura__bg"
  });
}

function crearTorsoFrontal({ tapeY, labelLines, labelX = 236, labelY = 148, navel = true, abdomen = false }) {
  const grupo = crearGrupo();
  const torsoPath = abdomen
    ? "M121 58 C134 48 226 48 239 58 C256 91 258 158 244 211 C235 240 215 255 180 255 C145 255 125 240 116 211 C102 158 104 91 121 58 Z"
    : "M122 58 C136 49 224 49 238 58 C251 96 248 164 233 219 C226 243 207 255 180 255 C153 255 134 243 127 219 C112 164 109 96 122 58 Z";

  agregar(
    grupo,
    setAttrs(crearSvgElemento("path"), { d: torsoPath, class: "medidas-figura__skin" }),
    setAttrs(crearSvgElemento("path"), { d: "M110 74 C82 98 70 129 64 166", class: "medidas-figura__arm-skin" }),
    setAttrs(crearSvgElemento("path"), { d: "M250 74 C278 98 290 129 296 166", class: "medidas-figura__arm-skin" }),
    setAttrs(crearSvgElemento("path"), { d: "M127 219 C147 231 213 231 233 219 L242 268 L118 268 Z", class: "medidas-figura__shorts" }),
    setAttrs(crearSvgElemento("path"), { d: "M144 98 C156 90 168 90 176 98", class: "medidas-figura__detail-line" }),
    setAttrs(crearSvgElemento("path"), { d: "M184 98 C192 90 204 90 216 98", class: "medidas-figura__detail-line" }),
    setAttrs(crearSvgElemento("circle"), { cx: 145, cy: 107, r: 3.5, class: "medidas-figura__soft-dot" }),
    setAttrs(crearSvgElemento("circle"), { cx: 215, cy: 107, r: 3.5, class: "medidas-figura__soft-dot" })
  );

  if (navel) {
    agregar(grupo, setAttrs(crearSvgElemento("circle"), {
      cx: 180,
      cy: 183,
      r: 4,
      class: "medidas-figura__navel"
    }));
  }

  agregar(grupo, crearTapeRect(100, tapeY, 160, 12));
  agregar(grupo, crearLineaGuia(260, tapeY + 6, labelX, labelY + 18));
  agregar(grupo, crearPunto(180, tapeY + 6));
  agregar(grupo, crearPildora({ x: labelX, y: labelY, width: 96, height: 46, lineas: labelLines }));
  return grupo;
}

function crearCuello() {
  const grupo = crearGrupo();
  agregar(
    grupo,
    setAttrs(crearSvgElemento("path"), { d: "M139 170 C150 184 210 184 221 170 L250 260 L110 260 Z", class: "medidas-figura__shirt" }),
    setAttrs(crearSvgElemento("path"), { d: "M152 128 L152 175 C160 188 200 188 208 175 L208 128 Z", class: "medidas-figura__skin" }),
    setAttrs(crearSvgElemento("circle"), { cx: 180, cy: 86, r: 46, class: "medidas-figura__skin" }),
    setAttrs(crearSvgElemento("path"), { d: "M132 77 C136 36 224 33 230 79 C210 55 157 54 132 77 Z", class: "medidas-figura__hair" }),
    setAttrs(crearSvgElemento("path"), { d: "M150 102 C164 112 196 112 210 102", class: "medidas-figura__face-line" }),
    setAttrs(crearSvgElemento("circle"), { cx: 163, cy: 88, r: 3, class: "medidas-figura__eye" }),
    setAttrs(crearSvgElemento("circle"), { cx: 197, cy: 88, r: 3, class: "medidas-figura__eye" })
  );
  agregar(grupo, crearTapeRect(129, 158, 102, 12));
  agregar(grupo, crearPunto(180, 164));
  agregar(grupo, crearLineaGuia(184, 164, 242, 147));
  agregar(grupo, crearPildora({ x: 242, y: 124, width: 92, height: 44, lineas: ["justo debajo", "de la nuez"] }));
  return grupo;
}

function crearCintura() {
  return crearTorsoFrontal({
    tapeY: 178,
    labelLines: ["a la altura", "del ombligo"],
    labelX: 244,
    labelY: 152,
    navel: true
  });
}

function crearAbdomen() {
  const grupo = crearGrupo();
  agregar(grupo, crearTorsoFrontal({
    tapeY: 198,
    labelLines: ["parte más", "sobresaliente"],
    labelX: 234,
    labelY: 184,
    navel: true,
    abdomen: true
  }));
  agregar(
    grupo,
    setAttrs(crearSvgElemento("rect"), { x: 238, y: 88, width: 88, height: 74, rx: 14, class: "medidas-figura__inset" }),
    setAttrs(crearSvgElemento("path"), { d: "M276 103 C289 119 292 143 282 153", class: "medidas-figura__profile-belly" }),
    setAttrs(crearSvgElemento("path"), { d: "M266 104 C266 125 266 145 266 154", class: "medidas-figura__profile-line" }),
    crearTextoLineas(["manda la zona", "que más sale"], 282, 136, { class: "medidas-figura__mini-text", "text-anchor": "middle" }, 11)
  );
  return grupo;
}

function crearPecho() {
  return crearTorsoFrontal({
    tapeY: 124,
    labelLines: ["altura media", "del tórax"],
    labelX: 236,
    labelY: 106,
    navel: true
  });
}

function crearBrazo() {
  const grupo = crearGrupo();
  agregar(
    grupo,
    setAttrs(crearSvgElemento("path"), { d: "M198 62 C232 80 248 124 238 205 L211 205 C218 145 213 96 190 76 Z", class: "medidas-figura__skin" }),
    setAttrs(crearSvgElemento("path"), { d: "M178 72 C142 92 123 128 119 205 C118 232 131 253 151 253 C160 253 168 248 170 240 C158 222 156 193 160 162 C164 124 176 95 198 62 Z", class: "medidas-figura__skin" }),
    setAttrs(crearSvgElemento("path"), { d: "M198 205 L238 205 L244 267 L185 267 Z", class: "medidas-figura__shorts" }),
    setAttrs(crearSvgElemento("line"), { x1: 116, y1: 78, x2: 116, y2: 226, class: "medidas-figura__bracket" }),
    setAttrs(crearSvgElemento("line"), { x1: 116, y1: 78, x2: 142, y2: 78, class: "medidas-figura__bracket" }),
    setAttrs(crearSvgElemento("line"), { x1: 116, y1: 226, x2: 142, y2: 226, class: "medidas-figura__bracket" }),
    crearPunto(151, 78),
    crearPunto(151, 226),
    crearTapeRect(130, 150, 78, 12),
    crearPunto(151, 156),
    crearLineaGuia(130, 156, 70, 156),
    crearPildora({ x: 30, y: 128, width: 90, height: 58, lineas: ["Punto medio", "hombro-codo"] }),
    crearPildora({ x: 160, y: 62, width: 68, height: 28, lineas: ["hombro"], className: "medidas-figura__tag" }),
    crearPildora({ x: 160, y: 212, width: 56, height: 28, lineas: ["codo"], className: "medidas-figura__tag" })
  );
  return grupo;
}

function crearPierna() {
  const grupo = crearGrupo();
  agregar(
    grupo,
    setAttrs(crearSvgElemento("path"), { d: "M154 38 L246 38 C252 83 238 119 219 148 C211 177 203 214 196 275 L138 275 C141 214 148 176 158 148 C145 111 140 74 154 38 Z", class: "medidas-figura__skin" }),
    setAttrs(crearSvgElemento("path"), { d: "M148 38 L250 38 C250 70 239 91 224 104 L158 104 C149 84 145 63 148 38 Z", class: "medidas-figura__shorts" }),
    setAttrs(crearSvgElemento("line"), { x1: 126, y1: 77, x2: 126, y2: 232, class: "medidas-figura__guide medidas-figura__guide--solid" }),
    crearPunto(166, 77),
    crearPunto(166, 232),
    crearTapeRect(112, 151, 112, 12),
    crearPunto(166, 157),
    crearLineaGuia(112, 157, 48, 157),
    crearPildora({ x: 24, y: 130, width: 96, height: 52, lineas: ["mitad entre", "cadera y rodilla"] }),
    crearPildora({ x: 20, y: 62, width: 94, height: 34, lineas: ["pliegue cadera"], className: "medidas-figura__tag" }),
    crearPildora({ x: 206, y: 216, width: 112, height: 38, lineas: ["parte superior", "rodilla"], className: "medidas-figura__tag" })
  );
  return grupo;
}

function crearCadera() {
  const grupo = crearGrupo();
  agregar(
    grupo,
    setAttrs(crearSvgElemento("path"), { d: "M130 42 C158 54 202 54 230 42 C235 89 236 122 249 155 C263 190 247 238 217 252 C198 260 162 260 143 252 C113 238 97 190 111 155 C124 122 125 89 130 42 Z", class: "medidas-figura__skin" }),
    setAttrs(crearSvgElemento("path"), { d: "M114 127 C145 114 215 114 246 127 C252 157 250 184 238 205 C211 198 149 198 122 205 C110 184 108 157 114 127 Z", class: "medidas-figura__shorts" }),
    setAttrs(crearSvgElemento("path"), { d: "M78 136 C65 159 65 188 78 211", class: "medidas-figura__wide-guide" }),
    setAttrs(crearSvgElemento("path"), { d: "M282 136 C295 159 295 188 282 211", class: "medidas-figura__wide-guide" }),
    setAttrs(crearSvgElemento("path"), { d: "M86 174 L116 174", class: "medidas-figura__arrow" }),
    setAttrs(crearSvgElemento("path"), { d: "M274 174 L244 174", class: "medidas-figura__arrow" }),
    crearTapeRect(80, 168, 200, 12),
    crearLineaGuia(258, 174, 272, 142),
    crearPildora({ x: 262, y: 112, width: 78, height: 48, lineas: ["parte más", "ancha"] })
  );
  return grupo;
}

function crearBascula() {
  const grupo = crearGrupo();
  agregar(
    grupo,
    setAttrs(crearSvgElemento("rect"), { x: 82, y: 82, width: 196, height: 162, rx: 28, class: "medidas-figura__scale-big" }),
    setAttrs(crearSvgElemento("rect"), { x: 125, y: 104, width: 110, height: 48, rx: 18, class: "medidas-figura__scale-screen" }),
    crearTextoLineas(["Peso", "misma balanza"], 180, 128, { class: "medidas-figura__scale-text", "text-anchor": "middle" }, 20)
  );
  return grupo;
}

function crearFecha() {
  const grupo = crearGrupo();
  agregar(
    grupo,
    setAttrs(crearSvgElemento("rect"), { x: 84, y: 72, width: 192, height: 170, rx: 18, class: "medidas-figura__calendar" }),
    setAttrs(crearSvgElemento("rect"), { x: 84, y: 72, width: 192, height: 44, rx: 18, class: "medidas-figura__calendar-head" }),
    crearTextoLineas(["Fecha real", "de medición"], 180, 156, { class: "medidas-figura__scale-text", "text-anchor": "middle" }, 22)
  );
  return grupo;
}

const RENDERERS = Object.freeze({
  cuello: crearCuello,
  cintura: crearCintura,
  abdomen: crearAbdomen,
  pecho: crearPecho,
  brazo: crearBrazo,
  pierna: crearPierna,
  cadera: crearCadera,
  bascula: crearBascula,
  fecha: crearFecha
});

export function crearFiguraMedicion(zona = "cintura") {
  const svg = setAttrs(crearSvgElemento("svg"), {
    viewBox: "0 0 360 320",
    role: "img",
    class: `medidas-figura medidas-figura--${zona}`,
    "aria-label": "Figura visual de medición corporal"
  });

  const renderizarZona = RENDERERS[zona] || RENDERERS.cintura;
  agregar(svg, crearMarco(), renderizarZona());
  return svg;
}
