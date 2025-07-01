import jwt from 'jsonwebtoken';

// Récupère l’email depuis le token
export function getUserEmailFromToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwt.decode(token);
    return decoded?.email || null;
  } catch (err) {
    return null;
  }
}

// Vérifie si le token a expiré
export function isTokenExpired() {
  if (typeof window === "undefined") return true;
  const token = localStorage.getItem("token");
  if (!token) return true;

  try {
    const decoded = jwt.decode(token);
    if (!decoded?.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (err) {
    return true;
  }
}

// Récupère l’ID utilisateur
export function getUserIdFromToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    console.log("Payload token:", jwt.decode(token));

    const decoded = jwt.decode(token);
    return decoded?.userId || null;
  } catch (err) {
    return null;
  }
}
