/**
 * Chart.js Visualizations for AgriAI – Waste2Fuel Dashboards
 */

const ChartsModule = {
  cropChart: null,
  districtChart: null,
  pathwayChart: null,
  savingsChart: null,

  init(dashboardData) {
    if (!dashboardData || !window.Chart) return;

    this.renderCropDistribution(dashboardData.charts.biomassByCrop || []);
    this.renderDistrictDistribution(dashboardData.charts.biomassByDistrict || []);
    this.renderPathwaysDistribution(dashboardData.charts.pathwaysDistribution || []);
    this.renderLogisticsSavings();
  },

  renderCropDistribution(cropData) {
    const ctx = document.getElementById('chart-crop-distribution');
    if (!ctx) return;

    if (this.cropChart) this.cropChart.destroy();

    const labels = cropData.map(d => d.crop);
    const values = cropData.map(d => d.kg);

    this.cropChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#15803d', // Rice straw
            '#d97706', // Bagasse
            '#0284c7', // Cotton
            '#ca8a04', // Maize stalk
            '#7e22ce', // Coconut
            '#059669', // Rice husk
            '#ea580c'  // Groundnut
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: function(item) {
                return ` ${item.label}: ${item.raw.toLocaleString()} kg`;
              }
            }
          }
        }
      }
    });
  },

  renderDistrictDistribution(districtData) {
    const ctx = document.getElementById('chart-district-distribution');
    if (!ctx) return;

    if (this.districtChart) this.districtChart.destroy();

    const labels = districtData.map(d => d.district);
    const values = districtData.map(d => d.kg);

    this.districtChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Biomass Volume (kg)',
          data: values,
          backgroundColor: '#16a34a',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(val) {
                return (val / 1000) + ' t';
              }
            },
            grid: { color: '#f1f5f9' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderPathwaysDistribution(pathways) {
    const ctx = document.getElementById('chart-pathways');
    if (!ctx) return;

    if (this.pathwayChart) this.pathwayChart.destroy();

    const labels = pathways.map(p => p.pathway);
    const values = pathways.map(p => p.percentage);

    this.pathwayChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ['#16a34a', '#0284c7', '#d97706', '#8b5cf6'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: function(item) {
                return ` ${item.label}: ${item.raw}%`;
              }
            }
          }
        }
      }
    });
  },

  renderLogisticsSavings() {
    const ctx = document.getElementById('chart-logistics-savings');
    if (!ctx) return;

    if (this.savingsChart) this.savingsChart.destroy();

    this.savingsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Farmer A (500kg)', 'Farmer B (800kg)', 'Farmer C (700kg)', 'Farmer D (1000kg)', 'Cluster Total (3000kg)'],
        datasets: [
          {
            label: 'Individual Solo Transport Cost (₹)',
            data: [950, 950, 950, 1000, 3850],
            backgroundColor: '#ef4444',
            borderRadius: 4
          },
          {
            label: 'Pooled Cluster Transport Cost (₹)',
            data: [396, 634, 555, 795, 2380],
            backgroundColor: '#10b981',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: function(item) {
                return ` ${item.dataset.label}: ₹${item.raw.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(val) {
                return '₹' + val;
              }
            },
            grid: { color: '#f1f5f9' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
};

window.ChartsModule = ChartsModule;
