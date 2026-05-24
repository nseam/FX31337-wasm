export function getIndicatorChartConfig(
  name: string,
  displayedSeries: number[],
  series: number[],
  min: string,
  max: string,
  dataLabels: number[]
) {
  return {
    type: 'line',
    data: {
      labels: dataLabels,
      datasets: [
        {
          label: name,
          data: displayedSeries,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 2,
          pointBackgroundColor: 'rgb(75, 192, 192)'
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: `${name} - Last ${displayedSeries.length} bars (Total: ${series.length})`
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Bar Index'
          }
        },
        y: {
          display: true,
          min: 0,
          max: 100,
          title: {
            display: true,
            text: `Value (actual range: ${min}-${max})`
          }
        }
      }
    }
  };
}

export function getCandlestickChartConfig(
  chartName: string,
  displayedOHLC: any[],
  ohlcData: any[],
  minPrice: string,
  maxPrice: string,
  dataLabels: number[]
) {
  return {
    type: 'line',
    data: {
      labels: dataLabels,
      datasets: [
        {
          label: 'Close',
          data: displayedOHLC.map(d => d.c),
          borderColor: 'rgb(33, 150, 243)',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 1,
          order: 1
        },
        {
          label: 'High',
          data: displayedOHLC.map(d => d.h),
          borderColor: 'rgb(76, 175, 80)',
          backgroundColor: 'rgba(76, 175, 80, 0.05)',
          borderWidth: 1,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          borderDash: [5, 5],
          order: 2
        },
        {
          label: 'Low',
          data: displayedOHLC.map(d => d.l),
          borderColor: 'rgb(244, 67, 54)',
          backgroundColor: 'rgba(244, 67, 54, 0.05)',
          borderWidth: 1,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          borderDash: [5, 5],
          order: 3
        },
        {
          label: 'Open',
          data: displayedOHLC.map(d => d.o),
          borderColor: 'rgb(255, 152, 0)',
          backgroundColor: 'rgba(255, 152, 0, 0.05)',
          borderWidth: 1,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          order: 4
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: `${chartName} - Last ${displayedOHLC.length} bars (Total: ${ohlcData.length})`
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Bar Index'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: `Price (range: ${minPrice}-${maxPrice})`
          }
        }
      }
    }
  };
}
