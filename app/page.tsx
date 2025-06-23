"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const backendUrl = "http://localhost:3001";

    const newUser = {
      email: "utilisateur_a_creer",
      password: "MonSuperMotDePasse123!"
    };

    fetch(`${backendUrl}/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("User created:", data.user);
      })
      .catch((err) => {
        console.error("Error creating user:", err.message);
      });
  }, []);

  return <h1>Create User Example</h1>;
}
