
const menuLinks = document.querySelectorAll(".menu-link");

menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
  window.location.href = "index.html";
});
