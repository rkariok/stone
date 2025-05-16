import { useState, useEffect, useRef } from 'react';
import html2pdf from "html2pdf.js";

export default function StoneTopEstimator() {
  const [stoneOptions, setStoneOptions] = useState([]);
  const [selectedStone, setSelectedStone] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [result, setResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const pdfRef = useRef();

  useEffect(() => {
    fetch("https://opensheet.elk.sh/1g8w934dZH-NEuKfK8wg_RZYiXyLSSf87H0Xwec6KAAc/Sheet1")
      .then(res => res.json())
      .then(data => {
        setStoneOptions(data);
        setSelectedStone(data[0]?.["Stone Type"] || '');
      });
  }, []);

  const handleDrawingUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingAI(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("https://gpt4-drawing-backend.vercel.app/api/extract-dimensions", {
        method: "POST",
        headers: { "x-vercel-protection-bypass": "paramusicalkariokparamusicalkari" },
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        setWidth(json.data.width);
        setDepth(json.data.depth);
      } else {
        alert("AI Error: " + (json.error || "Unexpected response"));
      }
    } catch {
      alert("Failed to extract dimensions.");
    } finally {
      setLoadingAI(false);
    }
  };

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
    const sqft = area / 144;
    const topsPerSlab = Math.floor((63 * 126) / area);
    const materialCost = slabCost / topsPerSlab;
    const fabricationCost = sqft * fabCost;
    const rawCost = materialCost + fabricationCost;
    const finalPrice = rawCost * markup;
    setResult({ stone: selectedStone, width: w, depth: d, sqft, topsPerSlab, materialCost, fabricationCost, rawCost, finalPrice });
  };

  const handleDownloadPDF = () => {
    if (!pdfRef.current) return;
    html2pdf().from(pdfRef.current).save("quote.pdf");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg space-y-4 flex flex-col items-center">
        <img src="/AIC.jpg" alt="Logo" className="w-16 h-auto mb-2" />
        <h1 className="text-center text-xl font-semibold">Developed by Roy Kariok</h1>
        <div className="w-full grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Stone Type</label>
            <select value={selectedStone} onChange={e => setSelectedStone(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
              {stoneOptions.map((s, i) => (
                <option key={i} value={s["Stone Type"]}>{s["Stone Type"]}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-sm mb-1">Width (in)</label>
              <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Depth (in)</label>
              <input type="number" value={depth} onChange={e => setDepth(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Upload Drawing</label>
            <input type="file" onChange={handleDrawingUpload} className="w-full" />
            {loadingAI && <p className="text-blue-600 text-sm mt-1">Extracting dimensions...</p>}
          </div>
        </div>
        <button onClick={handleCalculate} className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">Calculate</button>

        {result && (
          <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-2">
            <p><strong>Stone:</strong> {result.stone}</p>
            <p><strong>Dimensions:</strong> {result.width}" x {result.depth}"</p>
            <p><strong>Area:</strong> {result.sqft.toFixed(2)} sq ft</p>
            <p><strong>Tops/Slab:</strong> {result.topsPerSlab}</p>
            <p><strong>Material Cost:</strong> ${result.materialCost.toFixed(2)}</p>
            <p><strong>Fab Cost:</strong> ${result.fabricationCost.toFixed(2)}</p>
            <p><strong>Raw Cost:</strong> ${result.rawCost.toFixed(2)}</p>
            <p className="text-lg font-semibold text-green-700"><strong>Final:</strong> ${result.finalPrice.toFixed(2)}</p>
            <button onClick={handleDownloadPDF} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Download PDF</button>
            <div style={{ display: 'none' }}><div ref={pdfRef}><h2>Stone Top Quote</h2><p><strong>Stone:</strong> {result.stone}</p><p><strong>Dimensions:</strong> {result.width}" x {result.depth}"</p><p><strong>Final Price:</strong> ${result.finalPrice.toFixed(2)}</p></div></div>
          </div>
        )}
      </div>
    </div>
  );
}
