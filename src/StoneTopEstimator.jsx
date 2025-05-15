
import { useState } from 'react';
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

export default function StoneTopEstimator() {
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [grommet, setGrommet] = useState('');
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const w = parseFloat(width);
    const d = parseFloat(depth);
    const g = parseFloat(grommet);

    if (!w || !d) return;

    const area = (w * d);
    const gArea = g ? Math.PI * (g / 2) ** 2 : 0;
    const usableAreaSqft = (area - gArea) / 144;
    const topsPerSlab = Math.floor((63 * 126) / (usableAreaSqft * 144));
    const materialCost = 1575 / topsPerSlab;
    const fabricationCost = usableAreaSqft * 18;
    const rawCost = materialCost + fabricationCost;
    const finalPrice = rawCost * 1.22;

    setResult({ usableAreaSqft, topsPerSlab, materialCost, fabricationCost, rawCost, finalPrice });
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <h2 className="text-xl font-bold">Stone Top Estimator</h2>
          <Input type="number" placeholder="Width (inches)" value={width} onChange={e => setWidth(e.target.value)} />
          <Input type="number" placeholder="Depth (inches)" value={depth} onChange={e => setDepth(e.target.value)} />
          <Input type="number" placeholder="Grommet Hole Diameter (inches, optional)" value={grommet} onChange={e => setGrommet(e.target.value)} />
          <Button onClick={handleCalculate}>Calculate</Button>

          {result && (
            <div className="pt-4 space-y-2">
              <div><strong>Usable SQFT:</strong> {result.usableAreaSqft.toFixed(2)}</div>
              <div><strong>Tops Per Slab:</strong> {result.topsPerSlab}</div>
              <div><strong>Material Cost:</strong> ${result.materialCost.toFixed(2)}</div>
              <div><strong>Fabrication Cost:</strong> ${result.fabricationCost.toFixed(2)}</div>
              <div><strong>Total Raw Cost:</strong> ${result.rawCost.toFixed(2)}</div>
              <div><strong>Final Price (w/ Markup):</strong> ${result.finalPrice.toFixed(2)}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
