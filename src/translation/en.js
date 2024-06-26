export default {
  test: {
    text: "English language",
  },

  // General
  general: {
    m: "m",
    km: "km",
    kmh: "kmh",
    perKm: "per km",
    perCell: "per cell",
    size: "Size",

    population: "Population",
    employment: "Employment",
    poi: "POI",

    noData: "No data",

    workdayMorning: "Workday, morning peak",
    workdayMidday: "Workday, midday",
    weekendMidday: "Weekend, midday",

    max: "Max",
    step: "Step",
    distribution: "Distribution",
    search: "Search",
    add: "Add",
    replace: "Replace",
    clear: "Clear",
    displayOptions: "Display options",
    direction: "Direction",
    mode: "Mode",
    from: "From",
    to: "To",
    between: "Between",
    one: "One",
    many: "Many",
    level: "Level",
    selected: "Selected",
    notSelected: "Not selected",
  },

  // Navigation Items
  navigation: {
    fallbackProjectName: "Project Name",
    fallbackUserName: "Demo User",

    mapStyle: "Map style",

    menuGroupCity: "CITY",
    menuItemSocial: "Social Data",
    menuItemDemand: "Travel Demand",

    menuGroupNetwork: "PUBLIC TRANSPORT",
    menuItemRoutes: "Routes",
    menuItemStops: "Stops",
    menuItemSites: "Sites",

    menuGroupAnalytics: "ANALYTICS",
    menuItemDuplication: "Duplication",
    menuItemDirectness: "Directness",
    menuItemRidership: "Ridership",
    menuItemConnectivity: "Connectivity",
    menuItemAccess: "Accessability",

    menuGroupReports: "AUTO-REPORTS",
    menuItemReportArea: "Area",
    menuItemReportSegment: "Segment",
    menuItemReportRoute: "Route",

    menuGroupTools: "TOOLS",
    menuItemToolsDeadhead: "Deadheads",
    menuItemToolsPuls: "Pulls",
    menuItemToolsSites: "Sites",

    menuGroupEdit: "EDIT DATA",
    menuItemEditRoutes: "Routes",
    menuItemEditStops: "Stops",
    menuItemEditSites: "Sites",
    menuItemEditZones: "Zones",
    menuItemEditCells: "Cells",
  },

  // Map Items
  map: {
    layerBorders: "Borders",
    layerDistricts: "Districts",
    layerGrid: "Grid",
    layerZones: "Zones",
    layerCells: "Cells",
    layerSites: "Sites",
    layerCentroids: "Centroids",
    layerStops: "Stops",
    layerRoutes: "Routes",
  },

  // Tools Items
  tools: {
    //Social Data
    socialColor: "Color",
    socialBars: "Bars",
    socialMix: `Enable "Mix-mode"`,
    socialLayers: "Show layers:",
    socialBoundary: "Area boundaries",
    socialZones: "Analytical zones",
    socialSavedDisplay: "Saved areas",
    socialSelected: "Selected area:",
    socialName: "Selection name",
    socialSaved: "Saved areas:",
    socialLayerPopulation: "Population",
    socialLayerEmployment: "Employment",
    socialLayerMix: "Mix (Pop / Emp)",
    socialLayerVisitors: "Visitors",
    socialLayerPopulationNext: "Population (+5 years)",
    socialLayerEmploymentNext: "Employment (+5 years)",
    socialSelectedTooMany: "Select a smaller number of features",

    // Travel Demand
    demandLevel: "Area type",
    demandReference: "Reference level",
    demandSelection: "Selection",
    demandCity: "City",
    demandGlobal: "Global",
    demandAdminAreas: "Districts",
    demandSplit: "Split demand by cells",

    // Routes
    routesSelectMode: "Select mode",
    routesSelect: "Select routes",
    routesDialogSelect: "Select",
    routesDialogClose: "Close",
    routesLads: "Routes",
    routesDistributionTitle: "Routes distribution",
    routesSearchTitle: "Routes search",
    routesSkeleton: "Network skeleton",
    routesStops: "Stops",
    routesLadsSelected: "Routes selected",
    routesAddTooltip: "Add selected Routes",
    routesReplaceTooltip: "Replace with selected Routes",
    routesSaved: "Saved groups",
    routesLadGroup: "Routes group",
    routesGroupName: "Routes group name",
    routesLadColor: "Color",
    routesLadWidth: "Width",
    routesFrequency: "Frequency",
    routesRidership: "Ridership",
    routesSpeed: "Speed",
    routesLoad: "Load",
    routesMode: "Transit mode",
    routesModeBus: "Bus",
    routesModeTrolley: "Trolleybus",
    routesModeSubway: "Subway",
    routesModeOther: "Other modes",
    routesUseCurrent: "Use current routes group",
    routesSitesList: "Sites sequence",
    routesStats: "Route statistics",
    routesSegmentWidth: "Segment width",
    routesSegmentSpeed: "Show segments speed",

    // Stops
    // stopsSelectMode: "Select mode",
    // stopsSelect: "Select stops",
    // stopsSitesSelect: "Select sites",
    // stopsSites: "Sites",
    // stopsStopsSelected: "Stops selected",
    // stopsAddTooltip: "Add selected Stops",
    // stopsReplaceTooltip: "Replace with selected Stops",
    // stopsTripsNumber: "Trips number",
    // stopsLadsNumber: "LADs number",
    // stopsBoarding: "Boarding",
    // stopsAlighting: "Alighting",
    // stopsDistributionTitle: "Stops distribution",
    // stopsSearchTitle: "Stops search",
    // stopsStopsGroup: "Stops group",
    // stopsGroupName: "Stops group name",
    // stopsColor: "Stop color",
    // stopsSize: "Stop size",
    // stopsShape: "Stop shape",

    // Sites
    sitesSelectMode: "Select mode",
    sitesSelect: "Select sites",
    sitesSites: "Sites",
    sitesCentroids: "Site centroids",
    sitesSelected: "Sites selected",
    sitesAddTooltip: "Add selected Sites",
    sitesReplaceTooltip: "Replace with selected Sites",
    sitesTripsNumber: "Trips number",
    sitesLadsNumber: "LADs number",
    sitesBoarding: "Boarding",
    sitesAlighting: "Alighting",
    sitesBoardingTotal: "Boarding all routes",
    sitesAlightingTotal: "Alighting all routes",
    sitesCapacity: "Transit capacity",
    sitesFlowAfter: "Load volume",
    sitesDistributionTitle: "Sites distribution",
    sitesSearchTitle: "Sites search",
    sitesGroup: "Sites group",
    sitesGroupName: "Sites group name",
    sitesColor: "Site color",
    sitesSize: "Site size",
    sitesShape: "Site shape",
    sitesId: "Site ID",
    sitesName: "Name",
    sitesUseCurrent: "Use current sites group",

    //Connectivity
    connectivityType: "Type of connectivity",
    connectivitySpeed: "Transit integrated speed",
    connectivityRoute: "Transfer level",
    connectivityGeneral: "General connectivity",
    connectivityGaps: "Demand level filter",
    connectivityDemand: "Demand level above",
    connectivityBelow: "Connectivity level below",
    connectivityConnections: "Connections",
    connectivityUseSpeed: "Use speed values data",
    connectivitySpeedBelow: "Speed value below",
    connectivityDetails: "Speed, Level, Demand",
    connectivityZones: "Zones selected",
    connectivityTooMany: "Too many connection to display",
    connectionsGroupName: "Connections group name",
    connectivityOrder: "Order connections by",
    connectivitySpeedAsc: "Speed, Ascending (kmh)",
    connectivitySpeedDes: "Speed, Descending (kmh)",
    connectivityConnAsc: "Connectivity level, Ascending",
    connectivityConnDes: "Connectivity level, Descending",
    connectivityDemandAsc: "Demand level, Ascending",
    connectivityDemandDes: "Demand level, Descending",
    connectivityNTop: "Get top N  items",

    //Accessability
    accessToolsTitle: "Walking Accessability",
    accessHighlight: "Highlight areas",
    accessPopulation: "Population above",
    accessAccessability: "Accessability below",
  },
};
