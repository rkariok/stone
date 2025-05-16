
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
      .then((res) => res.json())
      .then((data) => {
        setStoneOptions(data);
        setSelectedStone(data[0]?.["Stone Type"]);
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
        headers: {
          "x-vercel-protection-bypass": "paramusicalkariokparamusicalkari"
        },
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
      alert("Failed to extract dimensions from drawing.");
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
    const usableAreaSqft = area / 144;
    const topsPerSlab = Math.floor((63 * 126) / area);
    const materialCost = slabCost / topsPerSlab;
    const fabricationCost = usableAreaSqft * fabCost;
    const rawCost = materialCost + fabricationCost;
    const finalPrice = rawCost * markup;

    setResult({ stone: selectedStone, width: w, depth: d, usableAreaSqft, topsPerSlab, materialCost, fabricationCost, rawCost, finalPrice });
  };

  const handleDownloadPDF = () => {
    if (!pdfRef.current) return;
    html2pdf().from(pdfRef.current).save("quote.pdf");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4 py-10 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl space-y-6">
        <div className="flex justify-center">
          <img src="/AIC.jpg" alt="Logo" className="max-w-xs w-full h-auto mx-auto mb-6" />
        </div>
        <h1 className="text-center text-lg font-semibold text-gray-600">Developed by Roy Kariok</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block mb-1 font-medium text-sm">Stone Type</label>
            <select value={selectedStone} onChange={e => setSelectedStone(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm">
              {stoneOptions.map((stone, idx) => (
                <option key={idx} value={stone["Stone Type"]}>{stone["Stone Type"]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm">Width (in)</label>
            <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block mb-1 text-sm">Depth (in)</label>
            <input type="number" value={depth} onChange={e => setDepth(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="col-span-2">
            <input type="file" onChange={handleDrawingUpload} className="w-full text-sm" />
          </div>
        </div>
        {loadingAI && <p className="text-blue-500 text-sm text-center">Extracting dimensions with AI...</p>}
        <button onClick={handleCalculate} className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">Calculate</button>

        {result && (
          <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div><strong>Stone:</strong> {result.stone}</div>
            <div><strong>Dimensions:</strong> {result.width}" x {result.depth}"</div>
            <div><strong>Usable Area:</strong> {result.usableAreaSqft.toFixed(2)} sq ft</div>
            <div><strong>Tops Per Slab:</strong> {result.topsPerSlab}</div>
            <div><strong>Material Cost:</strong> ${result.materialCost.toFixed(2)}</div>
            <div><strong>Fabrication Cost:</strong> ${result.fabricationCost.toFixed(2)}</div>
            <div><strong>Raw Cost:</strong> ${result.rawCost.toFixed(2)}</div>
            <div className="text-base font-semibold text-green-700"><strong>Final Price:</strong> ${result.finalPrice.toFixed(2)}</div>
            <button onClick={handleDownloadPDF} className="w-full bg-blue-600 text-white py-2 mt-2 rounded-lg hover:bg-blue-700 transition">Download PDF</button>
            <div style={{ display: 'none' }}><div ref={pdfRef}><h2>Stone Top Quote</h2><p><strong>Stone:</strong> {result.stone}</p><p><strong>Dimensions:</strong> {result.width}" x {result.depth}"</p><p><strong>Final Price:</strong> ${result.finalPrice.toFixed(2)}</p></div></div>
          </div>
        )}
      </div>
    </div>
  );
}
