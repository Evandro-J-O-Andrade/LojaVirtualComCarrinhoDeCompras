// Função para ajustar o layout com base na largura da tela
function ajustarLayout() {
    const larguraTela = window.innerWidth;

    // Exemplo de lógica para ajustar elementos
    const logo = document.querySelector('.logo');
    const menuCelular = document.querySelector('.menu-celular');

    if (larguraTela < 500) {
        // Ajustes para telas menores
        logo.style.Width = '100%'; // Ajuste a largura da logo
        menuCelular.style.display = 'block'; // Mostra o menu celular
    } else {
        // Ajustes para telas maiores
        logo.style.maxWidth = 'none'; // Remove a restrição de largura
        menuCelular.style.display = 'none'; // Esconde o menu celular
    }
}

// Adiciona um event listener para executar a função ao redimensionar a janela
window.addEventListener('resize', ajustarLayout);

// Chama a função no carregamento da página para garantir que o layout esteja correto
ajustarLayout();
