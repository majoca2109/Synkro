firebase.initializeApp({
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402",
});

const db = firebase.firestore();
const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "index.html";
}

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");
const tiendaContenedor = document.getElementById("tienda-contenido");

const popup = document.getElementById("popup");
const popupMsg = document.getElementById("popup-message");
const btnCancelar = document.getElementById("popup-btn-cancelar");
const btnAceptar = document.getElementById("popup-btn-aceptar");

document.getElementById("btn-volver").onclick = () => history.back();
document.getElementById("btn-cerrar-sesion").onclick = () => {
  localStorage.clear();
  window.location.href = "index.html";
};

profilePic.onclick = () => window.location.href = "perfil.html";

function mostrarPopup(mensaje, confirmar = false) {
  popupMsg.textContent = mensaje;
  btnAceptar.style.display = confirmar ? "inline-block" : "none";
  btnCancelar.textContent = confirmar ? "Cancelar" : "Cerrar";
  popup.classList.remove("hidden");
}
function cerrarPopup() {
  popup.classList.add("hidden");
}
btnCancelar.onclick = cerrarPopup;

let confirmacionCompra = null;
btnAceptar.onclick = () => {
  if (confirmacionCompra) {
    confirmacionCompra();
    confirmacionCompra = null;
    cerrarPopup();
  }
};

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (!doc.exists) {
    localStorage.clear();
    window.location.href = "index.html";
  }
  const data = doc.data();
  profilePic.src = data.profilePic || "default-profile.png";
  novaValue.textContent = data.novaPoints ?? 0;
  return data;
}

async function cargarTienda() {
  const usuario = await cargarUsuario();
  tiendaContenedor.innerHTML = "";

  const hoy = new Date();
  const subsActiva = usuario.subs && usuario.subsfechaExpiracion && new Date(usuario.subsfechaExpiracion) > hoy;
  const subsCaducada = usuario.subs && usuario.subsfechaExpiracion && new Date(usuario.subsfechaExpiracion) <= hoy;

  const tiendaSnap = await db.collection("Tienda").get();

  tiendaSnap.forEach((doc) => {
    const item = doc.data();
    const div = document.createElement("div");
    div.className = "tienda-card";

    let html = `
      <h3>${item.subs}</h3>
      <p><strong>Contenido:</strong> ${item.contenido.join(", ")}</p>
      <p>Duración: ${item.duracionDias} días</p>
      <p>Precio: ${item.price} NovaPoints</p>
    `;

    const esSubsActual = usuario.subs === item.subs;

    const fechaExp = esSubsActual ? new Date(usuario.subsfechaExpiracion).toLocaleDateString("es-ES") : null;

    if (subsActiva && esSubsActual) {
      html += `<p>Válido hasta: ${fechaExp}</p><button id="btn-dejar">Dejar subscripción</button>`;
    } else if (subsCaducada && esSubsActual) {
      html += `<p>Expirada: ${fechaExp}</p><button>Renovar subscripción</button>`;
    } else if (!usuario.subs) {
      html += `<button>Comprar</button>`;
    } else {
      html += `<button disabled>Otra subscripción activa</button>`;
    }

    div.innerHTML = html;

    const boton = div.querySelector("button");
    if (boton && !boton.disabled) {
      boton.addEventListener("click", () => {
        if (boton.id === "btn-dejar") {
          mostrarPopup("¿Deseas dejar esta subscripción?", true);
          confirmacionCompra = async () => {
            await db.collection("usuarios").doc(username).update({
              subs: firebase.firestore.FieldValue.delete(),
              subsfechaInicio: firebase.firestore.FieldValue.delete(),
              subsfechaExpiracion: firebase.firestore.FieldValue.delete()
            });
            mostrarPopup("Subscripción cancelada.");
            cargarTienda();
          };
          return;
        }

        if (usuario.novaPoints < item.price) {
          mostrarPopup("No tienes suficientes NovaPoints.");
          return;
        }

        mostrarPopup(`¿Confirmar ${subsCaducada ? "renovación" : "compra"} de "${item.subs}" por ${item.price} NovaPoints?`, true);
        confirmacionCompra = async () => {
          const ahora = new Date();
          const expiracion = new Date(ahora.getTime() + item.duracionDias * 24 * 60 * 60 * 1000);
          const fechaInicioStr = ahora.toISOString().split("T")[0];
          const fechaExpStr = expiracion.toISOString().split("T")[0];

          await db.collection("usuarios").doc(username).update({
            novaPoints: usuario.novaPoints - item.price,
            subs: item.subs,
            subsfechaInicio: fechaInicioStr,
            subsfechaExpiracion: fechaExpStr
          });

          mostrarPopup(subsCaducada ? "¡Subscripción renovada!" : "¡Subscripción activada!");
          cargarTienda();
        };
      });
    }

    tiendaContenedor.appendChild(div);
  });
}

cargarTienda();
