
import { useState, useEffect, useRef } from 'react';
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import html2pdf from "html2pdf.js";

export default function StoneTopEstimator() {
  const [stoneOptions, setStoneOptions] = useState([]);
  const [selectedStone, setSelectedStone] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [result, setResult] = useState(null);
  const pdfRef = useRef();

  useEffect(() => {
    fetch("https://opensheet.elk.sh/1g8w934dZH-NEuKfK8wg_RZYiXyLSSf87H0Xwec6KAAc/Sheet1")
      .then((res) => res.json())
      .then((data) => {
        setStoneOptions(data);
        setSelectedStone(data[0]?.["Stone Type"] || '');
      });
  }, []);

  const handleCalculate = () => {
    const stone = stoneOptions.find(s => s["Stone Type"] === selectedStone);
    if (!stone) return;

    const slabCost = parseFloat(stone["Slab Cost"]);
    const fabCost = parseFloat(stone["Fab Cost"]);
    const markup = parseFloat(stone["Mark Up"]);

    const w = parseFloat(width);
    const d = parseFloat(depth);

    if (!w || !d || isNaN(slabCost) || isNaN(fabCost) || isNaN(markup)) return;

    const area = w * d;
    const usableAreaSqft = area / 144;
    const topsPerSlab = Math.floor((63 * 126) / (usableAreaSqft * 144));
    const materialCost = slabCost / topsPerSlab;
    const fabricationCost = usableAreaSqft * fabCost;
    const rawCost = materialCost + fabricationCost;
    const finalPrice = rawCost * markup;

    setResult({
      stone: selectedStone,
      width: w,
      depth: d,
      usableAreaSqft,
      topsPerSlab,
      materialCost,
      fabricationCost,
      rawCost,
      finalPrice
    });
  };

  const handleDownloadPDF = () => {
    if (!pdfRef.current) return;
    html2pdf().from(pdfRef.current).save("quote.pdf");
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <h2 className="text-xl font-bold">Stone Top Estimator</h2>
          <label className="block font-semibold">Select Stone Type:</label>
          <select className="border rounded px-2 py-1 w-full" value={selectedStone} onChange={e => setSelectedStone(e.target.value)}>
            {stoneOptions.map((stone, idx) => (
              <option key={idx} value={stone["Stone Type"]}>{stone["Stone Type"]}</option>
            ))}
          </select>
          <Input type="number" placeholder="Width (inches)" value={width} onChange={e => setWidth(e.target.value)} />
          <Input type="number" placeholder="Depth (inches)" value={depth} onChange={e => setDepth(e.target.value)} />
          <Button onClick={handleCalculate}>Calculate</Button>

          {result && (
            <>
              <div className="pt-4 space-y-2">
                <div><strong>Stone Type:</strong> {result.stone}</div>
                <div><strong>Dimensions:</strong> {result.width}" x {result.depth}"</div>
                <div><strong>Usable SQFT:</strong> {result.usableAreaSqft.toFixed(2)}</div>
                <div><strong>Tops Per Slab:</strong> {result.topsPerSlab}</div>
                <div><strong>Material Cost:</strong> ${result.materialCost.toFixed(2)}</div>
                <div><strong>Fabrication Cost:</strong> ${result.fabricationCost.toFixed(2)}</div>
                <div><strong>Total Raw Cost:</strong> ${result.rawCost.toFixed(2)}</div>
                <div><strong>Final Price (w/ Markup):</strong> ${result.finalPrice.toFixed(2)}</div>
              </div>
              <div className="pt-4">
                <Button onClick={handleDownloadPDF}>Download Quote (PDF)</Button>
              </div>
              <div style={{ display: 'none' }}>
                <div ref={pdfRef}>
                  <h2>Stone Top Quote</h2>
                  <p><strong>Stone Type:</strong> {result.stone}</p>
                  <p><strong>Dimensions:</strong> {result.width}" x {result.depth}"</p>
                  <p><strong>Usable SQFT:</strong> {result.usableAreaSqft.toFixed(2)}</p>
                  <p><strong>Tops Per Slab:</strong> {result.topsPerSlab}</p>
                  <p><strong>Material Cost:</strong> ${result.materialCost.toFixed(2)}</p>
                  <p><strong>Fabrication Cost:</strong> ${result.fabricationCost.toFixed(2)}</p>
                  <p><strong>Total Raw Cost:</strong> ${result.rawCost.toFixed(2)}</p>
                  <p><strong>Final Price (w/ Markup):</strong> ${result.finalPrice.toFixed(2)}</p>
                  <p><em>Generated on: {new Date().toLocaleString()}</em></p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
