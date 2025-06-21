firebase.initializeApp({
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402"
});

const db = firebase.firestore();
const username = localStorage.getItem("username");

if (!username) window.location.href = "../../../index.html";

const profilePic = document.getElementById("profile-pic");
const novaValue = document.getElementById("nova-value");

document.getElementById("cerrar-sesion").onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "../../../index.html";
};

const pathParts = window.location.pathname.split("/");
const fileName = pathParts[pathParts.length - 1];
const match = fileName.match(/^(.*?)(\d+)\.html$/);

const nombreSerie = decodeURIComponent(match[1]);
const numeroTemporada = match[2];

async function cargarUsuario() {
  const doc = await db.collection("usuarios").doc(username).get();
  if (doc.exists) {
    const data = doc.data();
    profilePic.src = data.profilePic || "../../../default-profile.png";
    novaValue.textContent = data.novaPoints ?? 0;
  }
}

async function cargarTemporada() {
  const snap = await db.collection("Películas y Series")
    .where("nombre", "==", nombreSerie)
    .where("tipo", "==", "Serie")  // Corregido: "Serie" con mayúscula
    .limit(1)
    .get();

  if (snap.empty) {
    document.querySelector("main").innerHTML = "<p>Temporada no encontrada.</p>";
    return;
  }

  const data = snap.docs[0].data();
  const temporadaData = data.imagenTemporada?.["temporada" + numeroTemporada];
  const episodiosData = data.imagenEpisodio?.["temporada" + numeroTemporada] || {};

  if (!temporadaData) {
    document.querySelector("main").innerHTML = "<p>Información de temporada no disponible.</p>";
    return;
  }

  // Mostrar info de la temporada
  document.getElementById("imagenTemporada").src = temporadaData.imagentemporada;
  document.getElementById("nombreSerie").textContent = data.nombre;
  document.getElementById("numeroTemporada").textContent = `Temporada ${temporadaData.numerotemporada}`;
  document.getElementById("resumenTemporada").textContent = temporadaData.resumentemporada || "";
  document.getElementById("numeroEpisodios").textContent = temporadaData.numeroepisodios || "0";

  const container = document.getElementById("episodios-container");

  Object.keys(episodiosData)
    .sort((a, b) => {
      const epA = parseInt(a.replace("episodio", ""));
      const epB = parseInt(b.replace("episodio", ""));
      return epA - epB;
    })
    .forEach(key => {
      const episodio = episodiosData[key];
      if (!episodio) return;

      const div = document.createElement("div");
      div.className = "episodio";

      div.innerHTML = `
        <img src="${episodio.imagenepisodio}" alt="Imagen episodio ${key}" class="episodio-img">
        <div class="episodio-info">
          <h3>Episodio ${episodio.numeroepisodio}</h3>
          <p><strong>Duración:</strong> ${episodio.duracion || "?"}</p>
          <p>${episodio.resumen || ""}</p>
          <button class="btn-ver">Ver</button>
          <div class="reproductor">
            <iframe src="${episodio.ver}" allowfullscreen frameborder="0"></iframe>
          </div>
        </div>
      `;

      const botonVer = div.querySelector(".btn-ver");
      const reproductor = div.querySelector(".reproductor");
      reproductor.style.display = "none";

      botonVer.onclick = () => {
        const visible = reproductor.style.display === "block";
        reproductor.style.display = visible ? "none" : "block";
        botonVer.textContent = visible ? "Ver" : "Dejar de ver";
      };

      container.appendChild(div);
    });
}

cargarUsuario();
cargarTemporada();
