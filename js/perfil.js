const firebaseConfig = {
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const username = localStorage.getItem("username");
let userData = {};

async function loadProfile() {
  if (!username) return;
  const doc = await db.collection("usuarios").doc(username).get();
  if (!doc.exists) return;

  userData = doc.data();

  document.getElementById("profilePic").src = userData.profilePic || "default-profile.png";
  document.getElementById("username").textContent = username;
  document.getElementById("novaPoints").textContent = userData.novaPoints ?? 0;

  document.getElementById("fullnameDisplay").textContent = userData.fullname;
  document.getElementById("fullname").value = userData.fullname;

  document.getElementById("ageDisplay").textContent = userData.age;
  document.getElementById("age").value = userData.age;

  document.getElementById("sexoDisplay").textContent = userData.sexo;
  document.getElementById("sexo").value = userData.sexo;

  document.getElementById("countryDisplay").textContent = userData.country;
  document.getElementById("country").value = userData.country;

  document.getElementById("phoneDisplay").textContent = userData.phone;
  document.getElementById("phone").value = userData.phone;

  document.getElementById("emailDisplay").textContent = userData.email;
  document.getElementById("email").value = userData.email;
}

// Cambiar imagen
document.getElementById("profilePic").onclick = () => {
  document.getElementById("fileInput").click();
};

document.getElementById("fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const imgData = reader.result;
    await db.collection("usuarios").doc(username).update({ profilePic: imgData });
    document.getElementById("profilePic").src = imgData;
  };
  reader.readAsDataURL(file);
});

// Editar perfil
let editing = false;
document.getElementById("editBtn").onclick = async () => {
  editing = !editing;

  const inputs = ["fullname", "age", "sexo", "country", "phone", "email"];
  const displays = inputs.map(id => document.getElementById(id + "Display"));
  const fields = inputs.map(id => document.getElementById(id));

  if (editing) {
    document.getElementById("editBtn").textContent = "Guardar datos";
    displays.forEach(d => d.style.display = "none");
    fields.forEach(f => f.style.display = "inline");
  } else {
    document.getElementById("editBtn").textContent = "Editar perfil";

    const updatedData = {
      fullname: document.getElementById("fullname").value,
      age: parseInt(document.getElementById("age").value),
      sexo: document.getElementById("sexo").value,
      country: document.getElementById("country").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
    };

    await db.collection("usuarios").doc(username).update(updatedData);
    loadProfile(); // Recargar vista
    displays.forEach(d => d.style.display = "inline");
    fields.forEach(f => f.style.display = "none");
  }
};

// Cerrar sesión
document.getElementById("logoutBtn").onclick = async () => {
  await db.collection("usuarios").doc(username).update({ line: false });
  localStorage.clear();
  window.location.href = "index.html";
};

// Volver
document.getElementById("backBtn").onclick = () => {
  history.back();
};

loadProfile();
