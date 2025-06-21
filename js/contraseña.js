// Firebase init
const firebaseConfig = {
  apiKey: "AIzaSyBECojQuG_eAtJOFNHw-73-OOwOFOZJLIA",
  authDomain: "synkro-1b402.firebaseapp.com",
  projectId: "synkro-1b402",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Hash function
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Form submit
document.getElementById("recoveryForm").onsubmit = async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const newPassword = document.getElementById("newPassword").value;

  try {
    const userRef = db.collection("usuarios").doc(username);
    const doc = await userRef.get();

    if (!doc.exists) {
      alert("El usuario no existe.");
      return;
    }

    const userData = doc.data();
    if (userData.email !== email) {
      alert("El correo no coincide.");
      return;
    }

    const hashed = await hashPassword(newPassword);
    await userRef.update({ password: hashed });

    alert("¡Contraseña actualizada!");
    window.location.href = "index.html";
  } catch (err) {
    alert("Error: " + err.message);
  }
};
