const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  const publicLinks = document.getElementById("public-links");
  const btnGoogleSignup = document.getElementById("btn-google-signup");

  if (btnGoogleSignup) {
    btnGoogleSignup.addEventListener("click", () => {
      alert("Google sign up is not fully wired yet – connect to backend OAuth endpoint here.");
    });
  }

  loadPublicLinks();

  async function loadPublicLinks() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/links/public`);
      if (!res.ok) throw new Error("Failed to load public links");
      const data = await res.json();

      publicLinks.innerHTML = "";

      data.links.forEach((link) => {
        const card = document.createElement("a");
        card.className = "public-link-card";
        card.href = link.url;
        card.target = "_blank";
        card.innerHTML = `
          <h3>${link.title || link.url}</h3>
          <p>${link.description || ""}</p>
        `;
        publicLinks.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      publicLinks.innerHTML = "<p>Could not load public links.</p>";
    }
  }
});
