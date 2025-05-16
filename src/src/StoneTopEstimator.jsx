// src/StoneTopEstimator.jsx
import { useState, useEffect } from 'react';

export default function StoneTopEstimator() {
  const [stoneOptions, setStoneOptions] = useState([]);
  const [selectedStone, setSelectedStone] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [result, setResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

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

  const handleDownloadQuote = () => {
    if (!result) return;
    
    // Create quote content with date in ISO format for visibility
    const quoteDate = new Date().toISOString().split('T')[0];
    const quoteContent = `
Stone Top Quote - AIC Surfaces
Generated on: ${quoteDate}

Project Details:
Stone Type: ${result.stone}
Dimensions: ${result.width}" × ${result.depth}"
Area: ${result.usableAreaSqft.toFixed(2)} sq ft

Pricing:
Material Cost: $${result.materialCost.toFixed(2)}
Fabrication Cost: $${result.fabricationCost.toFixed(2)}
Final Price: $${result.finalPrice.toFixed(2)}

Quote prepared by AIC Surfaces
    `.trim();
    
    // Create a Blob with the text content
    const blob = new Blob([quoteContent], { type: 'text/plain' });
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stone-quote-${quoteDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-xl">
        <div className="flex flex-col items-center mb-6">
          <img src="/AIC.jpg" alt="Logo" className="h-16 mb-2" />
          <h1 className="text-xl font-semibold text-gray-800">Stone Top Estimator</h1>
          <p className="text-sm text-gray-500">Developed by Roy Kariok</p>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Stone Type</label>
            <select 
              value={selectedStone} 
              onChange={e => setSelectedStone(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {stoneOptions.map((stone, idx) => (
                <option key={idx} value={stone["Stone Type"]}>{stone["Stone Type"]}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Width (inches)</label>
              <input 
                type="number" 
                value={width} 
                onChange={e => setWidth(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Width"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Depth (inches)</label>
              <input 
                type="number" 
                value={depth} 
                onChange={e => setDepth(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Depth"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Upload Drawing (AI Dimension Detection)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-1 text-sm text-gray-500">Click to upload drawing</p>
                  <p className="text-xs text-gray-500">AI will extract dimensions</p>
                </div>
                <input type="file" onChange={handleDrawingUpload} className="hidden" />
              </label>
            </div>
            {loadingAI && 
              <div className="flex items-center mt-2 text-blue-600">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Extracting dimensions with AI...</span>
              </div>
            }
          </div>
          
          <button 
            onClick={handleCalculate} 
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            Calculate Estimate
          </button>
        </div>
        
        {result && (
          <div className="mt-6 space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Estimate Results</h2>
              
              <div className="bg-gray-50 rounded-lg p-5 space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Stone Type</p>
                    <p className="font-medium">{result.stone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dimensions</p>
                    <p className="font-medium">{result.width}" × {result.depth}"</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Usable Area</p>
                    <p className="font-medium">{result.usableAreaSqft.toFixed(2)} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tops Per Slab</p>
                    <p className="font-medium">{result.topsPerSlab}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Material Cost</p>
                      <p className="font-medium">${result.materialCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fabrication Cost</p>
                      <p className="font-medium">${result.fabricationCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Raw Cost</p>
                      <p className="font-medium">${result.rawCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Final Price</p>
                      <p className="font-semibold text-lg text-blue-600">${result.finalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleDownloadQuote} 
                className="w-full mt-4 bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Quote
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}