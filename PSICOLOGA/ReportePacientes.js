// ReportePacientes.js
document.addEventListener('DOMContentLoaded', () => {
  const alertPlaceholder = document.getElementById('alertPlaceholder');
  const selYear  = document.getElementById('rep-year');
  const selMonth = document.getElementById('rep-month');
  const btnView  = document.getElementById('btnViewReport');
  const statusEl = document.getElementById('status-count');

  let chartMotive, chartBranch;

  // Muestra una alerta bootstrap en el placeholder
  function showAlert(msg, type='success') {
    alertPlaceholder.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  }

  // Rellena los selects de año y mes
  function populateFilters() {
    const now = new Date();
    // Años: de -5 hasta +1 respecto al actual
    for (let y = now.getFullYear() - 5; y <= now.getFullYear() + 1; y++) {
      const o = document.createElement('option');
      o.value = y;
      o.textContent = y;
      if (y === now.getFullYear()) o.selected = true;
      selYear.append(o);
    }
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    meses.forEach((m,i) => {
      const o = document.createElement('option');
      o.value = i + 1;
      o.textContent = m;
      if (i === now.getMonth()) o.selected = true;
      selMonth.append(o);
    });
  }

  // Inicializa los gráficos de Chart.js (pie y barra)
  function initCharts() {
    const ctxM = document.getElementById('chart-motive').getContext('2d');
    chartMotive = new Chart(ctxM, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      },
      options: { responsive: true }
    });

    const ctxB = document.getElementById('chart-branch').getContext('2d');
    chartBranch = new Chart(ctxB, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Pacientes',
          data: [],
          backgroundColor: []
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // Carga el reporte desde report.php y actualiza UI + gráficos
  async function loadReport(year, month) {
    try {
      const res = await fetch(`report.php?year=${year}&month=${month}`);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();

      // Actualiza contador
      statusEl.textContent = `${json.seen} / ${json.upcoming}`;

      // Actualiza gráfico de motivos (pie)
      const motives = Object.keys(json.motiveCounts);
      const motiveData = Object.values(json.motiveCounts);
      chartMotive.data.labels = motives;
      chartMotive.data.datasets[0].data = motiveData;
      chartMotive.data.datasets[0].backgroundColor = motives.map((_,i) =>
        Chart.helpers.color(`hsl(${i*60},80%,70%)`).rgbString()
      );
      chartMotive.update();

      // Actualiza gráfico de sucursales (barra)
      const branches = Object.keys(json.branchCounts);
      const branchData = Object.values(json.branchCounts);
      chartBranch.data.labels = branches;
      chartBranch.data.datasets[0].data = branchData;
      chartBranch.data.datasets[0].backgroundColor = branches.map((_,i) =>
        Chart.helpers.color(`hsl(${i*60},60%,60%)`).rgbString()
      );
      chartBranch.update();

    } catch (err) {
      console.error(err);
      showAlert('Error al cargar el reporte.', 'danger');
    }
  }

  // Evento click en "Ver reporte"
  btnView.addEventListener('click', () => {
    loadReport(selYear.value, selMonth.value);
  });

  // Inicialización al cargar la página
  populateFilters();
  initCharts();
  loadReport(selYear.value, selMonth.value);
});
