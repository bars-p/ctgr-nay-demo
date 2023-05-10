<template>
  <div id="map"></div>
</template>
<script>
import mapboxgl from "mapbox-gl";
export default {
  data() {
    return {
      access_token:
        "pk.eyJ1IjoiZmFrZXVzZXJnaXRodWIiLCJhIjoiY2pwOGlneGI4MDNnaDN1c2J0eW5zb2ZiNyJ9.mALv0tCpbYUPtzT7YysA2g",
      center: [76.924181, 43.255455],
      zoom: 11,
      map: {},
    };
  },
  methods: {
    async createMap() {
      try {
        mapboxgl.accessToken = this.access_token;
        this.map = new mapboxgl.Map({
          container: "map",
          // style: "mapbox://styles/mapbox/satellite-streets-v12",
          // style: "mapbox://styles/mapbox/streets-v12",
          // style: "mapbox://styles/mapbox/light-v11",
          // style: "mapbox://styles/mapbox/dark-v11",
          style: "mapbox://styles/mapbox/outdoors-v12",

          center: this.center,
          zoom: this.zoom,
          // projection: "globe",
        });
      } catch (err) {
        console.log("map error", err);
      }
    },
  },
  mounted() {
    this.createMap();
  },
};
</script>
<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
