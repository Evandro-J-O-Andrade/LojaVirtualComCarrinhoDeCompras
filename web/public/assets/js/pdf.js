document.querySelectorAll(".download-btn").forEach((btn) => {
    const link = btn.previousElementSibling; // O <a> que vem antes do botão

    btn.addEventListener("click", function () {
        const filePath = link.getAttribute("href"); // Obtém o caminho do arquivo PDF
        const fileName = filePath.split("/").pop(); // Pega o nome do arquivo

        // Variável de controle para saber se o download deve ocorrer
        let cancelDownload = false;

        // Cria a mensagem de download
        const downloadMessage = document.createElement("div");
        downloadMessage.classList.add("download-message");
        downloadMessage.textContent = "Iniciando o download...";

        // Cria o botão de cancelar
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancelar";
        cancelBtn.classList.add("cancel-btn");
        downloadMessage.appendChild(cancelBtn);

        // Adiciona a mensagem de download ao corpo da página
        document.body.appendChild(downloadMessage);

        // Exibe a mensagem
        downloadMessage.style.display = "block";

        // Função para cancelar o download
        cancelBtn.addEventListener("click", function () {
            cancelDownload = true; // Marca o download como cancelado
            document.body.removeChild(downloadMessage); // Remove a mensagem
        });

        // Cria um link temporário para forçar o download após 1 segundo
        setTimeout(function () {
            if (!cancelDownload) {  // Só faz o download se não tiver sido cancelado
                const downloadLink = document.createElement("a");
                downloadLink.href = filePath;
                downloadLink.download = fileName; // Define o nome do arquivo para download
                downloadLink.click(); // Simula o clique para fazer o download
                // Após o download começar, a mensagem será removida
                document.body.removeChild(downloadMessage);
            } else {
                // Se o download foi cancelado, a mensagem é removida sem exibir alerta
                document.body.removeChild(downloadMessage);
            }
        }, 3500); // 1 segundo de delay para dar tempo de cancelar o download

    });
});
