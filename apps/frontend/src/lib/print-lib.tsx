import { createRoot } from 'react-dom/client'

export function printReciept() {
  const newWindow = window.open('', '_blank', 'width=500,height=800')
  if (!newWindow) {
    alert('Cant open reciept popup window')
    return
  }

  const container = newWindow.document.createElement('div')
  newWindow.document.body.appendChild(container)
  const styleEle = document.createElement('style')
  styleEle.innerText = styles
  newWindow.document.head.appendChild(styleEle)

  const root = createRoot(container)
  root.render(<div style={{ padding: '30px' }}>Example receipt</div>)

  setTimeout(() => {
    newWindow.focus()
    newWindow.print()
  }, 300)

  newWindow.addEventListener('beforeunload', () => {
    root.unmount()
  })
}

const styles = `
/* Zero out native browser print margins & force 80mm thermal canvas */
@page {
  size: 80mm auto;
  margin: 0mm;
}

@media print {
  html, body {
    width: 80mm;
    margin: 0;
    padding: 0;
    background: #fff;
  }
}

* {
  box-sizing: border-box;
  /* Use standard monospace fallback stack for consistent thermal grid rendering */
  font-family: 'Courier New', Courier, 'Consolas', monospace;
  font-size: 11px;
  line-height: 1.3;
  color: #000000; /* Thermal print heads require true black (#000000) */
  -webkit-print-color-adjust: exact;
}

body {
  width: 80mm;
  margin: 0 auto;
  padding: 4mm 5mm 8mm 5mm; /* Safe edge margin to avoid cut-off from print head alignment */
  background: #ffffff;
  text-align: center;  /* optional */
}
`
