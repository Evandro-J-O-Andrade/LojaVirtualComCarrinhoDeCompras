function initMap() {
    // Coordenadas da loja
    const loja = { lat: -23.55052, lng: -46.633308 }; 

    // Criar o mapa
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15, // Nível de zoom
        center: loja, // Centralizar no local da loja
    });

    // Adicionar marcador
    const marker = new google.maps.Marker({
        position: loja,
        map: map,
        title: "Angel Cosméticos", // Texto ao passar o mouse no marcador
    });
}
