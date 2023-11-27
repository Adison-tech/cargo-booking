const cargoData = [
    { id: 'ABC123', status: 'In Transit', location: [37.7749, -122.4194] },
    { id: 'XYZ789', status: 'Delivered', location: [34.0522, -118.2437] },
    // Add more cargo entries as needed
];

let map;

function initMap() {
    console.log('Map initialized');
    map = L.map('map', {
        center: [1.2921, 36.8219],  // Centered on Nairobi, Kenya
        zoom: 7,
        maxZoom: 18,  // You can adjust the maximum zoom level if needed
        noWrap: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true
    }).addTo(map);
}

window.onload = function() {
    initMap();
};


function trackCargo() {
    const trackingId = document.getElementById('trackingId').value.toUpperCase();
    const resultDiv = document.getElementById('result');
    const cargo = cargoData.find(item => item.id === trackingId);

    if (cargo) {
        resultDiv.innerHTML = `<p>Status for Tracking ID ${trackingId}: ${cargo.status}</p>`;
        updateMap(cargo.location);
    } else {
        resultDiv.innerHTML = '<p>Cargo not found. Please check the tracking ID.</p>';
    }
}

function updateMap(location) {
    console.log('Updating map with marker');
    map.setView(location, 10);
    L.marker(location).addTo(map);
}
