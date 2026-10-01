function initMap() {
    // Coordenadas da loja (ajustadas para sua localização)
    const loja = { lat: -23.5227103, lng:  -46.3487538 }; 

    // Criar o mapa
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15, // Nível de zoom
        center: loja, // Centralizar no local da loja
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    // Adicionar marcador
    const marker = new google.maps.Marker({
        position: loja,
        map: map,
        title: "Angel Cosméticos", // Texto ao passar o mouse no marcador
    });
}
