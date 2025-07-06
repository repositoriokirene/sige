function capturarLocalizacao() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(pos) {
                document.getElementById("latitude").value = pos.coords.latitude;
                document.getElementById("longitude").value = pos.coords.longitude;
            },
            function(err) {
                alert("Erro ao capturar localização.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }
}