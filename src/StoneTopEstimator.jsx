
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
      console.log('AI response:', json);
      if (json.success) {
        setWidth(json.data.width);
        setDepth(json.data.depth);
      } else {
        alert("AI Error: " + (json.error || "Unexpected response"));
      }
    } catch (err) {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl space-y-6">
        <div className="text-center">
          <img src="/AIC.jpg" alt="Logo" className="mx-auto mb-2" style={{ maxWidth: '140px' }} />
          <p className="text-sm text-gray-500">Developed by Roy Kariok</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-semibold block mb-1">Stone Type:</label>
            <select className="border w-full p-2 rounded" value={selectedStone} onChange={e => setSelectedStone(e.target.value)}>
              {stoneOptions.map((stone, idx) => (
                <option key={idx} value={stone["Stone Type"]}>{stone["Stone Type"]}</option>
              ))}
            </select>
          </div>
          <input type="number" className="border w-full p-2 rounded" placeholder="Width (in)" value={width} onChange={e => setWidth(e.target.value)} />
          <input type="number" className="border w-full p-2 rounded" placeholder="Depth (in)" value={depth} onChange={e => setDepth(e.target.value)} />
          <input type="file" onChange={handleDrawingUpload} className="w-full" />
          {loadingAI && <p className="text-blue-500 text-sm">Extracting dimensions with AI...</p>}
          <button onClick={handleCalculate} className="bg-black hover:bg-gray-800 transition text-white px-4 py-2 rounded w-full">Calculate</button>
        </div>

        {result && (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
              <div><strong>Stone Type:</strong> {result.stone}</div>
              <div><strong>Dimensions:</strong> {result.width}" x {result.depth}"</div>
              <div><strong>Usable Area:</strong> {result.usableAreaSqft.toFixed(2)} sq ft</div>
              <div><strong>Tops Per Slab:</strong> {result.topsPerSlab}</div>
              <div><strong>Material Cost:</strong> ${result.materialCost.toFixed(2)}</div>
              <div><strong>Fabrication Cost:</strong> ${result.fabricationCost.toFixed(2)}</div>
              <div><strong>Total Raw Cost:</strong> ${result.rawCost.toFixed(2)}</div>
              <div><strong>Final Price:</strong> ${result.finalPrice.toFixed(2)}</div>
            </div>
            <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mt-4">Download PDF</button>
            <div style={{ display: 'none' }}>
              <div ref={pdfRef}>
                <h2>Stone Top Quote</h2>
                <p><strong>Stone:</strong> {result.stone}</p>
                <p><strong>Dimensions:</strong> {result.width}" x {result.depth}"</p>
                <p><strong>Final Price:</strong> ${result.finalPrice.toFixed(2)}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
