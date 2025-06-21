firebase.initializeApp({
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402"
});

const db = firebase.firestore();
const username = localStorage.getItem("username");
if (!username) window.location.href = "../../index.html";

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");
const resultados = document.getElementById("resultados");
const buscador = document.getElementById("buscador");

// Obtener nombre de la lista desde el nombre del archivo
const lista = decodeURIComponent(window.location.pathname.split("/").pop().replace(".html", ""));
document.getElementById("titulo-lista").textContent = `Lista: ${lista}`;

let usuarioEdad = 0;
let contenidoItems = [];

document.getElementById("cerrar-sesion").onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../../index.html";
};

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    const data = doc.data();
    profilePic.src = data.profilePic || "../../default-profile.png";
    novaValue.textContent = data.novaPoints ?? 0;
    usuarioEdad = Number(data.age) || 0;
  } else {
    // Si no existe usuario, redirigir a login
    localStorage.clear();
    window.location.href = "../../index.html";
  }
}

function esAptoPorEdad(item) {
  let edadMinima = 0;
  if (item.edadMinima !== undefined && item.edadMinima !== null) {
    edadMinima = Number(item.edadMinima);
    if (isNaN(edadMinima)) edadMinima = 0;
  }
  return edadMinima <= usuarioEdad;
}

function filtrarPorEdadYBusqueda(items, textoBusqueda) {
  const texto = textoBusqueda.toLowerCase();
  return items.filter(item =>
    esAptoPorEdad(item) &&
    item.nombre?.toLowerCase().includes(texto)
  );
}

function mostrarResultados(lista) {
  resultados.innerHTML = "";

  if (lista.length === 0) {
    resultados.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  lista.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.onclick = () => manejarAcceso(item);

    div.innerHTML = `
      <img src="${item.imagenCartelera}" alt="${item.nombre}" />
      <h3>${item.nombre}</h3>
    `;

    resultados.appendChild(div);
  });
}

async function cargarContenido() {
  const snap = await db.collection("Películas y Series")
    .where("listas", "array-contains", lista)
    .get();

  contenidoItems = [];

  snap.forEach(doc => {
    contenidoItems.push(doc.data());
  });

  // Mostrar filtrado inicialmente sin texto
  mostrarResultados(filtrarPorEdadYBusqueda(contenidoItems, ""));

  // Filtrar al escribir en buscador
  buscador.addEventListener("input", () => {
    const filtrados = filtrarPorEdadYBusqueda(contenidoItems, buscador.value);
    mostrarResultados(filtrados);
  });
}

async function manejarAcceso(item) {
  const tipoRuta = item.tipo === "película" ? "../películas" : "../series";
  const destino = `${tipoRuta}/${encodeURIComponent(item.nombre)}.html`;

  if (item.type === "Gratis") {
    window.location.href = destino;
    return;
  }

  if (item.type === "Pago") {
    const usuarioDoc = await db.collection("usuarios").doc(username).get();
    if (usuarioDoc.exists) {
      const usuarioData = usuarioDoc.data();
      const subsUsuario = usuarioData.subs || [];
      const subsContenido = Array.isArray(item.subs) ? item.subs : [item.subs || ""];

      const accesoConcedido = subsContenido.some(sub => subsUsuario.includes(sub));

      if (accesoConcedido) {
        window.location.href = destino;
      } else {
        mostrarPopup(`Película con suscripción - (${subsContenido.join(", ")})`, () => {
          window.location.href = "../../NovaPoints.html";
        });
      }
    }
  }
}

function mostrarPopup(mensaje, onContinuar) {
  const popup = document.getElementById("popup");
  const popupMensaje = document.getElementById("popup-mensaje");
  const popupContinuar = document.getElementById("popup-continuar");
  const popupCancelar = document.getElementById("popup-cancelar");

  popupMensaje.textContent = mensaje;
  popup.style.display = "flex";

  const cerrarPopup = () => {
    popup.style.display = "none";
    popupContinuar.removeEventListener("click", continuarHandler);
    popupCancelar.removeEventListener("click", cerrarPopup);
  };

  const continuarHandler = () => {
    cerrarPopup();
    onContinuar();
  };

  popupContinuar.addEventListener("click", continuarHandler);
  popupCancelar.addEventListener("click", cerrarPopup);
}

(async () => {
  await cargarUsuario();
  await cargarContenido();
})();
