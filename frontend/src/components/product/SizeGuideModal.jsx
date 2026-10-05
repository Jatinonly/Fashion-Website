import { Modal } from '@/components/ui/Modal'

const APPAREL = [
  ['XS', '32', '26', '35'],
  ['S', '34', '28', '37'],
  ['M', '36', '30', '39'],
  ['L', '38', '32', '41'],
  ['XL', '40', '34', '43'],
  ['XXL', '42', '36', '45'],
]

export function SizeGuideModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Size guide" size="md">
      <p className="mb-4 text-sm text-muted">
        Body measurements in inches. Between sizes? Size up.
      </p>
      <table className="w-full text-left text-sm">
        <thead className="label text-muted">
          <tr className="border-b border-line">
            <th className="py-2 font-normal">Size</th>
            <th className="py-2 font-normal">Chest</th>
            <th className="py-2 font-normal">Waist</th>
            <th className="py-2 font-normal">Hips</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {APPAREL.map(([size, ...cells]) => (
            <tr key={size} className="border-b border-line">
              <th scope="row" className="py-2 font-sans font-medium">
                {size}
              </th>
              {cells.map((cell, index) => (
                <td key={index} className="py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-muted">Shoes follow UK sizing. UK 6 ≈ EU 39 ≈ 24.5 cm.</p>
    </Modal>
  )
}
