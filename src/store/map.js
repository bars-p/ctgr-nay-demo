// Utilities
import axios from "axios";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useMapStore = defineStore("mapStore", () => {
  const userSettingsShown = ref(false);

  const version = "0.0.4d";

  const mapStyles = [
    { value: 0, title: "Streets", uri: "mapbox://styles/mapbox/streets-v12" },
    {
      value: 1,
      title: "Satellite",
      uri: "mapbox://styles/mapbox/satellite-streets-v12",
    },
    { value: 2, title: "Outdoor", uri: "mapbox://styles/mapbox/outdoors-v12" },
    { value: 3, title: "Light", uri: "mapbox://styles/mapbox/light-v11" },
    { value: 4, title: "Dark", uri: "mapbox://styles/mapbox/dark-v11" },
  ];
  const activeMapStyle = ref(0);

  const isLayersSet = ref(false);
  const layersIdxs = {
    adminBorder: 0,
    adminFill: 1,
    zonesBorder: 2,
    zonesFill: 3,
    cellsFill: 4,
    cellsExtrusion: 5,
    cellsSaved: 6,
    cellsSelected: 7,
    adminAreaSelect: 8,
    adminAreasSelected: 9,
    zoneSelect: 10,
    zonesSelected: 11,
    savedAreasSelected: 12,
    sitesFill: 13,
    sitesCentroids: 14,
    stopsPoints: 15,
    sitesSelected: 16,
    sitesAnalytics: 17,
    ladsTraces: 18,
    ladsSelected: 19,
    measurePoints: 20,
    measureLines: 21,
    measureLabels: 22,
  };
  const layers = ref([
    { idx: 0, name: "admin-areas-border", shown: false },
    { idx: 1, name: "admin-areas-fill", shown: true },
    { idx: 2, name: "analytical-zones-border", shown: false },
    { idx: 3, name: "analytical-zones-fill", shown: false },
    { idx: 4, name: "cells-fill", shown: false },
    { idx: 5, name: "cells-extrusion", shown: false },
    { idx: 6, name: "cells-saved", shown: false },
    { idx: 7, name: "cells-selected", shown: false },
    { idx: 8, name: "admin-area-select", shown: false },
    { idx: 9, name: "admin-areas-selected", shown: false },
    { idx: 10, name: "zone-select", shown: false },
    { idx: 11, name: "zones-selected", shown: false },
    { idx: 12, name: "saved-areas-selected", shown: false },
    { idx: 13, name: "sites-fill", shown: false },
    { idx: 14, name: "sites-centroids", shown: false },
    { idx: 15, name: "stops-point", shown: false },
    { idx: 16, name: "sites-selected", shown: false },
    { idx: 17, name: "sites-analytics", shown: false },
    { idx: 18, name: "lads-traces", shown: false },
    { idx: 19, name: "lads-selected", shown: false },
    { idx: 20, name: "measure-points", shown: false },
    { idx: 21, name: "measure-lines", shown: false },
    { idx: 22, name: "measure-labels", shown: false },
  ]);

  const turnOnLayer = (idx) => {
    if (!layers.value[idx].shown) {
      layers.value[idx].shown = true;
    }
  };
  const turnOffLayer = (idx) => {
    if (layers.value[idx].shown) {
      layers.value[idx].shown = false;
    }
  };

  const updateLayers = (newState) => {
    layers.value = newState;
  };

  const newLayerPaint = ref(null);
  const newLayerFilter = ref(null);

  const centerItem = ref(null);

  const measureActive = ref(false);

  const colorLevels = [
    [192, 0, 0],
    [166, 107, 211],
    [128, 96, 0],
    [55, 86, 35],
    [0, 176, 80],
    [47, 117, 181],
  ];

  //
  // Social data
  //
  const socialColor = ref(null);
  const socialBars = ref(null);

  const selectedCellsFeatures = ref([]);

  const addCellToSelected = (feature) => {
    selectedCellsFeatures.value.push(feature);
  };
  const removeCellFromSelected = (feature) => {
    const idx = selectedCellsFeatures.value.findIndex(
      (item) => item.properties.id == feature.properties.id
    );
    console.warn("Index:", idx);
    selectedCellsFeatures.value.splice(idx, 1);

    // selectedCellsFeatures.value = selectedCellsFeatures.value.filter(
    //   (item) => item.properties.id != feature.properties.id
    // );
  };

  const clearSelectedCells = () => {
    selectedCellsFeatures.value = [];
  };
  const selectedSize = computed(() => {
    return selectedCellsFeatures.value.length * 10000;
  });
  const selectedPopulation = computed(() => {
    return selectedCellsFeatures.value.reduce(
      (sum, cur) => sum + cur.properties.pop,
      0
    );
  });
  const selectedPopulationDensity = computed(() => {
    return selectedCellsFeatures.value.length == 0
      ? 0
      : Math.round(
          selectedPopulation.value / selectedCellsFeatures.value.length
        );
  });
  const selectedEmployment = computed(() => {
    return selectedCellsFeatures.value.reduce(
      (sum, cur) => sum + cur.properties.emp,
      0
    );
  });
  const selectedEmploymentDensity = computed(() => {
    return selectedCellsFeatures.value.length == 0
      ? 0
      : Math.round(
          selectedEmployment.value / selectedCellsFeatures.value.length
        );
  });

  const savedCellsData = ref([]);
  const savedAreas = ref([]);
  const savedAreasNames = new Set(); // FIXME: Map() should be better name+color
  const clearSavedCellsData = () => {
    savedCellsData.value = [];
    savedAreas.value = [];
    savedAreasNames.clear();
  };
  const saveSelectedFeatures = (name, color) => {
    console.log("Save Params", name, color);
    console.log("Save Features", selectedCellsFeatures.value);
    let dataBlock = [...savedCellsData.value];
    if (savedAreasNames.has(name)) {
      dataBlock = dataBlock.filter((item) => item.properties.name != name);
    } else {
      savedAreasNames.add(name);
      savedAreas.value.push({ name, color });
    }
    console.log("Saved Areas", savedAreas);

    selectedCellsFeatures.value.forEach((item) =>
      dataBlock.push({
        ...item,
        properties: {
          ...item.properties,
          name: name,
          color: color,
        },
      })
    );
    console.log("Data to Save:", dataBlock);
    savedCellsData.value = [...dataBlock];
    console.log("Save Result:", savedCellsData.value);
    clearSelectedCells();
  };
  const removeFromSaved = (name) => {
    if (savedAreasNames.has(name)) {
      savedAreasNames.delete(name);
      savedAreas.value = savedAreas.value.filter((item) => item.name != name);
      savedCellsData.value = savedCellsData.value.filter(
        (item) => item.properties.name != name
      );
    } else {
      console.warn("Area name not found:", name);
    }
  };
  const updateSavedAreaColor = (name, color) => {
    savedCellsData.value = savedCellsData.value.map((item) => {
      if (item.properties.name != name) {
        return item;
      } else {
        return {
          ...item,
          properties: {
            ...item.properties,
            color: color,
          },
        };
      }
    });
  };
  const selectSavedArea = (name) => {
    const areaFeatures = savedCellsData.value.filter(
      (item) => item.properties.name == name
    );
    // console.log("Saved Data", savedCellsData.value);
    // console.log("Features found", [...areaFeatures]);
    selectedCellsFeatures.value = [...areaFeatures];
  };
  const clearSelectedColorMode = () => {
    if (socialColor.value != null) {
      socialColor.value = null;
    }
  };

  //
  // Demand data
  //
  const demandProcessing = ref(false);
  const demandLevel = ref(null);
  const demandReference = ref("selection");
  const demandSplit = ref(false);
  const demandReady = ref(false);
  const demandCityMax = 377; // FIXME: Calculate on data load or get from BE
  const demandDirection = ref("from");
  const demandSelectMode = ref("one");
  const demandItemsSelectedIds = new Set();
  const demandDistrictId = null;
  const demandIdsFromLevel = ref(null);
  const demandItemsForProcessing = ref([]);

  const demandProcessItems = () => {
    console.log("Map Store - Demand processed", demandProcessing.value);
    // demandProcessing.value = true;
    demandItemsForProcessing.value = [...demandItemsSelectedIds];
  };
  const demandResetData = () => {
    demandLevel.value = null;
    demandDirection.value = "from";
    demandSelectMode.value = "one";
    demandItemsSelectedIds.clear();
    demandIdsFromLevel.value = null;
    demandItemsForProcessing.value = [];
  };
  let demandConnectData = [];
  // FIXME: Data loading with BackEnd
  const loadDemandConnectData = async () => {
    if (demandConnectData.length == 0) {
      console.log("😡 Demand Connect data loading...");
      await axios
        .get("Almaty_demand_connect.json")
        .then((result) => (demandConnectData = result.data))
        .catch((err) => console.warn("Error loading Demand Connect data", err));
      console.log("😲 Loading finished", demandConnectData.length);
      await loadZonesByDistricts();
    }
  };
  const getDemandFrom = (id) => {
    return demandConnectData
      .filter((item) => item.fromId == id)
      .map((item) => ({ zoneId: item.toId, value: item.val }));
  };
  const getDemandTo = (id) => {
    return demandConnectData
      .filter((item) => item.toId == id)
      .map((item) => ({ zoneId: item.fromId, value: item.val }));
  };
  let zonesByDistricts = [];
  const loadZonesByDistricts = async () => {
    if (zonesByDistricts.length == 0) {
      await axios
        .get("Almaty_zone_id_district_id.json")
        .then((result) => (zonesByDistricts = result.data))
        .catch((err) =>
          console.warn("Error loading Zones by Districts data", err)
        );
    }
  };
  const getZoneIdsByDistrict = (id) => {
    console.log("Zones By Districts", zonesByDistricts.length);
    return zonesByDistricts
      .filter((item) => item.districtId == id)
      .map((item) => item.zoneId);
  };

  //
  // Sites data
  //
  let sitesData = ref([]);
  let sitesByDistricts = [];
  // FIXME: Data loading with BackEnd
  const loadSitesData = async () => {
    if (sitesData.value.length == 0) {
      await axios
        .get("Almaty_sites_data.json")
        .then((result) => (sitesData.value = result.data))
        .catch((err) => console.warn("Error loading Sites data", err));
    }
    if (sitesByDistricts.length == 0) {
      await axios
        .get("Almaty_site_id_district_id.json")
        .then((result) => (sitesByDistricts = result.data))
        .catch((err) =>
          console.warn("Error loading Sites by Districts data", err)
        );
    }
  };
  const getSiteName = (id) => {
    return (
      sitesData.value.find((site) => site.id == id).name || "Name not found"
    );
  };
  const getSiteStopIds = (id) => {
    return sitesData.value.find((site) => site.id == id).stop_ids || [];
  };
  const getSitesByDistrict = (districtId) => {
    return sitesByDistricts
      .filter((item) => item.districtId == districtId)
      .map((item) => item.siteId);
  };

  const sitesColor = ref("#FFB74D");
  const centroidsColor = ref("#3F51B5");
  const stopsColor = ref("#039BE5");
  const sitesSelectionMode = ref(null);

  const selectedSiteIds = ref(new Set());
  const currentSitesGroup = ref(null);
  const useCurrentSiteGroup = ref(false);

  const savedSitesGroups = ref([]);
  const updateSavedSitesGroup = (idx, groupData) => {
    savedSitesGroups.value[idx] = groupData;
  };
  const siteSizeMode = ref(null);
  const siteColorMode = ref(null);
  const siteSizeStep = ref(2);

  //
  // Routes data
  //
  const routesSelectMode = ref(null);

  const routesSelectedIds = ref(new Set());
  const useCurrentRoutesGroup = ref(false);
  const currentRoutesGroup = ref(null);
  const savedRoutesGroups = ref([]);
  const updateSavedRoutesGroup = (idx, groupData) => {
    savedRoutesGroups.value[idx] = groupData;
  };

  const showRouteInfo = ref(false);

  const skeletonColor = ref("#90A4AE");
  const busColor = ref("#00b300");
  const trolleyColor = ref("#00ace6");
  const subwayColor = ref("#ff3300");

  const modesDisplay = ref([
    {
      mode: "Bus",
      color: busColor.value,
      shown: true,
    },
    {
      mode: "Trolley",
      color: trolleyColor.value,
      shown: true,
    },
    {
      mode: "Subway",
      color: subwayColor.value,
      shown: true,
    },
    {
      mode: "Unknown",
      color: skeletonColor.value,
      shown: true,
    },
  ]);

  const linesData = ref([]);
  const ladsData = ref([]);
  const routesData = ref([]);

  const loadRoutesData = async () => {
    if (linesData.value.length == 0) {
      await axios
        .get("Almaty_lines.json")
        .then((result) => (linesData.value = result.data))
        .catch((err) => console.warn("Error loading Lines data", err));
    }
    if (ladsData.value.length == 0) {
      await axios
        .get("Almaty_lads.json")
        .then((result) => (ladsData.value = result.data))
        .catch((err) => console.warn("Error loading LADs data", err));
    }
    if (routesData.value.length == 0) {
      await axios
        .get("Almaty_routes.json")
        .then((result) => (routesData.value = result.data))
        .catch((err) => console.warn("Error loading Routes data", err));
    }
    console.log(
      "Loaded Routes Data",
      linesData.value.length,
      ladsData.value.length,
      routesData.value.length
    );
  };

  const getRouteName = (id) => {
    const lad = ladsData.value.find((lad) => lad.ladId == id);
    const line = linesData.value.find((line) => line.line == lad?.line);
    const mode = line ? line.mode : "Unknown";
    return lad ? lad.line + " -> " + lad.dir + " (" + mode + ")" : "Not found";
  };
  const getModeColor = (id) => {
    let color = skeletonColor.value;
    const lad = ladsData.value.find((lad) => lad.ladId == id);
    const line = linesData.value.find((line) => line.line == lad?.line);
    if (lad && line) {
      const mode = line.mode;
      switch (mode) {
        case "Bus":
          color = busColor.value;
          break;
        case "Trolley":
          color = trolleyColor.value;
          break;
        case "Subway":
          color = subwayColor.value;
          break;

        default:
          break;
      }
    }

    return color;
  };

  const getLadsBySite = (id) => {
    const ladsIds = routesData.value
      .filter((item) => item.siteId == id)
      .map((item) => item.ladId);
    const result = new Set(ladsIds);
    return [...result];
  };

  const getSitesByLad = (id) => {
    const sitesIds = routesData.value
      .filter((item) => item.ladId == id)
      .map((item) => item.siteId);
    const result = new Set(sitesIds);
    return [...result];
  };

  //
  // Connectivity data
  //
  const connectivityType = ref(null);
  const connectivityDirection = ref("from");
  const connectivityGeneralDirection = ref("between");
  const connectivitySelectMode = ref("one");
  const connectivityUseSpeedValues = ref(false);

  const connectivityItemsSelectedIds = new Set();
  const connectivityIdsFromType = ref(null);
  const connectivityItemsForProcessing = ref([]);
  const connectivityProcessed = ref(false);

  const connectivityMapData = ref(null);

  const connectivityDemandAbove = ref(6);
  const connectivityBelow = ref(1);
  const connectivitySpeedBelow = ref(0);

  const currentConnectionsGroup = ref(null);
  const savedConnectionsGroups = ref([]);

  const connectivityProcessItems = () => {
    console.log(
      "Map Store - Connectivity processed",
      connectivityItemsSelectedIds
    );
    connectivityItemsForProcessing.value = [...connectivityItemsSelectedIds];
  };
  const connectivityResetData = () => {
    // connectivityLevel.value = null;
    connectivityDirection.value = "from";
    connectivitySelectMode.value = "one";
    connectivityItemsSelectedIds.clear();
    connectivityIdsFromType.value = null;
    connectivityItemsForProcessing.value = [];
    connectivityProcessed.value = false;
    connectivityType.value = null;
    connectivityMapData.value = [];

    connectivityDemandAbove.value = 6;
    connectivityBelow.value = 1;
    connectivitySpeedBelow.value = 0;
    connectivityUseSpeedValues.value = false;

    currentConnectionsGroup.value = null;
  };

  const getConnectivityFrom = (id) => {
    // For Speed add Demand data to aggregate several Zones selected
    return connectivityType.value == "speed"
      ? demandConnectData
          .filter((item) => item.fromId == id)
          .map((item) => ({ zoneId: item.toId, value: item.sp, dm: item.dm }))
      : demandConnectData
          .filter((item) => item.fromId == id)
          .map((item) => ({ zoneId: item.toId, value: item.ch, dm: item.dm }));
  };
  const getConnectivityTo = (id) => {
    // For Speed add Demand data to aggregate several Zones selected
    return connectivityType.value == "speed"
      ? demandConnectData
          .filter((item) => item.toId == id)
          .map((item) => ({ zoneId: item.fromId, value: item.sp, dm: item.dm }))
      : demandConnectData
          .filter((item) => item.toId == id)
          .map((item) => ({
            zoneId: item.fromId,
            value: item.ch,
            dm: item.dm,
          }));
  };

  const getConnectivityMap = () => {
    let data = null;

    if (connectivityUseSpeedValues.value) {
      if (connectivitySpeedBelow.value < 0) {
        connectivitySpeedBelow.value = 0;
        data = [];
      } else {
        data = demandConnectData.filter(
          (item) =>
            item.dm >= connectivityDemandAbove.value &&
            item.kmh <= connectivitySpeedBelow.value
        );
      }
    } else {
      data = demandConnectData.filter(
        (item) =>
          item.dm >= connectivityDemandAbove.value &&
          item.sp <= connectivityBelow.value
      );
    }

    return data;
  };

  const getZonesFilteredConnections = () => {
    let data = [];

    // Look through selected connection if they exist otherwise process all data
    const dataSource = connectivityMapData.value?.length
      ? connectivityMapData.value
      : demandConnectData;

    console.log(
      "Filter Zones Direction",
      connectivityGeneralDirection.value,
      connectivityItemsSelectedIds
    );

    if (connectivityUseSpeedValues.value) {
      if (connectivitySpeedBelow.value < 0) {
        connectivitySpeedBelow.value = 0;
      }
    }

    switch (connectivityGeneralDirection.value) {
      case "from":
        connectivityItemsSelectedIds.forEach((id) => {
          const conns = dataSource
            .filter((item) => item.fromId == id)
            .filter(
              (item) =>
                item.dm >= connectivityDemandAbove.value &&
                (connectivityUseSpeedValues.value
                  ? item.kmh <= connectivitySpeedBelow.value
                  : item.sp <= connectivityBelow.value)
            );
          data = data.concat(conns);
          // data = [...conns];
        });
        break;

      case "to":
        connectivityItemsSelectedIds.forEach((id) => {
          const conns = dataSource
            .filter((item) => item.toId == id)
            .filter(
              (item) =>
                item.dm >= connectivityDemandAbove.value &&
                (connectivityUseSpeedValues.value
                  ? item.kmh <= connectivitySpeedBelow.value
                  : item.sp <= connectivityBelow.value)
            );
          data = data.concat(conns);
        });
        break;

      case "between":
        connectivityItemsSelectedIds.forEach((idFrom) => {
          let conns = [];
          connectivityItemsSelectedIds.forEach((idTo) => {
            conns.push(
              ...dataSource.filter(
                (item) => item.fromId == idFrom && item.toId == idTo
              )
            );
          });
          conns = conns.filter(
            (item) =>
              item.dm >= connectivityDemandAbove.value &&
              (connectivityUseSpeedValues.value
                ? item.kmh <= connectivitySpeedBelow.value
                : item.sp <= connectivityBelow.value)
          );
          data = data.concat(conns);
        });
        break;

      default:
        break;
    }

    console.log("Data Found", data);

    return data;
  };

  //
  // Accessability Data
  //
  const populationAbove = ref(0);
  const accessabilityBelow = ref(6);
  // const accessGapColor = ref("#ff0000");
  const accessabilityResetData = () => {
    populationAbove.value = 0;
    accessabilityBelow.value = 6;
  };

  return {
    userSettingsShown,
    version,
    mapStyles,
    activeMapStyle,
    isLayersSet,
    layersIdxs,
    layers,
    colorLevels,
    newLayerPaint,
    newLayerFilter,
    turnOnLayer,
    turnOffLayer,
    updateLayers,
    centerItem,
    measureActive,
    socialColor,
    socialBars,
    selectedCellsFeatures,
    savedCellsData,
    savedAreas,
    clearSavedCellsData,
    saveSelectedFeatures,
    removeFromSaved,
    updateSavedAreaColor,
    selectSavedArea,
    selectedSize,
    selectedPopulation,
    selectedPopulationDensity,
    selectedEmployment,
    selectedEmploymentDensity,
    addCellToSelected,
    removeCellFromSelected,
    clearSelectedCells,
    clearSelectedColorMode,

    // demandConnectData, // FIXME: Access by getters
    loadDemandConnectData,
    getDemandFrom,
    getDemandTo,
    demandProcessing,
    demandLevel,
    demandReference,
    demandSplit,
    demandReady,
    demandCityMax,
    demandDirection,
    demandSelectMode,
    demandItemsSelectedIds,
    demandDistrictId,
    demandIdsFromLevel,
    demandItemsForProcessing,
    demandProcessItems,
    demandResetData,
    getZoneIdsByDistrict,

    // Routes
    routesSelectMode,
    routesSelectedIds,
    showRouteInfo,
    skeletonColor,
    busColor,
    trolleyColor,
    subwayColor,
    modesDisplay,
    linesData,
    ladsData,
    routesData,
    loadRoutesData,
    useCurrentRoutesGroup,
    currentRoutesGroup,
    savedRoutesGroups,
    updateSavedRoutesGroup,
    getRouteName,
    getModeColor,
    getLadsBySite,
    getSitesByLad,

    // Sites
    sitesData,
    loadSitesData,
    getSiteName,
    getSiteStopIds,
    getSitesByDistrict,
    sitesColor,
    centroidsColor,
    stopsColor,
    sitesSelectionMode,
    selectedSiteIds,
    currentSitesGroup,
    useCurrentSiteGroup,
    savedSitesGroups,
    updateSavedSitesGroup,
    siteSizeMode,
    siteColorMode,
    siteSizeStep,

    //Connectivity
    connectivityType,
    connectivityDirection,
    connectivityGeneralDirection,
    connectivitySelectMode,
    connectivityUseSpeedValues,
    connectivityItemsSelectedIds,
    connectivityIdsFromType,
    connectivityItemsForProcessing,
    connectivityProcessItems,
    connectivityResetData,
    getConnectivityFrom,
    getConnectivityTo,
    connectivityProcessed,
    connectivityDemandAbove,
    connectivityBelow,
    connectivitySpeedBelow,
    getConnectivityMap,
    getZonesFilteredConnections,
    connectivityMapData,
    currentConnectionsGroup,
    savedConnectionsGroups,
    populationAbove,
    accessabilityBelow,
    accessabilityResetData,
  };
});
