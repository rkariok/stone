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
    <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa] px-4 py-12">
      <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-lg flex flex-col items-center space-y-4">
        <img src="/AIC.jpg" alt="Logo" className="w-24 h-auto mb-2" />
        <p className="text-center text-[10px] text-gray-600 mb-4">Developed by Roy Kariok</p>
        <div className="w-full space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Stone Type</label>
        {file && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded preview"
              className="mx-auto rounded border max-h-60"
            />
          </div>
        )}
    
            <select value={selectedStone} onChange={e => setSelectedStone(e.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-lg">
              {stoneOptions.map((s, i) => (
                <option key={i} value={s["Stone Type"]}>{s["Stone Type"]}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">Width (inches)</label>
        {file && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded preview"
              className="mx-auto rounded border max-h-60"
            />
          </div>
        )}
    
              <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">Depth (inches)</label>
        {file && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded preview"
              className="mx-auto rounded border max-h-60"
            />
          </div>
        )}
    
              <input type="number" value={depth} onChange={e => setDepth(e.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Upload Drawing</label>
        {file && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded preview"
              className="mx-auto rounded border max-h-60"
            />
          </div>
        )}
    
            <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer">
              <input type="file" onChange={handleDrawingUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {!loadingAI ? (
                <>
                  <span className="text-sm text-gray-700 font-medium">Click to upload drawing</span>) : (<span className="text-gray-400 text-center text-sm">Click to upload drawing<br />AI will extract dimensions</span>)}
                  <span className="text-xs text-gray-500">AI will extract dimensions</span>) : (<span className="text-gray-400 text-center text-sm">Click to upload drawing<br />AI will extract dimensions</span>)}
                </>
              ) : (
                <span className="text-sm text-blue-600">Extracting dimensions...</span>) : (<span className="text-gray-400 text-center text-sm">Click to upload drawing<br />AI will extract dimensions</span>)}
              )}
            </label>
        {file && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded preview"
              className="mx-auto rounded border max-h-60"
            />
          </div>
        )}
    
          </div>
        </div>
        <button onClick={handleCalculate} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition">Calculate Estimate</button>

        {result && (
          <div className="w-full bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-sm space-y-1">
            <p><strong>Stone:</strong> {result.stone}</p>
            <p><strong>Dimensions:</strong> {result.width}" x {result.depth}"</p>
            <p><strong>Usable Area:</strong> {result.sqft.toFixed(2)} sq ft</p>
            <p><strong>Tops Per Slab:</strong> {result.topsPerSlab}</p>
            <p><strong>Material Cost:</strong> ${result.materialCost.toFixed(2)}</p>
            <p><strong>Fabrication Cost:</strong> ${result.fabricationCost.toFixed(2)}</p>
            <p><strong>Raw Cost:</strong> ${result.rawCost.toFixed(2)}</p>
            <p className="text-base font-semibold text-green-700"><strong>Final Price:</strong> ${result.finalPrice.toFixed(2)}</p>
            <button onClick={handleDownloadPDF} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition">Download PDF</button>
            <div style={{ display: 'none' }}><div ref={pdfRef}><h2>Stone Top Quote</h2><p><strong>Stone:</strong> {result.stone}</p><p><strong>Dimensions:</strong> {result.width}" x {result.depth}"</p><p><strong>Final Price:</strong> ${result.finalPrice.toFixed(2)}</p></div></div>
          </div>
        )}
      </div>
    </div>
  );
}
