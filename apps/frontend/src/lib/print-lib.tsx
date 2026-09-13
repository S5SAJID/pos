import { shopConfig } from '#/lib/shop-config.ts'
import { createRoot } from 'react-dom/client'

export interface ReceiptItem {
  name: string
  quantity: number
  unitPrice: number
}

export interface ReceiptData {
  orderId: string
  items: ReceiptItem[]
  total: number
  paymentMethod: string
  createdAt: Date
}

export function printReciept(data: ReceiptData) {
  const newWindow = window.open('', '_blank', 'width=500,height=800')
  if (!newWindow) {
    alert('Could not open receipt window. Please allow popups for this site.')
    return
  }

  const container = newWindow.document.createElement('div')
  newWindow.document.body.appendChild(container)

  const styleEl = newWindow.document.createElement('style')
  styleEl.innerText = receiptStyles
  newWindow.document.head.appendChild(styleEl)

  const root = createRoot(container)
  root.render(<ReceiptDocument data={data} />)

  setTimeout(() => {
    newWindow.focus()
    newWindow.print()
  }, 300)

  newWindow.addEventListener('beforeunload', () => {
    root.unmount()
  })
}

function ReceiptDocument({ data }: { data: ReceiptData }) {
  const { name, address, phone, currency, tagline } = shopConfig
  const { orderId, items, total, paymentMethod, createdAt } = data
  const dateStr = createdAt.toLocaleDateString()
  const timeStr = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const paymentLabel: Record<string, string> = {
    CASH: 'Cash',
    CARD: 'Card',
    EASYPAISA: 'Easypaisa',
  }

  return (
    <div>
      {/* Header */}
      <div className="center bold large">{name}</div>
      <div className="center bold">{tagline}</div>
      <div className="center">{address}</div>
      <div className="center">{phone}</div>

      <div className="divider" />

      <div className="row">
        <span>Order ID:</span>
        <span>{orderId.slice(0, 8).toUpperCase()}</span>
      </div>
      <div className="row">
        <span>Date:</span>
        <span>{dateStr}</span>
      </div>
      <div className="row">
        <span>Time:</span>
        <span>{timeStr}</span>
      </div>

      <div className="divider" />

      {/* Column headers */}
      <div className="row header-row">
        <span className="col-name">Item</span>
        <span className="col-qty">Qty</span>
        <span className="col-price">Price</span>
        <span className="col-sub">Sub</span>
      </div>

      <div className="divider-thin" />

      {/* Line items */}
      {items.map((item, i) => (
        <div key={i} className="row">
          <span className="col-name">{item.name}</span>
          <span className="col-qty">{item.quantity}</span>
          <span className="col-price">
            {currency}
            {item.unitPrice.toFixed(2)}
          </span>
          <span className="col-sub">
            {currency}
            {(item.unitPrice * item.quantity).toFixed(2)}
          </span>
        </div>
      ))}

      <div className="divider" />

      <div className="row bold">
        <span>TOTAL</span>
        <span className="medium">
          {currency}
          {total.toFixed(2)}
        </span>
      </div>
      <div className="row">
        <span>Payment</span>
        <span>{paymentLabel[paymentMethod] ?? paymentMethod}</span>
      </div>

      <div className="divider" />
      <div className="center small bold">{data.orderId}</div>
      <div className="divider" />

      <div className="center">Thank you for your purchase!</div>
      <div className="center small">Please come again</div>
    </div>
  )
}

const receiptStyles = `
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
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'Courier New', monospace;
  font-size: 9px;
  line-height: 1.5;
  color: #000000;
  -webkit-print-color-adjust: exact;
}

body {
  width: 80mm;
  margin: 0 auto;
  padding: 4mm 5mm 8mm 5mm;
  background: #ffffff;
}

.center { text-align: center; margin-bottom: 2px; }
.bold { font-weight: bold; }
.large { font-size: 14px; margin-bottom: 2px; }
.large { font-size: 14px; }
.small {  } 

.medium { font-size: 12px; }

.divider {
  border-top: 1px dashed #000;
  margin: 6px 0;
}
.divider-thin {
  border-top: 1px solid #000;
  margin: 3px 0;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.header-row { font-weight: bold; }

.col-name { flex: 2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-qty  { flex: 0.5; text-align: center; }
.col-price { flex: 1; text-align: right; }
.col-sub  { flex: 1; text-align: right; }
`
