// Seleciona o botão
const btnTopo = document.getElementById("btnTopo");

// Mostra ou esconde o botão dependendo da rolagem
window.onscroll = function () {
    const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (document.documentElement.scrollTop > scrollTotal * 0.8) {
        btnTopo.style.display = "block"; // Mostra o botão
    } else {
        btnTopo.style.display = "none"; // Esconde o botão
    }
};

// Rola suavemente para o topo ao clicar no botão
btnTopo.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
});

