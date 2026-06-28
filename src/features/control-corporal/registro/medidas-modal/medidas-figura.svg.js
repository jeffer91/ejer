const ZONAS_LINEA = {
  cuello: { y: 76, x1: 108, x2: 172, label: "Cuello" },
  cintura: { y: 128, x1: 92, x2: 188, label: "Cintura" },
  abdomen: { y: 148, x1: 86, x2: 194, label: "Abdomen" },
  pecho: { y: 100, x1: 88, x2: 192, label: "Pecho" },
  brazo: { y: 118, x1: 54, x2: 96, label: "Brazo" },
  pierna: { y: 220, x1: 105, x2: 135, label: "Pierna" },
  cadera: { y: 172, x1: 82, x2: 198, label: "Cadera" },
  bascula: { y: 250, x1: 95, x2: 185, label: "Báscula" },
  fecha: { y: 44, x1: 86, x2: 194, label: "Fecha" }
};

function crearSvgElemento(nombre) {
  return document.createElementNS("http://www.w3.org/2000/svg", nombre);
}

function setAttrs(elemento, attrs) {
  Object.entries(attrs).forEach(([clave, valor]) => elemento.setAttribute(clave, String(valor)));
  return elemento;
}

function crearLineaMedicion(zona) {
  const datos = ZONAS_LINEA[zona] || ZONAS_LINEA.cintura;
  const grupo = crearSvgElemento("g");
  const cinta = setAttrs(crearSvgElemento("line"), {
    x1: datos.x1,
    y1: datos.y,
    x2: datos.x2,
    y2: datos.y,
    class: "medidas-figura__cinta"
  });
  const etiquetaFondo = setAttrs(crearSvgElemento("rect"), {
    x: 196,
    y: datos.y - 16,
    width: 68,
    height: 24,
    rx: 12,
    class: "medidas-figura__label-bg"
  });
  const etiqueta = setAttrs(crearSvgElemento("text"), {
    x: 230,
    y: datos.y,
    class: "medidas-figura__label",
    "text-anchor": "middle",
    "dominant-baseline": "middle"
  });

  etiqueta.textContent = datos.label;
  grupo.appendChild(cinta);
  grupo.appendChild(etiquetaFondo);
  grupo.appendChild(etiqueta);

  return grupo;
}

function crearCuerpo() {
  const grupo = crearSvgElemento("g");

  grupo.appendChild(setAttrs(crearSvgElemento("circle"), {
    cx: 140,
    cy: 45,
    r: 25,
    class: "medidas-figura__body"
  }));
  grupo.appendChild(setAttrs(crearSvgElemento("path"), {
    d: "M105 86 C112 72 168 72 175 86 C184 110 182 152 170 176 C165 187 154 190 140 190 C126 190 115 187 110 176 C98 152 96 110 105 86 Z",
    class: "medidas-figura__body"
  }));
  grupo.appendChild(setAttrs(crearSvgElemento("path"), {
    d: "M104 90 C77 108 68 135 62 160",
    class: "medidas-figura__limb"
  }));
  grupo.appendChild(setAttrs(crearSvgElemento("path"), {
    d: "M176 90 C203 108 212 135 218 160",
    class: "medidas-figura__limb"
  }));
  grupo.appendChild(setAttrs(crearSvgElemento("path"), {
    d: "M126 188 C120 210 114 232 108 258",
    class: "medidas-figura__limb"
  }));
  grupo.appendChild(setAttrs(crearSvgElemento("path"), {
    d: "M154 188 C160 210 166 232 172 258",
    class: "medidas-figura__limb"
  }));
  grupo.appendChild(setAttrs(crearSvgElemento("rect"), {
    x: 96,
    y: 258,
    width: 88,
    height: 16,
    rx: 8,
    class: "medidas-figura__scale"
  }));

  return grupo;
}

export function crearFiguraMedicion(zona = "cintura") {
  const svg = setAttrs(crearSvgElemento("svg"), {
    viewBox: "0 0 280 290",
    role: "img",
    class: `medidas-figura medidas-figura--${zona}`,
    "aria-label": "Figura visual de medición corporal"
  });

  svg.appendChild(setAttrs(crearSvgElemento("rect"), {
    x: 12,
    y: 12,
    width: 256,
    height: 266,
    rx: 26,
    class: "medidas-figura__bg"
  }));
  svg.appendChild(crearCuerpo());
  svg.appendChild(crearLineaMedicion(zona));

  return svg;
}
