// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Toggle entre formularios
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
document.getElementById("loginToggle").onclick = () => {
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
};
document.getElementById("registerToggle").onclick = () => {
  registerForm.classList.add("active");
  loginForm.classList.remove("active");
};

// Función para hashear con SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Registro
registerForm.onsubmit = async (e) => {
  e.preventDefault();

  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  const hashedPassword = await hashPassword(password);

  const userData = {
    fullname: document.getElementById("regFullname").value,
    username,
    password: hashedPassword,
    age: parseInt(document.getElementById("regAge").value),
    sexo: document.getElementById("regSex").value,
    country: document.getElementById("regCountry").value,
    phone: document.getElementById("regPhone").value,
    email: document.getElementById("regEmail").value,
    profilePic: "default-profile.png",
    novaPoints: 100,
    line: true
  };

  try {
    const userDoc = await db.collection("usuarios").doc(username).get();
    if (userDoc.exists) {
      alert("El nombre de usuario ya está en uso.");
      return;
    }
    await db.collection("usuarios").doc(username).set(userData);
    alert("¡Registro exitoso!");
    registerForm.reset();
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
  } catch (err) {
    alert("Error al registrar: " + err.message);
  }
};

// Inicio de sesión
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  const hashedPassword = await hashPassword(password);

  try {
    const userRef = db.collection("usuarios").doc(username);
    const doc = await userRef.get();
    if (!doc.exists || doc.data().password !== hashedPassword) {
      alert("Usuario o contraseña incorrectos.");
      return;
    }

    await userRef.update({ line: true });
    localStorage.setItem("username", username);
    window.location.href = "Synkro.html";
  } catch (err) {
    alert("Error al iniciar sesión: " + err.message);
  }
};
