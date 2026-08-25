/**
 * Leaflet Interactive Map Module for AgriAI – Waste2Fuel
 */

const MapModule = {
  map: null,
  farmLayer: null,
  facilityLayer: null,
  clusterLayer: null,
  routeLayer: null,

  init(containerId = 'biomass-map') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Center on Guntur / Amaravati / Vijayawada agro basin, Andhra Pradesh
    const defaultLat = 16.3067;
    const defaultLng = 80.4365;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    this.map = L.map(containerId, {
      center: [defaultLat, defaultLng],
      zoom: 9,
      scrollWheelZoom: true
    });

    // OpenStreetMap Standard Free Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | AgriAI Prototype'
    }).addTo(this.map);

    this.farmLayer = L.layerGroup().addTo(this.map);
    this.facilityLayer = L.layerGroup().addTo(this.map);
    this.clusterLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);

    // Initial load of markers
    this.loadMapData();
  },

  createCustomIcon(type) {
    let color = '#15803d'; // Green for farms
    let iconChar = '🌾';

    if (type === 'facility') {
      color = '#0284c7'; // Blue for facilities
      iconChar = '🏭';
    } else if (type === 'cluster') {
      color = '#7e22ce'; // Purple for clusters
      iconChar = '🚛';
    }

    return L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="
        background: ${color};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        border: 2px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${iconChar}</span>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  },

  async loadMapData() {
    try {
      // Clear previous layers
      this.farmLayer.clearLayers();
      this.facilityLayer.clearLayers();
      this.clusterLayer.clearLayers();

      // 1. Fetch & Render Facilities
      const facilitiesRes = await API.getFacilities();
      if (facilitiesRes.data) {
        facilitiesRes.data.forEach(fac => {
          const marker = L.marker([fac.latitude, fac.longitude], {
            icon: this.createCustomIcon('facility')
          });

          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; min-width: 200px;">
              <span style="background: #e0f2fe; color: #0284c7; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">DEMO FACILITY</span>
              <h4 style="margin: 6px 0 2px 0; color: #0f172a; font-size: 14px;">${fac.name}</h4>
              <p style="color: #64748b; margin: 0 0 6px 0;"><strong>Type:</strong> ${fac.type}</p>
              <p style="margin: 0 0 4px 0;"><strong>Capacity:</strong> ${fac.capacityTpd} Tonnes/Day</p>
              <p style="margin: 0 0 4px 0;"><strong>Min Lot:</strong> ${fac.minimumQuantity} kg</p>
              <p style="margin: 0 0 8px 0;"><strong>Contact:</strong> ${fac.phone}</p>
              <div style="font-size: 11px; color: #059669; font-weight: 600;">Status: Operational</div>
            </div>
          `;

          marker.bindPopup(popupContent);
          this.facilityLayer.addLayer(marker);
        });
      }

      // 2. Fetch & Render Farms
      const farmsRes = await API.getFarms();
      if (farmsRes.data) {
        farmsRes.data.forEach(farm => {
          const marker = L.marker([farm.latitude, farm.longitude], {
            icon: this.createCustomIcon('farm')
          });

          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; min-width: 190px;">
              <span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">FARM LOT</span>
              <h4 style="margin: 6px 0 2px 0; color: #0f172a; font-size: 14px;">${farm.farmerName}</h4>
              <p style="color: #64748b; margin: 0 0 4px 0;">📍 ${farm.location}</p>
              <p style="margin: 0 0 4px 0;"><strong>Waste:</strong> ${farm.wasteTypeName}</p>
              <p style="margin: 0 0 4px 0;"><strong>Quantity:</strong> ${farm.quantity} kg (${farm.condition})</p>
              <p style="margin: 0 0 6px 0;"><strong>Harvest:</strong> ${farm.harvestDate}</p>
              <div style="color: #d97706; font-size: 11px; font-weight: 600;">Status: ${farm.status}</div>
            </div>
          `;

          marker.bindPopup(popupContent);
          this.farmLayer.addLayer(marker);
        });
      }

      // 3. Fetch & Render Aggregation Clusters
      const clustersRes = await API.getCollections();
      if (clustersRes.data) {
        clustersRes.data.forEach(cluster => {
          const marker = L.marker([cluster.centerLatitude, cluster.centerLongitude], {
            icon: this.createCustomIcon('cluster')
          });

          // Draw cluster radius circle
          const circle = L.circle([cluster.centerLatitude, cluster.centerLongitude], {
            color: '#7e22ce',
            fillColor: '#a855f7',
            fillOpacity: 0.15,
            radius: 8000 // 8km coverage
          });

          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; min-width: 220px;">
              <span style="background: #f3e8ff; color: #7e22ce; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">COMMUNITY POOL</span>
              <h4 style="margin: 6px 0 2px 0; color: #0f172a; font-size: 14px;">${cluster.name}</h4>
              <p style="color: #64748b; margin: 0 0 4px 0;"><strong>Waste:</strong> ${cluster.wasteTypeName}</p>
              <p style="margin: 0 0 4px 0;"><strong>Total Volume:</strong> ${cluster.totalBiomassKg} kg (${cluster.farmerCount} Farmers)</p>
              <p style="margin: 0 0 4px 0;"><strong>Destination:</strong> ${cluster.destinationFacilityName}</p>
              <p style="color: #15803d; font-weight: 700; margin: 0 0 6px 0;">Logistics Savings: ₹${cluster.logisticsSavings}</p>
              <div style="font-size: 11px; color: #7e22ce; font-weight: 600;">Status: ${cluster.status}</div>
            </div>
          `;

          marker.bindPopup(popupContent);
          this.clusterLayer.addLayer(marker);
          this.clusterLayer.addLayer(circle);
        });
      }

    } catch (err) {
      console.error('Error loading map layers:', err);
    }
  },

  filterLayers(showFarms, showFacilities, showClusters) {
    if (!this.map) return;
    if (showFarms) this.map.addLayer(this.farmLayer); else this.map.removeLayer(this.farmLayer);
    if (showFacilities) this.map.addLayer(this.facilityLayer); else this.map.removeLayer(this.facilityLayer);
    if (showClusters) this.map.addLayer(this.clusterLayer); else this.map.removeLayer(this.clusterLayer);
  }
};

window.MapModule = MapModule;
