mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: cafe.geometry.coordinates, // starting position [lng, lat]
    zoom: 14
});


map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(cafe.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${cafe.title}</h3><p>${cafe.location}</p>` //when you click on the point on the map, it would show the location 
            )
    )
    .addTo(map) 