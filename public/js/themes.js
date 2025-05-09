// themes.js

document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("toggle-theme");
  const root = document.documentElement;

  // Cek preferensi dari localStorage
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    root.classList.add("light");
    themeToggle.innerHTML = '<i data-feather="moon"></i>';
    feather.replace();
  }

  themeToggle.addEventListener("click", function (e) {
    e.preventDefault();
    root.classList.toggle("light");
    const isLight = root.classList.contains("light");

    // Simpan preferensi
    localStorage.setItem("theme", isLight ? "light" : "dark");

    // Ganti ikon
    themeToggle.innerHTML = isLight
      ? '<i data-feather="moon"></i>'
      : '<i data-feather="sun"></i>';
    feather.replace();
  });
});
